var KiteWorld = require('./kite_world').World;
var CukestallDriver = require("kite/lib/kite/driver/cukestall_driver");

var CukeStallSupport = function CukeStallSupport() {
  if (typeof window == 'undefined')
    return; // do not run outside of browsers

  this.World = function(callback) {
    var driver = new CukestallDriver();
    new KiteWorld({baseRef: "/", driver: driver}, callback);
  };
};

module.exports = CukeStallSupport;
