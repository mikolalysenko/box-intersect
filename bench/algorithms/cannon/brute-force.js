var AABB = require('cannon/src/collision/AABB')
var SAPBroadphase = require('cannon/src/collision/SAPBroadphase')

exports.prepare = function(boxes) {
  var bodies = []
  for(var i=0; i<boxes.length; ++i) {
    var box = boxes[i]
    bodies.push({
      id: i,
      aabb: new AABB({
        lowerBound: [box[0], box[1]],
        upperBound: [box[2], box[3]]
      }),
      collisionFilterGroup: 0xff,
      collisionFilterMask: 0xff,
      type: 0,
      sleepState: 1054
    })
  }
  return {
    bodies: bodies,
    on:     function() { return this },
    off:    function() { return this },
    addEventListener: function() {},
    removeEventListener: function() {}
  }
}

exports.run = function(world) {
  var bp = new SAPBroadphase()
  bp.setWorld(world)
  var left = []
  var right = []
  bp.collisionPairs(world, left, right)
  console.log(left, right)
  return left.length
}