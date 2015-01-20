function defaultLo(d, n) {
  var result = new Array(d)
  for(var i=0; i<d; ++i) {
    result[i] = 0
  }
  return result
}

function defaultHi(lo, d, n) {
  var n1d = Math.pow(n, 1-1/d)/n
  var result = new Array(d)
  for(var i=0; i<d; ++i) {
    result[i] = lo[i] + n1d
  }
  return result
}

module.exports = function(options) {
  var n = options.n|0
  var d = options.d|0
  var result  = new Array(n)
  var sizeLo  = options.lo || defaultLo(d, n) 
  var sizeHi  = options.hi || defaultHi(sizeLo, d, n)

  for(var i=0; i<n; ++i) {
    var box = new Array(2*d)
    for(var j=0; j<d; ++j) {
      box[j] = Math.random()
    }
    for(var j=0; j<d; ++j) {
      box[j+d] = box[j] + (sizeLo[j] + (sizeHi[j]-sizeLo[j]) * Math.random())
    }
    result[i] = box
  }

  return result
}