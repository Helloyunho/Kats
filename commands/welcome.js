const command = require('../command')

module.exports = class extends command {
  guildMemberAdd (member) {
    this.redis.get(`welcome:${member.guild.id}:channel`, (err, reply) => {
      if (err) {
        this.client.console.error(err)
        return undefined
      }
      let channel = this.member.guild.channels.find('id', reply)
      this.redis.get(`welcome:${member.guild.id}:content`, (err, replyy) => {
        if (err) {
          this.client.console.error(err)
          return undefined
        }
        channel.send(replyy.replace('{server_name}', member.guild.name).replace('{user}', `<@${member.id}>`))
      })
    })
  }
}
