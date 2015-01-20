var boxIntersect = require('../index')

//Boxes are listed as flattened 2*d length arrays
var boxes = [
  [1, 1, 2, 2],   //Interpretation: [minX, minY, maxX, maxY]
  [0, -1, 3, 2],
  [2, 1, 4, 5],
  [0.5, 3, 1, 10]
]

//Default behavior reports list of intersections
console.log('overlaps:', boxIntersect(boxes))

//Can also use a visitor to report all crossings
var result = boxIntersect(boxes, function(i,j) {
  console.log('overlap:', boxes[i], boxes[j])

  //Can early out by returning any value
  if(i === 2 || j === 2) {
    return 2
  }
})

console.log('early out result:', result)