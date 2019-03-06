const tokens = require('./tokens')
const bot = require('./bot')

let token

if (tokens.discordTest) {
  token = tokens.discordTest
} else {
  token = tokens.discord
}

bot.login(token).then(_ => {
  bot.user.setPresence({
    game: {
      name: 'Testing..',
      type: 'WATCHING'
    },
    status: 'online',
  })
})

process.on('exit', () => {
  bot.destroy()
})
