'use strict'

var QuadTree = require('./quadtree');

exports.prepare = function(boxes) {
  return boxes.map(function(box, id) {
    return { 
      x: box[0],
      y: box[1],
      w: box[2] - box[0],
      h: box[3] - box[1],
      id: id
    }
  })
}

exports.run = function(boxes) {
  var minX = Infinity
  var minY = Infinity
  var maxX = -Infinity
  var maxY = -Infinity
  for(var i=0; i<boxes.length; ++i) {
    var b = boxes[i]
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x+b.w)
    maxY = Math.max(maxY, b.y+b.h)
  }
  var qt = QuadTree({
    x:minX, 
    y:minY, 
    w:(maxX-minX), 
    h:(maxY-minY)
  })
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    qt.retrieve(boxes[i], function(obj) {
      count += 1
    })
    qt.insert(boxes[i])
  }
  return count
}