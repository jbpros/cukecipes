var fs               = require("fs");
var KiteWorld        = require("./kite_world").World;
var ZombieDriver     = require("kite/lib/kite/driver/zombie_driver");
var CukestallMounter = require("../../cukestall_mounter");
var App              = require("../../app.js");

var ZombieWorld = function ZombieWorldConstructor(callback) {
  var LOG_FILE = __dirname + "/../../log/cucumber.zombie.log";
  var self = this;

  var driver  = new ZombieDriver();
  var logFile = fs.createWriteStream(LOG_FILE, {flags: "a"});
  self.app    = new App({port: 21013, logStream: logFile});
  CukestallMounter.mountOnApp(self.app);
  self.app.start();

  new KiteWorld({baseRef: "http://localhost:21013/", driver: driver}, callback);
};

exports.World = ZombieWorld;
