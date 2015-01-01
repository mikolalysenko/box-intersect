'use strict'

module.exports = symDiff

function toDict(pairs) {
  var dict = {}
  for(var i=0; i<pairs.length; ++i) {
    dict[pairs[i]] = true
  }
  return dict
}

function asymDiff(src, dst) {
  var dict = toDict(src)
  var diff = []
  for(var i=0; i<dst.length; ++i) {
    if(!dict[dst[i]]) {
      diff.push(dst[i])
    }
  }
  return diff
}

function symDiff(red, blue) {
  return {
    red:  asymDiff(red, blue),
    blue: asymDiff(blue, red)
  }
}