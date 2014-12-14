'use strict'

module.exports           = wrapper
module.exports.full      = fullIntersect
module.exports.bipartite = redBlueIntersect

var box1d = require('box-intersect-1d')
var pool  = require('typedarray-pool')
var boxnd = require('./lib/boxnd')

function convertBoxes(boxes, n, d) {
  var result = pool.mallocDouble(n * d * 2)
  var ptr    = 0
  for(var i=0; i<n; ++i) {
    var b = boxes[i]
    for(var j=0; j<2*d; ++j) {
      result[ptr++] = b[j]
    }
  }
  return result
}

function iotaArray(n) {
  var result = pool.mallocInt32(n)
  for(var i=0; i<n; ++i) {
    result[i] = i
  }
  return result
}

function fullIntersect(boxes, visit) {
  var n = boxes.length
  if(n <= 0) {
    return
  }
  var d = (boxes[0].length)>>>1
  if(d <= 0) {
    return
  }
  switch(d) {
    case 1:
      return box1d.full(boxes, visit)

    default:
      var boxList = convertBoxes(boxes, n, d)
      var boxIds  = iotaArray(n)

      //TODO: run algorithm

      pool.free(boxList)
      pool.free(boxIds)
  } 
}

function redBlueIntersect(red, blue, visit) {
  var n = red.length
  var m = blue.length
  if(n <= 0 || m <= 0) {
    return
  }
  var d = (red[0].length)>>>1
  if(d <= 0) {
    return
  }
  switch(d) {
    case 1:
      return box1d.bipartite(red, blue, visit)

    default:
      var redList  = convertBoxes(red, n, d)
      var redIds   = iotaArray(n)
      var blueList = convertBoxes(blue, m, d)
      var blueIds  = iotaArray(m)

      //TODO

      pool.free(redList)
      pool.free(redIds)
      pool.free(blueList)
      pool.free(blueIds)
  }
}

//User-friendly wrapper layer
function wrapper() {
  var result
  switch(arguments.length) {
    case 1:
      result = []
      fullIntersect(arguments[0], function(i,j) {
        result.push([i,j])
      })
      return result
    case 2:
      if(typeof arguments[1] === 'function') {
        return fullIntersect(arguments[0], arguments[1])
      } else {
        result = []
        redBlueIntersect(arguments[0], arguments[1], function(i,j) {
          result.push([i,j])
        })
        return result
      }
    case 3:
      return redBlueIntersect(arguments[0], arguments[1], arguments[2])
    default:
      throw new Error('box-intersect: Invalid arguments')
  }
}