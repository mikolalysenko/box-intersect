var AABB = require('./AABB')

exports.prepare = function(boxes) {
  return boxes.map(function(b, i) {
    return {
      aabb: new AABB(b[0], b[3], b[1], b[4], b[2], b[5]),
      id: i,
      belongsTo: 1,
      collidesWith: 1,
      parent: {
        sleeping: false,
        isDynamic: true,
        numJoints: 0,
        jointLink: null
      }
    }
  })
}

exports.run = function(BroadPhase, boxes) {
  var bp = new BroadPhase()
  for(var i=0; i<boxes.length; ++i) {
    bp.addProxy(bp.createProxy(boxes[i]))
  }
  bp.detectPairs()
  return bp.numPairs
}