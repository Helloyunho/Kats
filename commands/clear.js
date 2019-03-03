const command = require('../command')

module.exports = class extends command {
  async message (msg) {
    if (this.getPrefix('clear', msg)) {
      if (msg.member.permissions.hasPermission('ADMINISTRATOR') || msg.author.id === 119550317003014144) {
        let mmsg = msg.content.split(' ')[2]
        mmsg = msg.content.indexOf(mmsg)
        mmsg = msg.content.slice(mmsg)
        let a
        try {
          a = Number(mmsg)
        } catch (err) {
          msg.channel.send({ embed: this.embedWVars('clear', 'error_not_int') })
          return null
        }
        msg.channel.bulkDelete(a)
        msg.channel.send(this.translate[this.lang].clear.cleared.replace('{}', a))
      } else {
        msg.channel.send({ embed: this.embedWVars('clear', 'error_no_permission') })
      }
    }
  }
}
