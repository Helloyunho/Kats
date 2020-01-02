const Command = require('../utils/command')

module.exports = class Ping extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['message']
    this.codename = 'ping'
  }

  async message (msg, lang) {
    const temp = await msg.channel.send('Wait a second...')
    temp.edit({
      embed: this.getTranslatedEmbed(lang, 'ping:pong', {
        ping: temp.createdTimestamp - msg.createdTimestamp
      })
    })
  }
}
