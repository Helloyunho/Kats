const glob = require('glob')
const path = require('path')

module.exports = {}

glob('./*', {cwd: path.resolve(__dirname), ignore: './index.js'}, (err, match) => {
  if (err) {
    throw err
  }

  match.forEach(x => {
    let asdf = /(\.\/)(.+)(\.js)/
    asdf = asdf.exec(x)
    module.exports[asdf[2]] = require(x)
  })
})
