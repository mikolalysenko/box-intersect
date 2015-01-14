module.exports = function(cells, positions) {
  var d = positions[0].length
  return cells.map(function(c) {
    var b = new Array(2*d)
    for(var i=0; i<d; ++i) {
      b[i] = Infinity
      b[i+d] = -Infinity
    }
    for(var j=0; j<c.length; ++j) {
      var x = positions[c[j]]
      for(var i=0; i<d; ++i) {
        b[i] = Math.min(b[i], x[i])
        b[i+d] = Math.max(b[i+d], x[i])
      }
    }
    return b
  })
}