'use strict'

function gridRec(n, d) {
  if(d === 1) {
    var result = []
    for(var i=0; i<n; ++i) {
      var x = i+Math.random() * 0.25
      result.push([x, x+Math.random()*0.25])
    }
    return result
  }
  var lo = gridRec(n, d-1)
  var result = []
  lo.forEach(function(box) {
    for(var i=0; i<n; ++i) {
      var b = new Array(2*d)
      b[0] = i + Math.random()*0.25 
      b[d] = b[0] + Math.random() * 0.25
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
  var G = Math.ceil(Math.pow(n, 1/d))|0
  var boxes = gridRec(G, d)

  var k = 0

  for(var i=-1; i<G; ++i) {
    var p = new Array(2*d)
    for(var j=0; j<d; ++j) {
      p[j]   = Math.random()
      p[j+d] = G + Math.random()
    }
    p[k]   = i+0.25 + 0.5*Math.random()
    p[k+d] = p[k] + 0.25 * Math.random()
    boxes.push(p)
  }
  
  return boxes
}