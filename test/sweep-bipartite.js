'use strict'

//Test internal 1D sweep line intersection
var tape = require('tape')
var iota = require('iota-array')
var guard = require('guarded-array')
var genBoxes = require('./util/random-boxes')
var misc = require('./util/misc')
var sweep = require('../lib/sweep')

function bruteForceRBIntersect(
  redStart, redEnd, red, 
  blueStart, blueEnd, blue) {
  var result = []
  for(var i=redStart; i<redEnd; ++i) {
    for(var j=blueStart; j<blueEnd; ++j) {
      if(misc.intervalOverlap(red[i], blue[j])) {
        result.push([i,j])
      }
    }
  }
  return misc.canonicalize(result)
}

function algorithmicRBIntersect(
  redStart, redEnd, red, 
  blueStart, blueEnd, blue) {

  var result = []
  function visit(i,j) {
    result.push([i,j])
  }

  sweep.init(red.length+blue.length)

  var d = (red[0].length>>>1)

  var redFlat = genBoxes.flatten(red)
  var redIds = iota(red.length)
  var blueFlat = genBoxes.flatten(blue)
  var blueIds = iota(blue.length)

  sweep.sweepBipartite(1, visit,
    redStart, 
    redEnd, 
    guard(redFlat, 2*d*redStart, 2*d*redEnd), 
    guard(redIds, redStart, redEnd),
    blueStart, 
    blueEnd,
    guard(blueFlat, 2*d*blueStart, 2*d*blueEnd), 
    guard(blueIds, blueStart, blueEnd))

  return misc.canonicalize(result)
}

tape('sweep-bipartite', function(t) {

  function bipartite(
    redStart, redEnd, red, 
    blueStart, blueEnd, blue) {

    var actual = algorithmicRBIntersect(
        redStart, redEnd, red, 
        blueStart, blueEnd, blue)
    var expected = bruteForceRBIntersect(
        redStart, redEnd, red, 
        blueStart, blueEnd, blue)

    t.equals(actual.join(';'), expected.join(';'))
  }
 
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
  bipartite(0, bigBoxes.length, bigBoxes, 0, bigBoxes.length, bigBoxes)

  t.end()
})