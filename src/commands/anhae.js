const Command = require('../utils/command')
const { resolve } = require('path')

module.exports = class Anhae extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['message']
    this.codename = 'anhae'
  }

  async message (msg, lang) {
    msg.channel.send(this.client.i18n.t('anhae:anhae', { lng: lang }), {
      file: {
        attachment: resolve(__dirname, '../../assets/anhae.png'),
        name: 'anhae.png'
      }
    })
  }
}
