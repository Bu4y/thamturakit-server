'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Payment
 */
exports.create = function(req, res) {
  var payment = new Payment(req.body);
  payment.user = req.user;

  payment.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(payment);
    }
  });
};

/**
 * Show the current Payment
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var payment = req.payment ? req.payment.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  payment.isCurrentUserOwner = req.user && payment.user && payment.user._id.toString() === req.user._id.toString();

  res.jsonp(payment);
};

/**
 * Update a Payment
 */
exports.update = function(req, res) {
  var payment = req.payment;

  payment = _.extend(payment, req.body);

  payment.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(payment);
    }
  });
};

/**
 * Delete an Payment
 */
exports.delete = function(req, res) {
  var payment = req.payment;

  payment.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(payment);
    }
  });
};

/**
 * List of Payments
 */
exports.list = function(req, res) {
  Payment.find().sort('-created').populate('user', 'displayName').exec(function(err, payments) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(payments);
    }
  });
};

/**
 * Payment middleware
 */
exports.paymentByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Payment is invalid'
    });
  }

  Payment.findById(id).populate('user', 'displayName').exec(function (err, payment) {
    if (err) {
      return next(err);
    } else if (!payment) {
      return res.status(404).send({
        message: 'No Payment with that identifier has been found'
      });
    }
    req.payment = payment;
    next();
  });
};
