'use strict'

var tape = require('tape')
var dup = require('dup')
var iota = require('iota-array')
var guard = require('guarded-array')
var genBoxes = require('./util/random-boxes')
var median = require('../lib/median')
var shuffle = require('array-shuffle')

function stripAxis(array, axis) {
  return array.map(function(box) {
    return box[axis]
  })
}

function slowMedian(data, lo, hi) {
  var sorted = data.slice()
  sorted.sort(function(a,b) {
    return a - b
  })
  var mid = (lo + hi)>>>1
  var midV = sorted[mid]
  while(lo < mid && 
    sorted[mid-1] === midV) {
    mid -= 1
  }
  return [mid, midV]
}

function toBoxes(data, d, axis) {
  var result = new Array(data.length)
  var counter = 0

  for(var i=0; i<data.length; ++i) {
    var box = new Array(2*d)
    for(var j=0; j<2*d; ++j) {
      box[j] = counter++
    }
    box[axis] = data[i]
    result[i] = box
  }
  return result
}

tape('findMedian', function(t) {

  function verify(data, lo, hi) {
    if(lo === void 0) {
      lo = 0
    }
    if(hi === void 0) {
      hi = data.length
    }
    var expectedResult = slowMedian(data, lo, hi)
    var expectedIndex  = expectedResult[0]
    var expectedMedian = expectedResult[1]

    //Try packing into boxes
    for(var d=2; d<=3; ++d) {
      for(var axis=0; axis<d; ++axis) {
        var boxes = toBoxes(data, d, axis)
        var flatBoxes = genBoxes.flatten(boxes)
        var indices = iota(data.length)

        var computedIndex = median(
          d, axis, 
          lo, hi, 
          guard(flatBoxes, 2*d*lo, 2*d*hi), 
          guard(indices, lo, hi))

        t.equals(computedIndex, expectedIndex, 'median ok')

        console.log(flatBoxes.filter(function(v,i) {
          return (i%(2*d))===axis
        }))

        for(var i=lo; i<computedIndex; ++i) {
          t.ok(flatBoxes[2*d*i+axis] <= expectedMedian, 'partition below ok')
        }
        t.equals(flatBoxes[computedIndex*2*d+axis], expectedMedian, 'partition ok')
        for(var i=computedIndex+1; i<hi; ++i) {
          t.ok(flatBoxes[2*d*i+axis] >= expectedMedian, 'partition above ok')
        }
        for(var i=0; i<lo; ++i) {
          t.equals(indices[i], i, 'lo untouched')
        }
        for(var i=hi; i<data.length; ++i) {
          t.equals(indices[i], i, 'hi untouched')
        }
        for(var i=0; i<data.length; ++i) {
          var box = boxes[indices[i]]
          for(var j=0; j<2*d; ++j) {
            t.equals(flatBoxes[2*d*i+j], box[j], 'index ok')
          }
        }
        indices.sort(function(a,b) {
          return a-b
        })
        t.same(indices, iota(data.length), 'no duplicates/deletes')
      }
    }
  }

  function deepVerify(data, lo, hi) {
    verify(data, lo, hi)
    for(var i=0; i<10; ++i) {
      verify(shuffle(data), lo, hi)
    }
  }

  deepVerify(stripAxis(genBoxes.diamonds(1000, 3), 0))

  deepVerify([0,1,2,3,4,5,6,6,6,6,6,6,6,6,7,8,9])
  
  var brutal = dup([10], 0)
  brutal[0] = 1
  verify(brutal)
  brutal[0] = -1
  verify(brutal)
  brutal[9] = 1
  verify(brutal)

  brutal = dup([10], 0)
  brutal[9] = 1
  verify(brutal)
  brutal[9] = -1
  verify(brutal)
  brutal[0] = 1
  verify(brutal)
  
  verify([0])
  verify([5, 4, 3, 2, 1, 0])
  verify([0,1,2,3,4,5])
  verify([1, -1, 0, 1, 1, 2])
  deepVerify([0, 1, 1, 1, 1, 1, 2])
  verify([0,0,0,0,0])
  verify(dup([32], 0))



  deepVerify([ 
    0.9191182393115014,
    0.82473976444453,
    0.5173067646101117,
    0.370650454191491,
    0.9679583257529885,
    0.6838582328055054,
    0.19114303076639771,
    0.5988740497268736,
    0.9954310422763228,
    0.9333904932718724 ])

  for(var i=0; i<10; ++i) {
    verify(dup([100], 0).map(function() {
      return Math.random()
    }))
  }

  t.end()
})