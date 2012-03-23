var assert   = require('assert');
var mongoose = require('mongoose');
var Recipe   = require('../../app/models/recipe');

var PersistenceWorld = function PersistenceWorld(callback) {
  var self = this;
  this.cleanUp(callback);
};

PersistenceWorld.prototype.addNewRecipe = function (callback) {
  this.newRecipeAttributes = {
    title: "Cucumber au gratin",
    ingredients: "2 cucumbers\n1 1/2 cups grated Gruyere cheese\nsalt & black pepper\n3-4 Tbs butter",
    instructions: "Peel the cucumbers & cut them into 3 inch pieces. Slice each piece in half lengthwise & remove the seeds. Cook the cucumber in boiling salted water for 10 minutes, the drain & dry. Arrange a layer of cucumber in the base of a buttered ovenproof dish. Sprinkle with a third of the cheese, & season with salt & pepper. Repeat these layers, finishing with cheese. Dot the top with butter. Bake the cucumber gratin in the center of a preheated oven at 400 for 30 minutes."
  };
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

exports.World = PersistenceWorld;
