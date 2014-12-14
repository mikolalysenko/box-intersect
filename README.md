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
boxIntersect(red, blue, function(r, b) {
  console.log(red[r], blue[b])
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

#### full


#### bipartite

# Credits
(c) 2014 Mikola Lysenko. MIT License