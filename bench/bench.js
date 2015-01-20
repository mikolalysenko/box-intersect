'use strict'

module.exports = runBenchmark

var distributions = {
  uniform:   require('./generators/uniform'),
  skewed:    require('./generators/skewed'),
  sphere:    require('./generators/sphere'),
  bunny:     require('./generators/bunny')
}

var completeAlgs = {
  'brute-force': require('./algorithms/brute-force/complete-fast'),
  'brute-force-robust': require('./algorithms/brute-force/complete-robust'),
  'box-intersect': require('./algorithms/box-intersect/complete'),
  'rbush-incremental': require('./algorithms/rbush/incremental'),
  'rbush-bulk': require('./algorithms/rbush/bulk'),
  'box2d': require('./algorithms/box2d/broadphase'),
  'p2-grid': require('./algorithms/p2/grid'),
  'p2-sweep': require('./algorithms/p2/sweep'),
  'oimo-brute-force': require('./algorithms/oimo/brute-force'),
  'oimo-bvh': require('./algorithms/oimo/bvh'),
  'simple-quadtree': require('./algorithms/simple-quadtree/complete'),
  'lazykdtree': require('./algorithms/lazykdtree/complete'),
  'rtree': require('./algorithms/rtree/complete'),
  'jsts-quadtree': require('./algorithms/jsts/quadtree'),
  'jsts-strtree': require('./algorithms/jsts/strtree')
}

var bipartiteAlgs = {
  'brute-force': require('./algorithms/brute-force/bipartite-fast'),
  'box-intersect': require('./algorithms/box-intersect/bipartite'),
  'rbush': require('./algorithms/rbush/bipartite')
  //TODO: jsts, lazykdtree, simple-quadtree, rtree
}

var prettyNames = {
  'n':   'Boxes',
  '0.n': 'Red boxes',
  '1.n': 'Blue boxes'
}


function generateBoxes(options) {
  var dist = distributions[options.type]
  if(dist) {
    return dist(options)
  }
  throw new Error('invalid distribution type: ' + options.type)
}

function runBenchmark(desc) {
  var algorithms   = desc.algorithms
  var distribution = desc.distribution
  var sweepParam   = desc.parameters
  var sweepValues  = desc.ranges
  var sweepCases   = desc.cases
  var numIters     = desc.numIters || 5
  var bipartite    = Array.isArray(distribution) && distribution.length === 2

  if(bipartite) {
    console.log('generators:', distribution[0].type, distribution[1].type)
  } else {
    console.log('generator:', desc.distribution.type)
  }

  function parameterSweep() {
    var result = {
      names: sweepParam[0].map(function(name) {
        if(name in prettyNames) {
          return prettyNames[name]
        }
        return name
      }),
      axis: [],
      data: {}
    }
    for(var i=0; i<algorithms.length; ++i) {
      result.data[algorithms[i]] = []
    }

    for(var i=0; i<=sweepCases[0]; ++i) {
      var xparameter = []
      for(var j=0; j<sweepParam[0].length; ++j) {
        var p = sweepParam[0][j].split('.')
        var x = distribution
        while(p.length > 1) {
          x = x[p.shift()]
        }
        var v = sweepValues[0][j]
        var vv = v[0] + (v[1] - v[0]) / sweepCases[0] * i
        x[p[0]] = vv
        xparameter.push(vv)
      }
      result.axis.push(xparameter)

      var boxes, red, blue 

      if(bipartite) {
        red = generateBoxes(distribution[0])
        blue = generateBoxes(distribution[1])
      } else {
        boxes = generateBoxes(distribution)
      }

      console.log('case:', i, ' - ', distribution)
      algorithms.forEach(function(alg) {
        console.log('testing', alg)

        if(bipartite) {
          var algorithm = bipartiteAlgs[alg]
          var convertedRed = algorithm.prepare(red)
          var convertedBlue = algorithm.prepare(blue)
          for(var k=0; k<5; ++k) {
            algorithm.run(convertedRed, convertedBlue)
          }
          var tStart = Date.now()
          var counter = 0
          for(var k=0; k<numIters; ++k) {
            counter += algorithm.run(convertedRed, convertedBlue)
          }
          var tEnd = Date.now()
        } else {
          var algorithm = completeAlgs[alg]
          var convertedBoxes = algorithm.prepare(boxes)
          for(var k=0; k<5; ++k) {
            algorithm.run(convertedBoxes)
          }
          var tStart = Date.now()
          var counter = 0
          for(var k=0; k<numIters; ++k) {
            counter += algorithm.run(convertedBoxes)
          }
          var tEnd = Date.now()
        }

        result.data[alg].push((tEnd - tStart) / numIters)

        console.log('num interactions=', counter, 'tAvg=', (tEnd-tStart)/numIters + 'ms')
      })
    }

    return result
  }

  if(!sweepParam || sweepParam.length === 0) {
    //Bar chart
    sweepCases = [1]
    sweepParam = [[]]
    sweepValues = [[]]
    var result = parameterSweep()
    return {
      name: desc.name,
      type: 'barchart',
      plot: desc.plot,
      data: result.data
    }
  } else if(sweepParam.length === 1) {
    //Series
    var result = parameterSweep()
    return {
      name:   desc.name,
      type:   'series',
      plot:   desc.plot,
      xaxisTitle:  result.names.join(', '),
      xaxis: result.axis.map(function(data) {
        return data[0]
      }),
      data: result.data
    }
  } else {
    //Surface plot
    var result = {
      name: desc.name,
      type: 'surface',
      plot: desc.plot,
      yaxisTitle: sweepParam[1].map(function(name) {
        if(name in prettyNames) {
          return prettyNames[name]
        }
        return name
      }),
      yaxis: [],
      data: {}
    }
    for(var i=0; i<algorithms.length; ++i) {
      result.data[algorithms[i]] = []
    }

    for(var i=0; i<=sweepCases[1]; ++i) {
      var yparameter = []
      for(var j=0; j<sweepParam[1].length; ++j) {
        var p = sweepParam[1][j].split('.')
        var x = distribution
        while(p.length > 1) {
          x = x[p.shift()]
        }
        var v = sweepValues[1][j]
        var vv = v[0] + (v[1] - v[0]) / sweepCases[1] * i
        x[p[0]] = vv
        yparameter.push(vv)
      }
      result.yaxis.push(yparameter[0])

      var sweep = parameterSweep()
      result.xaxisTitle = sweep.names.join(', ')
      result.xaxis = sweep.axis.map(function(x) {
        return x[0]
      })
      for(var j=0; j<algorithms.length; ++j) {
        result.data[algorithms[j]].push(sweep.data[algorithms[j]])
      }
    }
    return result
  }
}