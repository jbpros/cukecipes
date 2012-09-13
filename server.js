var nopt = require('nopt');
var App  = require('./app');
var app  = new App();

var knownOptions  = { "with-cukestall": Boolean };
var shortOptions  = {};
var options       = nopt(knownOptions, shortOptions, process.argv);
var withCukestall = options['with-cukestall'] || process.env.WITH_CUKESTALL;
withCukestall     = withCukestall == "1" || withCukestall == "true";

if (withCukestall) {
  var CukeStall = require('cukestall');
  var Recipe    = require('./app/models/recipe');

  console.log("Mounting CukeStall on /cukestall");

  app.server.use(
    CukeStall.runner({
      features: [__dirname + '/features/manage_recipes.feature'],
      modules: [__dirname + "/node_modules/async/index.js"],
      require: [__dirname + '/features/support/cukestall.js', __dirname + '/features/step_definitions/recipe_stepdefs.js'],
      backdoors: {
        reset_all: function (req, res, next) {
          req.Recipe.collection.drop(function() {
            res.end("Done.");
          });
        }
      }
    })
  );
}

app.start();
