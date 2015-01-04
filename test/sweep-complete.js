'use strict'

var tape = require('tape')

function bruteForceIntersect(boxes) {
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<i; ++j) {
      if(misc.intervalOverlap(boxes[i], boxes[j])) {
        result.push([j,i])
      }
    }
  }
  return misc.canonicalize(result)
}

function algorithmicIntersect(boxes) {
  boxnd.sweepInit(boxes.length)
  var result = []
  boxnd.sweepComplete(guard(boxes), function(i,j) {
    result.push([i,j])
  })
  return misc.canonicalize(result)
}

tape('sweep-complete', function(t) {

  function verify(boxes) {
    t.equals(
      algorithmicIntersect(boxes).join(':'), 
      bruteForceIntersect(boxes).join(':'))
  }

   full([
    [0,0],
    [1,-1],
    [0,2],
    [1,2],
    [2,3],
    [2,2],
    [-10, 10]
  ])
 
  t.end()
})