var ZombieWorld = function ZombieWorld(callback) {
  var LOG_FILE = __dirname + '/../../log/cucumber.zombie.log';

  var fs      = require('fs');
  var App     = require('../../app.js');
  var Browser = require("zombie");

  var self = this;

  var init = function() {
    var logFile  = fs.createWriteStream(LOG_FILE, {flags: 'a'});
    self.app     = new App({port: 21013, logStream: logFile});
    self.app.start();
    self.browser = new Browser({ site: self.app.baseUrl });
    callback();
  };

  self.cleanUp(init);
};

ZombieWorld.prototype.addNewRecipe = function (callback) {
  var self = this;

  self.prepareNewRecipeAttributes();
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


      if (stripString(self.browser.text('body')).indexOf(stripString(self.newRecipeAttributes.ingredients)) == -1) {
        callback.fail("Recipe ingredients not found (" + self.newRecipeAttributes.ingredients + ").");
      }

      if (stripString(self.browser.text('body')).indexOf(stripString(self.newRecipeAttributes.instructions)) == -1)
        callback.fail("Recipe instructions not found (" + self.newRecipeAttributes.instructions + ").");

      else
        callback();
    });
  });
};

ZombieWorld.prototype.cleanUp = function (callback) {
  var Recipe = require('../../app/models/recipe');
  Recipe.collection.drop(function (err) {
    callback();
  });
};

ZombieWorld.prototype.prepareNewRecipeAttributes = function () {
  this.newRecipeAttributes = {
    title: "Stuffed cucumbers",
    ingredients: "2 cucumbers\n\
1/2 lb ground beef or Italian sausage\n\
1/2 cup bread crumbs\n\
1 or 2 cloves garlic, crushed\n\
1 egg\n\
1 can or jar of your favorite spaghetti sauce\n\
4 slices of Provolone or Swiss cheese (or use enough crumbled blue cheese to cover)",
    instructions: "Peel cucumbers and cut in half, lengthwise.\n\
Scrape away seeds with a spoon.\n\
Mix meat, bread crumbs, garlic and egg.\n\
Fill cucumber \"boats\" with this mixture.\n\
Place in microwave dish and pour tomato sauce over the stuffed cucumbers.\n\
Cover each with a slice of cheese (select cheese according to desired degree of tangyness. If sauce already contains Parmesan cheese you may wish to omit the cheese.)\n\
\n\
Cover dish, and microwave on 80% power for five minutes.\n\
Turn dish 1/2 turnand repeat.\n\
Test cucumbers with a fork for doneness.\n\
If they appear too hard, cook another 5 minutes on 80%."
  };
};

function stripString(string) {
  return string.replace(/[\s\n]+/gm, ' ');
}

exports.World = ZombieWorld;
