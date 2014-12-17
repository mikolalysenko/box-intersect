**WORK IN PROGRESS**

box-intersect
=============
This modules finds all intersection in a set of n boxes in d-dimensions, or between a pair of sets with n and m boxes respectively.  The time taken is O((n+m) log^d(n+m)) and the algorithm uses a temporary scratch memory of size O(n+m).  This memory is pooled so that after the first execution no additional memory is allocated.

The algorithm in this package is based on the one described in the following paper:

* [A. Zomorodian, H. Edelsbrunner. (2000) "Software for fast box intersections" In proceedings of SoCG](http://pub.ist.ac.at/~edels/Papers/2002-J-01-FastBoxIntersection.pdf)

A detailed experimental analysis of the performance of this module can be found in the `bench/README.md` file within this repository:

* [Benchmark and performance comparisons](https://github.com/mikolalysenko/box-intersect/blob/master/bench/README.md#benchmark-overview)

Some possible applications of this library include:

* Collision detection
* Polygon clipping
* Batched box stabbing queries
* Mesh boolean operations (CSG)

# Example

### Detecting overlaps in a set of boxes

Here is how to detect all pairs of overlapping boxes in a single set of boxes:

```javascript
var boxIntersect = require('box-intersect')

//Boxes are listed as flattened 2*d length arrays
var boxes = [
  [1, 1, 2, 2],   //Interpretation: [minX, minY, maxX, maxY]
  [0, -1, 3, 2],
  [2, 1, 4, 5],
  [0.5, 3, 1, 10]
]

//Default behavior reports list of intersections
console.log('overlaps:', boxIntersect(boxes))

//Note:  Boxes are closed

//Can also use a visitor to report all crossings
var result = boxIntersect(boxes, function(i,j) {
  console.log('overlap:', boxes[i], boxes[j])

  //Can early out by returning any value
  if(i === 2 || j === 2) {
    return 2
  }
})

console.log('early out result:', result)
```

#### Output

```
overlaps: [ [ 0, 1 ], [ 0, 2 ], [ 1, 2 ] ]
overlap: [ 1, 1, 2, 2 ] [ 0, -1, 3, 2 ]
overlap: [ 1, 1, 2, 2 ] [ 2, 1, 4, 5 ]
early out result: 2
```

### Bipartite intersection

You can also detect all intersections between two different sets of boxes:

```javascript
var boxIntersect = require('box-intersect')

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
boxIntersect.direct(red, blue, function(r, b) {
  console.log('overlap:', red[r], blue[b])
})
```

#### Output

```
crossings= [ [ 0, 0 ], [ 1, 1 ], [ 2, 2 ] ]
overlap: [ 0, 0, 0, 8, 1, 1 ] [ 5, 0, 0, 6, 10, 10 ]
overlap: [ 0, 0, 0, 1, 8, 1 ] [ 0, 5, 0, 10, 6, 10 ]
overlap: [ 0, 0, 0, 1, 1, 8 ] [ 0, 0, 5, 10, 10, 10 ]
```

# Install

```sh
npm install box-intersect
```

Works in any reasonable CommonJS environment (includes browsersify, iojs and node.js)

# API

```javascript
var boxIntersect = require('box-intersect')
```

### `boxIntersect(boxes[, otherBoxes, visit])`

Finds all pairs intersections in a set of boxes.  There are two basic modes of operation for this function:

* `full` which detects all pairs of intersections within a single set of boxes
* `bipartite` which detects pairs of intersections between two different sets of boxes

The parameters to the function are as follows:

* `boxes` is a list of boxes.  Boxes are represented as length 2*d arrays where the first d-components are the lower bound of the box and then the next d components are the upper bound.
* `otherBoxes` is an optional list of boxes which `boxes` is tested against.  If not specified, then the algorithm will report self intersections in `boxes`
* `visit(i,j)` is a callback which is called once for each overlapping pair of boxes.  If `visit` returns any value not equal to `undefined`, then the search is terminated immediately and this value is returned.  If `visit` is not specified, then a list of intersecting pairs is returned.

**Returns** If `visit` was specified, then the last returned value of `visit`.  Otherwise an array of pairs of intersecting boxes.

**Note** The boxes are treated as closed intervals.  That is, the boxes `[1,1,2,2]` and `[0,0,1,1]` intersect according to this algorithm.

### `boxIntersect.direct(boxes, otherBoxes, visit)`

Internally both of the above modes are implemented in terms of bipartite intersection detection.  To skip the overhead of calling the wrapper, you can also call the underlying bipartite intersection algorithm directly.  This requires that you pass in `boxes`, `otherBoxes` and `visit` as in the above case.  Under the hood, all intersection checks are implemented using this method.

# License

(c) 2014 Mikola Lysenko. MIT License