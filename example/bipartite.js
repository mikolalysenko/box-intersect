var boxIntersect = require('../index')

//Again, boxes are given as flattened lists of coordinates
var red = [
  [0, 0, 0, 8, 1, 1],  //Format: [minX, minY, minZ, maxX, maxY, maxZ]
  [0, 0, 0, 1, 8, 1],
  [0, 0, 0, 1, 1, 8]
]

var blue = [
  [5, 0, 0, 6, 10, 10],
  [0, 5, 0, 10, 6, 10],
  [0, 0, 5, 10, 10, 10]
]

//Report all crossings
console.log('crossings=', boxIntersect(red, blue))

//Again can use a visitor.  Also possible to use lower overhead direct wrapper.
boxIntersect(red, blue, function(r, b) {
  console.log('overlap:', red[r], blue[b])
})