'use strict'

var Grid = require('p2/src/collision/GridBroadphase.js')
var AABB = require('p2/src/collision/AABB')
var uniq = require('uniq')

exports.name = 'p2.js grid'

function comparePair(a, b) {
  var d = a[0] - b[0]
  if(d) {
    return d
  }
  return a[1] - b[1]
}

exports.prepare = function(boxes) {
  var bodies = []
  var xmin = Infinity, xmax= -Infinity,
      ymin = Infinity, ymax= -Infinity
  for(var i=0; i<boxes.length; ++i) {
    var box = boxes[i]
    bodies.push({
      id: i,
      aabb: new AABB({
        lowerBound: [box[0], box[1]],
        upperBound: [box[2], box[3]]
      })
    })
    xmin = Math.min(xmin, box[0])
    ymin = Math.min(ymin, box[1])
    xmax = Math.max(xmax, box[2])
    ymax = Math.max(ymax, box[3])
  }
  return {
    xmin: xmin,
    xmax: xmax,
    ymin: ymin,
    ymax: ymax,
    bodies: bodies,
    nx: Math.ceil(Math.sqrt(boxes.length)*0.25)|0,
    ny: Math.ceil(Math.sqrt(boxes.length)*0.25)|0
  }
}

exports.run = function(options) {
  var grid = new Grid(options)
  var pairs = grid.getCollisionPairs(options)
  var npairs = []
  for(var i=0, np = pairs.length; i<np; i+=2) {
    var a = pairs[i].id
    var b = pairs[i+1].id
    if(a !== b) {
      npairs.push([Math.min(a,b), Math.max(a,b)])
    }
  }
  uniq(npairs, comparePair, false)
  return npairs.length
}