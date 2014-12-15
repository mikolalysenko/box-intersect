var DBVTNode = require('./DBVTNode')
var Proxy = require('../Proxy')

/**
* A proxy for dynamic bounding volume tree broad-phase.
* @author saharan
*/
var DBVTProxy = function(shape){
    Proxy.call( this, shape);
    // The leaf of the proxy.
    this.leaf = new DBVTNode();
    this.leaf.proxy = this;
}
DBVTProxy.prototype = Object.create( Proxy.prototype );
DBVTProxy.prototype.update = function () {
}

module.exports = DBVTProxy