'use strict'

module.exports = {
  intersect: boxIntersectRec,
  sweepInit: sqInit,
  sweep:     sweepIntersect,
  sweepFull: sweepFullIntersect,
  brute:     bruteForcePartial,
  median:    findMedian
}

var ndarray = require('ndarray')
var ndsort  = require('ndarray-sort')
var pool    = require('typedarray-pool')
var bits    = require('bit-twiddle')

//TODO: Tune twiddle parameters
var BRUTE_FORCE_CUTOFF  = 256
var PARTITION_THRESHOLD = 8
var INIT_CAPACITY       = 1024

//Partitioning functions - generated code to avoid v8 deopts :|
function partitionContainsHalfInterval(a,b,c,d,e,f,a0,a1){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<=a0&&a1<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionContainsPoint(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<=p0&&p0<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionContainsPointProper(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<p0&&p0<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionStartLessThan(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n];if(lo<p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionStartLessThanEqual(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n];if(lo<=p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionEndLessThan(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var hi=e[k+o];if(hi<p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}

//Flag for blue
var BLUE_FLAG = (1<<28)

//1D sweep event queue stuff (use pool to save space)
var RED_SWEEP_QUEUE   = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_QUEUE  = pool.mallocInt32(INIT_CAPACITY)
var RED_SWEEP_INDEX   = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_INDEX  = pool.mallocInt32(INIT_CAPACITY)
var SWEEP_EVENTS      = pool.mallocDouble(INIT_CAPACITY * 8)
var SWEEP_ARRAY       = ndarray(SWEEP_EVENTS, [INIT_CAPACITY * 4, 2], [2, 1], 0)

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
  var eventLength = 8 * rcount
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
  var ptr       = 0
  var boxLength = boxes.length
  for(var i=0; i<boxLength; ++i) {
    var box = boxes[i]
    var b0  = box[0]
    var b1  = box[1]
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
  var ptr    = 0
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

function bruteForceRedMajorFlip(
  d, axis, visit,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var elemSize = 2 * d

  for(var i=redStart,redPtr=elemSize*redStart; i<redEnd; ++i, redPtr+=elemSize) {
    var x0 = red[axis+redPtr]
    var x1 = red[axis+d+redPtr]
blue_loop:
    for(var j=blueStart,bluePtr=elemSize*blueStart; j<blueEnd; ++j, bluePtr+=elemSize) {
      var y0 = blue[axis+bluePtr]

      if( y0 <= x0 || x1 < y0) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var r0 = red[k+redPtr]
        var r1 = red[k+d+redPtr]
        var b0 = blue[k+bluePtr]
        var b1 = blue[k+d+bluePtr]

        if(r1 < b0 || b1 < r0) {
          continue blue_loop
        }
      }

      var retval = visit(blueIndex[j], redIndex[i])
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

function bruteForceRedMajor(
  d, axis, visit,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var elemSize = 2 * d

  for(var i=redStart,redPtr=elemSize*redStart; i<redEnd; ++i, redPtr+=elemSize) {
    var x0 = red[axis+redPtr]
    var x1 = red[axis+d+redPtr]
blue_loop:
    for(var j=blueStart,bluePtr=elemSize*blueStart; j<blueEnd; ++j, bluePtr+=elemSize) {
      var y0 = blue[axis+bluePtr]

      if( y0 < x0 || x1 < y0) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var r0 = red[k+redPtr]
        var r1 = red[k+d+redPtr]
        var b0 = blue[k+bluePtr]
        var b1 = blue[k+d+bluePtr]

        if(r1 < b0 || b1 < r0) {
          continue blue_loop
        }
      }

      var retval = visit(redIndex[i], blueIndex[j])
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

function bruteForceBlueMajorFlip(
  d, axis, visit, 
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var elemSize = 2 * d

  for(var j=blueStart,bluePtr=elemSize*blueStart; j<blueEnd; ++j, bluePtr+=elemSize) {
    var y0 = blue[axis+bluePtr]
red_loop:
    for(var i=redStart,redPtr=elemSize*redStart; i<redEnd; ++i, redPtr+=elemSize) {
      var x0 = red[axis+redPtr]
      var x1 = red[axis+d+redPtr]

      if(y0 <= x0 || x1 < y0) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var r0 = red[k+redPtr]
        var r1 = red[k+d+redPtr]
        var b0 = blue[k+bluePtr]
        var b1 = blue[k+d+bluePtr]

        if(r1 < b0 || b1 < r0) {
          continue red_loop
        }
      }

      var retval = visit(blueIndex[j], redIndex[i])
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

function bruteForceBlueMajor(
  d, axis, visit,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {

  var elemSize = 2 * d

  for(var j=blueStart,bluePtr=elemSize*blueStart; j<blueEnd; ++j, bluePtr+=elemSize) {
    var y0 = blue[axis+bluePtr]
red_loop:
    for(var i=redStart,redPtr=elemSize*redStart; i<redEnd; ++i, redPtr+=elemSize) {
      var x0 = red[axis+redPtr]
      var x1 = red[axis+d+redPtr]

      if( y0 < x0 || x1 < y0) {
        continue
      }

      for(var k=axis+1; k<d; ++k) {
        var r0 = red[k+redPtr]
        var r1 = red[k+d+redPtr]
        var b0 = blue[k+bluePtr]
        var b1 = blue[k+d+bluePtr]

        if(r1 < b0 || b1 < r0) {
          continue red_loop
        }
      }

      var retval = visit(redIndex[i], blueIndex[j])
      if(retval !== void 0) {
        return retval
      }
    }
  }
}

function bruteForcePartial(
  d, axis, visit, flip,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex) {
  if(redEnd - redStart > blueEnd - blueStart) {
    if(flip) {
      return bruteForceRedMajorFlip(
        d, axis, visit, 
        redStart, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
    } else {
      return bruteForceRedMajor(
        d, axis, visit,
        redStart, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
    }
  } else {
    if(flip) {
      return bruteForceBlueMajorFlip(
        d, axis, visit,
        redStart, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
    } else {
      return bruteForceBlueMajor(
        d, axis, visit,
        redStart, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
    }
  }
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

  var lo       = start
  var hi       = end
  var mid      = ((end + start) >>> 1)
  var elemSize = 2*d
  var pivot    = mid
  var value    = boxes[elemSize*mid+axis]
  
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
    var count  = hi - lo
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
    pivot = partitionStartLessThan(
      d, axis, 
      lo, hi-1, boxes, ids,
      value)

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
var assert = require('assert')
function boxIntersectRec(
  d, axis, visit, flip,
  redStart, redEnd, red, redIndex,
  blueStart, blueEnd, blue, blueIndex, 
  lo, hi) {

  var retval

  //ASSERTIONS

  /*
  var redIntervals = []
  assert(redStart < redEnd, 'red interval non-empty')
  for(var i=redStart; i<redEnd; ++i) {
    var r0 = red[2*d*i+axis]
    var r1 = red[2*d*i+d+axis]
    assert(r0 < hi && lo <= r1, 'red box in interval')
    redIntervals.push([[r0, r1], redIndex[i]])
  }
  var bluePoints = []
  assert(blueStart < blueEnd, 'blue interval non-empty')
  for(var i=blueStart; i<blueEnd; ++i) {
    var b0 = blue[2*d*i+axis]
    assert(lo <= b0 && b0 < hi, 'blue point in interval')
    bluePoints.push([b0, blueIndex[i]])
  }
  console.log('range:', '['+lo+','+hi+')', 'axis=', axis, 'flip=', flip)
  console.log('  red:', redIntervals)
  console.log('  blue:', bluePoints)
  */


  //Handle base case:  If input small, then use brute force
  var redCount  = redEnd - redStart
  var blueCount = blueEnd - blueStart
  if(redCount < BRUTE_FORCE_CUTOFF || 
     blueCount < BRUTE_FORCE_CUTOFF) {
    if(redCount > blueCount) {
      if(flip) {
        return bruteForceRedMajorFlip(
          d, axis, visit, 
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      } else {
        return bruteForceRedMajor(
          d, axis, visit,
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      }
    } else {
      if(flip) {
        return bruteForceBlueMajorFlip(
          d, axis, visit,
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      } else {
        return bruteForceBlueMajor(
          d, axis, visit,
          redStart, redEnd, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
      }
    }
  }

  //Find all boxes containing interval
  var Imid = partitionContainsHalfInterval(
    d, axis, 
    redStart, redEnd, red, redIndex, 
    lo, hi)

  if(Imid > redStart) {
    if(axis === d-2) {
      if(flip) {
        retval = sweepIntersect(d, visit, 
          blueStart, blueEnd, blue, blueIndex,
          redStart, Imid, red, redIndex)
      } else {
        retval = sweepIntersect(d, visit,
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

  if(redEnd - Imid < BRUTE_FORCE_CUTOFF) {
    return bruteForcePartial(
      d, axis, visit, flip,
      Imid, redEnd, red, redIndex,
      blueStart, blueEnd, blue, blueIndex)
  }

  //Split blue into 2 (approximately) equally sized chunks
  var Bmid = findMedian(d, axis, blueStart, blueEnd, blue, blueIndex)
  
  //Handle degenerate case where blue is all the same point
  if(Bmid === blueStart) {

    //Using partitioning we can test if all points are equal in O(n)
    var midV = blue[2*d*Bmid + axis]
    var Bmid2 = partitionStartLessThanEqual(
        d, axis,
        blueStart, blueEnd, blue, blueIndex,
        midV)

    if(Bmid2 === blueEnd) {

      //Locate all intervals containing point
      var redPT
      if(flip) {
        redPT = partitionContainsPointProper(
          d, axis, 
          Imid, redEnd, red, redIndex, 
          midV)
      } else {
        redPT = partitionContainsPoint(
          d, axis, 
          Imid, redEnd, red, redIndex, 
          midV)
      }

      //Handle degenerate case where red empty
      if(redPT === Imid) {
        return
      }

      if(axis === d-2) {
        if(flip) {
          return sweepIntersect(d, visit, 
            blueStart, blueEnd, blue, blueIndex,
            Imid, redPT, red, redIndex)
        } else {
          return sweepIntersect(d, visit,
            Imid, redPT, red, redIndex,
            blueStart, blueEnd, blue, blueIndex)
        }
      } else {
        retval = boxIntersectRec(
          d, axis+1, visit, flip,
          Imid, redPT, red, redIndex,
          blueStart, blueEnd, blue, blueIndex,
          -Infinity, Infinity)
        if(retval !== void 0) {
          return retval
        }
        return boxIntersectRec(
          d, axis+1, visit, !flip,
          blueStart, blueEnd, blue, blueIndex,
          Imid, redPT, red, redIndex,
          -Infinity, Infinity)
      }
    } else {

      //If not degenerate, then split blue at secondary mid point
      Bmid = Bmid2
    }
  }

  var midV = blue[2*d*Bmid + axis]

  //Partition red intervals, recursively search
  var redLT = partitionStartLessThan(
      d, axis, 
      Imid, redEnd, red, redIndex, 
      midV)
  if(redLT > Imid) {
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
  var redGE = partitionEndLessThan(
      d, axis, 
      Imid, redEnd, red, redIndex,
      midV)
  if(redGE < redEnd) {
    return boxIntersectRec(
      d, axis, visit, flip,
      redGE, redEnd, red, redIndex,
      Bmid, blueEnd, blue, blueIndex,
      midV, hi)
  }
}