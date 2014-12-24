'use strict'

var intersect = require('../../index').direct

exports.name = 'box-intersect'

exports.prepare = function(boxes) {return boxes}

exports.run     = function(boxes) {
  var count = 0
  intersect(boxes, boxes, function(i,j) {
    if(i !== j) {
      count += 1
    }
  }, true)
  return count
}