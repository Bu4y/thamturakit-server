'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shipping = mongoose.model('Shipping'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shipping
 */
exports.create = function(req, res) {
  var shipping = new Shipping(req.body);
  shipping.user = req.user;

  shipping.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shipping);
    }
  });
};

/**
 * Show the current Shipping
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var shipping = req.shipping ? req.shipping.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shipping.isCurrentUserOwner = req.user && shipping.user && shipping.user._id.toString() === req.user._id.toString();

  res.jsonp(shipping);
};

/**
 * Update a Shipping
 */
exports.update = function(req, res) {
  var shipping = req.shipping;

  shipping = _.extend(shipping, req.body);

  shipping.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shipping);
    }
  });
};

/**
 * Delete an Shipping
 */
exports.delete = function(req, res) {
  var shipping = req.shipping;

  shipping.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shipping);
    }
  });
};

/**
 * List of Shippings
 */
exports.list = function(req, res) {
  Shipping.find().sort('-created').populate('user', 'displayName').exec(function(err, shippings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shippings);
    }
  });
};

/**
 * Shipping middleware
 */
exports.shippingByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shipping is invalid'
    });
  }

  Shipping.findById(id).populate('user', 'displayName').exec(function (err, shipping) {
    if (err) {
      return next(err);
    } else if (!shipping) {
      return res.status(404).send({
        message: 'No Shipping with that identifier has been found'
      });
    }
    req.shipping = shipping;
    next();
  });
};
