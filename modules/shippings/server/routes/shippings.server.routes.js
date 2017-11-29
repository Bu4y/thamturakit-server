'use strict';

/**
 * Module dependencies
 */
var shippingsPolicy = require('../policies/shippings.server.policy'),
core = require('../../../core/server/controllers/core.server.controller'),
  shippings = require('../controllers/shippings.server.controller');

module.exports = function(app) {
  // Shippings Routes
  app.route('/api/shippings').all(core.requiresLoginToken,shippingsPolicy.isAllowed)
    .get(shippings.list)
    .post(shippings.create);

  app.route('/api/shippings/:shippingId').all(core.requiresLoginToken,shippingsPolicy.isAllowed)
    .get(shippings.read)
    .put(shippings.update)
    .delete(shippings.delete);

  // Finish by binding the Shipping middleware
  app.param('shippingId', shippings.shippingByID);
};
