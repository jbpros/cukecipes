var mongoose   = require('mongoose');
var mongoDbUri = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/cukecipes';
mongoose.connect(mongoDbUri);

var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RecipeSchema = new Schema({
  title: String,
  ingredients: String,
  instructions: String
});

var Recipe = mongoose.model('Recipe', RecipeSchema);
Recipe.isolations = {'recipes': Recipe};

Recipe.isolateInCollection = function isolateInCollection(collectionName) {
  if (Recipe.isolations[collectionName]) {
    return Recipe.isolations[collectionName];
  } else {
    var IsolatedRecipe = mongoose.model(collectionName, RecipeSchema, collectionName);
    IsolatedRecipe.isolateInCollection = Recipe.isolateInCollection;
    Recipe.isolations[collectionName] = IsolatedRecipe;
    return IsolatedRecipe;
  }
};

module.exports = Recipe;
