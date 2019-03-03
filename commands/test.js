const command = require('../command')

module.exports = class extends command {
  constructor (...args) {
    super(...args)
    this.forceEnable = true
  }

  async message (msg) {
    if (this.getPrefix('test', msg)) {
      msg.channel.send('Testing...')
        .then(messageSended => messageSended.edit({
          embed: this.embedWVars('test', 'test', messageSended.createdTimestamp - msg.createdTimestamp)
        })
        )
    }
  }
}
