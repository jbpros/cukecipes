window.supportCode = function () {
  var SAFETY_WAIT_TIMEOUT = 20;

  // --- WORLD ---

  var World = function World(callback) {
    this.browser = new FrameBrowser('#cucumber-browser');
    this.runInSequence(
      this.cleanUp,
      callback
    );
  };
  this.World = World;

  // DSL

  World.prototype.addNewRecipe = function (callback) {
    var self = this;

    self.prepareNewRecipeAttributes();
    var visitRoot               = self.browser.visitUrl("/");
    var clickAddRecipeLink      = self.browser.clickLink("Add recipe");
    var fillInTitle             = self.browser.fillIn("#recipe_title", self.newRecipeAttributes.title);
    var fillInIngredients       = self.browser.fillIn("#recipe_ingredients", self.newRecipeAttributes.ingredients);
    var fillInInstructions      = self.browser.fillIn("#recipe_instructions", self.newRecipeAttributes.instructions);
    var clickCreateRecipeButton = self.browser.clickButton("button[type='submit'][name='save']");
    var waitForPageToLoad       = self.browser.waitForPageToLoad();
    self.runInSequence(
      visitRoot,
      clickAddRecipeLink,
      fillInTitle,
      fillInIngredients,
      fillInInstructions,
      clickCreateRecipeButton,
      waitForPageToLoad,
      callback
    );
  };

  World.prototype.assertNewRecipeIsInDiary = function (callback) {
    var self = this;

    var visitRoot                         = self.browser.visitUrl("/");
    var clickRecipeLink                   = self.browser.clickLink(self.newRecipeAttributes.title);
    var waitForPageToLoad                 = self.browser.waitForPageToLoad();
    var assertDisplayedRecipeTitle        = self.browser.assertBodyText(self.newRecipeAttributes.title);
    var assertDisplayedRecipeIngredients  = self.browser.assertBodyText(self.newRecipeAttributes.ingredients);
    var assertDisplayedRecipeInstructions = self.browser.assertBodyText(self.newRecipeAttributes.instructions);
    self.runInSequence(
      visitRoot,
      clickRecipeLink,
      waitForPageToLoad,
      assertDisplayedRecipeTitle,
      assertDisplayedRecipeIngredients,
      assertDisplayedRecipeInstructions,
      callback
    );
  };

  // helpers

  World.prototype.cleanUp = function (callback) {
    var resetAllRemotely = RemoteCommand("reset_all");
    var visitRoot        = this.browser.visitUrl("about:blank");
    this.runInSequence(
      resetAllRemotely,
      visitRoot,
      callback
    );
  };

  World.prototype.prepareNewRecipeAttributes = function () {
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
  };

  World.prototype.runInSequence = function () {
    var self      = this;
    var funcCalls = Array.prototype.slice.apply(arguments);
    var funcCall  = funcCalls.shift();
    if (funcCalls.length > 0) {
      var subCallback = function () { self.runInSequence.apply(self, funcCalls) };
      funcCall.call(self, subCallback);
    } else {
      funcCall.call(self);
    }
  };

  // Remote calls

  var getRemoteUrlForFunction = function (funcName) {
    return "/cukes/" + funcName;
  };

  var RemoteQuery = function RemoteQuery(funcName, data) {
    var self = this;

    return function (callback) {
      var url = getRemoteUrlForFunction(funcName);
      $.getJSON(url, data, function (results, textStatus, jqXHR) {
        callback(results);
      });
    };
  };

  var RemoteCommand = function RemoteCommand(funcName, data) {
    var self = this;

    return function (callback) {
      var url = getRemoteUrlForFunction(funcName);
      $.post(url, data, function (results, textStatus, jqXHR) {
        callback();
      });
    };
  };

  // Frame browser

  var FrameBrowser = function FrameBrowser(frameSelector) {
    var WAIT_FOR_TIMEOUT = 5000;
    var WAIT_FOR_DELAY   = 20;
    var $frame           = jQuery(frameSelector);
    window.f = $frame;

    function waitFor(subject, test, callback, errCallback) {
      var start = new Date().getTime();

      function check() {
        var now     = new Date().getTime();
        var elapsed = now - start;
        if (test()) {
          callback();
        } else if (elapsed > WAIT_FOR_TIMEOUT) {
          var error = new Error("Timed out waiting for " + subject);
          if (errCallback)
            errCallback(error);
          else
            throw error;
        } else {
          setTimeout(function () { check(callback); }, WAIT_FOR_DELAY);
        }
      };
      check(test, callback);
    };

    function _visitUrl(url) {
      $frame.get()[0].contentWindow.stop(); // stop possible current loads
      if ($frame.attr('src') == url) {
        $frame.get()[0].contentWindow.location.reload();
      } else {
        $frame.attr('src', url);
      }
    };

    var self = {
      visitUrl: function (url) {
        return function visitUrl(callback) {
          _visitUrl(url);
          var state = $frame.get()[0].contentDocument.readyState;
          callback();
        };
      },

      fillIn: function (selector, value) {
        return function fillIn(callback) {
          self.waitForSelector(selector, function () {
            self.find(selector).val(value);
            callback();
          });
        };
      },

      clickLink: function (link) {
        return function clickLink(callback) {
          var selector = "a:contains('" + link.replace("'", "\\'") + "'):first";
          self.waitForSelector(selector, function () {
            var $a = self.find(selector);
            var href = $a.attr('href');
            $a.click();
            if (href)
              _visitUrl(href);
            callback();
          });
        };
      },

      clickButton: function (selector) {
        return function clickButton(callback) {
          self.waitForSelector(selector, function () {
            self.find(selector).click();
            callback();
          });
        };
      },

      waitForPageToLoad: function () {
        return function waitForPageToLoad(callback) {
          setTimeout(function () {
            waitFor(
              "page to load",
              function () {
                var state = $frame.get()[0].contentDocument.readyState;
                var isPageLoaded = state == 'complete';
                return isPageLoaded;
              },
              callback
            );
          }, SAFETY_WAIT_TIMEOUT); // TODO: remove this ugly hack
        };
      },

      assertBodyText: function (text) {
        return function assertBodyText(callback) {
          waitFor(
            "body text to contain " + text,
            function () {
              var bodyText      = $($frame.get()[0].contentDocument.body).text().replace(/\n\n/g, '\n');
              var isTextPresent = bodyText.indexOf(text) !== -1;
              return isTextPresent;
            },
            callback
          );
        };
      },

      // internals

      waitForSelector: function (selector, callback) {
        waitFor(
          "selector \"" + selector + "\"",
          function () {
            var elements = self.find(selector);
            var found    = elements.length > 0;
            return found;
          },
          callback
        );
      },

      find: function (selector) {
        var $elements = $frame.contents().find(selector);
        return $elements;
      }
    };
    return self;
  };
};
