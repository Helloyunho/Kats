const command = require('../command')

module.exports = class extends command {
  async guildMemberAdd (member) {
    this.redis.get(`welcome:${member.guild.id}:channel`, (err, reply) => {
      if (err) {
        this.client.console.error(err)
        return undefined
      }
      let channel = member.guild.channels.get(reply)
      this.redis.get(`welcome:${member.guild.id}:message`, (err, replyy) => {
        if (err) {
          this.client.console.error(err)
          return undefined
        }
        channel.send(replyy.replace('{server_name}', member.guild.name).replace('{user}', `<@${member.id}>`))
      })
    })
  }
}
