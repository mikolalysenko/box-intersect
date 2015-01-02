'use strict'

var DIMENSION   = 'd'
var AXIS        = 'ax'
var VISIT       = 'vv'
var FLIP        = 'fp'
var FULL        = 'fl'

var ELEM_SIZE   = 'es'

var RED_START   = 'rs'
var RED_END     = 're'
var RED_BOXES   = 'rb'
var RED_INDEX   = 'ri'
var RED_PTR     = 'rp'

var BLUE_START  = 'bs'
var BLUE_END    = 'be'
var BLUE_BOXES  = 'bb'
var BLUE_INDEX  = 'bi'
var BLUE_PTR    = 'bp'

var RETVAL      = 'rv'

var INNER_LABEL = 'Q'

var ARGS = [
  DIMENSION,
  AXIS,
  VISIT,
  RED_START,
  RED_END,
  RED_BOXES,
  RED_INDEX,
  BLUE_START,
  BLUE_END,
  BLUE_BOXES,
  BLUE_INDEX
]

function generateBruteForce(redMajor, flip, full) {
  var funcName = 'bruteForce' + 
    (redMajor ? 'Red' : 'Blue') + 
    (flip ? 'Flip' : '') +
    (full ? 'Full' : '')

  var code = ['function ', funcName, '(', ARGS.join(), '){',
    'var ', ELEM_SIZE, '=2*', DIMENSION, ';']
    
  var redLoop = 
    'for(var i=' + RED_START + ',' + RED_PTR + '=' + ELEM_SIZE + '*' + RED_START + ';' +
        'i<' + RED_END +';' +
        '++i,' + RED_PTR + '+=' + ELEM_SIZE + '){' +
        'var x0=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '],' +
            'x1=' + RED_BOXES + '[' + AXIS + '+' + RED_PTR + '+' + DIMENSION + '],' +
            'xi=' + RED_INDEX + '[i]'

  var blueLoop = 
    'for(var j=' + BLUE_START + ',' + BLUE_PTR + '=' + ELEM_SIZE + '*' + BLUE_START + ';' +
        'j<' + BLUE_END + ';' +
        '++j,' + BLUE_PTR + '+=' + ELEM_SIZE + '){' +
        'var y0=' + BLUE_BOXES + '[' + AXIS + '+' + BLUE_PTR + '],' +
            'yi=' + BLUE_INDEX + '[j]'

  if(full) {
    redLoop  += ',xf=' + RED_BOXES + '[' + RED_PTR + ']'
    blueLoop += ',yf=' + BLUE_BOXES + '[' + BLUE_PTR + ']'
  }

  redLoop  += ';'
  blueLoop += ';'

  if(redMajor) {
    code.push(redLoop, INNER_LABEL, ':', blueLoop)
  } else {
    code.push(blueLoop, INNER_LABEL, ':', redLoop)
  }

  if(flip) {
    code.push('if(y0<=x0||x1<y0)continue;')
  } else {
    code.push('if(y0<x0||x1<y0)continue;')
  }

  if(full) {
    if(flip) {
      code.push('if(xf===yf&&yi<=xi)continue;')
    } else {
      code.push('if(xf===yf&&xi<=yi)continue;')
    }
  }

  code.push('for(var k='+AXIS+'+1;k<'+DIMENSION+';++k){'+
    'var r0='+RED_BOXES+'[k+'+RED_PTR+'],'+
        'r1='+RED_BOXES+'[k+'+DIMENSION+'+'+RED_PTR+'],'+
        'b0='+BLUE_BOXES+'[k+'+BLUE_PTR+'],'+
        'b1='+BLUE_BOXES+'[k+'+DIMENSION+'+'+BLUE_PTR+'];'+
      'if(r1<b0||b1<r0)continue ' + INNER_LABEL + ';}' +
      'var ' + RETVAL + '=' + VISIT + '(')

  if(flip) {
    code.push('yi,xi')
  } else {
    code.push('xi,yi')
  }

  code.push(');if(' + RETVAL + '!==void 0)return ' + RETVAL + ';}}}')

  return {
    name: funcName, 
    code: code.join('')
  }
}

function bruteForcePlanner() {
  var funcName = 'bruteForcePartial'
  var prefix = []
  var code = ['function ' + funcName + '(' + [
      DIMENSION,
      AXIS,
      VISIT,
      FLIP,
      RED_START,
      RED_END,
      RED_BOXES,
      RED_INDEX,
      BLUE_START,
      BLUE_END,
      BLUE_BOXES,
      BLUE_INDEX,
      FULL
    ].join() + '){']

  function invoke(redMajor, flip, full) {
    var res = generateBruteForce(redMajor, flip, full)
    prefix.push(res.code)
    code.push('return ' + res.name + '(' + ARGS.join() + ');')
  }

  code.push('if(' + RED_END + '-' + RED_START + '>' +
                    BLUE_END + '-' + BLUE_START + '){')


  code.push('if(' + FLIP + '){if(' + FULL + '){')
  invoke(true, true, true)
  code.push('}else{') 
  invoke(true, true, false)
  code.push('}}else{if(' + FULL + '){')
  invoke(true, false, true)
  code.push('}else{')
  invoke(true, false, false)
  code.push('}}}else{if(' + FLIP + '){if(' + FULL + '){')
  invoke(false, true, true)
  code.push('}else{') 
  invoke(false, true, false)
  code.push('}}else{if(' + FULL + '){')
  invoke(false, false, true)
  code.push('}else{')
  invoke(false, false, false)
  code.push('}}}}return ' + funcName)

  var codeStr = prefix.join('') + code.join('')
  var proc = new Function(codeStr)
  return proc()
}

module.exports = bruteForcePlanner()

/*
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


//This needs a rewrite
// 1. Use code generation here instead of manually unrolling the brute force loops
// 2. For the full case, check the id of each object and compare iff first components are =
function bruteForcePartial(
  d, axis, visit, flip,
  redStart,  redEnd,  red,  redIndex,
  blueStart, blueEnd, blue, blueIndex,
  full) {

  //TODO: Handle full case

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
}*/