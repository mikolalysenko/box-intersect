'use strict'

var tape = require('tape')
var genBoxes = require('./util/random-boxes')
var harness = require('./util/harness')

tape('bipartite', function(t) {

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
        harness.bipartite(t, boxes, boxes, d + 'd sym bipartite n=' + countR)

        ;[10, 100, 1000].forEach(function(countB) {
          var otherBoxes = new Array(countB)
          for(var j=0; j<countB; ++j) {
            var box = new Array(2*d)
            for(var k=0; k<2*d; ++k) {
                box[k] = Math.random()
            }
            otherBoxes[j] = box
          }
          harness.bipartite(t, boxes, otherBoxes, d + 'd bipartite n=' + countR + '/m=' + countB)
        })
      }
    }
  })

  harness.bipartite(t, genBoxes.diamonds(1000, 2), genBoxes.diamonds(800,2))

  t.end()
})