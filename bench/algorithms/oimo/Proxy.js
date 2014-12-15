/**
* A proxy is used for broad-phase collecting pairs that can be colliding.
*/
var Proxy = function(shape){
  // The parent shape.
    this.shape=shape;
    // The axis-aligned bounding box.
    this.aabb=shape.aabb;
};

Proxy.prototype = {

    constructor: Proxy,
    
    /**
  * Update the proxy.
  */
    update:function(){
        throw new Error("Inheritance error.");
    }
}

module.exports = Proxy