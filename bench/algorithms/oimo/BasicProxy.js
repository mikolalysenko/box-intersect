var Proxy = require('./Proxy')

/**
* A basic implementation of proxies.
* @author saharan
*/
var BasicProxy = function(shape){
    Proxy.call( this, shape );
}
BasicProxy.prototype = Object.create( Proxy.prototype );
BasicProxy.prototype.update = function () {
}

module.exports = BasicProxy