var ooimoTester = require('./ooimo-tester')
var DBVTBroadPhase = require('./dbvt/DBVTBroadPhase')

exports.name = 'oimo - dbvt'

exports.prepare = ooimoTester.prepare

exports.run = function(data) {
  return ooimoTester.run(DBVTBroadPhase, data)
}