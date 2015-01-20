'use strict'

module.exports = plotBenchmark

//TODO:  If you are running this locally, create an account with plotly and get an API key
// Store this in a local file called plotly.json with two keys:
//
//    username:  your plotly user name
//    key:       your plotly api key
//
var PLOTLY_CONFIG = require('./plotly.json')

var plotly = require('plotly')(PLOTLY_CONFIG.username, PLOTLY_CONFIG.key)

function plotBenchmark(result) {
  if(typeof document !== 'undefined') {
    console.log(result)
    return
  }

  switch(result.type) {
    case 'barchart':
      plotBarChart(result)
    break

    case 'series':
      plotSeries(result)
    break

    case 'surface':
      plotSurface(result)
    break
  }
}

function plotBarChart(result) {
}

function plotSeries(result) {
  var series = Object.keys(result.data)
  var traces = series.map(function(name) {
    return {
      x: result.xaxis,
      y: result.data[name],
      type: 'scatter',
      name: name
    }
  })
  var options = {
    filename: result.name,
    fileopt: "overwrite",
    layout: {
      title: result.name,
      showlegend: true,
      autosize: true,
      yaxis: {
        title: "Average time (ms)",
        autorange: true
      },
      xaxis: {
        title: result.xaxisTitle,
        autorange: true
      }
    }
  }

  plotly.plot(traces, options, function(err, msg) {
    if(err) {
      console.error("error!", err)
      console.log("data:", result)
    } else {
      console.log(result.name+':', msg.url)
    }
  })
}

function plotSurface(result) {
}