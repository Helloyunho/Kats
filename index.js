const tokens = require('./tokens')
const bot = require('./bot')

bot.login(tokens.discord).then(_ => {
  bot.user.setPresence({
    game: {
      name: '[Kats] you.goto(\'https://kats.helloyunho.xyz/\')',
      type: 'WATCHING'
    },
    status: 'online',
  })
})

process.on('exit', () => {
  bot.destroy()
})
