'use strict'

var tape = require('tape')
var boxIntersect = require('../index')

function generateBoxes(d, n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    var b = new Array(d * 2)
    for(var j=0; j<d; ++j) {
      b[j] = Math.random()
    }
    for(var j=0; j<d; ++j) {
      b[j+d] = Math.random() + b[j]
    }
    result[i] = b
  }
  return result
}

function boxOverlap(d, a, b) {
  for(var i=0; i<d; ++i) {
    var a0 = a[i]
    var a1 = a[i+d]
    var b0 = b[i]
    var b1 = b[i+d]

    if(a0 > a1 || b0 > b1) {
      return false
    }
    if(!(a[0] <= b[1] && b[0] <= a[1])) {
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
  var d = boxes[0].length
  for(var i=0; i<boxes.length; ++i) {
  }
}

function algorithmFullOverlap()


tape('box-intersect', function(t) {

  t.end()
})