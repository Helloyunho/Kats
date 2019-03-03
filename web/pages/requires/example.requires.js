module.exports = async ({ req, res, redis, getAsync, smembersAsync }) => {
  req.datas.enabled = await smembersAsync(`${req.query.guildid}:commands:enabled`)
  req.datas.guildid = req.query.guildid
}
