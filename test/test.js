'use strict'

var tape = require('tape')
var harness = require('./harness')

tape('box-intersect', function(t) {

  harness.full(t, [
    [1,2],
    [2,3],
    [1,3]
    ], '1d example')

  //Random test cases
  ;[10, 100, 1000].forEach(function(count) {
    for(var d=1; d<=4; ++d) {
      for(var i=0; i<10; ++i) {
        var boxes = new Array(count)
        var otherBoxes = new Array(count)
        for(var j=0; j<count; ++j) {
          var box = new Array(2*d)
          var otherBox = new Array(2*d)
          for(var k=0; k<2*d; ++k) {
            box[k] = Math.random()
            otherBox[k] = Math.random()
          }
          boxes[j] = box
          otherBoxes[j] = otherBox
        }
        
        harness.full(t, boxes, d + 'd full')
        harness.full(t, otherBoxes, d + 'd full')
        harness.bipartite(t, boxes, otherBoxes, d + 'd bipartite')
      }
    }
  })

  t.end()
})