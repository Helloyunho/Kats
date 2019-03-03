const format = require('string-format')
const { promisify } = require('util')

module.exports = class {
  constructor (client) {
    this.client = client
    this.translate = null
    this.lang = 'en'
    this.noBlack = false
    this.redis = this.client.redis
    this.noPrefix = false
    this.forceEnable = false
  }

  getPrefix (codename, msg) {
    if (msg.content.startsWith(this.translate[this.lang]['prefix'])) {
      let a = msg.content.split(' ')[1]
      if (a === this.translate[this.lang][codename]['prefix']) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  embedWVars (codename, embedType, ...args) {
    let embed = Object.assign({}, this.translate[this.lang][codename]['embed'][embedType])
    if (args.length > 0) {
      Object.keys(embed).forEach((x) => {
        if (args.length === 1 && typeof args[0] === 'object') {
          embed[x] = format(String(embed[x]), args[0])
        } else {
          embed[x] = format(String(embed[x]), args)
        }
      })
    }
    return embed
  }

  textWVars (codename, Type, ...args) {
    let text = this.translate[this.lang][codename][Type]
    if (args.length > 0) {
      if (args.length === 1 && typeof args[0] === 'object') {
        text = format(String(text), args[0])
      } else {
        text = format(String(text), args)
      }
    }
    return text
  }

  async updateLang (server) {
    let lang = await promisify(this.redis.get).bind(this.client.redis)(`${server}:lang`)
    if (lang !== 'ko') {
      this.lang = 'en'
    } else {
      this.lang = 'ko'
    }
  }

  async ready () {
    return undefined
  }

  async message () {
    return undefined
  }

  async channelCreate () {
    return undefined
  }

  async channelDelete () {
    return undefined
  }

  async channelUpdate () {
    return undefined
  }

  async disconnect () {
    return undefined
  }

  async guildCreate () {
    return undefined
  }

  async guildDelete () {
    return undefined
  }

  async guildMemberAdd () {
    return undefined
  }

  async guildMemberRemove () {
    return undefined
  }

  async guildUpdate () {
    return undefined
  }

  async messageDelete () {
    return undefined
  }

  async messageDeleteBulk () {
    return undefined
  }

  async messageUpdate () {
    return undefined
  }
}
