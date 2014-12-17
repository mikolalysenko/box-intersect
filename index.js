'use strict'

module.exports           = wrapper
module.exports.direct    = redBlueIntersect

var BRUTE_FORCE_CUTOFF   = 32

var pool  = require('typedarray-pool')
var boxnd = require('./lib/boxnd')

//Use brute force test for bipartite case
function bruteForce(d, red, blue, visit, flip) {
  var n = red.length
  var m = blue.length

red_loop:
  for(var i=0; i<n; ++i) {
    var a = red[i]
    for(var k=0; k<d; ++k) {
      if(a[k+d] < a[k]) {
        continue red_loop
      }
    }
blue_loop:
    for(var j=0; j<m; ++j) {
      var b = blue[j]
      for(var k=0; k<d; ++k) {
        var a0 = a[k]
        var a1 = a[k+d]
        var b0 = b[k]
        var b1 = b[k+d]
        if(b1 < b0 || b1 < a0 || a1 < b0) {
          continue blue_loop
        }
      }
      var retval
      if(flip) {
        retval = visit(j, i)
      } else {
        retval = visit(i, j)
      }
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

//Brute force full test
function bruteForceFull(d, boxes, visit) {
  var n = boxes.length
  for(var i=0; i<n; ++i) {
    var a = boxes[i]
    for(var k=0; k<d; ++k) {
      if(a[k+d] < a[k]) {
        continue
      }
    }
box_loop:
    for(var j=0; j<i; ++j) {
      var b = boxes[j]
      for(var k=0; k<d; ++k) {
        var a0 = a[k]
        var a1 = a[k+d]
        var b0 = b[k]
        var b1 = b[k+d]
        if(b1 < b0 || b1 < a0 || a1 < b0) {
          continue box_loop
        }
      }
      var retval = visit(i, j)
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

//Unpack boxes into a flat typed array, remove empty boxes
function convertBoxes(boxes, n, d, data, ids) {
  var ptr = 0
  var count = 0
i_loop:
  for(var i=0; i<n; ++i) {
    var b = boxes[i]
    for(var j=0; j<d; ++j) {
      if(b[d+j] < b[j]) {
        continue i_loop
      }
    }
    for(var j=0; j<2*d; ++j) {
      result[ptr++] = b[j]
    }
    ids[count] = count
    count += 1
  }
  return count
}

//Internal algorithm, exposed as .direct()
function redBlueIntersect(red, blue, visit) {
  var n = red.length
  var m = blue.length

  //If either array is empty, then we can skip this whole thing
  if(n <= 0 || m <= 0) {
    return
  }

  //Compute dimension, if 0 again skip
  var d = (red[0].length)>>>1
  if(d <= 0) {
    return
  }

  //Test for bipartite or full intersection
  var full = (red === blue)

  //If either n or m is small, then use brute force
  if(n < BRUTE_FORCE_CUTOFF || 
     m < BRUTE_FORCE_CUTOFF) {

    if(full) {
      return bruteForceFull(d, red, visit, false)
    } else if(m < n) {
      return bruteForce(d, red, blue, visit, false)
    } else {
      return bruteForce(d, blue, red, visit, true)
    }
  }

  //Initialize sweep queue
  boxnd.sweepInit(Math.max(n, m))

  //Special case:  1D full intersection, use a different algorithm
  if(d === 1 && full) {
    return boxnd.sweepFull(visit, n, red)
  }

  //Otherwise, we use the general purpose algorithm
  var redList  = pool.mallocDouble(2*d*n)
  var redIds   = pool.mallocInt32(n)
  n = convertBoxes(red, n, d, redList, redIds)

  var blueList = pool.mallocDouble(2*d*m)
  var blueIds  = pool.mallocInt32(m)
  m = convertBoxes(blue, m, d, blueList, blueIds)

  var retval
  if(d === 1) {
    //Special case:  1D bipartite intersection
    retval = boxnd.sweep(
      d, visit, 
      0, n, red,  redIndex,
      0, m, blue, blueIndex)
  } else {
    retval = boxnd.intersect(
      d, 0, visit, false,
      0, n, red,  redIndex,
      0, m, blue, blueIndex,
      -Infinity, Infinity)
    if((retval === void 0) && !full) {
      retval = boxnd.intersect(
        d, 0, visit, true,
        0, m, blue, blueIndex,
        0, n, red,  redIndex,
        -Infinity, Infinity)
    }
  }

  pool.free(redList)
  pool.free(redIds)
  pool.free(blueList)
  pool.free(blueIds)

  return retval
}

//User-friendly wrapper, handle full input and no-visitor cases
function wrapper(arg0, arg1, arg2) {
  var result
  switch(arguments.length) {
    case 1:
      result = []
      redBlueIntersect(arg0, arg0, function(i,j) {
        result.push([i, j])
      })
      return result
    case 2:
      if(typeof arg1 === 'function') {
        return redBlueIntersect(arg0, arg0, arg1)
      } else {
        result = []
        redBlueIntersect(arg0, arg1, function(i,j) {
          result.push([i, j])
        })
        return result
      }
    case 3:
      return redBlueIntersect(arg0, arg1, arg2)
    default:
      throw new Error('box-intersect: Invalid arguments')
  }
}