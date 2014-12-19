'use strict'

var tape = require('tape')
var guard = require('guarded-array')
var iota = require('iota-array')
var genBoxes = require('./util/random-boxes')
var intersect = require('../lib/boxnd').intersect

// Signature:
//
// function boxIntersectRec(
//  d, axis, visit, flip,
//  redStart, redEnd, red, redIndex,
//  blueStart, blueEnd, blue, blueIndex, 
//  lo, hi)
//

//Test the main intersection routine
tape('boxIntersectRec', function(t) {




  t.end()
})
