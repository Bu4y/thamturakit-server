'use strict';

/**
 * Module dependencies
 */
var core = require('../../../core/server/controllers/core.server.controller'),
  addressesPolicy = require('../policies/addresses.server.policy'),
  addresses = require('../controllers/addresses.server.controller');

module.exports = function (app) {
  // Addresses Routes
  app.route('/api/addresses').all(core.requiresLoginToken, addressesPolicy.isAllowed)
    .get(addresses.list)
    .post(addresses.findLocation, addresses.create);

  app.route('/api/addresses/:addressId').all(core.requiresLoginToken, addressesPolicy.isAllowed)
    .get(addresses.read)
    .put(addresses.update)
    .delete(addresses.delete);

  app.route('/api/addressbyuser').all(core.requiresLoginToken, addressesPolicy.isAllowed)
    .get(addresses.addressByUser);

  // Finish by binding the Address middleware
  app.param('addressId', addresses.addressByID);
};
