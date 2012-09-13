var async = require("async");

var CukeStallSupport = function CukeStallSupport() {
  if (typeof window == 'undefined')
    return; // do not run outside of browsers

  // --- WORLD ---

  var CukeStallWorld = function CukeStallWorld(callback) {
    var driver = new window.Kite.Driver.Cukestall();
    this.browser = new Kite.Browser(driver);
    this.cleanUp(callback);
  };

  this.World = CukeStallWorld;

  // DSL

  CukeStallWorld.prototype.addNewRecipe = function (callback) {
    var self    = this;
    var browser = self.browser;
    var attributes = self.prepareNewRecipeAttributes();

    async.waterfall([
      function (next) { browser.visitUri("/", next); },
      function (next) { browser.click("Add recipe", next); },
      function (next) { browser.fill("#recipe_title", attributes.title, next); },
      function (next) { browser.fill("#recipe_ingredients", attributes.ingredients, next); },
      function (next) { browser.fill("#recipe_instructions", attributes.instructions, next); },
      function (next) { browser.click("button[type='submit'][name='save']", next); },
      function (next) { setTimeout(next, 100); } // todo: waitForPageToLoad
    ], callback);
  };

  CukeStallWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
    var self    = this;
    var browser = self.browser;
    var attributes = self.prepareNewRecipeAttributes();

    async.waterfall([
      function (next) { browser.visitUri("/", next); },
      function (next) { browser.click(self.newRecipeAttributes.title, next); },
      function (next) { setTimeout(next, 100); }, // todo: waitForPageToLoad
      function (next) { self.assertTextOnPage("recipe title", self.newRecipeAttributes.title, next); },
      function (next) { self.assertTextOnPage("recipe ingredients", self.newRecipeAttributes.ingredients, next); },
      function (next) { self.assertTextOnPage("recipe instructions", self.newRecipeAttributes.instructions, next); },
    ], callback);
  };

  // helpers

  CukeStallWorld.prototype.cleanUp = function (callback) {
    var browser = this.browser;
    async.waterfall([
      function (next) { command("reset_all", null, next); },
      function (next) { browser.visitUri("about:blank", next); }
    ], callback);
  };

  CukeStallWorld.prototype.prepareNewRecipeAttributes = function () {
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
    return this.newRecipeAttributes;
  };

  CukeStallWorld.prototype.assertTextOnPage = function (description, text, callback) {
    this.browser.getText(function (pageText) {
      var expected = normalizeString(text);
      var actual   = normalizeString(pageText);
      if (actual.indexOf(expected) == -1)
        callback(new Error("Couldn't find " + description + " in\n\"" + pageText + "\""));
      else
        callback(null);
    });
  }

  function getRemoteUrlForFunction(funcName) {
    // todo: unforge path
    return "/cukestall/" + funcName;
  };

  function command(funcName, data, callback) {
    var url = getRemoteUrlForFunction(funcName);
    $.post(url, data, function (results, textStatus, jqXHR) {
      // todo: handle errors
      callback(null);
    });
  };

  function normalizeString(string) {
    return string.replace(/[\s\n]+/gm, ' ');
  }
};

module.exports = CukeStallSupport;
