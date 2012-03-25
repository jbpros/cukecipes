var SeleniumWorld = function SeleniumWorld(callback) {
  var LOG_FILE       = __dirname + '/../../log/cucumber.selenium.log';
  var SELENIUM_SPEED = 1000; // ms

  var fs       = require('fs');
  var selenium = require('selenium-launcher');
  var soda     = require('soda');
  var App      = require('../../app.js');
  var Browser  = require("zombie");

  var self = this;

  var init = function () {
    var logFile  = fs.createWriteStream(LOG_FILE, {flags: 'a'});
    self.app     = new App({port: 21014, logStream: logFile});
    self.app.start();
    selenium(function(err, selenium) {
      process.on('exit', function() {
        //selenium.kill();
      });

      self.browser = soda.createClient({
        host: selenium.host,
        port: selenium.port,
        url:  self.app.baseUrl,
        browser: 'firefox'
      });

      self.browser.setSpeed(SELENIUM_SPEED, function(err) {
        self.browser.session(function(err) {
          callback();
        });
      });
    })
  };

  self.cleanUp(init);
};

SeleniumWorld.prototype.addNewRecipe = function (callback) {
  var self = this;

  self.newRecipeAttributes = {
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
  self.browser
    .chain
    .open('/')
    .clickAndWait('link=Add recipe')
    .type('name=recipe[title]', self.newRecipeAttributes.title)
    .type('name=recipe[ingredients]', self.newRecipeAttributes.ingredients)
    .type('name=recipe[instructions]', self.newRecipeAttributes.instructions)
    .clickAndWait('name=save')
    .end(function(err) {
      if (err)
        callback.fail(err);
      else
        callback();
    });
};

SeleniumWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
  var self = this;
  self.browser
    .chain
    .open('/')
    .clickAndWait('link='+self.newRecipeAttributes.title)
    .getBodyText(function(text) {
      text = text.replace(/^ +| +$/gm, '');

      if (text.indexOf(self.newRecipeAttributes.title) == -1)
        throw new Error("Recipe title not found (" + self.newRecipeAttributes.title + ").");

      if (text.indexOf(self.newRecipeAttributes.ingredients) == -1)
        throw new Error("Recipe ingredients not found (" + self.newRecipeAttributes.ingredients + ").");

      if (text.indexOf(self.newRecipeAttributes.instructions) == -1)
        throw new Error("Recipe instructions not found (" + self.newRecipeAttributes.instructions + ").");

    })
    .end(function(err) {
      if (err)
        callback.fail(err);
      else
        callback();
    });
};

SeleniumWorld.prototype.cleanUp = function (callback) {
  var Recipe = require('../../app/models/recipe');
  Recipe.collection.drop(callback);
};

exports.World = SeleniumWorld;