var rbush = require('rbush')

exports.name = 'rbush'

exports.prepare = function(boxes) { 
  return boxes
}

function run(red, blue) {
  if(red.length > blue.length) {
    return run(blue, red)
  }
  var tree = rbush(9).load(blue) //9 seems to be faster on this example
  var count = 0
  var n = red.length
  for(var i=0; i<n; ++i) {
    count += tree.search(red[i]).length
  }
  return count
}
exports.run = run