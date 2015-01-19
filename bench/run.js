var fs = require('fs')
var runBench = require('./bench')
var makePlot = require('./plot')

var cases = [
  require('./cases/uniform2d-small.json')
  //require('./cases/boxbench.json')
  //require('./cases/length-vs-bounds.json')
  //require('./cases/grid2d.json')
]

if(process.argv[2]) {
  cases = process.argv.slice(2).map(function(casepath) {
    var casestr = fs.readFileSync(casepath, 'utf-8')
    return JSON.parse(casestr)
  })
}

for(var i=0; i<cases.length; ++i) {
  var result = runBench(cases[i])
  if(cases[i].plot) {
    makePlot(result)
  }
}