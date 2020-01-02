const Command = require('../utils/command')

module.exports = class Welcome extends Command {
  constructor (...args) {
    super(...args)
    this.allowedEvents = ['guildMemberAdd']
    this.codename = 'welcome'
  }

  async guildMemberAdd (member) {
    const guild = member.guild
    const channel = guild.channels.get(
      await this.client.redis.getAsync(`${guild.id}:welcome:channel`)
    )
    if (typeof channel !== 'undefined') {
      const message = await this.client.redis.getAsync(
        `${guild.id}:welcome:message`
      )
      if (typeof message !== 'string') {
        const lang = await this.getGuildLang(guild.id)
        channel.send(
          this.client.i18n.t('welcome:defaultMsg', {
            lng: lang,
            guild: guild.name,
            user: `<@${member.id}>`,
            interpolation: { escapeValue: false }
          })
        )
      } else {
        channel.send(
          message
            .replace('{{user}}', `<@${member.id}>`)
            .replace('{{guild}}', guild.name)
        )
      }
    }
  }
}
