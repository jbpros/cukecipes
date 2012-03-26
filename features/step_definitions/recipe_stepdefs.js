var recipeStepDefs = function() {
  this.When(/^I add a recipe$/, function(callback) {
    this.addNewRecipe(callback);
  });

  this.Then(/^I see the recipe in the diary$/, function(callback) {
    this.assertNewRecipeIsInDiary(callback);
  });
};

// Node.js:
if (typeof(module) !== 'undefined')
  module.exports = recipeStepDefs;

// Browser:
if (typeof(window) !== 'undefined')
  window.stepDefs = recipeStepDefs;
