var assert   = require('assert');
var mongoose = require('mongoose');
var Recipe   = require('../../app/models/recipe');

var PersistenceWorld = function PersistenceWorld(callback) {
  var self = this;
  this.cleanUp(callback);
};

PersistenceWorld.prototype.addNewRecipe = function (callback) {
  this.prepareNewRecipeAttributes();
  var recipe = new Recipe(this.newRecipeAttributes);
  recipe.save(callback);
};

PersistenceWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
  var recipes = Recipe.
    where('title', this.newRecipeAttributes.title).
    where('ingredients', this.newRecipeAttributes.ingredients).
    where('instructions', this.newRecipeAttributes.instructions);

  recipes.count(function (err, count) {
    if (count == 1)
      callback();
    else
      callback.fail("Expected the recipe to be in diary once, got it " + count + " times.");
  });
};

PersistenceWorld.prototype.cleanUp = function (callback) {
  Recipe.collection.drop(callback);
};

PersistenceWorld.prototype.prepareNewRecipeAttributes = function () {
  this.newRecipeAttributes = {
    title: "Cucumber mousse",
    ingredients: "1 T plain gelatin\n\
3 T cold water\n\
2 T vinegar, or lemon or lime juice\n\
1 t grated onion\n\
3/4 t salt\n\
1/4 t paprika\n\
1 cup cucumber, pared, seeded, and chopped\n\
1/2 whipping cream",
    instructions: "Soak gelatin in water.\n\
Dissolve in a saucepan over heat.\n\
Add vinegar or juice, onion, salt, and paprika.\n\
Chill this mixture until almost set.\n\
\n\
Drain cucumbers well.\n\
Whip cream until stiff.\n\
Beat the gelatin mixture gradually into the cream.\n\
Fold in cucumbers.\n\
Fill a wet mold with mixture and chill thoroughly.\n\
When set, invert onto a platter and garnish."
  };
};

exports.World = PersistenceWorld;
