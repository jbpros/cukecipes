var recipeStepDefs = function() {
  this.After(function (callback) {
    if (this.tearDown) {
      this.tearDown(callback);
    } else {
      callback();
    }
  });

  this.When(/^I add a recipe$/, function(callback) {
    this.addNewRecipe(handleStepResult(callback));
  });

  this.Then(/^I see the recipe in the diary$/, function(callback) {
    this.assertNewRecipeIsInDiary(handleStepResult(callback));
  });
};

function handleStepResult(callback) {
  return function (err) {
    if (err)
      callback.fail(err);
    else
      callback();
  };
}

// Node.js:
if (typeof(module) !== 'undefined')
  module.exports = recipeStepDefs;
