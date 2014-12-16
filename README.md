**WORK IN PROGRESS**

box-intersect
=============
Report all intersections in a set of n-dimensional boxes.

# Example

### Detecting overlaps in a set of boxes

Here is how to detect all pairs of overlapping boxes in a single set of boxes:

```javascript
var boxIntersect = require('box-intersect')

//Boxes are listed as flattened 2*d length arrays
var boxes = [
]

//Default behavior reports list of intersections
console.log('overlaps:', boxIntersect(boxes))

//Can also use a visitor to report all crossings
boxIntersect(boxes, function(i,j) {
  console.log('overlap:', boxes[i], boxes[j])
})
```

#### Output

```
```

### Bipartite intersection

You can also detect all intersections between two different sets of boxes:

```javascript
var boxIntersect = require('box-intersect')

var red = [
]

var blue = [
]

//Report all crossings
console.log('crossings=', boxIntersect(red, blue))


//Can also call directly
boxIntersect.direct(red, blue, function(r, b) {
  console.log('overlap:', red[r], blue[b])
})
```

#### Output

```
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

Finds all box intersections in a set of boxes.  There are two basic modes for this function:

* `boxes` is a list of boxes
* `otherBoxes` is an optional list of boxes which `boxes` is tested against.  If not specified, then the algorithm will report self intersections in `boxes`
* `visit(i,j)` is a callback which is called once for each overlapping pair of boxes.  If `visit` returns any value not equal to `undefined`, then the search is terminated immediately and this value is returned.  If `visit` is not specified, then a list of intersecting pairs is returned.

**Returns** `visit` specified, then the last returned value of `visit`.  Otherwise an array of pairs of intersecting boxes.

### `boxIntersect.direct(boxes, otherBoxes, visit)`

To skip the overhead of calling the wrapper, you can also call the underlying bipartite intersection algorithm directly.  This requires that you pass in `boxes`, `otherBoxes` and `visit` as in the above case.  Under the hood, all intersection checks are implemented using this method.

# License

(c) 2014 Mikola Lysenko. MIT License