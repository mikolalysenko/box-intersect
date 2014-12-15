var box2d = require('./box2d')

exports.name = 'box2d'

exports.prepare = function(boxes) {
  return boxes.map(function(b) {
    var aabb = new box2d.AABB()
    aabb.lowerBound.x = b[0]
    aabb.lowerBound.y = b[1]
    aabb.upperBound.x = b[2]
    aabb.upperBound.y = b[3]
    return aabb
  })
}

exports.run = function(boxes) {
  var broadphase = new box2d.BroadPhase()
  var n = boxes.length
  for(var i=0; i<n; ++i) {
    broadphase.CreateProxy(boxes[i], i)
  }
  var count = 0
  broadphase.UpdatePairs({
    AddPair: function(anum, bnum) {
      //Box2D over reports collisions
      var a = boxes[anum]
      var b = boxes[bnum]

      if(a.lowerBound.x <= b.upperBound.x &&
         b.lowerBound.x <= a.upperBound.x &&
         a.lowerBound.y <= b.upperBound.y &&
         b.lowerBound.y <= a.upperBound.y) {
        count += 1
      }
    }
  })
  return count
}