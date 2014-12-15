var rbush = require('rbush')

exports.name = 'rbush'

exports.prepare = function(boxes) { return boxes.map(function(b,i) {
  return [b[0], b[1], b[2], b[3]]
}) }

exports.run = function(boxes) {
  var tree = rbush(9).load(boxes)
  var count = 0
  var n = boxes.length
  for(var i=0; i<n; ++i) {
    count += tree.search(boxes[i]).length-1
  }
  return count>>>1
}