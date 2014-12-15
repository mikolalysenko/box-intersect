'use strict'

var ooimoTester = require('./ooimo-tester')
var BruteForceBroadPhase = require('./BruteForceBroadPhase')

exports.name = 'oimo - brute force'

exports.prepare = ooimoTester.prepare

exports.run = function(data) {
  return ooimoTester.run(BruteForceBroadPhase, data)
}