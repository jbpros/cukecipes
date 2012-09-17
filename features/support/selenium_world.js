var fs               = require("fs");
var KiteWorld        = require("./kite_world").World;
var SeleniumDriver   = require("kite/lib/kite/driver/selenium_driver");
var CukestallMounter = require("../../cukestall_mounter");
var App              = require("../../app.js");

var SeleniumWorld = function SeleniumWorldConstructor(callback) {
  var LOG_FILE = __dirname + "/../../log/cucumber.selenium.log";
  var self = this;

  new SeleniumDriver({}, function (err, driver) {
    var logFile = fs.createWriteStream(LOG_FILE, {flags: "a"});
    self.app    = new App({port: 21014, logStream: logFile});
    CukestallMounter.mountOnApp(self.app);
    self.app.start();
    new KiteWorld({baseRef: "http://localhost:21014/", driver: driver}, callback);
  });
};

exports.World = SeleniumWorld;
