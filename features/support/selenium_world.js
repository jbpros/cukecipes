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
        selenium.kill();
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

  self.prepareNewRecipeAttributes();
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
  Recipe.collection.drop(function (err) {
    callback();
  });
};

SeleniumWorld.prototype.prepareNewRecipeAttributes = function () {
  this.newRecipeAttributes = {
    title: "Curried cucumber",
    ingredients: "1 cucumber\n\
1/4 pint heavy cream\n\
1 tsp curry powder",
    instructions: "Peel and cut cucumber into 1/2 inch cubes (Seeds scraped out).\n\
Blanch in salted boiling water for 5 minutes, drain, put them into small saucepan with the cream in which the curry has been mixed.\n\
Add salt to taste.\n\
Let simmer 10 minutes and serve."
  };
};

exports.World = SeleniumWorld;
