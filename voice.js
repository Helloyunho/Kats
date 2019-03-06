const ytdl = require('ytdl-core')

module.exports = {
  VoiceState: class VoiceState {
    constructor (voice, msg, client) {
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
      try {
        this.firstCall = false
        this.current = this.songs.shift()
        if (!this.current) {
          this.firstCall = true
          this.voice.disconnect()
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
        this.playing = true
        this.current.player.on('end', () => {
          this.playing = false
          this.skips.clear()
          this.audioPlayer()
        })
        this.current.player.on('error', (err) => {
          this.client.console.error(err)
          this.audioPlayer()
        })
      } catch (e) {
        if (e) {
          this.client.console.error(e)
        }
      }
    }
  },
  VoiceEntry: class VoiceEntry {
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
}
