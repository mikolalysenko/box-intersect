'use strict'

var QuadTree = require('node-trees').QuadTree

exports.prepare = function(boxes) {
  return boxes.map(function(box, id) {
    return { 
      x: box[0],
      y: box[1],
      width: box[2] - box[0],
      height: box[3] - box[1]
    }
  })
}

exports.run = function(boxes) {
  var qt = new QuadTree(1<<20)
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    count += qt.get(boxes[i]).length
    qt
    qt.insert(boxes[i])
  }
  return count
}