var sampleSphere = require('sphere-random')

module.exports = function(n, d, options) {
  var result = []
  var n1d = Math.pow(n, 1-1/d)
  for(var i=0; i<n; ++i) {
    var p = sampleSphere(d)
    var box = new Array(2*d)
    for(var j=0; j<d; ++j) {
      var l = 0.125 * Math.random() * Math.pow(n, 0.25)
      box[j] = n * p[j] - l
      box[j+d] = n * p[j] + l
    }
    result.push(box)
  }
  return result
}