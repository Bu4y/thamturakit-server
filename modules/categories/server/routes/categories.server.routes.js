'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  categories = require('../controllers/categories.server.controller');

module.exports = function (app) {
  // Categories Routes
  app.route('/api/categories').all(core.requiresLoginToken, categoriesPolicy.isAllowed)
    .get(categories.list)
    .post(categories.create);

  app.route('/api/categories/:categoryId').all(core.requiresLoginToken, categoriesPolicy.isAllowed)
    .get(categories.read)
    .put(categories.update)
    .delete(categories.delete);

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
