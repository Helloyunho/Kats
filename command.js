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

  }

  async message () {

  }

  async channelCreate () {

  }

  async channelDelete () {

  }

  async channelUpdate () {

  }

  async disconnect () {

  }

  async guildCreate () {

  }

  async guildDelete () {

  }

  async guildMemberAdd () {

  }

  async guildMemberRemove () {

  }

  async guildUpdate () {

  }

  async messageDelete () {

  }

  async messageDeleteBulk () {

  }

  async messageUpdate () {

  }
}
