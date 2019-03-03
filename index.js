const tokens = require('./tokens')
const bot = require('./bot')

bot.login(tokens.discord)

process.on('exit', () => {
  bot.destroy()
})
