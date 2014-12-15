'use strict'

module.exports = runBenchmark

var distributions = {
  uniform:   require('./generators/uniform')
}

var codes = {
  'brute-force': require('./algorithms/brute-force'),
  'rbush-incremental': require('./algorithms/rbush/incremental'),
  'rbush-bulk': require('./algorithms/rbush/bulk'),
  'box2d': require('./algorithms/box2d/broadphase'),
  'p2-grid': require('./algorithms/p2/grid'),
  'p2-sweep': require('./algorithms/p2/sweep'),
  'oimo-brute-force': require('./algorithms/oimo/brute-force'),
  'oimo-bvh': require('./algorithms/oimo/bvh')
}

function generateBoxes(options) {
  var n = options.n
  var d = options.d
  var dist = distributions[options.type]
  if(dist) {
    return dist(n, d, options)
  }
  throw new Error('invalid distribution type: ' + options.type)
}

function runBenchmark(desc) {
  var algorithms   = desc.algorithms
  var distribution = desc.distribution
  var sweep        = desc.sweep
  var sweepParam   = Object.keys(sweep)[0]
  var sweepValues  = sweep[sweepParam]
  var numIters     = desc.numIters || 5

  var result = {
    name: desc.name,
    xaxis: sweepValues,
    xvariable: sweepParam,
    data: {}
  }
  for(var i=0; i<algorithms.length; ++i) {
    result.data[algorithms[i]] = []
  }

  sweepValues.forEach(function(v, i) {
    distribution[sweepParam] = v
    var boxes = generateBoxes(distribution)

    console.log('case:', i, sweepParam + '=' + v)
    algorithms.forEach(function(alg) {
      console.log('testing', alg)

      var algorithm = codes[alg]
      var convertedBoxes = algorithm.prepare(boxes)

      var tStart = Date.now()
      var counter = 0
      for(var i=0; i<numIters; ++i) {
        counter += algorithm.run(convertedBoxes)
      }
      var tEnd = Date.now()

      result.data[alg].push((tEnd - tStart) / numIters)

      console.log('num interactions=', counter, 't=', tEnd-tStart)
    })
  })

  return result
}