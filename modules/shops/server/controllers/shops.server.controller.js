'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shop
 */
exports.create = function (req, res) {
  var shop = new Shop(req.body);
  shop.user = req.user;

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * Show the current Shop
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shop = req.shop ? req.shop.toJSON() : {};
  var data = {
    _id: shop._id,
    name: shop.name,
    email: shop.email,
    tel: shop.tel,
    map: shop.map,
    image: shop.image,
    detail: shop.detail,
    reviews: shop.reviews,
    rate: shop.rate || 5
  };
  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // shop.isCurrentUserOwner = req.user && shop.user && shop.user._id.toString() === req.user._id.toString();

  res.jsonp(data);
};

/**
 * Update a Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;

  shop = _.extend(shop, req.body);

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * Delete an Shop
 */
exports.delete = function (req, res) {
  var shop = req.shop;

  shop.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * List of Shops
 */

exports.cookingListShop = function (req, res, next) {
  Shop.find({}, 'name image _id').sort('-created').populate('user', 'displayName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var dataShops = [];
      shops.forEach(function (shop) {
        dataShops.push({
          _id: shop._id,
          name: shop.name,
          image: shop.image,
          rate: shop.rate || 5
        });
      });
      req.shops = dataShops;
      next();
    }
  });
};

exports.list = function (req, res) {
  res.jsonp({
    items: req.shops
  });
};

/**
 * Shop middleware
 */
exports.shopByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shop is invalid'
    });
  }

  Shop.findById(id).populate('user', 'displayName').exec(function (err, shop) {
    if (err) {
      return next(err);
    } else if (!shop) {
      return res.status(404).send({
        message: 'No Shop with that identifier has been found'
      });
    }
    req.shop = shop;
    next();
  });
};
exports.updateReview = function (req, res) {
  if (req.user && req.user !== undefined) {
    req.body = req.body ? req.body : {};
    req.body.user = req.user;
  }

  req.shop.reviews.push(req.body);

  req.shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(req.shop);
    }
  });
};

exports.shopByUser = function (req, res) {
  Shop.find({ user: { _id: req.user._id } }, 'name image _id').sort('-created').populate('user', 'displayName').exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shops);
    }
  });
};
