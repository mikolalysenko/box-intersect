module.exports = function(n, d, options) {
  var result  = new Array(n)
  var sizeLo  = options.lo 
  var sizeHi  = options.hi

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