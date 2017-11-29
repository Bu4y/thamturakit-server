'use strict';

/**
 * Module dependencies
 */
var currenciesPolicy = require('../policies/currencies.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  currencies = require('../controllers/currencies.server.controller');

module.exports = function (app) {
  // Currencies Routes
  app.route('/api/currencies').all(currenciesPolicy.isAllowed)
    .get(currencies.list);

  app.route('/api/currencies').all(core.requiresLoginToken, currenciesPolicy.isAllowed)
    .post(currencies.create);

  app.route('/api/currencies/:currencyId').all(currenciesPolicy.isAllowed)
    .get(currencies.read);

  app.route('/api/currencies/:currencyId').all(core.requiresLoginToken, currenciesPolicy.isAllowed)
    .put(currencies.update)
    .delete(currencies.delete);

  // Finish by binding the Currency middleware
  app.param('currencyId', currencies.currencyByID);
};
