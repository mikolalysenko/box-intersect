'use strict'

exports.flatten = flatten

function flatten(boxes) {
  var result = new Array(boxes.length * boxes[0].length)
  var ptr = 0
  for(var i=0; i<boxes.length; ++i) {
    var box = boxes[i]
    for(var j=0; j<box.length; ++j) {
      result[ptr++] = box[j]
    }
  }
  return result
}


exports.random = randomBoxes

function randomBoxes(n, d) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    var box = new Array(d)
    for(var j=0; j<d; ++j) {
      box[j] = Math.random()
    }
    for(var j=0; j<d; ++j) {
      box[j+d] = box[j] + Math.random()
    }
    result[i] = box
  }
  return result
}

exports.degenerate = degenerateBox

function cartesianProduct(a, b) {
  var result = []
  for(var i=0; i<a.length; ++i) {
    for(var j=0; j<b.length; ++j) {
      var x = a[i].slice()
      x.push(b[j])
      result.push(x)
    }
  }
  return result
}

function testValid(box) {
  var d = (box.length>>1)
  for(var i=0; i<d; ++i) {
    if(box[i+d] < box[i]) {
      return false
    }
  }
  return true
}

function degenerateBox(d) {
  var SAMPLE_POINTS = [ -1, 0, 0, 1 ]
  var result = [ [] ]
  for(var i=0; i<2*d; ++i) {
    result = cartesianProduct(result, SAMPLE_POINTS)
  }
  return result.filter(testValid)
}

var HARD_CASES = [
  {
    d: 2,
    red: [[0,0,0,0]],
    blue: [[0,0,0,0]]
  }

]

exports.hard = HARD_CASES

function diamonds(n, d) {
  var result = []
  for(var i=0; i<n; ++i) {
    var lo0 = i
    var hi0 = i+1
    var lo1 = 0
    var hi1 = i+1
    for(var j=0; j<d; ++j) {
      var box = new Array(2*d)
      for(var k=0; k<d; ++k) {
        if(k === j) {
          box[k] = lo0
          box[k+d] = hi0
        } else {
          box[k] = lo1
          box[k+d] = hi1
        }
      }
      result.push(box)
    }
  }
  return result
}
exports.diamonds = diamonds