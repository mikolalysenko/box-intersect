'use strict'

var tape       = require('tape')
var iota       = require('iota-array')
var genBoxes   = require('./util/random-boxes')
var bruteForcePartial = require('../lib/boxnd').brute

//Signature:
// bruteForcePartial(
//  d, axis, visit, flip,
//  redStart,  redEnd,  red,  redIndex,
//  blueStart, blueEnd, blue, blueIndex)

function comparePair(a,b) {
  var d = a[0] - b[0]
  if(d) {
    return d
  }
  return a[1] - b[1]
}

function partialOverlap(d, axis, a, b) {
  for(var i=axis; i<d; ++i) {
    var a0 = a[i]
    var a1 = a[i+d]
    var b0 = b[i]
    var b1 = b[i+d]
    if(b1 < a0 || a1 < b0) {
      return false
    }
  }
  return true
}

tape('bruteForcePartial', function(t) {

  function verify(d, axis, flip, redBoxes, blueBoxes) {
    var n = redBoxes.length
    var m = blueBoxes.length

    function testRange(redStart, redEnd, blueStart, blueEnd) {
      var red = genBoxes.flatten(redBoxes)
      var redIds = iota(n)

      var blue = genBoxes.flatten(blueBoxes)
      var blueIds = iota(m)

      var list = []

      function visit(r, b) {
        if(flip) {
          list.push([b,r])
        } else {
          list.push([r,b])
        }
      }

      bruteForcePartial(d, axis, visit, flip,
        redStart, redEnd, red, redIds,
        blueStart, blueEnd, blue, blueIds)

      /*
      list.forEach(function(pair) {
        t.ok(redStart <= pair[0] && pair[0] < redEnd, 'red bounds: ['+pair+']')
        t.ok(blueStart <= pair[1] && pair[1] < blueEnd, 'blue bounds: ['+pair+']')
      })
*/

      var elist = []
      for(var i=redStart; i<redEnd; ++i) {
        for(var j=blueStart; j<blueEnd; ++j) {
          var a = redBoxes[i]
          var b = blueBoxes[j]

          var a0 = a[axis]
          var a1 = a[axis+d]
          var b0 = b[axis]

          if(b0 < a0 || a1 < b0 ||
            (flip && b0 === a0)) {
            continue
          }

          if(partialOverlap(d, axis+1, a, b)) {
            if(flip) {
              elist.push([j,i])
            } else {
              elist.push([i,j])
            }
          }
        }
      }

      list.sort(comparePair)
      elist.sort(comparePair)

      t.same(list, elist)
    }

    //try a couple of ranges
    testRange(0, n, 0, m)
    testRange(0, n>>>1, m>>>1, m)
    testRange(n>>>1, n-1, m>>>1, m-1)
  }

  verify(2, 0, false, [[0, 0, 1, 1]], [[0,0,1,1]])
  verify(2, 0, true, [[0, 0, 1, 1]], [[0,0,1,1]])

  genBoxes.hard.forEach(function(c) {
    var red = c.red
    var blue = c.blue
    var d = c.d
    for(var axis=0; axis<d-1; ++axis) {
      for(var _flip=0; _flip<2; ++_flip) {
        verify(d, axis, !_flip, red, blue)
      }
    }
  })


  for(var d=2; d<=4; ++d) {
    for(var axis=0; axis<d-1; ++axis) {
      for(var _flip=0; _flip<2; ++_flip) {
        for(var i=0; i<10; ++i) {
          verify(d, axis, !_flip, genBoxes.random(100, d), genBoxes.random(100,d))
        }
      }
    }
  }

  verify(2, 0, true, genBoxes.degenerate(2), genBoxes.degenerate(2))
  verify(2, 0, false, genBoxes.degenerate(2), genBoxes.degenerate(2))

  t.end()
})