const command = require('../command')

module.exports = class extends command {
  async message (msg) {
    let a = this.updateLang(msg.guild.id)
    if (this.getPrefix('test', msg) && a) {
      msg.channel.send('Testing...')
        .then(messageSended => messageSended.edit({
          embed: this.embedWVars('test', 'test', messageSended.createdTimestamp - msg.createdTimestamp)
        })
        )
    }
  }
}
