'use strict'

var QuadTree = require('region-quadtree-2d/quadtree')
var AABB = require('region-quadtree-2d/aabb')

exports.prepare = function(boxes) {
  return boxes.map(function(box, id) {
    return new AABB(
      [box[0], box[1]], 
      box[2] - box[0],
      box[3] - box[1])
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
  var qt = new QuadTree(0, new AABB([minX, minY], maxX-minX, maxY-minY))
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    var a = boxes[i]
    var potential = qt.detectPotentialCollisions([], a)
    for(var j=0; j<potential.length; ++j) {
      var b0 = potential
    }
    qt.insert(boxes[i])
  }
  return count
}