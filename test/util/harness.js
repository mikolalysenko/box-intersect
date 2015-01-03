exports.full = verifyFull
exports.bipartite = verifyBipartite

var util = require('util')
var diff = require('./diff')
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
  var result = []
  function visit(i,j) {
    var lo = Math.min(i,j)
    var hi = Math.max(i,j)
    for(var k=0; k<result.length; ++k) {
      if(result[k][0] === lo && result[k][1] === hi) {
        throw new Error('bad!')
      }
    }
    if(i === j) {
      throw new Error("wth")
    }
    result.push([lo,hi])
  }
  boxIntersect(boxes, visit)
  result.sort(compareResult)
  return result
}

function verifyFull(tape, boxes, str) {

  var expectedBoxes = bruteForceFullOverlap(boxes)
  var actualBoxes   = algorithmFullOverlap(boxes)

  if(expectedBoxes.join(':') === actualBoxes.join(':')) {
    tape.pass(str)
  } else {
    tape.fail(str)
    for(var i=0; i<actualBoxes.length; ++i) {
      console.log(i, actualBoxes[i], expectedBoxes[i])
    }
    console.log(util.inspect(
      diff(actualBoxes, expectedBoxes)))
  }
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