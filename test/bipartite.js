'use strict'

var tape = require('tape')
var genBoxes = require('./util/random-boxes')
var misc = require('./util/misc')
var boxIntersect = require('../index')

function bruteForceBipartiteOverlap(boxes, otherBoxes) {
  console.log('brute force...')
  var d = (boxes[0].length)>>>1
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<otherBoxes.length; ++j) {
      if(misc.boxOverlap(d, boxes[i], otherBoxes[j])) {
        result.push([i,j])
      }
    }
  }
  return misc.canonicalize(result)
}

function algorithmPartialOverlap(boxes, otherBoxes) {
  console.log('algorithm...')
  var result = []
  boxIntersect(boxes, otherBoxes, function(i,j) {
    result.push([i,j])
  })
  return misc.canonicalize(result)
}

tape('bipartite', function(t) {

  function verify(boxes, otherBoxes, str) {
    t.equals(
      algorithmPartialOverlap(boxes, otherBoxes).join(':'),
      bruteForceBipartiteOverlap(boxes, otherBoxes).join(':'),
      str)
  }

  verify(genBoxes.degenerate(2), genBoxes.degenerate(2))  
  verify(genBoxes.degenerate(3), genBoxes.degenerate(3))

  //Random test cases
  ;[10, 100, 1000].forEach(function(countR) {
    for(var d=1; d<=4; ++d) {
      for(var i=0; i<10; ++i) {
        var boxes = new Array(countR)
        for(var j=0; j<countR; ++j) {
          var box = new Array(2*d)
          for(var k=0; k<2*d; ++k) {
              box[k] = Math.random()
          }
          boxes[j] = box
        }
        verify(boxes, boxes, d + 'd sym bipartite n=' + countR)

        ;[10, 100, 1000].forEach(function(countB) {
          var otherBoxes = new Array(countB)
          for(var j=0; j<countB; ++j) {
            var box = new Array(2*d)
            for(var k=0; k<2*d; ++k) {
                box[k] = Math.random()
            }
            otherBoxes[j] = box
          }
          verify(boxes, otherBoxes, d + 'd bipartite n=' + countR + '/m=' + countB)
        })
      }
    }
  })

  verify(genBoxes.diamonds(1000, 2), genBoxes.diamonds(800,2))
  verify(genBoxes.diamonds(1000, 3), genBoxes.diamonds(1000,3))
  
  t.end()
})