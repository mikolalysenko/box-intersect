'use strict'

module.exports           = wrapper
module.exports.direct    = redBlueIntersect

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

      var retval = boxnd(d, d-1, visit,
        0, n, redList, redIds,
        0, m, blueList, blueIds)

      pool.free(redList)
      pool.free(redIds)
      pool.free(blueList)
      pool.free(blueIds)

      return retval
  }
}

//User-friendly wrapper layer
function wrapper() {
  switch(arguments.length) {
    case 1:
      var result = []
      fullIntersect(arguments[0], arguments[0], function(i,j) {
        if(i !== j) {
          result.push([i,j])
        }
      })
      return result
    case 2:
      if(typeof arguments[1] === 'function') {
        var visit = arguments[1]
        return redBlueIntersect(arguments[0], arguments[0], function(i,j) {
          if(i !== j) {
            return visit(i, j)
          }
        })
      } else {
        var result = []
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