const tokens = require('./tokens')
const bot = require('./bot')

if (tokens.discordTest) {
  bot.login(tokens.discordTest)
} else {
  bot.login(tokens.discord)
}


process.on('exit', () => {
  bot.destroy()
})
