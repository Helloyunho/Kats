const command = require('../command')
const NodeRSA = require('node-rsa')
const ase256 = require('aes256')
const sha256 = require('sha256')
const request = require('request')
const crypto = require('crypto')

module.exports = class extends command {
  constructor (...args) {
    super(...args)
    this.encodeType = ['md5', 'ascii', 'base64', 'sha256', 'rsa', 'aes256']
    this.decodeType = ['ascii', 'base64', 'rsa', 'aes256']
  }
  async message (msg) {
    let a = this.updateLang(msg.guild.id)
    if (this.getPrefix('encode', msg) && a) {
      let splited = msg.content.split(' ')
      let type = splited[2]
      let indexx = msg.content.indexOf(splited[3])
      let content = msg.content.slice(indexx)
      if (!this.encodeType.includes(type)) {
        msg.channel.send({embed: this.embedWVars('encode', 'error_invaild_type')})
        return undefined
      }
      if (!content) {
        msg.channel.send({embed: this.embedWVars('encode', 'error_no_content')})
        return undefined
      }
      if (this.encodeType.indexOf(type) === 0) {
        msg.channel.send({embed: this.embedWVars('encode', 'success', crypto.createHash('md5').update(content).digest('hex'))})
      } else if (this.encodeType.indexOf(type) === 1) {
        let data = []
        for (let a = 0; a < content.length; a++) {
          data.push(content.charCodeAt(a))
        }
        msg.channel.send({embed: this.embedWVars('encode', 'success', data.join(' '))})
      } else if (this.encodeType.indexOf(type) === 2) {
        msg.channel.send({embed: this.embedWVars('encode', 'success', Buffer.from(content).toString('base64'))})
      } else if (this.encodeType.indexOf(type) === 3) {
        msg.channel.send({embed: this.embedWVars('encode', 'success', sha256(content))})
      } else if (this.encodeType.indexOf(type) === 4) {
        let key = (msg.attachments.array())[0]
        if (!key) {
          msg.channel.send({embed: this.embedWVars('encode', 'error_no_key')})
          return undefined
        }
        request(key.url, (err, req, body) => {
          if (err) {
            throw err
          }
          let publicKey = new NodeRSA()
          publicKey.importKey(body, 'public')
          msg.channel.send({embed: this.embedWVars('encode', 'success', publicKey.encrypt(content, 'base64'))})
        })
      } else if (this.encodeType.indexOf(type) === 5) {
        let key = (msg.attachments.array())[0]
        if (!key) {
          msg.channel.send({embed: this.embedWVars('encode', 'error_no_key')})
          return undefined
        }
        request(key.url, (err, req, body) => {
          if (err) {
            throw err
          }
          msg.channel.send({embed: this.embedWVars('encode', 'success', ase256.encrypt(body, content))})
        })
      }
    }
    if (this.getPrefix('decode', msg) && a) {
      let splited = msg.content.split(' ')
      let type = splited[2]
      let indexx = msg.content.indexOf(splited[3])
      let content = msg.content.slice(indexx)
      if (!this.decodeType.includes(type)) {
        msg.channel.send({embed: this.embedWVars('decode', 'error_invaild_type')})
        return undefined
      }
      if (!content) {
        msg.channel.send({embed: this.embedWVars('decode', 'error_no_content')})
        return undefined
      }
      if (this.decodeType.indexOf(type) === 0) {
        let data = content.split(' ')
        data.map(x => {
          return parseInt(x)
        })
        msg.channel.send({embed: this.embedWVars('decode', 'success', String.fromCharCode(...data))})
      } else if (this.decodeType.indexOf(type) === 1) {
        msg.channel.send({embed: this.embedWVars('decode', 'success', Buffer.from(content, 'base64').toString('utf8'))})
      } else if (this.decodeType.indexOf(type) === 2) {
        let key = (msg.attachments.array())[0]
        if (!key) {
          msg.channel.send({embed: this.embedWVars('decode', 'error_no_key')})
          return undefined
        }
        request(key.url, (err, req, body) => {
          if (err) {
            throw err
          }
          let publicKey = new NodeRSA()
          publicKey.importKey(body, 'pkcs8-private')
          msg.channel.send({embed: this.embedWVars('decode', 'success', publicKey.decrypt(content, 'utf8'))})
        })
      } else if (this.decodeType.indexOf(type) === 3) {
        let key = (msg.attachments.array())[0]
        if (!key) {
          msg.channel.send({embed: this.embedWVars('decode', 'error_no_key')})
          return undefined
        }
        request(key.url, (err, req, body) => {
          if (err) {
            throw err
          }
          msg.channel.send({embed: this.embedWVars('decode', 'success', ase256.decrypt(body, content))})
        })
      }
    }
  }
}
