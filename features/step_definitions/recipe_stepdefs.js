var recipeStepDefs = function() {
  this.After(function (callback) {
    if (this.tearDown) {
      this.tearDown(callback);
    } else {
      callback();
    }
  });

  this.Given(/^a recipe I tried$/, function(callback) {
    var world = this;
    world.prepareARecipe(callback);
  });

  this.When(/^I add a recipe$/, function(callback) {
    this.addNewRecipe(callback);
  });

  this.When(/^I rate it as "([^"]*)"$/, function(rating, callback) {
    this.rateRecipe(rating, callback);
  });

  this.Then(/^I see the recipe in the diary$/, function(callback) {
    this.assertNewRecipeIsInDiary(callback);
  });

  this.Then(/^my rating is displayed on the recipe$/, function(callback) {
    this.assertRecipeHasRating(callback);
  });
};

// Node.js:
if (typeof(module) !== 'undefined')
  module.exports = recipeStepDefs;
