'use strict'

var tape = require('tape')
var genBoxes = require('./util/random-boxes')
var misc = require('./util/misc')
var boxIntersect = require('../index')

function bruteForceFullOverlap(boxes) {
  console.log('brute force...')
  var d = (boxes[0].length)>>>1
  var result = []
  for(var i=0; i<boxes.length; ++i) {
    for(var j=0; j<i; ++j) {
      if(misc.boxOverlap(d, boxes[i], boxes[j])) {
        result.push([j,i])
      }
    }
  }
  return misc.canonicalize(result)
}

function algorithmFullOverlap(boxes) {
  console.log('algorithm...')
  var result = []
  function visit(i,j) {
    var lo = Math.min(i,j)
    var hi = Math.max(i,j)
    /*
    for(var k=0; k<result.length; ++k) {
      if(result[k][0] === lo && result[k][1] === hi) {
        console.log(boxes[lo], boxes[hi])
        throw new Error('bad!' + [lo,hi])
      }
    }
    */
    if(i === j) {
      throw new Error("repeated index")
    }
    result.push([lo,hi])
  }
  boxIntersect(boxes, visit)
  return misc.canonicalize(result)
}


tape('full intersect', function(t) {


  function verify(boxes, str) {
    console.log(boxes[28], boxes[34])


    var expectedBoxes = bruteForceFullOverlap(boxes)
    var actualBoxes   = algorithmFullOverlap(boxes)

    if(expectedBoxes.join(':') === actualBoxes.join(':')) {
      t.pass(str)
    } else {
      t.fail(str)
      for(var i=0; i<actualBoxes.length; ++i) {
        console.log(i, actualBoxes[i], expectedBoxes[i])
      }
    }
  }

  verify([
    [1,2],
    [2,3],
    [1,3]
    ], '1d example')

  //Random test cases
  ;[10, 100, 1000].forEach(function(count) {
    for(var d=1; d<=4; ++d) {
      for(var i=0; i<10; ++i) {
        var boxes = new Array(count)
        for(var j=0; j<count; ++j) {
          var box = new Array(2*d)
          for(var k=0; k<2*d; ++k) {
            box[k] = Math.random()
          }
          boxes[j] = box
        }
        
        verify(boxes, d + 'd full n=' + count)
      }
    }
  })

  verify(genBoxes.degenerate(2))
  verify(genBoxes.degenerate(3))

  verify(genBoxes.random(10,2))
  verify(genBoxes.diamonds(10, 2),   '2d diamond n=1000')
  verify(genBoxes.diamonds(1000, 2), '2d diamond n=1000')
  verify(genBoxes.diamonds(1000, 3), '3d diamond n=1000')
  verify(genBoxes.diamonds(1000, 4), '4d diamond n=1000')
  
  t.end()
})