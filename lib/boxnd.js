'use strict'

module.exports = {
  sweepInit: sqInit,
  sweep:     sweepIntersect,
  sweepFull: sweepFullIntersect,
  brute:     bruteForcePartial,
  median:    findMedian,
  iterInit:  iterInit,
  intersectIter: boxIntersectIter
}

var isort = require('./sort')
var pool  = require('typedarray-pool')
var bits  = require('bit-twiddle')

//Twiddle parameters
var BRUTE_FORCE_CUTOFF  = 64      //Cut off for brute force search
var PARTITION_THRESHOLD = 8       //Cut off for using insertion sort in findMedian
var INIT_CAPACITY       = 1024    //Initial capacity of internal data structures

//Partitioning functions - generated code is copy-pasted to get v8 to inline it :|
function partitionContainsHalfInterval(a,b,c,d,e,f,a0,a1){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<=a0&&a1<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionContainsPoint(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<=p0&&p0<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionContainsPointProper(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n],hi=e[k+o];if(lo<p0&&p0<=hi)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionStartLessThan(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n];if(lo<p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionStartLessThanEqual(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n];if(lo<=p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionStartEqual(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var lo=e[k+n];if(lo===p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}
function partitionEndLessThan(a,b,c,d,e,f,p0){for(var j=2*a,k=j*c,l=k,m=c,n=b,o=a+b,p=c;d>p;++p,k+=j){var hi=e[k+o];if(hi<p0)if(m===p)m+=1,l+=j;else{for(var s=0;j>s;++s){var t=e[k+s];e[k+s]=e[l],e[l++]=t}var u=f[p];f[p]=f[m],f[m++]=u}}return m}

//Flag for blue
var BLUE_FLAG = (1<<28)

//Frame size for iterative loop
var IFRAME_SIZE = 6
var DFRAME_SIZE = 2

//Data for box statck
var BOX_ISTACK  = pool.mallocInt32(INIT_CAPACITY)
var BOX_DSTACK  = pool.mallocDouble(INIT_CAPACITY)

//1D sweep event queue stuff (use pool to save space)
var RED_SWEEP_QUEUE   = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_QUEUE  = pool.mallocInt32(INIT_CAPACITY)
var RED_SWEEP_INDEX   = pool.mallocInt32(INIT_CAPACITY)
var BLUE_SWEEP_INDEX  = pool.mallocInt32(INIT_CAPACITY)
var SWEEP_EVENTS      = pool.mallocDouble(INIT_CAPACITY * 8)

//Initialize iterative loop queue
function iterInit(d, count) {
  var levels = Math.pow(bits.log2(count+1)*2, d+1)|0
  var maxInts = bits.nextPow2(IFRAME_SIZE*levels)
  if(BOX_ISTACK.length < maxInts) {
    pool.free(BOX_ISTACK)
    BOX_ISTACK = pool.mallocInt32(maxInts)
  }
  var maxDoubles = bits.nextPow2(DFRAME_SIZE*levels)
  if(BOX_DSTACK < maxDoubles) {
    pool.free(BOX_DSTACK)
    BOX_DSTACK = pool.mallocDouble(maxDoubles)
  }
}

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
    SWEEP_EVENTS = pool.mallocDouble(eventLength)
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
  isort(SWEEP_EVENTS, n)
  
  //Sweep through points
  var active = 0
  for(var i=0; i<n; ++i) {
    var e = SWEEP_EVENTS[2*i+1]|0
    if(e < 0) {
      e = -e-1
      for(var j=0; j<active; ++j) {
        var other = RED_SWEEP_QUEUE[j]|0
        var retval = visit(Math.min(other, e)|0, Math.max(other, e)|0)
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

//TODO: Implement special case for full termination

//Recursion base case: use 1D sweep algorithm
// takes O( sort(n + m) ) time
function sweepIntersect(
    d, visit,
    redStart,  redEnd, red, redIndex,
    blueStart, blueEnd, blue, blueIndex) {

  //store events as pairs [coordinate, idx]
  //
  //  red create:  -(idx+1)
  //  red destroy: idx
  //  blue create: -(idx+BLUE_FLAG)
  //  blue destroy: idx+BLUE_FLAG
  //
  var ptr      = 0
  var elemSize = 2*d
  var istart   = d-1
  var iend     = elemSize-1

  for(var i=redStart; i<redEnd; ++i) {
    var idx = redIndex[i]
    var redOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = red[redOffset+istart]
    SWEEP_EVENTS[ptr++] = -(idx+1)
    SWEEP_EVENTS[ptr++] = red[redOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  for(var i=blueStart; i<blueEnd; ++i) {
    var idx = blueIndex[i]+BLUE_FLAG
    var blueOffset = elemSize*i
    SWEEP_EVENTS[ptr++] = blue[blueOffset+istart]
    SWEEP_EVENTS[ptr++] = -idx
    SWEEP_EVENTS[ptr++] = blue[blueOffset+iend]
    SWEEP_EVENTS[ptr++] = idx
  }

  //process events from left->right
  var n = ptr >>> 1
  isort(SWEEP_EVENTS, n)
  
  var redActive  = 0
  var blueActive = 0
  for(var i=0; i<n; ++i) {
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
//TODO: Replace this with code generation
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
      break
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

  //Make sure pivot is at start
  return partitionStartLessThan(
    d, axis, 
    start, end, boxes, ids,
    boxes[elemSize*mid+axis])
}




function moveSmallestToFront(d, axis, start, end, boxes, ids) {
  var elemSize = 2*d
  var smallestV = boxes[elemSize*start+axis]
  var smallestI = start

  for(var i=start+1; i<end; ++i) {
    var v = boxes[elemSize*i + axis]
    if(v < smallestV) {
      smallestV = v
      smallestI = i
    }
  }

  //Swap
  var aptr = elemSize*smallestI
  var bptr = elemSize*start
  for(var i=0; i<elemSize; ++i, ++aptr, ++bptr) {
    var tmp = boxes[aptr]
    boxes[aptr] = boxes[bptr]
    boxes[bptr] = tmp
  }
  var q = ids[smallestI]
  ids[smallestI] = ids[start]
  ids[start] = q
}



//Append item to queue
var assert = require('assert')
function iterPush(ptr,
  axis, 
  redStart, redEnd, 
  blueStart, blueEnd, 
  state, 
  lo, hi) {

  var iptr = IFRAME_SIZE * ptr
  BOX_ISTACK[iptr]   = axis
  BOX_ISTACK[iptr+1] = redStart
  BOX_ISTACK[iptr+2] = redEnd
  BOX_ISTACK[iptr+3] = blueStart
  BOX_ISTACK[iptr+4] = blueEnd
  BOX_ISTACK[iptr+5] = state

  var dptr = DFRAME_SIZE * ptr
  BOX_DSTACK[dptr]   = lo
  BOX_DSTACK[dptr+1] = hi
}

//Recursive algorithm
function boxIntersectIter(
  d, visit, initFlip,
  xSize, xBoxes, xIndex,
  ySize, yBoxes, yIndex) {

  var top  = 0
  var retval
  
  if(initFlip) {
    iterPush(top++,
      0,
      0, ySize,
      0, xSize,
      1, 
      -Infinity, Infinity)
  } else {
    iterPush(top++,
      0,
      0, xSize,
      0, ySize,
      0, 
      -Infinity, Infinity)
  }

  while(top > 0) {
    top  -= 1

    var iptr = top * IFRAME_SIZE
    var axis      = BOX_ISTACK[iptr]
    var redStart  = BOX_ISTACK[iptr+1]
    var redEnd    = BOX_ISTACK[iptr+2]
    var blueStart = BOX_ISTACK[iptr+3]
    var blueEnd   = BOX_ISTACK[iptr+4]
    var state     = BOX_ISTACK[iptr+5]

    var dptr = top * DFRAME_SIZE
    var lo        = BOX_DSTACK[dptr]
    var hi        = BOX_DSTACK[dptr+1]

    //Unpack state info
    var flip      = (state & 1)

    //Unpack indices
    var red       = xBoxes
    var redIndex  = xIndex
    var blue      = yBoxes
    var blueIndex = yIndex
    if(flip) {
      red         = yBoxes
      redIndex    = yIndex
      blue        = xBoxes
      blueIndex   = xIndex
    }

    //Special case: return from final terminal
    if(state & 2) {
      redStart = partitionEndLessThan(
          d, axis, 
          redStart, redEnd, red, redIndex,
          lo)
      if(redStart >= redEnd) {
        continue
      }
    }

    //Special case: filter blue start
    if(state & 4) {
      blueStart = partitionStartEqual(
          d, axis,
          blueStart, blueEnd, blue, blueIndex,
          lo)
      if(blueStart >= blueEnd) {
        continue
      }
    }
    
    //If input small, then use brute force
    var redCount  = redEnd  - redStart
    var blueCount = blueEnd - blueStart
    if(redCount  < BRUTE_FORCE_CUTOFF || 
       blueCount < BRUTE_FORCE_CUTOFF) {
      retval = bruteForcePartial(
          d, axis, visit, flip,
          redStart,  redEnd,  red,  redIndex,
          blueStart, blueEnd, blue, blueIndex)
      if(retval !== void 0) {
        return retval
      }
      continue
    }

    /*
    console.log('range:', '['+lo+','+hi+')', 'axis=', axis, 'flip=', flip, 'state=', state)
    console.log('  red:', redStart, redEnd)
    assert(redStart < redEnd, 'red interval non-empty')
    for(var i=redStart; i<redEnd; ++i) {
      var r0 = red[2*d*i+axis]
      var r1 = red[2*d*i+d+axis]
      //console.log('\t', [r0,r1], redIndex[i])
      assert(r0 < hi && lo <= r1, 'red box in interval')
    }
    console.log('  blue:', blueStart, blueEnd)
    assert(blueStart < blueEnd, 'blue interval non-empty')
    for(var i=blueStart; i<blueEnd; ++i) {
      var b0 = blue[2*d*i+axis]
      //console.log('\t', b0, blueIndex[i])
      assert(lo <= b0 && b0 < hi, 'blue point in interval')
    }
    */

    //Find all boxes containing interval
    var Imid = partitionContainsHalfInterval(
      d, axis, 
      redStart, redEnd, red, redIndex, 
      lo, hi)
    if(Imid > redStart) {

      if(Imid - redStart < BRUTE_FORCE_CUTOFF) {
        retval = bruteForcePartial(
          d, axis, visit, flip,
          redStart, Imid, red, redIndex,
          blueStart, blueEnd, blue, blueIndex)
        if(retval !== void 0) {
          return retval
        }
      } else if(flip) {
        var redO = partitionStartEqual(
          d, axis,
          redStart, Imid, red, redIndex,
          lo)

        var blueO  //Only initialize if necessary
        if(redO !== redStart && (
          blueO = partitionStartEqual(
            d, axis,
            blueStart, blueEnd, blue, blueIndex,
            lo)) !== blueStart) {

          //Hard case: Need to intersect non-duplicated intervals
          //
          //   [redO,Imid] = red intervals without midV as start
          //   [redStart,redO] = red intervals starting with midV
          //
          //    [blueStart, blueEnd] with [redO, Imid]
          //    [blueO, blueEnd] with [redStart, redO]
          //

          if(axis === d-2) {
            if(redO < Imid) {
              retval = sweepIntersect(d, visit,
                blueStart, blueEnd, blue, blueIndex,
                redO, Imid, red, redIndex)
              if(retval !== void 0) {
                return retval
              }
            }
            if(blueO < blueEnd) {
              retval = sweepIntersect(d, visit,
                blueO, blueEnd, blue, blueIndex,
                redStart, redO, red, redIndex)
              if(retval !== void 0) {
                return retval
              }
            }
          } else {
            if(blueO < blueEnd) {
              iterPush(
                top++,
                axis,
                redStart, redO,
                blueStart, blueEnd,
                5,
                lo, hi)
            }
            if(redO < Imid) {
              iterPush(
                top++,
                axis+1,
                redO, Imid,
                blueStart, blueEnd,
                1,
                -Infinity, Infinity)
              iterPush(
                top++,
                axis+1,
                blueStart, blueEnd,
                redO, Imid,
                0,
                -Infinity, Infinity)
            }
          }
        } else {
          //Easy case:  Symmetric to non-flipped
          if(axis === d-2) {
            retval = sweepIntersect(d, visit,
              blueStart, blueEnd, blue, blueIndex,
              redStart, Imid, red, redIndex)
            if(retval !== void 0) {
              return retval
            }
          } else {
            iterPush(
              top++,
              axis+1,
              redStart, Imid,
              blueStart, blueEnd,
              1,
              -Infinity, Infinity)
            iterPush(
              top++,
              axis+1,
              blueStart, blueEnd,
              redStart, Imid,
              0,
              -Infinity, Infinity)
          }
        }
      } else {
        if(axis === d-2) {
          retval = sweepIntersect(d, visit,
            redStart, Imid, red, redIndex,
            blueStart, blueEnd, blue, blueIndex)
          if(retval !== void 0) {
            return retval
          }
        } else {
          iterPush(
            top++,
            axis+1,
            redStart, Imid,
            blueStart, blueEnd,
            0,
            -Infinity, Infinity)
          iterPush(
            top++,
            axis+1,
            blueStart, blueEnd,
            redStart, Imid,
            1,
            -Infinity, Infinity)
        }
      }
    }

    //Test for brute force exit
    if(redEnd - Imid < BRUTE_FORCE_CUTOFF) {
      retval = bruteForcePartial(
        d, axis, visit, flip,
        Imid, redEnd, red, redIndex,
        blueStart, blueEnd, blue, blueIndex)
      if(retval !== void 0) {
        return retval
      }
      continue
    }

    //Split blue into 2 (approximately) equally sized chunks
    var Bmid = findMedian(d, axis, blueStart, blueEnd, blue, blueIndex)

    //Test if splitting failed
    if(Bmid === blueStart) {

      //Use partitioning to test if all points have same start
      var midV = blue[2*d*Bmid + axis]
      var Bmid2 = partitionStartLessThanEqual(
          d, axis,
          blueStart, blueEnd, blue, blueIndex,
          midV)

      //Test for degenerate case where all blue intervals have same start
      if(Bmid2 === blueEnd) {

        //Find all red intervals containing start point
        var redPT
        if(flip) {
          //If we are flipped, require that red points that contain point except in their start
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
          continue
        }

        //If intervals are small enough resort to brute force
        if(redPT - Imid < BRUTE_FORCE_CUTOFF) {
          retval = bruteForcePartial(
            d, axis, visit, flip,
            Imid, redPT, red, redIndex,
            blueStart, blueEnd, blue, blueIndex)
          if(retval !== void 0) {
            return retval
          }
        } else if(axis === d-2) {
          if(flip) {
            retval = sweepIntersect(d, visit,
              blueStart, blueEnd, blue, blueIndex,
              Imid, redPT, red, redIndex)
          } else {
            retval = sweepIntersect(d, visit,
              Imid, redPT, red, redIndex,
              blueStart, blueEnd, blue, blueIndex)
          }
          if(retval !== void 0) {
            return retval
          }
        } else {
          iterPush(
            top++,
            axis+1,
            Imid, redPT,
            blueStart, blueEnd,
            flip,
            -Infinity, Infinity)
          iterPush(
            top++,
            axis+1,
            blueStart, blueEnd,
            Imid, redPT,
            flip^1,
            -Infinity, Infinity)
        }
        continue
      } else {
        // Move smallest value in array to front
        Bmid = Bmid2
        moveSmallestToFront(
          d, axis,
          Bmid, blueEnd, blue, blueIndex)
      }
    }

    var midV = blue[2*d*Bmid + axis]

    //Push reverse partition here (subtle trick, but this must be pushed before previous)
    iterPush(
      top++,
      axis,
      Imid, redEnd,
      Bmid, blueEnd,
      flip|2,
      midV, hi)

    //Partition red intervals, recursively search
    var redLT = partitionStartLessThan(
        d, axis, 
        Imid, redEnd, red, redIndex, 
        midV)
    if(redLT > Imid) {
      iterPush(
        top++,
        axis,
        Imid, redLT, 
        blueStart, Bmid,
        flip,
        lo, midV)
    }
  }
}