var rbush = require('rbush')

exports.name = 'rbush'

exports.prepare = function(boxes) { return boxes.map(function(b,i) {
  return [b[0], b[1], b[2], b[3]]
}) }

exports.run = function(boxes) {
  var tree = rbush(16)  //16 seems to give best results
  var count = 0
  var n = boxes.length
  for(var i=0; i<n; ++i) {
    count += tree.search(boxes[i]).length
    tree.insert(boxes[i])
  }
  return count
}