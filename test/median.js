'use strict'

var tape = require('tape')
var dup = require('dup')
var iota = require('iota-array')
var genBoxes = require('./util/random-boxes')
var median = require('../lib/boxnd').median

function slowMedian(data, lo, hi) {
  var sorted = data.slice()
  sorted.sort(function(a,b) {
    return a - b
  })
  var mid = (lo + hi)>>>1
  var midV = sorted[mid]
  while(mid > lo && sorted[mid-1] === midV) {
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

function makeProperty(data, i) {
  return {
    set: 
  }
}

function makeGuardedArray(n, lo, hi) {
  var store = iota(n)
  var result = {
    length: n
  }
  var props = {}
  for(var i=0; i<n; ++i) {
    if(i < lo || i >= hi) {
      props[i] = makeGuard()
    } else {
      props[i] = makeProperty(store, i)
    }
  }
  Object.defineProperties(result, props)
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
    console.log(lo, hi)
    var expectedResult = slowMedian(data, lo, hi)
    var expectedIndex  = expectedResult[0]
    var expectedMedian = expectedResult[1]

    //Try packing into boxes
    for(var d=2; d<=3; ++d) {
      for(var axis=0; axis<d; ++axis) {
        var boxes = toBoxes(data, d, axis)
        var flatBoxes = genBoxes.flatten(boxes)
        var indices = iota(data.length)

        var computedMedian = median(
          d, axis, 
          lo, hi, flatBoxes, indices)

        t.equals(computedMedian, expectedMedian, 'median ok')
        t.equals(flatBoxes[computedMedian*2*d+axis], expectedMedian, 'value ok')

        for(var i=lo; i<computedMedian; ++i) {
          t.ok(flatBoxes[2*d*i+axis] < expectedMedian, 'partition below ok')
        }
        for(var i=computedMedian; i<hi; ++i) {
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


  //verify([0])
  verify([5, 4, 3, 2, 1,0])
  /*
  verify([0,1,2,3,4,5])
  verify([1, -1, 0, 1, 1, 2])
  verify([0, 1, 1, 1, 1, 1, 2])
  verify([0,0,0,0,0])
  verify(dup([100], 0))
  verify([0,1,2,3,4,5,6,6,6,6,6,6,6,6,7,8,9])
  for(var i=0; i<10; ++i) {
    verify(dup([100], 0).map(function() {
      return Math.random()
    }))
  }
  */

  t.end()
})