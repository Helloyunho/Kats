module.exports = async ({ req, smembersAsync, getAsync }) => {
  req.datas.enabled = await smembersAsync(`${req.query.guildid}:commands:enabled`)
  req.datas.guildid = req.query.guildid
  req.datas.levelUpMessage = await getAsync(`${req.query.guildid}:level_up_message`)
}
