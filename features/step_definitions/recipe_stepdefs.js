module.exports = function() {
  var recipe;

  this.World = require('../support/persistence_world').World;

  this.When(/^I add a recipe$/, function(callback) {
    this.addNewRecipe(callback);
  });

  this.Then(/^I see the recipe in the diary$/, function(callback) {
    this.assertNewRecipeIsListed(callback);
  });
};
