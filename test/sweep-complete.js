'use strict'

var tape = require('tape')
var guard = require('guarded-array')
var misc = require('./util/misc')
var sweep = require('../lib/sweep')
var uniq = require('uniq')

function bruteForceFullIntersect(boxes) {
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

function fullIntersect(boxes) {
  sweep.init(boxes.length)
  var d = boxes[0].length>>>1

  var converted = new Array(2*d*boxes.length)
  var ids = new Array(boxes.length)
  var ptr = 0
  for(var i=0; i<boxes.length; ++i) {
    ids[i] = i
    for(var j=0; j<2*d; ++j) {
      converted[ptr++] = boxes[i][j]
    }
  }

  var result = []
  sweep.sweepComplete(d, 
    function(i,j) {
      result.push([Math.min(i,j), Math.max(i,j)])
    },
    0, boxes.length, guard(converted), guard(ids),
    0, boxes.length, guard(converted), guard(ids))

  return misc.canonicalize(result)
}

function bruteForceIntersect(red, redIds, blue, blueIds) {
  var pairs = []
  for(var i=0; i<red.length; ++i) {
    for(var j=0; j<blue.length; ++j) {
      if(misc.intervalOverlap(red[i], blue[j])) {
        var r = redIds[i]
        var b = blueIds[j]
        if(r !== b) {
          pairs.push([Math.min(r,b), Math.max(r,b)])
        }
      }
    }
  }
  return uniq(pairs, function(a,b) {
    var d = a[0] - b[0]
    if(d) {
      return d
    }
    return a[1] - b[1]
  })
}

function pairIntersect(red, redIds, blue, blueIds) {
  function convert(boxes) {
    var n = boxes.length
    var pBoxes = new Array(2*n)
    var ptr = 0
    for(var i=0; i<n; ++i) {
      for(var j=0; j<boxes[i].length; ++j) {
        pBoxes[ptr++] = boxes[i][j]
      }
    }
    return pBoxes
  }
  var result = []
  sweep.sweepComplete(1, 
    function(i,j) {
      result.push([Math.min(i,j), Math.max(i,j)])
    },
    0, red.length, guard(convert(red)), guard(redIds),
    0, blue.length, guard(convert(blue)), guard(blueIds))
  return misc.canonicalize(result)
}

tape('sweep-complete', function(t) {

  function full(boxes) {
    t.equals(
      fullIntersect(boxes).join(':'), 
      bruteForceFullIntersect(boxes).join(':'))
  }

  function pairs(red, redIds, blue, blueIds) {
    t.equals(
      pairIntersect(red, redIds, blue, blueIds).join(':'),
      bruteForceIntersect(red, redIds, blue, blueIds).join(':'))
  }

  full([
    [0,0],
    [-1,1],
    [0,2],
    [1,2],
    [2,3],
    [2,2],
    [-10, 10]
  ])
 
  pairs([
    [0,0],
    [-1,1],
    [0,2],
    [1,2],
    [2,3],
    [2,2],
    [-10, 10]
  ],
  [0, 1, 2, 3, 4, 5, 6],
  [
    [0,0],
    [-1,1],
    [0,2],
    [1,2],
    [2,3],
    [2,2],
    [-10, 10]
  ],
  [0, 1, 2, 3, 7, 8, 9])

  t.end()
})