'use strict'

var kdtree = require('lazykdtree')

exports.prepare = function(boxes) {
  return boxes.map(function(box) {
    var res =  new kdtree.BoundingBox()
    var d = box.length>>>1
    var coords = new Array(d)
    for(var i=0; i<box.length>>>1; ++i) {
      coords[i] = [box[i], box[i+d]]
    }
    res.coords = coords
    return res
  })
}

exports.run = function(boxes) {
  var d = boxes[0].coords.length
  var index = new kdtree.Index(d)
  for(var i=0; i<boxes.length; ++i) {
    index.add(boxes[i])
  }
  index.update()
  var count = 0
  for(var i=0; i<boxes.length; ++i) {
    count += index.query(boxes[i]).length
  }
  return (count - boxes.length) >>> 1
}