'use strict'

module.exports = boxIntersectND

var ndarray = require('ndarray')
var ndsort  = require('ndarray-sort')
var pool    = require('typedarray-pool')
var bits    = require('bit-twiddle')

var BLUE_FLAG = (1<<28)

//Brute force cutoff threshold
var BRUTE_FORCE_CUTOFF = 32

//1D sweep event queue stuff (use pool to save space)
var RED_SWEEP_QUEUE   = pool.mallocInt32(1024)
var BLUE_SWEEP_QUEUE  = pool.mallocInt32(1024)
var SWEEP_EVENTS      = pool.mallocDouble(1024)
var SWEEP_ARRAY       = ndarray(SWEEP_EVENTS, [512,2])
var SCRATCH           = pool.mallocDouble(16)

function sqInit(nred, nblue) {
  if(RED_SWEEP_QUEUE.length < nred) {
    pool.free(RED_SWEEP_QUEUE)
    RED_SWEEP_QUEUE = pool.mallocInt32(bits.nextPow2(nred))
  }
  if(BLUE_SWEEP_QUEUE.length < nblue) {
    pool.free(BLUE_SWEEP_QUEUE)
    BLUE_SWEEP_QUEUE = pool.mallocInt32(bits.nextPow2(nblue))
  }
  var eventLength = 2*(nred + nblue)
  if(SWEEP_EVENTS.length < eventLength) {
    pool.free(SWEEP_EVENTS)
    SWEEP_EVENTS = pool.mallocDouble(bits.nextPow2(eventLength))
    SWEEP_ARRAY.data = SWEEP_EVENTS
  }
  SWEEP_ARRAY.shape[0] = eventLength
}

function sqPop(queue, count, item) {
  for(var i=0; i<count; ++i) {
    if(queue[i] === item) {
      queue[i] = queue[count-1]
      return
    }
  }
}

//1D case, use sweep algorithm
function sweepIntersect(
    d, visit,
    redStart,  redEnd, red, redIndex,
    blueStart, blueEnd, blue, blueIndex) {

  var nred   = redEnd - redStart
  var nblue  = blueEnd - blueStart

  sqInit(nred, nblue)

  //store events as pairs [coordinate, idx]
  //
  //  red create:  -(idx+1)
  //  red destroy: idx
  //  blue create: -(idx+BLUE_FLAG)
  //  blue destroy: idx+BLUE_FLAG
  //
  var ptr = 0
  var istart = d-1
  var iend   = 2*d-1
  for(var i=redStart; i<redEnd; ++i) {
    var idx = redIndex[i]
    SWEEP_EVENTS[ptr++] = red[istart]
    SWEEP_EVENTS[ptr++] = -(idx+1)
    SWEEP_EVENTS[ptr++] = red[iend]
    SWEEP_EVENTS[ptr++] = idx
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = blueIndex[i]+BLUE_FLAG
    SWEEP_EVENTS[ptr++] = blue[istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = blue[iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  //process events from left->right
  ndsort(SWEEP_ARRAY)

  var redActive  = 0
  var blueActive = 0
  var numEvents  = 2 * (nred + nblue)
  for(var i=0; i<numEvents; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e >= BLUE_FLAG) {
      //blue destroy event
      sqPop(BLUE_SWEEP_QUEUE, blueActive--, e-BLUE_FLAG)
    } else if(e >= 0) {
      //red destroy event
      sqPop(RED_SWEEP_QUEUE, redActive--, e)
    } else if(e < -BLUE_FLAG) {
      //blue create event
      e = -(e+BLUE_FLAG)|0
      for(var j=0; j<redActive; ++j) {
        var retval = visit(RED_SWEEP_QUEUE[j], e)
        if(retval !== void 0) {
          return retval
        }
      }
      BLUE_SWEEP_QUEUE[blueActive++] = e
    } else {
      //red create event
      e = -(e+1)|0
      for(var j=0; j<blueActive; ++j) {
        var retval = visit(e, BLUE_SWEEP_QUEUE[j])
        if(retval !== void 0) {
          return retval
        }
      }
      RED_SWEEP_QUEUE[redActive++] = e
    }
  }
}

//Partially brute force search, starting along axis
function bruteForcePartial(
  d, axis, visit, flip,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  for(var i=redStart; i<redEnd; ++i) {
j_loop:
    for(var j=blueStart; j<blueEnd; ++j) {
      var a0 = red[axis]
      var a1 = red[axis+d]
      var b0 = blue[axis]
      if(b0 < a0 || a1 < b0) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var a0 = red[k]
        var a1 = red[k+d]
        var b0 = blue[k]
        var b1 = blue[k+d]

        if(a1 < b0 || b1 < a0) {
          continue j_loop
        }
      }
    }

    var retval
    if(flip) {
      retval = visit(blueIndex[i], redIndex[j])
    } else {
      retval = visit(redIndex[i], blueIndex[j])
    }
    if(retval !== void 0) {
      return retval
    }
  }
}

//Partitions box array in place so that all boxes with pred(true) are first
function partitionBoxes(d, axis, start, end, boxes, id, pred, a, b) {
  var boxSize = 2*d
  var boxPtr  = boxSize * start
  var dstPtr  = boxPtr
  var ptr     = start
  var offset0 = axis
  var offset1 = d+axis
  for(var i=start; i<end; ++i) {
    var i0 = boxes[boxPtr + offset0]
    var i1 = boxes[boxPtr + offset1]

    if(pred(i0, i1, a, b)) {

      //Swap boxes
      for(var j=0; j<boxSize; ++j) {
        var v = boxes[boxPtr+j]
        boxes[boxPtr+j] = boxes[dstPtr]
        boxes[dstPtr++] = v
      }

      //Swap index
      var tmp = id[i]
      id[i] = id[ptr]
      id[ptr++] = tmp
    }

    boxPtr += boxSize
  }

  return ptr
}

function intervalContainsInterval(a0, a1, lo, hi) {
  return a0 <= lo && hi <= a1
}

function intervalContainsPoint(a0, a1, p, _) {
  return a0 <= p && p <= a1
}

function intervalStartLessThan(a0, a1, p, _) {
  return a0 <= p
}

function intervalEndGreaterThanEqual(a0, a1, p, _) {
  return p <= a1
}

//Find median using quick select algorithm
function findMedian(d, axis, start, end, boxes, ids) {
  //TODO
}


//Recursive algorithm
function boxIntersectRec(
  d, axis, visit, flip,
  redStart, redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex, 
  lo, hi) {

  var retval

  //Handle base case:  If input small, then use brute force
  var redCount  = redEnd - redStart
  var blueCount = blueEnd - blueStart
  if(redCount < BRUTE_FORCE_CUTOFF || 
     blueCount < BRUTE_FORCE_CUTOFF) {
    if(redCount < blueCount) {
      return bruteForcePartial(
        d, axis, visit, !flip,
        blueStart, blueEnd, blue, blueIndex,
        redStart, redEnd, red, redIndex)
    } else {
      return bruteForcePartial(
        d, axis, visit, flip,
        redStart, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
    }
  }

  //Find all boxes containing interval
  var Imid = partitionBoxes(
    d, axis, 
    redStart, redEnd, red, redIndex, 
    intervalContainsInterval,
    lo, hi)
  if(Imid > redStart) {
    //Recurse to lower dimensional case
    if(axis === d-2) {
      if(flip) {
        retval = sweepIntersect(d, visit, 
          blueStart, blueEnd, blue, blueIndex,
          redStart, Imid, red, redIndex)
      } else {
        retVal = sweepIntersect(d, visit,
          redStart, Imid, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      }
      if(retval !== void 0) {
        return retval
      }
    } else {
      retval = boxIntersectRec(
        d, axis+1, visit, flip,
        redStart, Imid, red, redIndex,
        blueStart, blueEnd, blue, blueIndex,
        -Infinity, Infinity)
      if(retval !== void 0) {
        return retval
      }
      retval = boxIntersectRec(
        d, axis+1, visit, !flip,
        blueStart, blueEnd, blue, blueIndex,
        redStart, Imid, red, redIndex,
        -Infinity, Infinity)
      if(retval !== void 0) {
        return retval
      }
    }
  }

  //Find median of blue set
  // Cut rest of red into 2 chunks
  var Bmid = findMedian(d, axis, blueStart, blueEnd, blue, blueIndex)
  var midV = blue[2*d*Bmid + axis]

  if(Bmid === blueStart) {
    //Degenerate case:  All blue points have same left point
    var redCT = partitionBoxes(
      d, axis, 
      Imid, redEnd, red, redIndex, 
      intervalContainsPoint,
      midV, 0.5)

    if(redCT === Imid) {
      return
    }

    if(axis === d-2) {
      if(flip) {
        return sweepIntersect(d, visit,
          blueStart, blueEnd, blue, blueIndex,
          Imid, redCT, red, redIndex)
      } else {
        return sweepIntersect(d, visit,
          Imid, redCT, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      }
    } else {
      retval = boxIntersectRec(
        d, axis+1, visit, flip,
        Imid, redCT, red, redIndex,
        blueStart, blueEnd, blue, blueIndex,
        -Infinity, Infinity)

      if(retval !== void 0) {
        return retval
      }

      return boxIntersectRec(
        d, axis+1, visit, !flip,
        blueStart, blueEnd, blue, blueIndex,
        Imid, redCT, red, redIndex,
        -Infinity, Infinity)
    }
  }


  //Partition red intervals, recursively search
  var redLT = partitionBoxes(
    d, axis, 
    Imid, redEnd, red, redIndex, 
    intervalStartLessThan,
    midV, 0.5)
  if(redLt > Imid) {
    retval = boxIntersectRec(
      d, axis, visit, flip,
      Imid, redLT, red, redIndex,
      blueStart, Bmid, blue, blueIndex,
      lo, midV)
    if(retval !== void 0) {
      return retval
    }
  }

  var redGE = paritionBoxes(
    d, axis, 
    Imid, redEnd, red, redIndex,
    intervalEndGreaterThanEqual,
    midV, 0.5)
  if(redGE > Imid) {
    return boxIntersectRec(
      d, axis, visit, flip,
      Imid, redGE, red, redIndex,
      Bmid, blueEnd, blue, blueIndex,
      midV, hi)
  }
}

function boxIntersectND(
  d, visit,
  redCount,  red,  redIndex, 
  blueCount, blue, blueIndex) {

  if(2*d < SCRATCH.length) {
    pool.free(SCRATCH)
    SCRATCH = pool.mallocDouble(bits.nextPow2(2*d))
  }

  var retval = boxIntersectRec(
    d, 0, visit, false,
    0, redCount, red, redIndex,
    0, blueCount, blue, blueIndex,
    -Infinity, Infinity)

  if(retval !== void 0) {
    return retval
  }

  return boxIntersectRec(
    d, 0, visit, true,
    0, blueCount, blue, blueIndex,
    0, redCount, red, redIndex,
    -Infinity, Infinity)
}