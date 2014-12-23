'use strict'

var tape = require('tape')
var guard = require('guarded-array')
var iota = require('iota-array')
var genBoxes = require('./util/random-boxes')
var genPartition = require('../lib/partition')

// Type signature:
//
// function partitionBoxes(
//  d, axis, 
//  start, end, boxes, id, 
//  pred, a, b)
//

var partition = genPartition('pred(lo,hi,a0,a1)', ['pred', 'a0', 'a1'])

function intervalContainsInterval(a0, a1, lo, hi) {
  return a0 <= lo && hi <= a1
}

function intervalContainsPoint(a0, a1, p, _) {
  return a0 <= p && p <= a1
}

function intervalStartLessThan(a0, a1, p, _) {
  return a0 < p
}

function intervalEndGreaterThanEqual(a0, a1, p, _) {
  return a1 >= p
}

tape('partitionBoxes', function(t) {

  function verifyPartition(d, boxes, start, end, pred, a, b) {
    var n = boxes.length
    for(var axis=0; axis<d; ++axis) {
      var boxFlat = genBoxes.flatten(boxes)
      var boxIds = iota(n)

      var mid = partition(d, axis, start, end, 
        guard(boxFlat, 2*d*start, 2*d*end), 
        guard(boxIds, start, end), 
        pred, a, b)
      t.ok(start <= mid && mid <= end, 'mid (' + mid + ') in range ' + start + '-' + end)
      for(var i=0; i<start; ++i) {
        t.equals(boxIds[i], i, '< start ok')
      }
      for(var i=end; i<n; ++i) {
        t.equals(boxIds[i], i, '>= end ok')
      }
      for(var i=start; i<end; ++i) {
        var idx = boxIds[i]
        for(var j=0; j<2*d; ++j) {
          t.equals(boxFlat[2*d*i+j], boxes[idx][j], 'swap ok: ' + i + '->' + idx + ': ' + j)
        }
      }
      for(var i=start; i<mid; ++i) {
        var idx = boxIds[i]
        t.ok(pred(boxes[idx][axis], boxes[idx][axis+d], a, b), 'pred true < mid')
      }
      for(var i=mid; i<end; ++i) {
        var idx = boxIds[i]
        t.ok(!pred(boxes[idx][axis], boxes[idx][axis+d], a, b), 'pred false >= mid')
      }

      boxIds.sort(function(a, b) { return a-b })

      t.same(boxIds, iota(n), 'ids ok')
    }
  }

  var dboxes = genBoxes.degenerate(2)
  verifyPartition(2, dboxes, 0, dboxes.length, intervalStartLessThan, 0.1)

  for(var d=2; d<=4; ++d) {
    for(var i=0; i<4; ++i) {
      var boxes = genBoxes.random(32, d)
      var istart = Math.random()
      
      verifyPartition(d, boxes, 0, 32, intervalContainsPoint, Math.random(), Math.random())
      
      verifyPartition(d, boxes, 1, 2, intervalStartLessThan, 0.5, 0.5)
      verifyPartition(d, boxes, 0, 32, intervalContainsInterval, istart, istart+Math.random())
      verifyPartition(d, boxes, 0, 32, intervalContainsPoint, Math.random(), Math.random())
      verifyPartition(d, boxes, 10, 30, intervalStartLessThan, Math.random(), Math.random())
      verifyPartition(d, boxes, 30, 32, intervalEndGreaterThanEqual, Math.random(), Math.random())
      verifyPartition(d, boxes, 10, 20, intervalStartLessThan, Infinity)
      verifyPartition(d, boxes, 10, 20, intervalStartLessThan, -Infinity)
    }
  }

  t.end()
})