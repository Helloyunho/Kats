const { ShardingManager } = require('discord.js')
const config = require('./config.json')
const dev = process.env.NODE_ENV === 'development'

const sharder = new ShardingManager('./src/index.js', {
  respawn: config.shard.respawn,
  token: dev ? config.devToken : config.token,
  totalShards: config.shard.count
})

sharder.spawn(
  config.shard.count === 'auto' ? sharder.totalShards : config.shard.count,
  config.shard.delay
)
