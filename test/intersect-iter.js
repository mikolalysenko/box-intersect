'use strict'

var tape = require('tape')
var guard = require('guarded-array')
var iota = require('iota-array')
var genBoxes = require('./util/random-boxes')
var boxnd = require('../lib/boxnd')
var boxIntersectIter = boxnd.intersectIter
var sqInit = boxnd.sweepInit
var iterInit = boxnd.iterInit

// Signature:
//
// function boxIntersectIter(
//  d, initFlip,
//  redSize, red, redIndex,
//  blueSize, blue, blueIndex)
//

function canonicalizeIntersect(reported) {
  reported = reported.slice()
  reported.sort(function(a, b) {
    var d = a[0] - b[0]
    if(d) {
      return d
    }
    return a[1] - b[1]
  })
  return reported
}

function testOverlap(d, flip, r, b) {
  var axis = 0
  var r0 = r[axis]
  var r1 = r[axis+d]
  var b0 = b[axis]
  var b1 = b[axis+d]
  if(b0 < r0 || r1 < b0) {
    return false
  }
  if(b[axis] === r[axis] && flip) {
    return false
  }
  for(var k=axis+1; k<d; ++k) {
    var r0 = r[k]
    var r1 = r[k+d]
    var b0 = b[k]
    var b1 = b[k+d]
    if(r1 < b0 || b1 < r0) {
      return false
    }
  }
  return true
}


function bruteForceIntersect(
  d, flip,
  redStart, redEnd, red,
  blueStart, blueEnd, blue) {
  var axis = 0
  var result = []
  for(var i=redStart; i<redEnd; ++i) {
    var r = red[i]

j_loop:
    for(var j=blueStart; j<blueEnd; ++j) {
      var b = blue[j]

      if(!testOverlap(d, flip, r, b)) {
        continue
      }

      if(flip) {
        result.push([j,i])
      } else {
        result.push([i,j])
      }
    }
  }
  return canonicalizeIntersect(result)
}


function liftBoxes(intervals) {
  return intervals.map(function(interv) {
    return [interv[0], 0, interv[1], 1]
  })
}


//Test the main intersection routine
tape('boxIntersectIter', function(t) {

  function verifyBoxes(d, start, end, boxes, flat, ids, color) {
    var n = boxes.length
    for(var i=0; i<ids.length; ++i) {
      t.ok(start <= ids[i] && ids[i] < end, color + ' id ' + i + ' (=' + ids[i] + ') ok')
      var eb = boxes[ids[i]]
      for(var j=0; j<2*d; ++j) {
        t.equals(flat[2*d*i+j], eb[j], color + ' box ok')
      }
    }
    var nids = ids.slice()
    nids.sort(function(a,b) {
      return a-b
    })
    t.equals(nids.join(), iota(n).join(), color + ' ids ok')
  } 

  function verifyIntersect(d, flip, red, blue) {

    var redFlat = genBoxes.flatten(red)
    var redIds = iota(red.length)

    var blueFlat = genBoxes.flatten(blue)
    var blueIds = iota(blue.length)

    var redStart = 0
    var redEnd = red.length
    var blueStart = 0
    var blueEnd = blue.length

    sqInit(red.length+blue.length)
    iterInit(d, red.length+blue.length)

    var actual = []
    function visit(i,j) {
      //console.log('\tvisit', i, j, red[i], blue[j])

      if(flip) {
        if(red[i][0] === blue[j][0]) {
          throw new Error('visiting boxes with common end point')
        }
        if(!testOverlap(d, flip, blue[j], red[i])) {
          throw new Error('invalid overlap reported')
        }
      } else {
        if(!testOverlap(d, flip, red[i], blue[j])) {
          throw new Error('invalid overlap reported')
        }
      }

      actual.push([i,j])
    }

    boxIntersectIter(
      d, visit, flip,
      red.length,
      guard(redFlat, 2*d*redStart, 2*d*redEnd),
      guard(redIds, redStart, redEnd),
      blue.length,
      guard(blueFlat, 2*d*blueStart, 2*d*blueEnd),
      guard(blueIds, blueStart, blueEnd))
    actual = canonicalizeIntersect(actual)

    var expected

    if(flip) {
      expected = bruteForceIntersect(
        d, true,
        blueStart, blueEnd, blue,
        redStart, redEnd, red)
    } else {
      expected = bruteForceIntersect(
        d, false,
        redStart, redEnd, red,
        blueStart, blueEnd, blue)
    }

    t.equal(actual.join(':'), expected.join(':'), 'expected intersections')

    /*
    verifyBoxes(d, redStart, redEnd, red, redFlat, redIds, 'red')
    verifyBoxes(d, blueStart, blueEnd, blue, blueFlat, blueIds, 'blue')
    */
  }

  function verify(red, blue) {
    var d = (red[0].length>>>1)
    for(var flip=0; flip<2; ++flip) {
      verifyIntersect(d, flip, red, blue)
    }
  }

  function test1D(red, blue) {
    verify(liftBoxes(red), liftBoxes(blue))
  }

  function verifyDupe(boxes) {
    verify(boxes, boxes)
  }

  function verifyDupe1D(boxes) {
    var lifted = liftBoxes(boxes)
    verify(lifted, lifted)
  }

  verify(genBoxes.diamonds(1000, 2), genBoxes.diamonds(1000, 2))

/*
  verify(
    genBoxes.random(200, 2), 
    genBoxes.random(50, 2))

  verifyDupe1D(
    [ [ 0.18938103900291026, 0.7061685477383435 ],
    [ 0.9226114833727479, 1.2856494062580168 ],
    [ 0.3661293820478022, 0.8289455785416067 ],
    [ 0.4401386131066829, 1.3658635288011283 ],
    [ 0.779426485998556, 1.5643593447748572 ],
    [ 0.8874769012909383, 1.6818850559648126 ],
    [ 0.4854744207113981, 0.749912568833679 ],
    [ 0.6239485782571137, 1.5382558887358755 ],
    [ 0.13101207045838237, 0.25228343228809536 ],
    [ 0.2223381686490029, 0.649963942123577 ] ])

  for(var d=2; d<=4; ++d) {
    for(var k=0; k<5; ++k) {
      verify(
        genBoxes.random(100, d), 
        genBoxes.random(100, d))

      verifyDupe(genBoxes.random(200, d))

      verify(
        genBoxes.random(200, d), 
        genBoxes.random(50, d))

      verifyDupe(genBoxes.diamonds(300, d))
      verify(genBoxes.diamonds(200, d), genBoxes.diamonds(200, d))
    }
  }

  verify(genBoxes.random(16, 2), genBoxes.random(16,2))

  test1D(
    [ [ 0.7471681835595518, 1.2161468632984906 ],
      [ 0.19124030973762274, 0.7060783409979194 ],
      [ 0.5821812257636338, 0.7042505703866482 ],
      [ 0.12580981012433767, 0.5745962404180318 ],
      [ 0.7854974835645407, 1.6881890837103128 ],
      [ 0.15464330464601517, 0.9616530060302466 ],
      [ 0.7290581108536571, 1.542481885291636 ],
      [ 0.36789345811121166, 0.742206763708964 ],
      [ 0.12284757080487907, 0.8289807005785406 ],
      [ 0.6898150336928666, 0.7583785944152623 ],
      [ 0.39026873279362917, 1.2188732076901942 ],
      [ 0.35464170947670937, 0.5746510501485318 ],
      [ 0.04181262175552547, 0.17437314637936652 ],
      [ 0.5271184351295233, 0.6855345845688134 ],
      [ 0.5476832001004368, 0.7072964604012668 ],
      [ 0.162303960416466, 1.1499900666531175 ] ], 
    [ [ 0.37825337145477533, 1.2619508667849004 ],
      [ 0.7418697790708393, 1.4401920952368528 ],
      [ 0.10460884333588183, 0.800378279061988 ],
      [ 0.642160561401397, 0.6621420127339661 ],
      [ 0.3230334378313273, 1.0825469121336937 ],
      [ 0.8214478325098753, 1.1379944616928697 ],
      [ 0.20398710714653134, 0.40041443705558777 ],
      [ 0.6593001605942845, 0.938064135145396 ],
      [ 0.790955517673865, 1.1166351430583745 ],
      [ 0.14128341572359204, 1.0256871837191284 ],
      [ 0.4319758345372975, 0.8862462448887527 ],
      [ 0.45653435587882996, 1.2549572456628084 ],
      [ 0.13833985524252057, 0.5506597210187465 ],
      [ 0.7484710896387696, 1.091657368466258 ],
      [ 0.3586640276480466, 0.9134677585680038 ],
      [ 0.38055921043269336, 1.0824621389620006 ] ])
  
  test1D(
    [ [ 0.736438934225589, 1.3674250801559538 ],
      [ 0.5837275013327599, 0.7599847516976297 ],
      [ 0.09032262023538351, 0.1493472980801016 ],
      [ 0.8885269907768816, 1.4405972380191088 ],
      [ 0.6885977059137076, 0.8506820511538535 ],
      [ 0.7436587226111442, 0.9087541229091585 ],
      [ 0.8267327351495624, 1.799088786356151 ],
      [ 0.9728763550519943, 1.39666907209903 ],
      [ 0.37792006903328, 1.1096990518271923 ],
      [ 0.7426377378869802, 1.1762328871991485 ],
      [ 0.5277198625262827, 0.923048626165837 ],
      [ 0.10787915345281363, 1.0845460707787424 ],
      [ 0.052249304950237274, 0.3900811786297709 ],
      [ 0.7852772364858538, 0.8231681799516082 ],
      [ 0.19007079931907356, 0.8123392330016941 ],
      [ 0.5714588942937553, 1.3376684309914708 ] ],
    [ [ 0.7126550150569528, 0.9184670178219676 ],
      [ 0.20807655691169202, 0.9589796008076519 ],
      [ 0.4389537647366524, 1.4179615746252239 ],
      [ 0.7348773742560297, 1.594867696519941 ],
      [ 0.8278656958136708, 1.7904916044790298 ],
      [ 0.013886372791603208, 0.036140055395662785 ],
      [ 0.04114095983095467, 0.98967872466892 ],
      [ 0.858309657080099, 1.0053827590309083 ],
      [ 0.2647855372633785, 0.41644384944811463 ],
      [ 0.3979512103833258, 1.358669359702617 ],
      [ 0.11073166155256331, 1.036533386213705 ],
      [ 0.3604931687004864, 1.024509888375178 ],
      [ 0.8296235564630479, 1.8023635477293283 ],
      [ 0.526039463467896, 0.9828070944640785 ],
      [ 0.20988954068161547, 1.1411469725426286 ],
      [ 0.3009275479707867, 1.0896102127153426 ] ])

  test1D(genBoxes.random(16,1), genBoxes.random(16,1))
  
  test1D([
      [0,0],
      [-1,1],
      [0,2],
      [1,2],
      [2,3],
      [2,2],
      [-10, 10]
    ],[
      [0,0],
      [-1,1],
      [0,2],
      [1,2],
      [2,3],
      [2,2],
      [-10, 10]
    ])
  
  test1D(genBoxes.degenerate(1), genBoxes.degenerate(1))

  verify(
    genBoxes.degenerate(2),
    genBoxes.degenerate(2))

  var clippedBoxes = genBoxes.degenerate(3)
  verify(clippedBoxes, clippedBoxes)
  */

  t.end()
})