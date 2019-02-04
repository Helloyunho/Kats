const format = require('string-format')
const deasync = require('deasync')

module.exports = class {
  constructor (client) {
    this.client = client
    this.global = false
    this.translate = null
    this.lang = 'en'
    this.noBlack = false
    this.redis = this.client.redis
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

    let done = false
    let num = 0
    if (args.length > 0) {
      Object.keys(embed).forEach((x) => {
        embed[x] = format(String(embed[x]), args)
        num++
        if (num === Object.keys(embed).length) {
          done = true
        }
      })
    } else {
      done = true
    }
    deasync.loopWhile(() => {
      return !done
    })
    return embed
  }

  textWVars (codename, Type, ...args) {
    let text = this.translate[this.lang][codename][Type]

    let done = false
    if (args.length > 0) {
      if (args.length === 1 && typeof args[0] === 'object') {
        text = format(String(text), args[0])
      } else {
        text = format(String(text), args)
      }
      done = true
    } else {
      done = true
    }
    deasync.loopWhile(() => {
      return !done
    })
    return text
  }

  updateLang (server) {
    let done = false
    this.redis.get(`${server}:lang`, (err, reply) => {
      if (err) {
        console.error(err)
        done = true
      }
      if (!reply) {
        this.lang = 'en'
        done = true
      } else {
        this.lang = reply
        done = true
      }
    })
    deasync.loopWhile(() => {
      return !done
    })
    return done
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
