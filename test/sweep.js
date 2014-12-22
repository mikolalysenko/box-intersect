'use strict'

//Test internal 1D sweep line intersection

var tape = require('tape')
var iota = require('iota-array')
var guard = require('guarded-array')
var genBoxes = require('./util/random-boxes')
var boxnd = require('../lib/boxnd')

function intervalOverlap(a, b) {
  return (a[0] <= a[1]) && 
         (b[0] <= b[1]) && 
         (a[0] <= b[1]) && 
         (b[0] <= a[1])
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
  boxnd.sweepFull(guard(boxes), function(i,j) {
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

  var d = (red[0].length>>>1)

  var redFlat = genBoxes.flatten(red)
  var redIds = iota(red.length)
  var blueFlat = genBoxes.flatten(blue)
  var blueIds = iota(blue.length)

  boxnd.sweep(1, visit,
    redStart, 
    redEnd, 
    guard(redFlat, 2*d*redStart, 2*d*redEnd), 
    guard(redIds, redStart, redEnd),
    blueStart, 
    blueEnd,
    guard(blueFlat, 2*d*blueStart, 2*d*blueEnd), 
    guard(blueIds, blueStart, blueEnd))

  result.sort(compareIntervals)
  return result
}

tape('sweep1D', function(t) {

  function full(boxes) {
    t.same(
      algorithmicIntersect(boxes), 
      bruteForceIntersect(boxes))
  }

  function bipartite(
    redStart, redEnd, red, 
    blueStart, blueEnd, blue) {
    t.same(
      algorithmicRBIntersect(
        redStart, redEnd, red, 
        blueStart, blueEnd, blue), 
      bruteForceRBIntersect(
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
      [-1,1],
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
      var rs = Math.random()
      var bs = Math.random()
      red.push([rs, rs+Math.random()])
      blue.push([bs, bs+Math.random()])
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


  var bigBoxes = genBoxes.degenerate(3).map(function(b) {
    return [ b[2], b[5] ]
  })
  full(bigBoxes)
  bipartite(0, bigBoxes.length, bigBoxes, 0, bigBoxes.length, bigBoxes)

  t.end()
})