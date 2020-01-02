const Command = require('../utils/command')

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const levelToXp = (level) => {
  return 5 * level ** 2 + 50 * level + 100
}

const xpToLevel = (xp) => {
  let userXp = xp
  let level = 0
  while (userXp >= levelToXp(level)) {
    userXp -= levelToXp(level)
    level++
  }
  return level
}

module.exports = class Level extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['message']
    this.codename = 'level'
    this.alwaysMessage = true
  }

  async message (msg) {
    const isWating = parseInt(
      await this.client.redis.getAsync(
        `${msg.guild.id}:level:${msg.author.id}:waiting`
      )
    )
    if (!isWating) {
      const currentXp = parseInt(
        await this.client.redis.getAsync(
          `${msg.guild.id}:level:${msg.author.id}:xp`
        )
      )
      const levelBefore = xpToLevel(currentXp || 0)
      const updatedXp = getRandomIntInclusive(15, 25)
      this.client.redis.incrby(
        `${msg.guild.id}:level:${msg.author.id}:xp`,
        updatedXp
      )
      this.client.redis.set(`${msg.guild.id}:level:${msg.author.id}:waiting`, 1)
      this.client.redis.expire(
        `${msg.guild.id}:level:${msg.author.id}:waiting`,
        60
      )
      const levelAfter = xpToLevel(updatedXp + currentXp)
      if (levelAfter > levelBefore) {
        const message = await this.client.redis.get(
          `${msg.guild.id}:level:message`
        )
        if (typeof message !== 'string') {
          const lang = await this.getGuildLang(msg.guild.id)
          msg.channel.send(
            this.client.i18n.t('level:defaultMsg', {
              lng: lang,
              level: levelAfter,
              user: `<@${msg.author.id}>`,
              interpolation: { escapeValue: false }
            })
          )
        } else {
          msg.channel.send(
            message
              .replace('{{level}}', levelAfter)
              .replace('{{user}}', `<@${msg.author.id}>`)
          )
        }
      }
    }
  }
}
