'use strict'

function gridRec(n, d) {
  if(d === 1) {
    var result = []
    for(var i=0; i<n; ++i) {
      result.push([i, i+1])
    }
    return result
  }
  var lo = gridRec(n, d-1)
  var result = []
  lo.forEach(function(box) {
    for(var i=0; i<n; ++i) {
      var b = new Array(2*d)
      b[0] = i
      b[d] = i+1
      for(var j=1; j<d; ++j) {
        b[j] = box[j-1]
        b[j+d] = box[j+d-2]
      }
      result.push(b)
    }
  })
  return result
}

module.exports = function(n, d) {
  var boxes = gridRec(Math.ceil(Math.pow(n, 1/d))|0, d)
  return boxes
}