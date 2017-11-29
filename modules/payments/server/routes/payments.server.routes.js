'use strict';

/**
 * Module dependencies
 */
var paymentsPolicy = require('../policies/payments.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  payments = require('../controllers/payments.server.controller');

module.exports = function (app) {
  // Payments Routes
  app.route('/api/payments').all(core.requiresLoginToken, paymentsPolicy.isAllowed)
    .get(payments.list)
    .post(payments.create);

  app.route('/api/payments/:paymentId').all(core.requiresLoginToken, paymentsPolicy.isAllowed)
    .get(payments.read)
    .put(payments.update)
    .delete(payments.delete);

  // Finish by binding the Payment middleware
  app.param('paymentId', payments.paymentByID);
};
