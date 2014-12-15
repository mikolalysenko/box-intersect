var fs = require('fs')
var runBench = require('./bench')
var makePlot = require('./plot')

var cases = [
  //require('./cases/uniform2d.json')
  require('./cases/uniform3d.json')
]

if(process.argv[2]) {
  cases = process.argv.slice(2).map(function(casepath) {
    var casestr = fs.readFileSync(casepath, 'utf-8')
    return JSON.parse(casestr)
  })
}

for(var i=0; i<cases.length; ++i) {
  var result = runBench(cases[i])
  console.log('plot:', makePlot(result))
}