module.exports = function () {
  var worldType = process.env.WORLD_TYPE || 'persistence';
  this.World = require('../support/' + worldType + '_world').World;
};
