var nopt = require('nopt');
var App  = require('./app');
var app  = new App();

var knownOptions  = { "with-cukestall": Boolean };
var shortOptions  = {};
var options       = nopt(knownOptions, shortOptions, process.argv);
var withCukestall = options['with-cukestall'] || process.env.WITH_CUKESTALL;
withCukestall     = withCukestall == "1" || withCukestall == "true";

if (withCukestall) {
  var CukestallMounter = require("./cukestall_mounter");
  CukestallMounter.mountOnApp(app);
}

app.start();
