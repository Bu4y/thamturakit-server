'use strict';

/**
 * Module dependencies
 */
var shopsPolicy = require('../policies/shops.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  shops = require('../controllers/shops.server.controller');

module.exports = function (app) {
  // Shops Routes
  app.route('/api/shops') //.all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .get(shops.cookingListShop, shops.list);

  app.route('/api/shops').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .post(shops.create);

  app.route('/api/shops/:shopId')//.all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .get(shops.read);

  app.route('/api/shops/:shopId').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .put(shops.update)
    .delete(shops.delete);

  app.route('/api/shops/review/:shopId')//.all(shopsPolicy.isAllowed)
    .put(shops.updateReview);

  app.route('/api/shopbyuser').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .get(shops.shopByUser);

  // Finish by binding the Shop middleware
  app.param('shopId', shops.shopByID);
};
