var fs      = require('fs');
var express = require('express');
var App     = require('../app');
var Recipe  = require('../app/models/recipe');

var app     = new App();

app.server.use(express.static(__dirname + '/public'));
app.server.get('/cukes', function (req, res) {
  var features = [fs.readFileSync(__dirname + '/../features/manage_recipes.feature')];
  res.render(__dirname + '/views/index', {features: features, layout: false});
});

app.server.post('/cukes/reset_all', function (req, res) {
  Recipe.collection.drop(function() {
    res.end("Done.");
  });
});

app.start();
