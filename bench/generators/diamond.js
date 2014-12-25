'use strict'

module.exports = function(n, d) {
  var result = []
  for(var i=0; i<n; ++i) {
    var lo0 = i
    var hi0 = i+1
    var lo1 = 0
    var hi1 = i+1
    for(var j=0; j<d; ++j) {
      var box = new Array(2*d)
      for(var k=0; k<d; ++k) {
        if(k === j) {
          box[k] = lo0
          box[k+d] = hi0
        } else {
          box[k] = lo1
          box[k+d] = hi1
        }
      }
      result.push(box)
    }
  }
  return result
}