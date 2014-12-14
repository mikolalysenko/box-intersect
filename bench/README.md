Benchmark overview
==================

## Libraries/algorithms

### Brute force

* Algorithm: Brute force

### box-intersect

* Algorithm: [Zomorodian & Edelsbrunner's algorithm](http://pub.ist.ac.at/~edels/Papers/2002-J-01-FastBoxIntersection.pdf)

### [rbush](https://github.com/mourner/rbush)

* Algorithm: BVH
* Try incremental insertion and bulk loading

### [box2d](http://box2d.org/)

* Algorithm: BVH
* https://code.google.com/p/jsbox2d/source/browse/trunk/src/js/Collision/b2BroadPhase.js
* Note: Gold standard for 2D physics in C, multiple JS ports hard to pick best one...

### [PhysicsJS](https://github.com/wellcaffeinated/PhysicsJS)

* Algorithm: Sweep and prune
* https://github.com/wellcaffeinated/PhysicsJS/blob/master/src/behaviors/sweep-prune.js

### [p2.js](https://github.com/schteppe/p2.js)

* Algorithms: grids and sweep-and-prune
* https://github.com/schteppe/p2.js/blob/master/src/collision/GridBroadphase.js
* https://github.com/schteppe/p2.js/blob/master/src/collision/SAPBroadphase.js

### [oimo.js](https://github.com/lo-th/Oimo.js/)

* Algorithms: brute force, sweep and prune, BVH
* https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/BruteForceBroadPhase.js
* https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/sap/SAPBroadPhase.js
* https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/dbvt/DBVTBroadPhase.js

### [cannon.js](https://github.com/schteppe/cannon.js)

* Algorithm: Sweep and prune
* https://github.com/schteppe/cannon.js/blob/master/src/collision/SAPBroadphase.js

## Data sets

### Parameters

* Dimension:  1, 2, 3, 4
* Number of boxes
* Aspect ratio
* Distribution type (uniform, gaussian, gaussian-mixture, pathological distributions ?)
* Runtime environment: (Chrome, Firefox, node/iojs, etc.)

### Constructed examples

* 2D: take coast line of some country/map, create 1 box/segment
* 3D: take some meshes (bunny/dragon), create 1 box/polygon

## Common benchmark interface

Must expose an interface which given list of boxes reports list of pairs of intersections.  For each package, we create a shim that exposes two methods:

1.  Preprocessing phase: convert box array to internal format. (Should not build data structures, just do type conversions here to control for overhead.)
2.  Benchmark phase: Take list of boxes, count number of intersections.

### List of confounding factors

* Type conversion/data representation
* VM optimization
* Garbage collection
* Data structure initialization/construction

## Algorithms represented in survey

* Brute force
* Sweep and prune
* Grids
* BVH
* Zomorodian & Edelsbrunner's algorithm