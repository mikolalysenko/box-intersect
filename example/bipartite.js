var boxIntersect = require('../index')

var red = [
]

var blue = [
]

//Report all crossings
console.log('crossings=', boxIntersect(red, blue))

//Again can use a visitor.  Also possible to use lower overhead direct wrapper.
boxIntersect.direct(red, blue, function(r, b) {
  console.log('overlap:', red[r], blue[b])
})