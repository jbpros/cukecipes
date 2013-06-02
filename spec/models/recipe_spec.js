require("../env");
var Recipe = require("../../app/models/recipe");

describe(Recipe, function () {
  describe("#rate", function () {
    var recipe, rating, callback;

    beforeEach(function () {
      recipe = new Recipe();
      rating = "some rating";
      callback = jasmine.createSpy("callback");
      spyOn(recipe, "save");
    });

    it("sets the rating", function () {
      recipe.rate(rating, callback);
      expect(recipe.ratings[rating]).toEqual(1);
    });

    it("saves itself", function () {
      recipe.rate(rating, callback);
      expect(recipe.save).toHaveBeenCalledWith(callback);
    });
  });
});
