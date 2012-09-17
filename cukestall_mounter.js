var CukeStall = require('cukestall');
var Recipe    = require('./app/models/recipe');

var CukestallMounter = {
  mountOnApp: function mountOnApp(app) {
    console.log("Mounting CukeStall on /cukestall");
    app.server.use(
      CukeStall.runner({
        features: [__dirname + '/features/manage_recipes.feature'],
        modules: [__dirname + "/node_modules/async/index.js"],
        require: [
          __dirname + '/features/support/cukestall.js',
          __dirname + '/features/step_definitions/recipe_stepdefs.js'
        ],
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
};

module.exports = CukestallMounter;
