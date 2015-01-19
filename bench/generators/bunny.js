var bunny = require('bunny')
var sc = require('./sc')

module.exports = function() {
  return sc(bunny.cells, bunny.positions)
}