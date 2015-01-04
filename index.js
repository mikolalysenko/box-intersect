'use strict'

module.exports = boxIntersectWrapper

var pool = require('typedarray-pool')
var sweep = require('./lib/sweep')
var boxIntersectIter = require('./lib/boxnd')

//Unpack boxes into a flat typed array, remove empty boxes
function convertBoxes(boxes, n, d, data, ids) {
  var ptr = 0
  var count = 0
i_loop:
  for(var i=0; i<n; ++i) {
    var b = boxes[i]

    //Make sure b is not empty
    for(var j=0; j<d; ++j) {
      if(b[d+j] < b[j]) {
        continue i_loop
      }
    }

    //If not empty, then append to list
    for(var j=0; j<2*d; ++j) {
      data[ptr++] = b[j]
    }
    ids[count] = i
    count += 1
  }
  return count
}

function boxIntersect(red, blue, visit, full) {
  var n = red.length
  var m = blue.length

  //If either array is empty, then we can skip this whole thing
  if(n <= 0 || m <= 0) {
    return
  }

  //Compute dimension, if it is 0 then we skip
  var d = (red[0].length)>>>1
  if(d <= 0) {
    return
  }

  var retval

  //Convert red boxes
  var redList  = pool.mallocDouble(2*d*n)
  var redIds   = pool.mallocInt32(n)
  n = convertBoxes(red, n, d, redList, redIds)

  if(n > 0) {
    if(d === 1 && full) {
      //Special case: 1d complete
      sweepInit(n)
      retval = sweep.sweepComplete(d, visit, 
        0, n, redList, redIds)
    } else {

      //Convert blue boxes
      var blueList = pool.mallocDouble(2*d*m)
      var blueIds  = pool.mallocInt32(m)
      m = convertBoxes(blue, m, d, blueList, blueIds)

      if(m > 0) {
        sweep.init(n+m)

        if(d === 1) {
          //Special case: 1d bipartite
          retval = sweep.sweepBipartite(
            d, visit, 
            0, n, redList,  redIds,
            0, m, blueList, blueIds)
        } else {
          //General case:  d>1
          retval = boxIntersectIter(
            d, visit,    full,
            n, redList,  redIds,
            m, blueList, blueIds)
        }

        pool.free(blueList)
        pool.free(blueIds)
      }
    }

    pool.free(redList)
    pool.free(redIds)
  }

  return retval
}

//User-friendly wrapper, handle full input and no-visitor cases
function boxIntersectWrapper(arg0, arg1, arg2) {
  var result
  switch(arguments.length) {
    case 1:
      result = []
      boxIntersect(arg0, arg0, function(i,j) {
        result.push([i, j])
      }, true)
      return result
    case 2:
      if(typeof arg1 === 'function') {
        var visit = arg1
        return boxIntersect(arg0, arg0, visit, true)
      } else {
        result = []
        boxIntersect(arg0, arg1, function(i,j) {
          result.push([i, j])
        }, false)
        return result
      }
    case 3:
      return boxIntersect(arg0, arg1, arg2, false)
    default:
      throw new Error('box-intersect: Invalid arguments')
  }
}