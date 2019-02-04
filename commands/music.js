const command = require('../command')
const tokens = require('../tokens')
const youtubeApi = require('youtube-search')

module.exports = class extends command {
  async message (msg) {
    let a = this.updateLang(msg.guild.id)
    if (msg.content.startsWith(this.translate[this.lang]['prefix']) && a) {
      let msgPrefix = msg.content.split(' ')[1]
      if (msgPrefix === this.translate[this.lang]['music']['play_prefix']) {
        let voice = msg.member.voiceChannel
        if (!voice) {
          msg.channel.send({embed: this.embedWVars('music', 'error_author_not_in_voice')})
          return undefined
        }
        let state = this.client.voiceState[msg.guild.id]
        if (!state) {
          this.client.voiceState[msg.guild.id] = new this.client.VoiceState(await voice.join(), msg)
          state = this.client.voiceState[msg.guild.id]
        }

        if (!state.playing && (msg.content === this.translate[this.lang]['prefix'] + ' ' + this.translate[this.lang]['music']['play_prefix'])) {
          state.current.player.resume()
          state.playing = true
          return undefined
        }
        let url = msg.content.split(' ')[2]
        url = msg.content.indexOf(url)
        url = msg.content.slice(url)

        if (/^https?:\/\/(www.youtube.com|youtube.com)\$/.test(url)) {
          state.songs.push(new this.client.VoiceEntry(msg, url))
          if (state.firstCall) {
            state.audioPlayer()
          }
        } else {
          let datas = await youtubeApi(url, {key: tokens.youtubeToken, maxResults: 5, type: 'video'})
          let videos = []
          let emojis = ['\u2B55', '\u274C', '\u26D4']
          datas.results.forEach(x => {
            videos.push(x.id)
          })
          let i = 0
          let chat
          while (i < 5) {
            if (!videos[i]) {
              break
            }
            chat = await msg.channel.send(this.textWVars('music', 'choice_music', videos[i]))
            chat.react(emojis[0])
            chat.react(emojis[1])
            chat.react(emojis[2])
            let collected = await chat.awaitReactions((reaction, user) => {
              return emojis.includes(reaction.emoji.name) && user.id === msg.author.id
            }, {time: 30000, errors: ['time'], max: 1})
            let reaction = collected.first()
            if (reaction.emoji.name === '\u2B55') {
              chat.delete()
              let urll = `https://www.youtube.com/watch?v=${videos[i]}`
              let entry = new this.client.VoiceEntry(msg, urll)
              entry.data = await entry.getData()
              state.songs.push(entry)
              if (state.firstCall) {
                state.audioPlayer()
              }
              let delmsg = await msg.channel.send(this.textWVars('music', 'added_music', {entry: `${entry.data.title} by ${entry.data.author.name}`}))
              delmsg.delete(5000)
              return
            } else if (reaction.emoji.name === '\u274C') {
              chat.delete()
              i++
              continue
            } else if (reaction.emoji.name === '\u26D4') {
              chat.delete()
              break
            }
          }
          msg.channel.send(this.textWVars('music', 'give_up'))
        }
      } else if (msgPrefix === this.translate[this.lang]['music']['stop_prefix']) {
        let state = this.client.voiceState[msg.guild.id]
        state.voice.disconnect()
        delete this.client.voiceState[msg.guild.id]
      } else if (msgPrefix === this.translate[this.lang]['music']['skip_prefix']) {
        let state = this.client.voiceState[msg.guild.id]

        if (!state) {
          return undefined
        }

        if (!state.playing) {
          let delMsg = await msg.channel.send({embed: this.embedWVars('music', 'error_not_playing')})
          delMsg.delete(5000)
          return undefined
        }

        let voter = msg.member
        if (voter.id === state.current.msg.member.id || voter.id === '119550317003014144') {
          state.current.player.end()
          let delMsg = await msg.channel.send({embed: this.embedWVars('music', 'skip_by_requester')})
          delMsg.delete(5000)
        } else if (!state.skips.has(voter.id)) {
          state.skips.add(voter.id)
          let totalVotes = state.skips.size
          if (totalVotes >= 3) {
            state.current.player.end()
            let delMsg = msg.channel.send({embed: this.embedWVars('music', 'skip_cause_over_three')})
            delMsg.delete(5000)
          } else {
            msg.channel.send(this.textWVars('music', 'skip_voted', totalVotes))
          }
        } else {
          let delMsg = msg.channel.send({embed: this.embedWVars('music', 'error_already_voted')})
          delMsg.delete(5000)
        }
      } else if (msgPrefix === this.translate[this.lang]['music']['volume_prefix']) {
        let state = this.client.voiceState[msg.guild.id]

        if (!state) {
          return undefined
        }

        if (!state.playing) {
          let delMsg = await msg.channel.send({embed: this.embedWVars('music', 'error_not_playing')})
          delMsg.delete(5000)
          return undefined
        }

        let volume = msg.content.split(' ')[2]
        volume = msg.content.indexOf(volume)
        volume = msg.content.slice(volume)

        volume = parseInt(volume)
        if (!volume) {
          let msgDel = await msg.channel.send({embed: this.embedWVars('music', 'error_not_int')})
          msgDel.delete(5000)
          return undefined
        }
        state.current.player.setVolume(volume / 100)
        state.volume = volume / 100
        let msgDel = await msg.channel.send({embed: this.embedWVars('music', 'success_change_vol', volume)})
        msgDel.delete(5000)
      } else if (msgPrefix === this.translate[this.lang]['music']['pause_prefix']) {
        let state = this.client.voiceState[msg.guild.id]

        if (!state) {
          return undefined
        }

        if (state.playing) {
          state.current.player.pause()
          state.playing = false
        }
      }
    }
  }
}
