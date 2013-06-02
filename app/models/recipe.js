var mongoose   = require('mongoose');

var mongoDbUri = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/cukecipes-' + (process.env.NODE_ENV || "development");
mongoose.connect(mongoDbUri);

var Schema   = mongoose.Schema;

var RecipeSchema = new Schema({
  title: String,
  ingredients: String,
  instructions: String,
  ratings: { type: Schema.Types.Mixed, default: {} }
});

RecipeSchema.methods.rate = function rate(rating, callback) {
  this.ratings[rating] = 1;
  this.markModified("ratings");
  this.save(callback);
};

var Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
