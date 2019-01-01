const command = require('../command')

module.exports = class extends command {
  async message (msg) {
    let a = this.updateLang(msg.guild.id)
    if (this.getPrefix('anhae', msg) && a) {
      msg.channel.send('ㅇㅈ 안해\n안해안해', {file: './anhe.png'})
    }
  }
}
