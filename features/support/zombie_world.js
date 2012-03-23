var ZombieWorld = function ZombieWorld(callback) {
  var LOG_FILE = __dirname + '/../../log/cucumber.zombie.log';

  var fs      = require('fs');
  var App     = require('../../app.js');
  var Browser = require("zombie");

  var self = this;

  self.cleanUp(function() {
    var logFile  = fs.createWriteStream(LOG_FILE, {flags: 'a'});
    self.app     = new App({port: 21012, logStream: logFile});
    self.app.start();
    self.browser = new Browser({ site: self.app.baseUrl });
    callback();
  });
};

ZombieWorld.prototype.addNewRecipe = function (callback) {
  var self = this;

  this.newRecipeAttributes = {
    title: "Cucumber au gratin",
    ingredients: "2 cucumbers\n\
1 1/2 cups grated Gruyere cheese\n\
salt & black pepper\n3-4 Tbs butter",
    instructions: "Peel the cucumbers & cut them into 3 inch pieces.\n\
Slice each piece in half lengthwise & remove the seeds.\n\
Cook the cucumber in boiling salted water for 10 minutes, the drain & dry.\n\
Arrange a layer of cucumber in the base of a buttered ovenproof dish.\n\
Sprinkle with a third of the cheese, & season with salt & pepper.\n\
Repeat these layers, finishing with cheese. Dot the top with butter.\n\
Bake the cucumber gratin in the center of a preheated oven at 400 for 30 minutes."
  };
  self.browser.visit('/', function() {
    self.browser.clickLink('Add recipe', function() {
      self.browser
        .fill("Title", self.newRecipeAttributes.title)
        .fill("Ingredients", self.newRecipeAttributes.ingredients)
        .fill("Instructions", self.newRecipeAttributes.instructions)
        .pressButton("Save", callback);
    });
  });
};

ZombieWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
  var self = this;
  self.browser.visit('/', function() {
    self.browser.clickLink(self.newRecipeAttributes.title, function() {
      if (self.browser.text('body').indexOf(self.newRecipeAttributes.title) == -1)
        callback.fail("Recipe title not found (" + self.newRecipeAttributes.title + ").");
      if (self.browser.text('body').indexOf(self.newRecipeAttributes.ingredients) == -1)
        callback.fail("Recipe ingredients not found (" + self.newRecipeAttributes.ingredients + ").");
      if (self.browser.text('body').indexOf(self.newRecipeAttributes.instructions) == -1)
        callback.fail("Recipe instructions not found (" + self.newRecipeAttributes.instructions + ").");
      else
        callback();
    });
  });
};

ZombieWorld.prototype.cleanUp = function (callback) {
  var Recipe = require('../../app/models/recipe');
  Recipe.collection.drop(callback);
};

exports.World = ZombieWorld;
