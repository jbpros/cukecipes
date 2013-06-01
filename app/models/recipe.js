var mongoose   = require('mongoose');

var mongoDbUri = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/cukecipes-' + (process.env.NODE_ENV || "development");
mongoose.connect(mongoDbUri);

var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RecipeSchema = new Schema({
  title: String,
  ingredients: String,
  instructions: String
});

var Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
