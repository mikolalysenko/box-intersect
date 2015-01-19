var jsts = require('jsts')

var STRTree = jsts.index.strtree.STRtree
var Envelope = jsts.geom.Envelope
var ItemVisitor = jsts.index.ItemVisitor

exports.prepare = function(boxes) {
  return boxes.map(function(box) {
    return new Envelope(box[0], box[2], box[1], box[3])
  })
}

exports.run = function(boxes) {
  var qt = new STRTree()
  for(var i=0; i<boxes.length; ++i) {
    qt.insert(boxes[i], i)
  }
  var count = 0
  var visitor = new ItemVisitor()
  visitor.visitItem = function(j) {
    if(j < i) {
      count += 1
    }
  }
  for(var i=0; i<boxes.length; ++i) {
    qt.query(boxes[i], visitor)
  }
  return count
}