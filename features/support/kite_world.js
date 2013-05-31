var http    = require("http");
var url     = require("url");
var async   = require("async");
var Kite    = require("kite");

var KiteWorld = function KiteWorld(options, callback) {
  if (!callback) {
    callback = options;
    options  = {};
  }
  var self     = this;
  var driver   = options.driver;
  self.options = options;
  self.baseRef = options.baseRef || "http://localhost";

  this.browser = new Kite.Browser(driver);
  this.cleanUp(function (err) {
    if (err)
      throw err;
    callback(self);
  });
};

KiteWorld.prototype.addNewRecipe = function (callback) {
  var self    = this;
  var browser = self.browser;
  var attributes = self.prepareNewRecipeAttributes();

  async.waterfall([
    function (next) { browser.visitUri(self._getUriToPath("/"), next); },
    function (next) { browser.click("Add recipe", next); },
    function (next) { browser.fill("#recipe_title", attributes.title, next); },
    function (next) { browser.fill("#recipe_ingredients", attributes.ingredients, next); },
    function (next) { browser.fill("#recipe_instructions", attributes.instructions, next); },
    function (next) { browser.click("button[type='submit'][name='save']", next); },
    function (next) { setTimeout(next, 100); } // todo: waitForPageToLoad
  ], callback);
};

KiteWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
  var self    = this;
  var browser = self.browser;
  var attributes = self.prepareNewRecipeAttributes();

  async.waterfall([
    function (next) { browser.visitUri(self._getUriToPath("/"), next); },
    function (next) { browser.click(self.newRecipeAttributes.title, next); },
    function (next) { setTimeout(next, 100); }, // todo: waitForPageToLoad
    function (next) { self.assertTextOnPage("recipe title", self.newRecipeAttributes.title, next); },
    function (next) { self.assertTextOnPage("recipe ingredients", self.newRecipeAttributes.ingredients, next); },
    function (next) { self.assertTextOnPage("recipe instructions", self.newRecipeAttributes.instructions, next); },
  ], callback);
};

// helpers

KiteWorld.prototype.cleanUp = function (callback) {
  var self    = this;
  var browser = self.browser;
  async.waterfall([
    function (next) { self._command("reset_all", null, next); },
    function (next) { browser.visitUri("about:blank", next); }
  ], callback);
};

KiteWorld.prototype.prepareNewRecipeAttributes = function () {
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

KiteWorld.prototype.assertTextOnPage = function (description, text, callback) {
  this.browser.getText(function (err, pageText) {
    if (err)
      throw err;
    var expected = normalizeString(text);
    var actual   = normalizeString(pageText);
    if (actual.indexOf(expected) == -1)
      callback(new Error("Couldn't find " + description + " in\n\"" + pageText + "\""));
    else
      callback(null);
  });
};

KiteWorld.prototype._getUriToPath = function _getUriToPath(path) {
  return url.resolve(this.baseRef, path);
};

KiteWorld.prototype._getRemoteUriForFunction = function getRemoteUriForFunction(funcName) {
  // todo: unforge path
  return this._getUriToPath("/cukestall/" + funcName);
};

KiteWorld.prototype._command = function _command(funcName, data, callback) {
  var uri = this._getRemoteUriForFunction(funcName);
  if (typeof(data) == "object")
    data = JSON.stringify(data);

  if (typeof window != "undefined") {
    $.post(uri, data, function (results, textStatus, jqXHR) {
      // todo: handle errors
      callback(null);
    });
  } else {
    var uri = url.parse(uri);
    var options = {
      host: uri.hostname,
      port: uri.port || 80,
      path: uri.path,
      method: "POST"
    };
    var req = http.request(options, function (res) {
      res.on('end', function () {
        if (res.statusCode >= 200 && res.statusCode < 400)
          callback(null);
        else
          callback(new Error("Remote command failed: " + res.statusCode + " " + http.STATUS_CODES[res.statusCode]));
      });
    });
    req.on('error', function (err) {
      callback(err);
    });

    req.end(data);
  }
}

function normalizeString(string) {
  return string.replace(/[\s\n]+/gm, ' ');
}

exports.World = KiteWorld;
