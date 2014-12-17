'use strict'

//Test internal 1D sweep line intersection

var tape = require('tape')
var iota = require('iota-array')
var genBoxes = require('./util/random-boxes')
var boxnd = require('../lib/boxnd')


function intervalOverlap(a, b) {
  return (a[0] <= b[1] && b[0] <= a[1]) && (a[0] <= a[1]) && (b[0] <= b[1])
}
function compareIntervals(a,b){
  var d = a[0]-b[0]
  if(d) { 
    return d
  }
  return a[1]-b[1]
}
function canonicalizeIntervals(intervals) {
  var r = intervals.map(function(x) {
    return [Math.min(x[0],x[1]), Math.max(x[0], x[1])]
  })
  r.sort(compareIntervals)
  return r
}
function bruteForceIntersect(boxes) {
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<=i; ++j) {
      if(intervalOverlap(boxes[i], boxes[j])) {
        result.push([j,i])
      }
    }
  }
  return canonicalizeIntervals(result)
}
function algorithmicIntersect(boxes) {
  boxnd.sweepInit(boxes.length)
  var result = []
  boxnd.sweepFull(boxes, function(i,j) {
    result.push([i,j])
  })
  return canonicalizeIntervals(result)
}


function bruteForceRBIntersect(
  redStart, redEnd, red, 
  blueStart, blueEnd, blue) {

  var result = []
  for(var i=redStart; i<redEnd; ++i) {
    for(var j=blueStart; j<blueEnd; ++j) {
      if(intervalOverlap(red[i], blue[j])) {
        result.push([i,j])
      }
    }
  }
  result.sort(compareIntervals)
  return result
}
function algorithmicRBIntersect(
  redStart, redEnd, red, 
  blueStart, blueEnd, blue) {

  var result = []
  function visit(i,j) {
    result.push([i,j])
  }

  boxnd.sweepInit(Math.max(red.length, blue.length))

  var redFlat = genBoxes.flatten(red)
  var redIds = iota(red.length)
  var blueFlat = genBoxes.flatten(blue)
  var blueIds = iota(blue.length)

  boxnd.sweep(1, visit,
    redStart, redEnd, redFlat, redIds,
    blueStart, blueFlat, blueIds)

  result.sort(compareIntervals)
  return result
}

tape('sweep1D', function(t) {

  function full(boxes) {
    t.same(algorithmicIntersect(boxes), bruteForceIntersect(boxes))
  }

  function bipartite(
    redStart, redEnd, red, 
    blueStart, blueEnd, blue) {
    t.same(
      algorithmicRBIntersect(
        redStart, redEnd, red, 
        blueStart, blueEnd, blue), 
      bruteForceIntersect(
        redStart, redEnd, red, 
        blueStart, blueEnd, blue))
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

  bipartite(
    0, 7,
    [
      [0,0],
      [1,-1],
      [0,2],
      [1,2],
      [2,3],
      [2,2],
      [-10, 10]
    ],
    0, 4,
    [ [0,0],
      [1,1],
      [2,2],
      [-1, 3] ])

  for(var i=0; i<10; ++i) {
    var red = []
    var blue = []
    for(var j=0; j<100; ++j) {
      red.push([Math.random(), Math.random()])
      blue.push([Math.random(), Math.random()])
    }
    full(red)
    full(blue)
    bipartite(
      0, 100, red, 
      0, 100, blue)
    bipartite(
      20, 24, red, 
      30, 40, blue)
  }

  t.end()
})