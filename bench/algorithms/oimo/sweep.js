var ooimoTester = require('./ooimo-tester')
var SAPBroadPhase = require('./sap/SAPBroadPhase')

exports.name = 'oimo - sweep'

exports.prepare = ooimoTester.prepare

exports.run = function(data) {
  return ooimoTester.run(SAPBroadPhase, data)
}