'use strict'

module.exports = {
  intersect: boxIntersectRec,
  sweepInit: sqInit,
  sweep:     sweepIntersect,
  sweepFull: sweepFullIntersect,
  brute:     bruteForcePartial,
  partition: partitionBoxes,
  median:    findMedian
}

var ndarray = require('ndarray')
var ndsort  = require('ndarray-sort')
var pool    = require('typedarray-pool')
var bits    = require('bit-twiddle')

var BLUE_FLAG = (1<<28)

//Brute force cutoff threshold
var BRUTE_FORCE_CUTOFF = 32

//With fewer than 8 items use insertion sort for median selection
var PARTITION_THRESHOLD = 8

//1D sweep event queue stuff (use pool to save space)
var RED_SWEEP_QUEUE   = pool.mallocInt32(1024)
var BLUE_SWEEP_QUEUE  = pool.mallocInt32(1024)
var RED_SWEEP_INDEX   = pool.mallocInt32(1024)
var BLUE_SWEEP_INDEX  = pool.mallocInt32(1024)
var SWEEP_EVENTS      = pool.mallocDouble(1024)
var SWEEP_ARRAY       = ndarray(SWEEP_EVENTS, [512,2])

//Reserves memory for the 1D sweep data structures
function sqInit(count) {
  var rcount = bits.nextPow2(count)
  if(RED_SWEEP_QUEUE.length < rcount) {
    pool.free(RED_SWEEP_QUEUE)
    RED_SWEEP_QUEUE = pool.mallocInt32(rcount)
  }
  if(RED_SWEEP_INDEX.length < rcount) {
    pool.free(RED_SWEEP_INDEX)
    RED_SWEEP_INDEX = pool.mallocInt32(rcount)
  }
  if(BLUE_SWEEP_QUEUE.length < rcount) {
    pool.free(BLUE_SWEEP_QUEUE)
    BLUE_SWEEP_QUEUE = pool.mallocInt32(rcount)
  }
  if(BLUE_SWEEP_INDEX.length < rcount) {
    pool.free(BLUE_SWEEP_INDEX)
    BLUE_SWEEP_INDEX = pool.mallocInt32(rcount)
  }
  var eventLength = 2 * rcount
  if(SWEEP_EVENTS.length < eventLength) {
    pool.free(SWEEP_EVENTS)
    SWEEP_ARRAY.data = SWEEP_EVENTS = pool.mallocDouble(eventLength)
  }
}

//Remove an item from the active queue in O(1)
function sqPop(queue, index, count, item) {
  var idx = index[item]
  var top = queue[count-1]
  queue[idx] = top
  index[top] = idx
}

//Insert an item into the active queue in O(1)
function sqPush(queue, index, count, item) {
  queue[count] = item
  index[item]  = count
}

//Special case:  1D full sweep intersection
//  takes O( sort(n) ) time
function sweepFullIntersect(boxes, visit) {

  //Initialize sweep events
  var ptr = 0
  for(var i=0; i<boxes.length; ++i) {
    var box = boxes[i]
    var b0 = box[0]
    var b1 = box[1]
    if(b1 < b0) {
      continue
    }
    SWEEP_EVENTS[ptr++] = b0
    SWEEP_EVENTS[ptr++] = -(i+1)
    SWEEP_EVENTS[ptr++] = b1
    SWEEP_EVENTS[ptr++] = i
  }

  //Sort events
  var n = ptr >>> 1
  SWEEP_ARRAY.shape[0] = n
  ndsort(SWEEP_ARRAY)

  //Sweep through points
  var active = 0
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e < 0) {
      e = -e-1
      var retval = visit(e, e)
      if(retval !== void 0) {
        return retval
      }
      for(var j=0; j<active; ++j) {
        var retval = visit(RED_SWEEP_QUEUE[j], e)
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, active++, e)
    } else {
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, active--, e)
    }
  }
}

//Recursion base case: use 1D sweep algorithm
// takes O( sort(n + m) ) time
function sweepIntersect(
    d, visit,
    redStart,  redEnd, red, redIndex,
    blueStart, blueEnd, blue, blueIndex) {

  var nred   = redEnd - redStart
  var nblue  = blueEnd - blueStart
  
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
    var redOffset = 2*d*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -(idx+1)
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }
  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = blueIndex[i]+BLUE_FLAG
    var blueOffset = 2*d*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  //process events from left->right
  SWEEP_ARRAY.shape[0] = 2 * (nred + nblue)
  ndsort(SWEEP_ARRAY)

  var redActive  = 0
  var blueActive = 0
  var numEvents  = 2 * (nred + nblue)
  for(var i=0; i<numEvents; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e >= BLUE_FLAG) {
      //blue destroy event
      e = (e-BLUE_FLAG)|0
      sqPop(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive--, e)
    } else if(e >= 0) {
      //red destroy event
      sqPop(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive--, e)
    } else if(e <= -BLUE_FLAG) {
      //blue create event
      e = (-e-BLUE_FLAG)|0
      for(var j=0; j<redActive; ++j) {
        var retval = visit(RED_SWEEP_QUEUE[j], e)
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(BLUE_SWEEP_QUEUE, BLUE_SWEEP_INDEX, blueActive++, e)
    } else {
      //red create event
      e = (-e-1)|0
      for(var j=0; j<blueActive; ++j) {
        var retval = visit(e, BLUE_SWEEP_QUEUE[j])
        if(retval !== void 0) {
          return retval
        }
      }
      sqPush(RED_SWEEP_QUEUE, RED_SWEEP_INDEX, redActive++, e)
    }
  }
}

//Partially brute force search, starting along axis
//  takes O(n * m) time
// Only call when n or m small
function bruteForcePartial(
  d, axis, visit, flip,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var ELEM_SIZE = 2 * d

  for(var i=redStart,redPtr=ELEM_SIZE*redStart; i<redEnd; ++i, redPtr+=ELEM_SIZE) {
j_loop:
    for(var j=blueStart,bluePtr=ELEM_SIZE*blueStart; j<blueEnd; ++j, bluePtr+=ELEM_SIZE) {
      var bluePtr = ELEM_SIZE*j
      var a0 = red[axis+redPtr]
      var a1 = red[axis+d+redPtr]
      var b0 = blue[axis+bluePtr]

      if( b0 < a0 || a1 < b0 ||
         (flip && b0 === a0) ) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var a0 = red[k+redPtr]
        var a1 = red[k+d+redPtr]
        var b0 = blue[k+bluePtr]
        var b1 = blue[k+d+bluePtr]

        if(a1 < b0 || b1 < a0) {
          continue j_loop
        }
      }

      var retval
      if(flip) {
        retval = visit(blueIndex[j], redIndex[i])
      } else {
        retval = visit(redIndex[i], blueIndex[j])
      }
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

//Partitions box array in place so that all boxes with pred(true) are first
//  takes O(n) time
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
      if(ptr === i) {

        //For partially sorted arrays skip
        ptr += 1
        dstPtr += boxSize

      } else {

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

function intervalContainsPointProper(a0, a1, p, _) {
  return a0 < p && p <= a1
}

function intervalStartLessThan(a0, a1, p, _) {
  return a0 < p
}

function intervalStartLessThan(a0, a1, p, _) {
  return a0 < p
}

function intervalStartLessThanEqual(a0, a1, p, _) {
  return a0 <= p
}

function intervalEndLessThan(a0, a1, p, _) {
  return a1 < p
}

//Base case for median finding:  Use insertion sort
function insertionSort(d, axis, start, end, boxes, ids) {
  var elemSize = 2 * d
  var boxPtr = elemSize * (start+1) + axis
  for(var i=start+1; i<end; ++i, boxPtr+=elemSize) {
    var x = boxes[boxPtr]
    for(var j=i, ptr=elemSize*(i-1); 
        j>start && boxes[ptr+axis] > x; 
        --j, ptr-=elemSize) {
      //Swap
      var aPtr = ptr
      var bPtr = ptr+elemSize
      for(var k=0; k<elemSize; ++k, ++aPtr, ++bPtr) {
        var y = boxes[aPtr]
        boxes[aPtr] = boxes[bPtr]
        boxes[bPtr] = y
      }
      var tmp = ids[j]
      ids[j] = ids[j-1]
      ids[j-1] = tmp
    }
  }
}

//Find median using quick select algorithm
//  takes O(n) time whp
function findMedian(d, axis, start, end, boxes, ids) {
  if(end <= start+1) {
    return start
  }

  var mid = ((end + start) >>> 1)

  var lo = start
  var hi = end
  var elemSize = 2*d
  var pivot = mid, value = boxes[elemSize*mid+axis]
  
  while(lo < hi) {
    if(hi - lo < PARTITION_THRESHOLD) {
      insertionSort(d, axis, lo, hi, boxes, ids)
      value = boxes[elemSize*mid+axis]
      pivot = mid
      while(start < pivot &&
        boxes[elemSize*(pivot-1)+axis] === value) {
        pivot -= 1
      }
      return pivot
    }
    
    //Select pivot using median-of-3
    var count = hi - lo
    var pivot0 = (Math.random()*count+lo)|0
    var value0 = boxes[elemSize*pivot0 + axis]
    var pivot1 = (Math.random()*count+lo)|0
    var value1 = boxes[elemSize*pivot1 + axis]
    var pivot2 = (Math.random()*count+lo)|0
    var value2 = boxes[elemSize*pivot2 + axis]

    if(value0 <= value1) {
      if(value2 >= value1) {
        pivot = pivot1
        value = value1
      } else if(value0 >= value2) {
        pivot = pivot0
        value = value0
      } else {
        pivot = pivot2
        value = value2
      }
    } else {
      if(value1 >= value2) {
        pivot = pivot1
        value = value1
      } else if(value2 >= value0) {
        pivot = pivot0
        value = value0
      } else {
        pivot = pivot2
        value = value2
      }
    }

    //Swap pivot to end of array
    var aPtr = elemSize * (hi-1)
    var bPtr = elemSize * pivot
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr]
      boxes[aPtr] = boxes[bPtr]
      boxes[bPtr] = x
    }
    var y = ids[hi-1]
    ids[hi-1] = ids[pivot]
    ids[pivot] = y

    //Partition using pivot
    pivot = partitionBoxes(
      d, axis, 
      lo, hi-1, boxes, ids,
      intervalStartLessThan,
      value, 0.5)

    //Swap pivot back
    var aPtr = elemSize * (hi-1)
    var bPtr = elemSize * pivot
    for(var i=0; i<elemSize; ++i, ++aPtr, ++bPtr) {
      var x = boxes[aPtr]
      boxes[aPtr] = boxes[bPtr]
      boxes[bPtr] = x
    }
    var y = ids[hi-1]
    ids[hi-1] = ids[pivot]
    ids[pivot] = y

    //Swap pivot to last pivot
    if(mid < pivot) {
      hi = pivot-1
      while(lo < hi && 
        boxes[elemSize*(hi-1)+axis] === value) {
        hi -= 1
      }
      hi += 1
    } else if(pivot < mid) {
      lo = pivot + 1
      while(lo < hi &&
        boxes[elemSize*lo+axis] === value) {
        lo += 1
      }
    } else {
      break
    }
  }
  while(start < pivot &&
    boxes[elemSize*(pivot-1)+axis] === value) {
    pivot -= 1
  }
  return pivot
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
  
  //Degenerate case:  P all the same point
  if(Bmid === blueStart) {
    var midV = blue[2*d*Bmid + axis]
    if(midV === blue[2*d*blueEnd+axis]) {

      //Locate all intervals containing point
      var redPT
      if(flip) {
        redPT = partitionBoxes(
          d, axis, 
          Imid, redEnd, red, redIndex, 
          intervalContainsPointProper,
          midV, 0.5)
      } else {
        redPT = partitionBoxes(
          d, axis, 
          Imid, redEnd, red, redIndex, 
          intervalContainsPoint,
          midV, 0.5)
      }
      
      if(axis === d-2) {
        if(flip) {
          return sweepIntersect(d, visit, 
            blueStart, blueEnd, blue, blueIndex,
            Imid, redPt, red, redIndex)
        } else {
          return sweepIntersect(d, visit,
            Imid, redPt, red, redIndex,
            blueStart, blueEnd, blue, blueIndex)
        }
      } else {
        return boxIntersectRec(
          d, axis+1, visit, flip,
          Imid, redPt, red, redIndex,
          blueStart, blueEnd, blue, blueIndex,
          -Infinity, Infinity)
      }
    } else {
      Bmid = partitionBoxes(d, axis,
        blueStart, blueEnd, blue, blueIndex,
        intervalStartLessThanEqual,
        midV, 0.5)
    }
  }

  var midV = blue[2*d*Bmid + axis]

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

  //Use reverse partition here
  var redGE = paritionBoxes(
    d, axis, 
    Imid, redEnd, red, redIndex,
    intervalEndLessThan,
    midV, 0.5)
  if(redGE > Imid) {
    return boxIntersectRec(
      d, axis, visit, flip,
      redGE, redEnd, red, redIndex,
      Bmid, blueEnd, blue, blueIndex,
      midV, hi)
  }
}