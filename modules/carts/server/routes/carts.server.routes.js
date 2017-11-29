'use strict';

/**
 * Module dependencies
 */
var core = require('../../../core/server/controllers/core.server.controller'),
  cartsPolicy = require('../policies/carts.server.policy'),
  carts = require('../controllers/carts.server.controller');

module.exports = function (app) {
  // Carts Routes
  app.route('/api/carts').all(core.requiresLoginToken, cartsPolicy.isAllowed)
    .get(carts.list)
    .post(carts.create);

  app.route('/api/carts/:cartId').all(core.requiresLoginToken, cartsPolicy.isAllowed)
    .get(carts.read)
    .put(carts.update)
    .delete(carts.delete);

  app.route('/api/cartbyuser/:userId').all(core.requiresLoginToken, cartsPolicy.isAllowed)
    .get(carts.readByUserID);

  // Finish by binding the Cart middleware
  app.param('cartId', carts.cartByID);
  app.param('userId', carts.cartByUserID);
};
