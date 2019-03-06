const Discord = require('discord.js')
const client = new Discord.Client()
const commands = require('./commands')
const redis = require('redis')
const tokens = require('./tokens')
const voicePart = require('./voice')
const Sentry = require('@sentry/node')
Sentry.init(tokens.sentry)

const translate = {
  ko: require('./translate/ko.json'),
  en: require('./translate/en.json')
}
let pluginLoaded = []
const pluginLoad = (cli) => {
  Object.keys(commands).forEach(name => {
    let command = new commands[name](cli)
    command.translate = translate
    command.name = name
    pluginLoaded.push(command)
    client.console.log('Added Plugin: ' + name)
  })
}


client.voiceState = {}
client.console = require('signale')
client.redis = redis.createClient(tokens.redis)
client.VoiceEntry = voicePart.VoiceEntry
client.voiceState = voicePart.VoiceState
process.on('uncaughtException', (err) => {
  client.console.error(err)
})


client.on('ready', () => {
  client.console.log('Running!')
  client.guilds.map((guild) => {
    client.redis.sadd('client:guilds', guild.id)
  })
  pluginLoad(client)
})

client.on('message', message => {
  if (!message.author.bot) {
    client.redis.smembers(`${message.guild.id}:commands:enabled`, (err, enabled) => {
      if (err) {
        throw err
      }
      pluginLoaded.forEach(async x => {
        await x.updateLang(message.guild.id)
        if (message.content.startsWith(translate[x.lang]['prefix']) || x.noPrefix) {
          if (enabled.includes(x.name) || x.forceEnable) {
            x.message(message).catch(exception => {
              message.channel.send({ embed: {
                title: 'An unexpected exception has occurred.',
                description: exception.toString(),
                color: 15158332
              } })
              client.console.error(exception.toString())
            })
          }
        }
      })
    })
  }
})

client.on('guildMemberAdd', member => {
  if (!member.bot) {
    client.redis.smembers(`${member.guild.id}:commands:enabled`, (err, enabled) => {
      if (err) {
        throw err
      }
      pluginLoaded.forEach(async x => {
        await x.updateLang(member.guild.id)
        if (enabled.includes(x.name) || x.forceEnable) {
          x.guildMemberAdd(member).catch(exception => {
            client.console.error(exception.toString())
          })
        }
      })
    })
  }
})

client.on('messageUpdate', (before, after) => {
  if (!before.author.bot) {
    client.redis.smembers(`${before.guild.id}:commands:enabled`, (err, enabled) => {
      if (err) {
        throw err
      }
      pluginLoaded.forEach(async x => {
        await x.updateLang(before.guild.id)
        if (enabled.includes(x.name) || x.forceEnable) {
          x.messageUpdate(before, after).catch(exception => {
            client.console.error(exception.toString())
          })
        }
      })
    })
  }
})

client.on('guildCreate', (guild) => {
  client.redis.sadd('client:guilds', guild.id)
})

client.on('guildDelete', (guild) => {
  client.redis.srem('client:guilds', guild.id)
})

module.exports = client
