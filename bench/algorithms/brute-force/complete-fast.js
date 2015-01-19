'use strict'

exports.name = 'Brute Force - Length Encoding'

exports.prepare = function(boxes) {
  return boxes.map(function(b) {
    var r = new Array(b.length)
    var d = b.length>>>1
    for(var i=0; i<d; ++i) {
      r[2*i] = 0.5 * (b[i+d] + b[i])
      r[2*i+1] = 0.5 * (b[i+d] - b[i])
    }
    return r
  })
}

exports.run     = function(boxes) {
  var n = boxes.length
  var d = boxes[0].length
  var count = 0
  for(var k=0; k<n; ++k) {
    var a = boxes[k]
j_loop:
    for(var j=0; j<k; ++j) {
      var b = boxes[j]
      for(var i=0; i<d; i+=2) {
        var a0 = a[i]
        var a1 = a[i+1]
        var b0 = b[i]
        var b1 = b[i+1]
        if(Math.abs(a0 - b0) > (a1 + b1)) {
          continue j_loop
        }
      }
      count += 1
    }
  }
  return count
}