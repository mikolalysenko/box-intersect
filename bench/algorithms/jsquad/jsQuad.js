/*
Author: Patrick DeHaan <me@pdehaan.com>
Brief:  MX-CIF Quadtrees implementation in javascript.

Copyright (c) 2011 Patrick DeHaan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var jsQuad = (function() {

var selection = [];

var Node = function(xMin, yMin, xMax, yMax, maxDepth, parent) {
  this.xMin = xMin;
  this.yMin = yMin;
  this.xMax = xMax;
  this.yMax = yMax;
  this.x = (xMax+xMin)/2;
  this.y = (yMax+yMin)/2;
  this.maxDepth = maxDepth === undefined ? 4 : maxDepth;
  this.children = [];
  this.q1 = null;
  this.q2 = null;
  this.q3 = null;
  this.q4 = null;
  this.parent = parent === undefined ? null : parent;
};

// It will run this itself, not you.
var subdivide = function(node, depth) {
  var xMin = node.xMin, yMin = node.yMin,
    xMax = node.xMax, yMax = node.yMax,
    x = node.x, y = node.y;
  node.q1 = new Node(x, y, xMax, yMax, depth, node);
  node.q2 = new Node(xMin, y, x, yMax, depth, node);
  node.q3 = new Node(xMin, yMin, x, y, depth, node);
  node.q4 = new Node(x, yMin, xMax, y, depth, node);
};

Node.prototype = {
  clear: function() {
    this.children.length = 0;
    this.q1.clear();
    this.q2.clear();
    this.q3.clear();
    this.q4.clear();
    this.q1 = null;
    this.q2 = null;
    this.q3 = null;
    this.q4 = null;
  },
  insert: function(child) {
    var node = this;
    // first establish the object is even in the node. If not, just make
    // it a child and move on. This
    if (child.QTenclosed(node.xMin,node.yMin,node.xMax,node.yMax)) {
      this._insert(child);
    }
    
    // TODO: non-enclosed objects should probably either throw an error or
    // cause the node to create parents for itself. This solutions keeps
    // track of the object, but will cause false positives when selection
    // boundaries enclose the node. Another possible solution is to create
    // a seperate container for them.
    else {
      node.children.push(child);
      child.QTsetParent(node);
    }
  },
  _insert: function(child) {
    var node = this;
    if (node.q1 === null && node.maxDepth > 0) {
      subdivide(node, node.maxDepth-1);
    }
    if (node.q1 !== null) {
      var q = child.QTquadrantNode(node, node.x, node.y);
      if (q !== null) {
        q._insert(child);
      } else {
        node.children.push(child);
        child.QTsetParent(node);
      }
    } else {
      node.children.push(child);
      child.QTsetParent(node);
    }
  },
  reinsert: function(child) {
    var parent = child.QTgetParent();
    parent._remove(child);
    parent._reinsert(child);
  },
  _reinsert: function(child) {
    if (child.QTenclosed(this.xMin, this.yMin, this.xMax, this.yMax)) {
      this._insert(child);
    } else {
      if (this.parent === null) { return; }
      this.parent._reinsert(child);
    }
  },
  remove: function(child) {
    // the child's parent is cached so this doesn't have to search half
    // the tree
    child.QTgetParent().remove(child);
  },
  _remove: function(child) {
    // search children to get the index of the child, then splice it out
    for (var i=0; i<this.children.length;i++) {
      if (this.children[i] === child) {
        this.children.splice(i,1);
      }
    }
  },
  getChildren: function() {
    selection.length = 0;
    this.selectChildren();
    return selection;
  },
  selectChildren: function() {
    // push all children into the list
    selection.push.apply(selection, this.children);
    
    // recurse if there are sub-nodes
    if (this.q1 !== null) {
      this.q1.selectChildren();
      this.q2.selectChildren();
      this.q3.selectChildren();
      this.q4.selectChildren();
    }
  },
  getEnclosed: function(xMin, yMin, xMax, yMax) {
    selection.length = 0;
    this.selectEnclosed(xMin, yMin, xMax, yMax);
    return selection;
  },
  selectEnclosed: function(xMin, yMin, xMax, yMax) {
    // move along if there isn't even a boundary overlap
    if (this.xMax < xMin || this.xMin > xMax || this.yMax < yMin || this.yMin > yMax) {
      return;
    }
    
    // entire node is enclosed, select everything
    if (xMin <= this.xMin && xMax >= this.xMax && yMin <= this.yMin && yMax >= this.yMax) {
      // node is entirely enclosed, select all children
      this.selectChildren();
    }
    // node is partially enclosed, search children and sub-nodes
    else {
      // search subnodes if we have them
      if (this.q1 !== null) {
        this.q1.selectEnclosed(xMin, yMin, xMax, yMax);
        this.q2.selectEnclosed(xMin, yMin, xMax, yMax);
        this.q3.selectEnclosed(xMin, yMin, xMax, yMax);
        this.q4.selectEnclosed(xMin, yMin, xMax, yMax);
      }
      // find enclosed children
      for (var i=0; i<this.children.length; i++) {
        if (this.children[i].QTenclosed(xMin, yMin, xMax, yMax)) {
          selection.push(this.children[i]);
        }
      }
    }
  },
  getOverlapping: function(xMin, yMin, xMax, yMax) {
    selection.length = 0;
    this.selectOverlapping(xMin, yMin, xMax, yMax);
    return selection;
  },
  selectOverlapping: function(xMin, yMin, xMax, yMax) {
    // move along if there isn't even a boundary overlap
    if (this.xMax < xMin || this.xMin > xMax || this.yMax < yMin || this.yMin > yMax) {
      return;
    }
    
    // entire node is enclosed, select everything
    if (xMin <= this.xMin && xMax >= this.xMax && yMin <= this.yMin && yMax >= this.yMax) {
      // node is entirely enclosed, select all children
      this.selectChildren();
    }
    // node is partially enclosed, search children and sub-nodes
    else {
      // search subnodes if we have them
      if (this.q1 !== null) {
        this.q1.selectOverlapping(xMin, yMin, xMax, yMax);
        this.q2.selectOverlapping(xMin, yMin, xMax, yMax);
        this.q3.selectOverlapping(xMin, yMin, xMax, yMax);
        this.q4.selectOverlapping(xMin, yMin, xMax, yMax);
      }
      // find enclosed children
      for (var i=0; i<this.children.length; i++) {
        if (this.children[i].QToverlaps(xMin, yMin, xMax, yMax)) {
          selection.push(this.children[i]);
        }
      }
    }
  },
  // TODO: the following methods are basically hacks built on the get methods,
  // they can run faster. The apply functions in particular should get a boost
  // by not needing to do list manipulation
  mapChildren: function(callback) {
    selection.length = 0;
    this.selectChildren();
    var n = selection.length;
    for (var i=0; i<n; i++) {
      selection[i] = callback(selection[i]);
    }
    return selection;
  },
  mapEnclosed: function(xMin, yMin, xMax, yMax, callback) {
    selection.length = 0;
    this.selectEnclosed(xMin, yMin, xMax, yMax);
    var n = selection.length;
    for (var i=0; i<n; i++) {
      selection[i] = callback(selection[i]);
    }
    return selection;
  },
  mapOverlapping: function(xMin, yMin, xMax, yMax, callback) {
    selection.length = 0;
    this.selectOverlapping(xMin, yMin, xMax, yMax);
    var n = selection.length;
    for (var i=0; i<n; i++) {
      selection[i] = callback(selection[i]);
    }
    return selection;
  },
  applyChildren: function(callback) {
    selection.length = 0;
    this.selectChildren();
    var n = selection.length;
    for (var i=0; i<n; i++) {
      callback(selection[i]);
    }
  },
  applyEnclosed: function(xMin, yMin, xMax, yMax, callback) {
    selection.length = 0;
    this.selectEnclosed(xMin, yMin, xMax, yMax);
    var n = selection.length;
    for (var i=0; i<n; i++) {
      callback(selection[i]);
    }
  },
  applyOverlapping: function(xMin, yMin, xMax, yMax, callback) {
    selection.length = 0;
    this.selectOverlapping(xMin, yMin, xMax, yMax);
    var n = selection.length;
    for (var i=0; i<n; i++) {
      callback(selection[i]);
    }
  }
};

return Node; })();