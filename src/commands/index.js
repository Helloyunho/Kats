const { readdirSync } = require('fs')
const blacklist = ['.DS_Store', 'index.js']

module.exports = []

readdirSync('./src/commands').forEach((command) => {
  if (blacklist.includes(command)) {
    return
  }
  module.exports.push(require(`./${command}`))
})
