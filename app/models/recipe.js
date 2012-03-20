var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cukecipes');

var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RecipeSchema = new Schema({
  title: String,
  ingredients: String,
  instructions: String
});

var Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
