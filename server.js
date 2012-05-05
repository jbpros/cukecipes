var nopt = require('nopt');
var App  = require('./app');
var app  = new App();

var knownOptions = { "with-cukestall": Boolean };
var shortOptions = {};
var options      = nopt(knownOptions, shortOptions, process.argv);

if (options['with-cukestall']) {
  var CukeStall = require('cukestall');
  var Recipe    = require('./app/models/recipe');

  console.log("Mounting CukeStall on /cukestall");

  app.server.use(
    CukeStall.runner({
      featurePaths:     [__dirname + '/features/manage_recipes.feature'],
      stepDefsPaths:    [__dirname + '/features/step_definitions/recipe_stepdefs.js'],
      supportCodePaths: [__dirname + '/features/support/cukestall.js'],
      backdoors: {
        reset_all: function (req, res, next) {
          Recipe.collection.drop(function() {
            res.end("Done.");
          });
        }
      }
    })
  );
}

app.start();
