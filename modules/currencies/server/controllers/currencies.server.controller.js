'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Currency = mongoose.model('Currency'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Currency
 */
exports.create = function(req, res) {
  var currency = new Currency(req.body);
  currency.user = req.user;

  currency.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(currency);
    }
  });
};

/**
 * Show the current Currency
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var currency = req.currency ? req.currency.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  currency.isCurrentUserOwner = req.user && currency.user && currency.user._id.toString() === req.user._id.toString();

  res.jsonp(currency);
};

/**
 * Update a Currency
 */
exports.update = function(req, res) {
  var currency = req.currency;

  currency = _.extend(currency, req.body);

  currency.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(currency);
    }
  });
};

/**
 * Delete an Currency
 */
exports.delete = function(req, res) {
  var currency = req.currency;

  currency.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(currency);
    }
  });
};

/**
 * List of Currencies
 */
exports.list = function(req, res) {
  Currency.find().sort('-created').populate('user', 'displayName').exec(function(err, currencies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(currencies);
    }
  });
};

/**
 * Currency middleware
 */
exports.currencyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Currency is invalid'
    });
  }

  Currency.findById(id).populate('user', 'displayName').exec(function (err, currency) {
    if (err) {
      return next(err);
    } else if (!currency) {
      return res.status(404).send({
        message: 'No Currency with that identifier has been found'
      });
    }
    req.currency = currency;
    next();
  });
};
