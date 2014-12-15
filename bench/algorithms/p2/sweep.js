'use strict'

var SAP = require('p2/src/collision/SAPBroadphase')
var AABB = require('p2/src/collision/AABB')

exports.name = 'p2.js sweep and prune'

exports.prepare = function(boxes) {
  var bodies = []
  for(var i=0; i<boxes.length; ++i) {
    var box = boxes[i]
    bodies.push({
      id: i,
      aabb: new AABB({
        lowerBound: [box[0], box[1]],
        upperBound: [box[2], box[3]]
      })
    })
  }
  return {
    bodies: bodies,
    on:     function() { return this },
    off:    function() { return this }
  }
}

exports.run = function(world) {
  var sap = new SAP()
  sap.setWorld(world)
  return sap.getCollisionPairs(world).length>>>1
}