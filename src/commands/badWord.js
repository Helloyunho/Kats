const Command = require('../utils/command')

module.exports = class BadWord extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['message', 'messageUpdate']
    this.codename = 'badWord'
    this.alwaysMessage = true
  }

  async message (msg) {
    if (
      !(
        msg.channel.nsfw &&
        (await this.client.redis.getAsync(`${msg.guild.id}:bw:nsfw`))
      )
    ) {
      const badWords = await this.client.redis.smembersAsync(
        `${msg.guild.id}:bw`
      )
      if (badWords instanceof Array) {
        const isBadWord = badWords.some((word) => {
          if (msg.content.includes(word)) {
            msg.delete()
            return true
          }
        })
        if (isBadWord) {
          const message = await this.client.redis.getAsync(
            `${msg.guild.id}:bw:msg`
          )
          if (typeof message === 'string') {
            msg.channel.send(message)
          } else {
            const lang = await this.getGuildLang(msg.guild.id)
            msg.channel.send(
              this.client.i18n.t('badWord:defaultMsg', { lng: lang })
            )
          }
        }
      }
    }
  }

  async messageUpdate (before, after) {
    if (
      !(
        after.channel.nsfw &&
        (await this.client.redis.getAsync(`${after.guild.id}:bw:nsfw`))
      )
    ) {
      const badWords = await this.client.redis.smembersAsync(
        `${after.guild.id}:bw`
      )
      if (badWords instanceof Array) {
        const isBadWord = badWords.some((word) => {
          if (after.content.includes(word)) {
            after.delete()
            return true
          }
        })
        if (isBadWord) {
          const message = await this.client.redis.getAsync(
            `${after.guild.id}:bw:msg`
          )
          if (typeof message === 'string') {
            after.channel.send(message)
          } else {
            const lang = await this.getGuildLang(after.guild.id)
            after.channel.send(
              this.client.i18n.t('badWord:defaultMsg', { lng: lang })
            )
          }
        }
      }
    }
  }
}
