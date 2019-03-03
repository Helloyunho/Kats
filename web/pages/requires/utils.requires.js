const axios = require('axios')
const tokens = require('../../../tokens')

module.exports = async ({ req, smembersAsync, getAsync }) => {
  req.datas.enabled = await smembersAsync(`${req.query.guildid}:commands:enabled`)
  req.datas.guildid = req.query.guildid
  req.datas.welcomeMessage = await getAsync(`welcome:${req.query.guildid}:message`)
  req.datas.welcomeChannel = await getAsync(`welcome:${req.query.guildid}:channel`)
  req.datas.channels = (await axios.get(`https://discordapp.com/api/v6/guilds/${req.query.guildid}/channels`, {
    headers: {
      'Authorization': `Bot ${tokens.discord}`
    }
  })).data
  req.datas.channels = req.datas.channels.filter(channel => {
    return channel.type === 0
  })
}
