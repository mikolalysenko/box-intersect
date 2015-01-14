var gaussRand = require('gauss-random')

module.exports = function(n, d, options) {
  var result = []
  var C = Math.sqrt(n)
  for(var i=0; i<C; ++i) {
    for(var j=0; j<C; ++j) {
      var b = new Array(2*d)
      for(var k=0; k<d; ++k) {
        b[k] = gaussRand()
        b[k+d] = b[k] + Math.pow(Math.random(), 8)
      }
      result.push(b)
    }
    var bb = new Array(2*d)
    for(var j=0; j<d; ++j) {
      bb[j] = i
      bb[j+d] = i+1
    }
    bb[0] = 0
    bb[d] = d
  }

  return result
}