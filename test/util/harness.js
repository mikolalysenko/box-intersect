exports.full = verifyFull
exports.bipartite = verifyBipartite

var boxIntersect = require('../../index')

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

function compareResult(a, b) {
  var d = a[0] - b[0]
  if(d) {
    return d
  }
  return a[1] - b[1]
}

function bruteForceFullOverlap(boxes) {
  console.log('brute force...')
  var d = (boxes[0].length)>>>1
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<i; ++j) {
      if(boxOverlap(d, boxes[i], boxes[j])) {
        result.push([j,i])
      }
    }
  }
  result.sort(compareResult)
  return result
}

function algorithmFullOverlap(boxes) {
  console.log('algorithm...')
  var result = boxIntersect(boxes).map(function(pair) {
    return [ Math.min(pair[0], pair[1]), Math.max(pair[0], pair[1]) ]
  })
  result.sort(compareResult)
  return result
}

function verifyFull(tape, boxes, str) {

  tape.equals(
    algorithmFullOverlap(boxes).join(':'),
    bruteForceFullOverlap(boxes).join(':'),
    str)
}


function bruteForceBipartiteOverlap(boxes, otherBoxes) {
  console.log('brute force...')
  var d = (boxes[0].length)>>>1
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<otherBoxes.length; ++j) {
      if(boxOverlap(d, boxes[i], otherBoxes[j])) {
        result.push([i,j])
      }
    }
  }
  result.sort(compareResult)
  return result
}

function algorithmPartialOverlap(boxes, otherBoxes) {
  console.log('algorithm...')
  var result = boxIntersect(boxes, otherBoxes)
  result.sort(compareResult)
  return result
}

function verifyBipartite(tape, boxes, otherBoxes, str) {
  tape.equals(
    algorithmPartialOverlap(boxes, otherBoxes).join(':'),
    bruteForceBipartiteOverlap(boxes, otherBoxes).join(':'),
    str)
}