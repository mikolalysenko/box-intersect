'use strict'

var tape = require('tape')
var harness = require('./harness')

tape('box-intersect', function(t) {

  harness.full(t, [
    [1,2],
    [2,3],
    [1,3]
    ], '1d example')

  t.end()
})