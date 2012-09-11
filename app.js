var express = require('express');
var Recipe  = require('./app/models/recipe');

var DEFAULT_HTTP_LISTEN_PORT = 9797;

var App = function App(options) {
  var self = this;
  options        = options || {};
  self.port      = options['port'] || process.env.PORT || DEFAULT_HTTP_LISTEN_PORT;
  self.logStream = options['logStream'] || process.stdout;

  var server = this.server = express.createServer();
  server.configure(function () {
    server.use(express.logger({format: 'dev', stream: self.logStream}));
    server.use(express.bodyParser());
    server.use(express.cookieParser());
    server.use(function (req, res, next) {
      if (req.cookies.sandboxid)
        var sandboxId = req.cookies.sandboxid;
      else {
        var sandboxId = Date.now();
        res.cookie('sandboxid', sandboxId);
      }
      req.Recipe = Recipe.isolateInCollection("recipes-" + sandboxId);
      next();
    });
    server.use(server.router);
    server.use(express.static(__dirname + '/public'));
    server.set('view engine', 'ejs');
    server.set('views', __dirname + '/app/views');
    server.set('view options', {
      layout: 'layouts/application'
    });
  });

  server.get('/', function (req, res) {
    res.redirect('/recipes');
  });

  server.get('/recipes', function (req, res) {
    req.Recipe.find({}, function (err, recipes) {
      res.render('recipes/index', {recipes: recipes});
    });
  });

  server.get('/recipes/new', function (req, res) {
    res.render('recipes/new');
  });

  server.get('/recipes/:id', function (req, res) {
    req.Recipe.findById(req.params.id, function (err, recipe) {
      res.render('recipes/show', {recipe: recipe});
    });
  });

  server.post('/recipes', function(req, res) {
    var recipe = new req.Recipe(req.body.recipe);
    recipe.save();
    res.redirect('/recipes');
  });
};

App.prototype.start = function start() {
  this.server.listen(this.port);
  this.baseUrl = "http://localhost:" + this.port;
  console.log("Listening on port " + this.port);
};

App.prototype.stop = function stop() {
  this.server.close();
};

module.exports = App;
