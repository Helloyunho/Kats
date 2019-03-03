const command = require('../command')

module.exports = class extends command {
  async message (msg) {
    if (this.getPrefix('anhae', msg)) {
      msg.channel.send('ㅇㅈ 안해\n안해안해', { file: './anhe.png' })
    }
  }
}
