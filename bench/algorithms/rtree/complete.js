'use strict'

var RTree = require('rtree')

exports.prepare = function(boxes) {
  return boxes.map(function(box) {
    return {
      x: box[0], 
      y: box[1],
      w: box[2] - box[0],
      h: box[3] - box[1]
    }
  })
}

exports.run = function(boxes) {
  var rtree = new RTree()
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    count += rtree.search(boxes[i]).length
    rtree.insert(boxes[i])
  }
  return count
}