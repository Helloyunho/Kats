const {app, BrowserWindow, ipcMain} = require('electron')

let win, started

let bot
let tokens = require('./tokens')

function createWindow () {
  win = new BrowserWindow({width: 800, height: 600})

  win.loadFile('./for_gui/index.html')

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('bot_start', (event, arg) => {
  if (!started) {
    bot = require('./bot')
    bot.login(tokens.discord)
    started = true
    event.sender.send('bot_started')
  }
})

ipcMain.on('bot_stop', (event, arg) => {
  if (started) {
    bot.destroy()
    bot = null
    started = false
    event.sender.send('bot_stopped')
  }
})

process.on('exit', () => {
  if (started) {
    bot.destroy()
  }
})
