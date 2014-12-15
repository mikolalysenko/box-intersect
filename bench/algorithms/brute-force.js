'use strict'

exports.name = 'Brute Force'

exports.prepare = function(boxes) {return boxes}

exports.run     = function(boxes) {
  var n = boxes.length
  var d = boxes[0].length>>>1
  var count = 0
  for(var k=0; k<n; ++k) {
    var a = boxes[k]
j_loop:
    for(var j=0; j<k; ++j) {
      var b = boxes[j]
      for(var i=0; i<d; ++i) {
        var a0 = a[i]
        var a1 = a[i+d]
        var b0 = b[i]
        var b1 = b[i+d]
        if(!(a0 <= b1 && b0 <= a1)) {
          continue j_loop
        }
      }
      count += 1
    }
  }
  return count
}