Benchmark overview
==================

**WORK IN PROGRESS**

The goal of this benchmark is to compare different solutions for finding all intersections amongst a set of boxes (which is pretty much what box-intersect does).  As this problem is common in rigid body dynamics simulations, many of these codes are implemented within physics simulators.  An effort has been made in each case to connect each of them to this code.

## Libraries/algorithms

### Brute force

* Algorithm: Brute force
* From scratch implementation of brute force collision test

### box-intersect

* Algorithm: [Zomorodian & Edelsbrunner's algorithm](http://pub.ist.ac.at/~edels/Papers/2002-J-01-FastBoxIntersection.pdf)

### [rbush](https://github.com/mourner/rbush)

* Algorithm: BVH
* Try incremental insertion and bulk loading
* Ease of use:  :smile: Super simple interface, clear no frills documentation.  ALSO VERY FAST

### [box2d](http://box2d.org/)

* Algorithm: BVH
* https://code.google.com/p/jsbox2d/source/browse/trunk/src/js/Collision/b2BroadPhase.js
* Note: Gold standard for 2D physics in C, multiple JS ports
* Using this version:  https://code.google.com/p/jsbox2d/
* Ease of use: :neutral_face: Collision detection buried in huge API.  Not modular, but still well organized.  Was not too much work to dig out relevant bits.

### [~~PhysicsJS~~](https://github.com/wellcaffeinated/PhysicsJS)

* ~~Algorithm: Sweep and prune~~
* ~~https://github.com/wellcaffeinated/PhysicsJS/blob/master/src/behaviors/sweep-prune.js~~
* Skipping this for now, collision detection code is too tightly coupled to rest of engine.  Too much work to use this thing
* Ease of use: :dizzy_face: Total nightmare dealing with this thing.  Would not recommend.

### [p2.js](https://github.com/schteppe/p2.js)

* Algorithms: grid and sweep-and-prune
* https://github.com/schteppe/p2.js/blob/master/src/collision/GridBroadphase.js
* https://github.com/schteppe/p2.js/blob/master/src/collision/SAPBroadphase.js
* Ease of use: :neutral_face: Code was clean, easy to grab the relevant modules though a require.  Collision detection routines are not publically documented though...

### [oimo.js](https://github.com/lo-th/Oimo.js/)

* Algorithms: brute force, BVH, ~~sweep and prune~~
* https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/BruteForceBroadPhase.js
* https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/dbvt/DBVTBroadPhase.js
* ~~https://github.com/lo-th/Oimo.js/blob/gh-pages/src/dev/collision/broadphase/sap/SAPBroadPhase.js~~
* Ease of use: :persevere:  Collision detection buried in a bunch of object oriented/inheritance hierarchies.  Required some manual modification to get it to work and still didn't manage to get the sweep and prune pass working! At least it isn't as much of a mess as physicsjs

### [~~cannon.js~~](https://github.com/schteppe/cannon.js)

* ~~Algorithm: brute force, grid, sweep and prune~~
* ~~https://github.com/schteppe/cannon.js/blob/master/src/collision/SAPBroadphase.js~~
* Only supports sphere geometries, not boxes :sad_face:

## Data sets

Want to test on two different types of data.  Generated, parameterized distributions and some realistic data taken from various samples

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

* Type conversion/data representation - Should libraries be penalized for using complicated data types?
* VM optimizations - Sometimes optimizations are non-deterministic (for example in v8), order of execution and other factors can possibly modify performance
* Garbage collection - If too much garbage left from previous algorithm, this could slow down subsequent code execution.
* Data structure initialization/construction - Especially for physics engines, many collision libraries are designed for incremental updates.  May be slower starting from scratch, which is penalized by this benchmark.

## Algorithms represented in survey

* Brute force
* Sweep and prune
* Grids
* BVH
* Zomorodian & Edelsbrunner's algorithm

## Analysis


### Brute force

Trivial analysis, O(n^2) in number of boxes

### Grid

Three modes of performance:

* Quadratic (grid too small)
* Exponential (grid too fine)
* Linear (grid just right)

How to tell:

1D case: Consider size of interval distribution, packing argument

2D case: Extend 1D case to consider aspect ratio

### BVH

Performance here is more mysterious, lots of diverse ways to create these gadgets.

BVH data structres are all O(n) size, so maybe can apply Matousek/Chazelle type argument on range searching lower bounds.  If true, then should take about O(n^(1-1/d))

### Sweep and prune

Worst case O(n^2), best case O(n log(n)).  More likely case is O(n^(1-1/d)).  Need to think about this more.

### Z&E

O(n log(n)), no matter what