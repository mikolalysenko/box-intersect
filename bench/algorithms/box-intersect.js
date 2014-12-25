'use strict'

var intersect = require('../../index')

exports.name = 'box-intersect'

exports.prepare = function(boxes) {return boxes}

exports.run     = function(boxes) {
  var count = 0
  intersect(boxes, function(i,j) {
    count += 1
  })
  return count
}