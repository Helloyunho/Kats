const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const client = new Discord.Client()
const commandsss = require('./commands')
const fs = require('fs')
const redis = require('redis')
const tokens = require('./tokens')
const translate = JSON.parse(fs.readFileSync('./translate.json'))
let pluginLoaded = []
const pluginLoad = (cli) => {
  Object.keys(commandsss).forEach(a => {
    let asddd = new commandsss[a](cli)
    asddd.translate = translate
    pluginLoaded.push(asddd)
    console.log('Added Plugin: ' + a)
  })
}

process.on('uncaughtException', function (err) {
  console.log(err)
})

client.on('ready', () => {
  console.log('아 귀찮아')
  pluginLoad(client)
})

client.on('message', message => {
  if (!message.author.bot) {
    try {
      pluginLoaded.forEach(x => {
        x.message(message)
      })
    } catch (exception) {
      message.channel.send({embed: {
        title: 'An unexpected exception has occurred.',
        description: exception.toString(),
        color: 15158332
      }})
      client.console.error(exception)
    }
  }
})

client.on('guildMemberAdd', member => {
  if (!member.bot) {
    try {
      pluginLoaded.forEach(x => {
        x.guildMemberAdd(member)
      })
    } catch (exception) {
      client.console.error(exception)
    }
  }
})

client.on('messageUpdate', (before, after) => {
  try {
    pluginLoaded.forEach(x => {
      x.messageUpdate(before, after)
    })
  } catch (exception) {
    client.console.error(exception)
  }
})

client.voiceState = {}
client.console = require('signale')
client.redis = redis.createClient(tokens.redis)

client.VoiceEntry = class {
  constructor (msg, url) {
    this.msg = msg
    this.player = undefined
    this.url = url
  }

  async getData () {
    let a = await ytdl.getInfo(this.url)
    return a
  }

  getStream () {
    return ytdl(this.url, {
      filter: 'audioonly'
    })
  }
}

client.VoiceState = class {
  constructor (voice, msg) {
    this.voice = voice
    this.current = undefined
    this.songs = []
    this.playing = false
    this.firstCall = true
    this.client = client
    this.skips = new Set()
    this.message = msg
    this.volume = 1
  }

  async audioPlayer () {
    this.firstCall = false
    this.current = this.songs.shift()
    if (!this.current) {
      this.firstCall = true
      return undefined
    }
    this.current.data = await this.current.getData()
    this.client.redis.get(`${this.voice.channel.guild.id}:lang`, (err, reply) => {
      if (err) {
        this.client.console.error(err)
        return undefined
      }

      if (reply === 'ko') {
        this.message.channel.send(`${this.current.data.author.name} 님의 ${this.current.data.title} (을)를 재생합니다. 빨리와요, <@${this.current.msg.author.id}>님!`)
      } else {
        this.message.channel.send(`Now Playing: ${this.current.data.title} by ${this.current.data.author.name}. C'mon <@${this.current.msg.author.id}>!`)
      }
    })
    let stream = this.current.getStream()
    this.current.player = this.voice.playStream(stream, {
      volume: this.volume
    })
    console.log('play')
    this.playing = true
    this.current.player.on('end', () => {
      console.log('ended')
      this.playing = false
      this.skips.clear()
      this.audio_player()
    })
  }
}

module.exports = client
