const Command = require('../utils/command')

module.exports = class Clear extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['message']
    this.codename = 'clear'
  }

  async message (msg, lang, args) {
    const count = parseInt(args[1]) + 1
    if (typeof count !== 'number') {
      msg.channel.send({
        embed: this.getTranslatedEmbed(lang, 'clear:notNumber')
      })
      return
    }
    if (count / 100 > 1) {
      let tempCount = count
      while (tempCount / 100 > 1) {
        msg.channel.bulkDelete(100)
        tempCount -= 100
      }
      msg.channel.bulkDelete(tempCount)
    } else {
      msg.channel.bulkDelete(count)
    }
    msg.channel.send({
      embed: this.getTranslatedEmbed(lang, 'clear:done', { count })
    })
  }
}
