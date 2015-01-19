var jsts = require('jsts')

var QuadTree = jsts.index.quadtree.Quadtree
var Envelope = jsts.geom.Envelope

exports.prepare = function(boxes) {
  return boxes.map(function(box) {
    return new Envelope(box[0], box[2], box[1], box[3])
  })
}

exports.run = function(boxes) {
  var qt = new QuadTree()
  var count = 0
  var visitor = {
    visitItem: function(j) {
      if(boxes[i].intersectsEnvelope(boxes[j])) {
        count += 1
      }
    }
  }
  for(var i=0; i<boxes.length; ++i) {
    qt.queryWithVisitor(boxes[i], visitor)
    qt.insert(boxes[i], i)
  }
  return count
}