module.exports = function() {
  var recipe;

  var worldType = process.env.WORLD_TYPE || 'persistence';
  this.World = require('../support/' + worldType + '_world').World;

  this.When(/^I add a recipe$/, function(callback) {
    this.addNewRecipe(callback);
  });

  this.Then(/^I see the recipe in the diary$/, function(callback) {
    this.assertNewRecipeIsInDiary(callback);
  });
};
