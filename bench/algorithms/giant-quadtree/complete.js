'use strict'

var QuadTree = require('giant-quadtree/src/quadtree');

exports.prepare = function(boxes) {
  return boxes.map(function(box, id) {
    return { 
      left: box[0],
      top: box[1],
      width: box[2] - box[0],
      height: box[3] - box[1],
      id: id
    }
  })
}

exports.run = function(boxes) {
  var qt = QuadTree.create()
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    count += qt.get(boxes[i].left, boxes[i].top, boxes[i].width, boxes[i].height).length
    qt.insert(boxes[i])
  }
  return count
}