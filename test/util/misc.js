function comparePair(a,b){
  var d = a[0]-b[0]
  if(d) { 
    return d
  }
  return a[1]-b[1]
}
function canonicalizePairs(intervals) {
  var r = intervals.map(function(x) {
    return [Math.min(x[0],x[1]), Math.max(x[0], x[1])]
  })
  r.sort(comparePair)
  return r
}
exports.canonicalize = canonicalizePairs

function boxOverlap(d, a, b) {
  for(var i=0; i<d; ++i) {
    var a0 = a[i]
    var a1 = a[i+d]
    var b0 = b[i]
    var b1 = b[i+d]
    if(a0 > a1 || 
       b0 > b1 ||
       a1 < b0 ||
       b1 < a0) {
      return false
    }
  }
  return true
}
exports.boxOverlap = boxOverlap

function intervalOverlap(a, b) {
  return (a[0] <= a[1]) && 
         (b[0] <= b[1]) && 
         (a[0] <= b[1]) && 
         (b[0] <= a[1])
}
exports.intervalOverlap = intervalOverlap