'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  Shop = mongoose.model('Shop'),
  Cart = mongoose.model('Cart'),
  Address = mongoose.model('Address'),
  Product = mongoose.model('Product'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  request = require('request'),
  pushNotiUrl = process.env.PUSH_NOTI_URL || 'https://onesignal.com/api/v1/notifications';

/**
 * Create a Order
 */
exports.create = function (req, res, next) {
  var order = new Order(req.body);
  if (req.body.shipping && req.body.shipping.location && req.body.shipping.location.lat && req.body.shipping.location.lng) {
    order.location.lat = req.body.shipping.location.lat;
    order.location.lng = req.body.shipping.location.lng;
    // console.log(order);
  }

  order.docno = (+new Date());
  order.docdate = new Date();
  order.user = req.user;

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Product.populate(order, {
        path: 'items.product'
      }, function (err, orderRes) {
        User.populate(orderRes, {
          path: 'items.product.user'
        }, function (err, orderRes2) {
          Shop.populate(orderRes2, {
            path: 'items.product.shop'
          }, function (err, orderRes3) {
            for (var i = 0; i < orderRes3.items.length; i++) {
              var ids = orderRes3.items[i].product ? orderRes3.items[i].product.user ? orderRes3.items[i].product.user.pushnotifications ? orderRes3.items[i].product.user.pushnotifications : [] : [] : [];
              if (ids.length > 0) {
                var sellerMessage = 'ร้าน ' + orderRes3.items[i].product.shop.name + ' มีรายการสั่งซื้อใหม่';
                sentNotiToSeller(sellerMessage, ids);
              }
            }
            createOrderBridge(orderRes3);
          });
          var buyerMessage = 'ขอขอบคุณที่ใช้บริการ';
          sentNotiToBuyer(buyerMessage, req.user.pushnotifications);
          req.resOrder = orderRes2;
          next();
        });
      });
    }
  });
};

exports.getCart = function (req, res, next) {
  Cart.find({
    user: req.user._id
  }).sort('-created').exec(function (err, carts) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (carts && carts.length > 0) {
        req.cart = carts[0];
        next();
      } else {
        Address.populate(req.resOrder, {
          path: 'shipping'
        }, function (err, orderRes) {
          res.jsonp(orderRes);
        });
      }
    }
  });
};

exports.clearCart = function (req, res, next) {
  Cart.findById(req.cart._id).sort('-created').exec(function (err, cart) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      cart.remove(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          Address.populate(req.resOrder, {
            path: 'shipping'
          }, function (err, orderRes) {
            res.jsonp(orderRes);
          });
        }
      });
    }
  });
};

/**
 * Show the current Order
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var order = req.order ? req.order.toJSON() : {};
  if (order.payment ? order.payment.paymenttype === 'Bank Transfer' : false) {
    order.isTransfer = true;
    if (order.status !== 'confirm') {
      order.isTransfer = false;
    } else if (order.status === 'confirm') {
      if (order.imageslip !== 'no image') {
        order.isTransfer = false;
      }
    }
  } else {
    order.isTransfer = false;
  }


  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  order.isCurrentUserOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();

  res.jsonp(order);
};

/**
 * Update a Order
 */
exports.update = function (req, res) {
  var order = req.order;

  order = _.extend(order, req.body);

  order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * Delete an Order
 */
exports.delete = function (req, res) {
  var order = req.order;

  order.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(order);
    }
  });
};

/**
 * List of Orders
 */
exports.list = function (req, res) {
  Order.find().sort('-created').populate('user', 'displayName').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(orders);
    }
  });
};

/**
 * Order middleware
 */
exports.orderByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    });
  }

  Order.findById(id).populate('user').populate('items.product').exec(function (err, order) {
    if (err) {
      return next(err);
    } else if (!order) {
      return res.status(404).send({
        message: 'No Order with that identifier has been found'
      });
    }
    req.order = order;
    next();
  });
};

exports.message = function (req, res, next, message) {
  req.message = message;
  next();
};

exports.sendNotiBuyer = function (req, res) {
  //console.log(admtokens);
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic Y2U2Njg0YzYtMjZmYi00YjMyLWE5NGEtMjIwZjQ4NzY1ZDc4'
    },
    method: 'POST',
    json: {
      app_id: '4deb2817-a4ea-496c-867e-9eb26940f565',
      contents: {
        en: req.message
      },
      included_segments: ['All']
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
      res.jsonp({
        message: error
      });

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
      res.jsonp({
        message: response.body.error
      });
    }
    res.jsonp({
      message: 'sent noti success'
    });
  });
};

exports.sendNotiSeller = function (req, res) {
  //console.log(admtokens);
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic YmY2MDJlMzMtNWNjZi00ODViLWI0NDgtNDM3YTcwNGI1YzBh'
    },
    method: 'POST',
    json: {
      app_id: '4b62e07d-3f2d-46a0-96f1-542b2fb46bd4',
      contents: {
        en: req.message
      },
      included_segments: ['All']
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
      res.jsonp({
        message: error
      });

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
      res.jsonp({
        message: response.body.error
      });
    }
    res.jsonp({
      message: 'sent noti success'
    });
  });
};

exports.getShopByUser = function (req, res, next, shopId) {
  req.shopId = shopId;
  next();
};

exports.getOrderList = function (req, res, next) {
  Order.find({
    status: {
      $nin: ['complete', 'cancel']
    },
    version: '2.0'
  }).sort('-created').populate('user', 'displayName').populate('items.product').populate('shipping').exec(function (err, orders) {
    if (err) {
      console.log('===========order by shop===========');
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.orders = orders;
      next();
    }
  });
};

exports.cookingOrderByShop = function (req, res, next) {
  var data = {
    waiting: [],
    accept: [],
    sent: [],
    return: []
  };
  if (req.orders && req.orders.length > 0 && req.shopId) {
    req.orders.forEach(function (order) {
      if (order.items && order.items.length > 0) {
        order.items.forEach(function (itm) {
          var shop = itm.product ? itm.product.shop ? itm.product.shop.toString() === req.shopId.toString() : false : false;
          if (shop) {
            var price = itm.totalamount && itm.totalamount > 0 ? itm.totalamount : (itm.amount || 0) - (itm.discount || 0);
            if (itm.status === 'waiting') {
              data.waiting.push({
                order_id: order._id,
                item_id: itm._id,
                name: itm.product.name,
                price: price,
                qty: itm.qty,
                rate: itm.product.rate || 0,
                image: itm.product.images[0] || 'No image',
                status: itm.status,
                shipping: order.shipping,
                delivery: itm.delivery,
                promotionprice: price - itm.discount,
                currency: itm.product.currency,
                percentofdiscount: itm.product.percentofdiscount
              });
            } else if (itm.status === 'accept') {
              data.accept.push({
                order_id: order._id,
                item_id: itm._id,
                name: itm.product.name,
                price: itm.totalamount && itm.totalamount > 0 ? itm.totalamount : (itm.amount || 0) - (itm.discount || 0),
                qty: itm.qty,
                rate: itm.product.rate || 0,
                image: itm.product.images[0] || 'No image',
                status: itm.status,
                shipping: order.shipping,
                delivery: itm.delivery,
                promotionprice: price - itm.discount,
                currency: itm.product.currency,
                percentofdiscount: itm.product.percentofdiscount
              });
            } else if (itm.status === 'sent') {
              data.sent.push({
                order_id: order._id,
                item_id: itm._id,
                name: itm.product.name,
                price: itm.totalamount && itm.totalamount > 0 ? itm.totalamount : (itm.amount || 0) - (itm.discount || 0),
                qty: itm.qty,
                rate: itm.product.rate || 0,
                image: itm.product.images[0] || 'No image',
                status: itm.status,
                shipping: order.shipping,
                delivery: itm.delivery,
                promotionprice: price - itm.discount,
                currency: itm.product.currency,
                percentofdiscount: itm.product.percentofdiscount
              });
            } else if (itm.status === 'return') {
              data.return.push({
                order_id: order._id,
                item_id: itm._id,
                name: itm.product.name,
                price: itm.totalamount && itm.totalamount > 0 ? itm.totalamount : (itm.amount || 0) - (itm.discount || 0),
                qty: itm.qty,
                rate: itm.product.rate || 0,
                image: itm.product.images[0] || 'No image',
                status: itm.status,
                shipping: order.shipping,
                delivery: itm.delivery,
                promotionprice: price - itm.discount,
                currency: itm.product.currency,
                percentofdiscount: itm.product.percentofdiscount
              });
            }
          }
        });
      }
    });
  }
  req.orderByShop = data;
  next();
};

exports.orderByShops = function (req, res) {
  res.jsonp(req.orderByShop);
};

exports.itemID = function (req, res, next, itemId) {
  req.itemID = itemId;
  next();
};

exports.waitingToAccept = function (req, res) {
  var productname = '';
  req.order.items.forEach(function (itm) {
    if (itm._id.toString() === req.itemID.toString()) {
      itm.status = 'accept';
      productname = itm.product.name;
    }
  });
  req.order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var buyerMessage = productname + ' ได้รับการยืนยันแล้ว กำลังเตรียมการจัดส่ง'; // คนซื้อ
      var pushnotifications = req.order.user ? req.order.user.pushnotifications ? req.order.user.pushnotifications : [] : [];
      sentNotiToBuyer(buyerMessage, pushnotifications);
      res.jsonp(req.order);
    }
  });
};

exports.acceptToSent = function (req, res) {
  var productname = '';
  req.order.items.forEach(function (itm) {
    if (itm._id.toString() === req.itemID.toString()) {
      itm.status = 'sent';
      productname = itm.product.name;
    }
  });
  req.order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var buyerMessage = productname + ' จัดส่งแล้ว หมายเลขพัสดุ: 123456789'; // คนซื้อ
      var pushnotifications = req.order.user ? req.order.user.pushnotifications ? req.order.user.pushnotifications : [] : [];
      sentNotiToBuyer(buyerMessage, pushnotifications);
      res.jsonp(req.order);
    }
  });
};

exports.sentToComplete = function (req, res) {
  var productname = '';
  req.order.items.forEach(function (itm) {
    if (itm._id.toString() === req.itemID.toString()) {
      itm.status = 'complete';
      productname = itm.product.name;
    }
  });
  req.order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var buyerMessage = productname + ' ดำเนินการเสร็จสิ้น ขอบคุณที่ใช้บริการ'; // คนซื้อ
      var pushnotifications = req.order.user ? req.order.user.pushnotifications ? req.order.user.pushnotifications : [] : [];
      sentNotiToBuyer(buyerMessage, pushnotifications);
      res.jsonp(req.order);
    }
  });
};

exports.waitingToReject = function (req, res) {
  var productname = '';

  req.order.items.forEach(function (itm) {
    if (itm._id.toString() === req.itemID.toString()) {
      itm.status = 'reject';
      productname = itm.product.name;
    }
  });
  req.order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var buyerMessage = productname + ' ถูกยกเลิกคำสั่งซื้อ ขออภัยในความไม่สะดวก'; // คนซื้อ
      var pushnotifications = req.order.user ? req.order.user.pushnotifications ? req.order.user.pushnotifications : [] : [];
      sentNotiToBuyer(buyerMessage, pushnotifications);
      res.jsonp(req.order);
    }
  });
};

exports.orderUserId = function (req, res, next, orderUserId) {
  req.orderUserId = orderUserId;
  next();
};

exports.orderByUser = function (req, res) {
  Order.find({ user: { _id: req.orderUserId } }).sort('-created').populate('user', 'displayName').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(orders);
    }
  });
};

exports.uploadSlip = function (req, res) {
  req.order.imageslip = req.body.image;
  req.order.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    User.populate(req.order, {
      path: 'user'
    }, function (err, orderRes1) {
      User.populate(orderRes1, {
        path: 'items.product.user'
      }, function (err, orderRes2) {
        Shop.populate(orderRes2, {
          path: 'items.product.shop'
        }, function (err, orderRes3) {
          for (var i = 0; i < orderRes3.items.length; i++) {
            var ids = orderRes3.items[i].product ? orderRes3.items[i].product.user ? orderRes3.items[i].product.user.pushnotifications ? orderRes3.items[i].product.user.pushnotifications : [] : [] : [];
            if (ids.length > 0) {
              var sellerMessage = 'ร้าน ' + orderRes3.items[i].product.shop.name + ' มีการชำระเงินโดยคุณ ' + orderRes1.user.displayName;
              sentNotiToSeller(sellerMessage, ids);
            }
          }
          res.jsonp(req.order);
        });
      });
    });
  });
};

function sentNotiToSeller(message, ids) {
  request({
    url: pushNotiUrl,
    headers: {
      'Authorization': 'Basic YmY2MDJlMzMtNWNjZi00ODViLWI0NDgtNDM3YTcwNGI1YzBh'
    },
    method: 'POST',
    json: {
      app_id: '4b62e07d-3f2d-46a0-96f1-542b2fb46bd4',
      contents: {
        en: message
      },
      include_player_ids: ids
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);

    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    // console.log({
    //   message: 'sent noti success'
    // });
  });
}

function sentNotiToBuyer(message, ids) {
  if (ids && ids.length > 0) {
    request({
      url: pushNotiUrl,
      headers: {
        'Authorization': 'Basic Y2U2Njg0YzYtMjZmYi00YjMyLWE5NGEtMjIwZjQ4NzY1ZDc4'
      },
      method: 'POST',
      json: {
        app_id: '4deb2817-a4ea-496c-867e-9eb26940f565',
        contents: {
          en: message
        },
        include_player_ids: ids
      }
    }, function (error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error);
        // res.jsonp({ message: error });

      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
        // res.jsonp({ message: response.body.error });
      }
      console.log({
        message: 'sent noti success'
      });
    });
  } else {
    // console.log({
    //   message: 'User ids not found.'
    // });
  }
}

function createOrderBridge(data) {
  var urlSubServer = 'https://thamapptest.herokuapp.com/api/orderbridge/'; //test
  // var urlSubServer = 'https://thamapp-sub.herokuapp.com/api/suborders/' + orderId; //prod
  request({
    url: urlSubServer,
    method: 'POST',
    body: data,
    json: true
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
