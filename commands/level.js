const command = require('../command')

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = class extends command {
  constructor (...args) {
    super(...args)
    this.noPrefix = true
  }

  getXpFromLevel (n) {
    return 5 * (n ** 2) + 50 * n + 100
  }

  getLevelFromXp (xp) {
    let userXp = Number(xp)
    let level = 0
    while (userXp >= this.getXpFromLevel(level)) {
      userXp -= this.getXpFromLevel(level)
      level++
    }
    return level
  }

  async message (msg) {
    this.redis.get(`${msg.guild.id}:player:${msg.author.id}:nope`, (err, nope) => {
      if (err) {
        console.error(err)
        return undefined
      }
      if (!nope) {
        this.redis.get(`${msg.guild.id}:player:${msg.author.id}:xp`, (err, xp) => {
          if (err) {
            console.error(err)
            return undefined
          }
          let authorXp
          if (xp) {
            authorXp = Number(xp)
          } else {
            authorXp = 0
          }

          let oldLevel = this.getLevelFromXp(authorXp)
          this.redis.incrby(`${msg.guild.id}:player:${msg.author.id}:xp`, getRandomIntInclusive(15, 25))
          this.redis.set(`${msg.guild.id}:player:${msg.author.id}:nope`, 1)
          this.redis.expire(`${msg.guild.id}:player:${msg.author.id}:nope`, 60)
          this.redis.get(`${msg.guild.id}:player:${msg.author.id}:xp`, (err, xp) => {
            if (err) {
              console.error(err)
              return undefined
            }
            let level = this.getLevelFromXp(Number(xp))
            let sendThing
            if (oldLevel !== level) {
              this.redis.get(`${msg.guild.id}:level_up_message`, (err, message) => {
                if (err) {
                  console.error(err)
                  return undefined
                }
                if (message) {
                  sendThing = message.replace('{user}', msg.author.toString()).replace('{level}', level)
                  msg.channel.send(sendThing)
                }
              })
            }
          })
        })
      }
    })
  }
}
