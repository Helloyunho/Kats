const express = require('express')
const next = require('next')
const withCss = require('@zeit/next-css')
const session = require('express-session')
const passport = require('passport')
const Strategy = require('passport-discord').Strategy
const redis = require('redis')
const tokens = require('../tokens')
const redisClient = redis.createClient(tokens.redis)
const { promisify } = require('util')
const getAsync = promisify(redisClient.get).bind(redisClient)
const smembersAsync = promisify(redisClient.smembers).bind(redisClient)
const requires = require('./pages/requires')
const bodyParser = require('body-parser')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

passport.use(new Strategy({
  clientID: tokens.discordClientID,
  clientSecret: tokens.discordClientSecret,
  callbackURL: `${tokens.mainURL}/login/callback`,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile)
}))

const port = 5000
const dev = true
const app = next({
  dev: dev,
  conf: withCss({
    webpack (config) {
      config.module.rules.push({
        test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            publicPath: './',
            outputPath: 'static/',
            name: '[name].[ext]'
          }
        }
      })
      return config
    }
  })
})
const handle = app.getRequestHandler()

const checkAdmin = async (guilds, guildid) => {
  let katsGuilds = await smembersAsync('client:guilds')
  let adminGuilds = guilds.filter(x => {
    return x.owner || ((x.permissions & 0x00000008) > 0)
  }).map(x => x.id)
  return katsGuilds.includes(guildid) && adminGuilds.includes(guildid)
}

const loginCheck = (req, res, next) => {
  req.loggined = req.isAuthenticated()
  if (req.loggined) {
    req.datas.user = req.user
    delete req.datas.user.accessToken
    next()
  } else {
    passport.authenticate('discord', {
      scope: ['identify', 'guilds']
    })(req, res, next)
  }
}

app.prepare()
  .then(() => {
    const server = express()
    server.use(session({
      secret: tokens.hashForToken,
      resave: false,
      saveUninitialized: false
    }))
    server.use(passport.initialize())
    server.use(passport.session())
    server.use((req, res, next) => {
      req.datas = {}
      next()
    })
    server.use(bodyParser.json())

    server.get('/', (req, res) => {
      if (req.isAuthenticated()) {
        req.datas.user = req.user
      }
      return app.render(req, res, '/', req.datas)
    })

    server.get('/login', passport.authenticate('discord', {
      scope: ['identify', 'guilds']
    }))

    server.get('/login/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/guilds')
    })

    server.get('/guilds', loginCheck, (req, res) => {
      req.datas.guilds = req.user.guilds.filter(x => {
        return x.owner || ((x.permissions & 0x00000008) > 0)
      })
      return app.render(req, res, '/guilds', req.datas)
    })

    server.get('/dashboard', loginCheck, async (req, res) => {
      if (await checkAdmin(req.user.guilds, req.query.guildid)) {
        req.datas.lang = await getAsync(`${req.query.guildid}:lang`)
        req.datas.guildid = req.query.guildid
        return app.render(req, res, '/dashboard', req.datas)
      } else {
        res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${tokens.discordClientID}&permissions=8&redirect_uri=${tokens.mainURL}/guilds&scope=bot`)
      }
    })

    server.get('/dashboard/lang/:lang', loginCheck, async (req, res) => {
      if (await checkAdmin(req.user.guilds, req.query.guildid)) {
        redisClient.set(`${req.query.guildid}:lang`, req.params.lang)
        res.json(await getAsync(`${req.query.guildid}:lang`))
      } else {
        res.status(403).end()
      }
    })

    server.get('/command/disable/:command', loginCheck, async (req, res) => {
      if (await checkAdmin(req.user.guilds, req.query.guildid)) {
        redisClient.srem(`${req.query.guildid}:commands:enabled`, req.params.command)
        res.json(await smembersAsync(`${req.query.guildid}:commands:enabled`))
      } else {
        res.status(403).end()
      }
    })

    server.get('/command/enable/:command', loginCheck, async (req, res) => {
      if (await checkAdmin(req.user.guilds, req.query.guildid)) {
        redisClient.sadd(`${req.query.guildid}:commands:enabled`, req.params.command)
        res.json(await smembersAsync(`${req.query.guildid}:commands:enabled`))
      } else {
        res.status(403).end()
      }
    })

    server.post('/command/level/message', loginCheck, async (req, res) => {
      if (typeof req.body.guildid !== 'undefined' && typeof req.body.message !== 'undefined') {
        if (await checkAdmin(req.user.guilds, req.body.guildid)) {
          redisClient.set(`${req.body.guildid}:level_up_message`, req.body.message)
          res.json(await getAsync(`${req.body.guildid}:level_up_message`))
        } else {
          res.status(403).end()
        }
      } else {
        res.status(401).end()
      }
    })

    server.post('/command/welcome/message', loginCheck, async (req, res) => {
      if (typeof req.body.guildid !== 'undefined' && typeof req.body.message !== 'undefined') {
        if (await checkAdmin(req.user.guilds, req.body.guildid)) {
          redisClient.set(`welcome:${req.body.guildid}:message`, req.body.message)
          res.json(await getAsync(`welcome:${req.body.guildid}:message`))
        } else {
          res.status(403).end()
        }
      } else {
        res.status(401).end()
      }
    })

    server.post('/command/welcome/channel', loginCheck, async (req, res) => {
      if (typeof req.body.guildid !== 'undefined' && typeof req.body.channel !== 'undefined') {
        if (await checkAdmin(req.user.guilds, req.body.guildid)) {
          redisClient.set(`welcome:${req.body.guildid}:channel`, req.body.channel)
          res.json(await getAsync(`welcome:${req.body.guildid}:channel`))
        } else {
          res.status(403).end()
        }
      } else {
        res.status(401).end()
      }
    })

    server.get('/settings/:setting', loginCheck, async (req, res) => {
      if (typeof requires[req.params.setting] !== 'undefined') {
        if (await checkAdmin(req.user.guilds, req.query.guildid)) {
          await requires[req.params.setting]({ req, res, redis, getAsync, smembersAsync })
          return app.render(req, res, `/settings/${req.params.setting}`, req.datas)
        } else {
          res.status(403).end()
        }
      } else {
        res.status(404).end()
      }
    })

    server.get('/_error', (req, res) => {
      return app.render(req, res, '/_error', req.query)
    })

    server.get('/logout', loginCheck, (req, res) => {
      req.logout()
      res.redirect('/')
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
