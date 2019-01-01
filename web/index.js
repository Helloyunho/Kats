const express = require('express')
const next = require('next')
const withCss = require('@zeit/next-css')
const session = require('express-session')
const passport = require('passport')
const Strategy = require('passport-discord').Strategy
const redis = require('redis')
const tokens = require('../tokens')
const redisClient = redis.createClient(tokens.redis)
const axios = require('axios')
const {promisify} = require('util')
const getAsync = promisify(redisClient.get).bind(redisClient)

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
    const loginCheck = (req, res, next) => {
      req.loggined = req.isAuthenticated()
      if (req.loggined) {
        req.datas.user = req.user
      }
      next()
    }
    server.use(loginCheck)

    server.get('/', (req, res) => {
      return app.render(req, res, '/', req.datas)
    })

    server.get('/login', passport.authenticate('discord', {
      scope: ['identify', 'guilds']
    }))

    server.get('/login/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/guilds')
    })

    server.get('/guilds', async (req, res) => {
      if (!(req.loggined)) {
        return res.redirect('/login')
      }
      req.datas.guilds = req.user.guilds.filter(x => {
        return x.owner || ((x.permissions & 0x00000008) > 0)
      })
      return app.render(req, res, '/guilds', req.datas)
    })

    server.get('/_error', (req, res) => {
      return app.render(req, res, '/_error', req.query)
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
