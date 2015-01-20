'use strict'

var intersect = require('../../../index')

exports.name = 'box-intersect'

exports.prepare = function(boxes) {return boxes}

exports.run     = function(red, blue) {
  var count = 0
  intersect(red, blue, function(i,j) {
    count += 1
  })
  return count
}