const { Client } = require('discord.js')
const { promisify } = require('util')
const redis = require('redis')
const i18next = require('i18next')
const i18nextKPP = require('i18next-korean-postposition-processor')
const i18nextback = require('i18next-sync-fs-backend')
const commands = require('./commands')
const config = require('../config.json')
const { resolve } = require('path')

const DEV = process.env.NODE_ENV === 'development'

i18next
  .use(i18nextback)
  .use(i18nextKPP.default)
  .init({
    fallbackLng: 'en',
    preload: config.langs,
    backend: {
      loadPath: resolve(__dirname, '../translate/{{lng}}/{{ns}}.json')
    }
  })

class Kats extends Client {
  constructor (...args) {
    super(...args)
    this.redis = redis.createClient(config.redis)
    this.redis.getAsync = promisify(this.redis.get).bind(this.redis)
    this.redis.smembersAsync = promisify(this.redis.smembers).bind(this.redis)
    this.i18n = i18next
    this.commands = commands.map(Command => {
      const command = new Command(this)
      this.i18n.loadNamespaces(command.codename)
      return command
    })
    this.DEV = DEV
    this.on('message', this.onMessage)
    this.on('messageUpdate', this.onMessageUpdate)
    this.on('guildMemberAdd', this.onGuildMemberAdd)
    this.on('guildCreate', this.onGuildCreate)
    this.on('guildDelete', this.onGuildDelete)
  }

  async onMessage (msg) {
    if (msg.author.bot) {
      return
    }
    try {
      const lang = await this.commands[0].getGuildLang(msg.guild.id)
      const args = msg.content.slice(config.prefix[lang].length).split(' ')
      const enabled = await this.redis.smembersAsync(
        `${msg.guild.id}:enabled:commands`
      )
      this.commands.forEach(async command => {
        try {
          if (enabled.includes(command.codename) || command.alwaysEnabled) {
            if (!command.alwaysMessage) {
              if (
                msg.content.startsWith(config.prefix[lang]) &&
                args[0] ===
                  this.i18n.t(`${command.codename}:prefix`, { lng: lang })
              ) {
                await command.message(msg, lang, args)
              }
            } else if (command.allowedEvents.includes('message')) {
              await command.message(msg, lang, args)
            }
          }
        } catch (err) {
          if (err && DEV) {
            msg.channel.send({
              embed: {
                color: 15158332,
                title: 'Error!',
                description: `\`\`\`${err}\`\`\``,
                author: {
                  name: 'An exception has occurred.'
                }
              }
            })
          }
        }
      })
    } catch (err) {
      if (err && DEV) {
        msg.channel.send({
          embed: {
            color: 15158332,
            title: 'Error!',
            description: `\`\`\`${err}\`\`\``,
            author: {
              name: 'An exception has occurred.'
            }
          }
        })
      }
    }
  }

  async onMessageUpdate (before, after) {
    const enabled = await this.redis.smembersAsync(
      `${after.guild.id}:enabled:commands`
    )
    this.commands.forEach(command => {
      if (enabled.includes(command.codename) || command.alwaysEnabled) {
        if (command.allowedEvents.includes('messageUpdate')) {
          command.messageUpdate(before, after)
        }
      }
    })
  }

  async onGuildMemberAdd (member) {
    const enabled = await this.redis.smembersAsync(
      `${member.guild.id}:enabled:commands`
    )
    this.commands.forEach(command => {
      if (enabled.includes(command.codename) || command.alwaysEnabled) {
        if (command.allowedEvents.includes('guildMemberAdd')) {
          command.guildMemberAdd(member)
        }
      }
    })
  }

  onGuildCreate (guild) {
    this.redis.sadd('client:guilds', guild.id)
  }

  onGuildDelete (guild) {
    this.redis.srem('client:guilds', guild.id)
  }
}

const client = new Kats()
client.login(DEV ? config.devToken : config.token)
