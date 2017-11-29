'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Address = mongoose.model('Address'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Address
 */
exports.findLocation = function (req, res, next) {
  var geocoder = require('simple-geocoder');
  var address = req.body.address + ' ' + req.body.subdistrict + ' ' + req.body.district + ' ' + req.body.province + ' ' + req.body.postcode;
  var data = new Address(req.body);
  data.location = data.location ? data.location : {};
  geocoder.geocode(address, function (success, locations) {
    if (success) {
      data.location.lat = locations.y;
      data.location.lng = locations.x;
      req.address = data;
      next();
    }
  });
};

exports.create = function (req, res) {
  var address = new Address(req.address);
  address.user = req.user;

  address.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(address);
    }
  });
};

/**
 * Show the current Address
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var address = req.address ? req.address.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  address.isCurrentUserOwner = req.user && address.user && address.user._id.toString() === req.user._id.toString();

  res.jsonp(address);
};

/**
 * Update a Address
 */
exports.update = function (req, res) {
  var address = req.address;

  address = _.extend(address, req.body);

  address.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(address);
    }
  });
};

/**
 * Delete an Address
 */
exports.delete = function (req, res) {
  var address = req.address;

  address.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(address);
    }
  });
};

/**
 * List of Addresses
 */
exports.list = function (req, res) {
  Address.find().sort('-created').populate('user', 'displayName').exec(function (err, addresses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(addresses);
    }
  });
};

/**
 * Address middleware
 */
exports.addressByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Address is invalid'
    });
  }

  Address.findById(id).populate('user', 'displayName').exec(function (err, address) {
    if (err) {
      return next(err);
    } else if (!address) {
      return res.status(404).send({
        message: 'No Address with that identifier has been found'
      });
    }
    req.address = address;
    next();
  });
};

exports.addressByUser = function (req, res) {
  Address.find({ user: { _id: req.user._id } }).sort('-created').populate('user', 'displayName').exec(function (err, addresses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({ address: addresses });
    }
  });
};
