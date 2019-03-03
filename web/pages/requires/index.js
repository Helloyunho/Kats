const glob = require('glob')
const path = require('path')

module.exports = {}

glob('./*.requires.js', { cwd: path.resolve(__dirname), ignore: './example.requires.js' }, (err, match) => {
  if (err) {
    throw err
  }

  match.forEach(x => {
    let asdf = /(\.\/)(.+)(\.requires\.js)/
    asdf = asdf.exec(x)
    module.exports[asdf[2]] = require(x)
  })
})
