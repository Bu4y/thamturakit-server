'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Product
 */
exports.create = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Show the current Product
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var productDB = req.product ? req.product.toJSON() : {};

  // var shippings = [];
  // if (productDB.shippings && productDB.shippings.length > 0) {
  //   productDB.shippings.forEach(function (shipping) {
  //     shippings.push({
  //       _id: shipping.shippingtype._id,
  //       name: shipping.shippingtype.name,
  //       price: shipping.shippingprice
  //     });
  //   });
  // }
  var shop = {
    _id: productDB.shop ? productDB.shop._id : '',
    name: productDB.shop ? productDB.shop.name : '',
    rate: productDB.shop ? productDB.shop.rate : null
  };
  // var isfavorite = false;
  // if (req.user && req.user !== undefined) {
  //   if (productDB.favorites && productDB.favorites.length > 0) {
  //     productDB.favorites.forEach(function (favorite) {
  //       if (favorite.user.toString() === req.user._id.toString()) {
  //         isfavorite = true;
  //       }
  //     });
  //   }
  // }

  var product = {
    _id: productDB._id,
    name: productDB.name,
    detail: productDB.detail,
    price: productDB.price,
    promotionprice: productDB.promotionprice,
    percentofdiscount: productDB.percentofdiscount,
    currency: productDB.currency,
    images: productDB.images,
    rate: productDB.rate ? productDB.rate : 5,
    reviews: productDB.reviews,
    shippings: productDB.shippings,
    shop: shop,
    // shippings: req.product.shippings,
    // shop: req.product.shop,
    categories: req.product.categories,
    otherproducts: []
  };
  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  product.isCurrentUserOwner = req.user && product.user && product.user._id.toString() === req.user._id.toString();

  res.jsonp(product);
};

/**
 * Update a Product
 */
exports.update = function (req, res) {
  var product = req.product;

  product = _.extend(product, req.body);

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Delete an Product
 */
exports.delete = function (req, res) {
  var product = req.product;

  product.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(product);
    }
  });
};

/**
 * Get List Product
 */
exports.getProductList = function (req, res, next) {
  Product.find({}, '_id name images price promotionprice percentofdiscount currency categories rate').sort('-created').populate('user', 'displayName').populate('categories').populate('shippings.shippingtype').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.products = products;
      next();
    }
  });

};

/**
 * Cooking List Product
 */
exports.cookingProductList = function (req, res, next) {
  var products = [];
  req.products.forEach(function (element) {
    var categories = [];
    element.categories.forEach(function (cate) {
      categories.push({
        name: cate.name
      });
    });
    products.push({
      _id: element._id,
      name: element.name,
      image: element.images[0],
      price: element.price,
      promotionprice: element.promotionprice,
      percentofdiscount: element.percentofdiscount,
      currency: element.currency,
      categories: categories,
      rate: element.rate ? element.rate : 5
    });
  });
  req.productsCookingList = products;
  next();
};

/**
 * List of Products
 */
exports.list = function (req, res) {
  res.jsonp({
    items: req.productsCookingList
  });
};

/**
 * Product middleware
 */
exports.productByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Product is invalid'
    });
  }

  Product.findById(id).populate('user', 'displayName').populate('categories').populate('shop').populate('shippings.shippingtype').exec(function (err, product) {
    if (err) {
      return next(err);
    } else if (!product) {
      return res.status(404).send({
        message: 'No Product with that identifier has been found'
      });
    }
    req.product = product;
    next();
  });
};

/**
 * Update Review
 */
exports.updateReview = function (req, res) {
  if (req.user && req.user !== undefined) {
    req.body = req.body ? req.body : {};
    req.body.user = req.user;
  }
  req.product.reviews.push(req.body);
  req.product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(req.product);
    }
  });

};

exports.updateShipping = function (req, res) {

  req.product.shippings = req.product.shippings.concat(req.body);
  req.product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(req.product);
    }
  });

};

exports.shopID = function (req, res, next, shopid) {
  Product.find({
    shop: shopid
  }, '_id name images price promotionprice percentofdiscount currency categories rate').sort('-created').populate('user', 'displayName').populate('categories').populate('shippings').exec(function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.products = products;
      next();
    }
  });
};

exports.productByShop = function (req, res) {
  res.jsonp({
    items: req.productsCookingList ? req.productsCookingList : []
  });
};

exports.updateHistoryLog = function (req, res, next) {
  req.product.historylog.push({
    user: req.user || null
  });
  req.product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(req.product);
    }
  });
};
