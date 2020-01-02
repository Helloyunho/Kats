const config = require('../../config.json')
const { readFileSync } = require('fs')
const { resolve } = require('path')

module.exports = class Command {
  constructor (client) {
    this.client = client
    this.allowedEvents = []
    this.alwaysMessage = false
    this.codename = ''
    this.alwaysEnabled = false
  }

  async getGuildLang (gid) {
    let lang = await this.client.redis.getAsync(`${gid}:lang`)
    if (typeof lang !== 'string' || !config.langs.includes(lang)) {
      this.client.redis.set(`${gid}:lang`, config.defaultLang)
      lang = config.defaultLang
    }
    return lang
  }

  getTranslatedEmbed (lang, ns, options) {
    ns = ns.split(':')
    const embed = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../translate/', `${lang}/`, `${ns[0]}.json`),
        'utf8'
      )
    )[ns[1]]
    Object.keys(embed).forEach((key) => {
      if (typeof embed[key] === 'string') {
        embed[key] = this.client.i18n.t(`${ns[0]}:${ns[1]}.${key}`, {
          lng: lang,
          postProcess: 'korean-postposition',
          ...options
        })
      }
    })
    return embed
  }

  async message (msg, lang, args) {}

  async messageUpdate (before, after) {}

  async guildMemberAdd (member) {}
}
