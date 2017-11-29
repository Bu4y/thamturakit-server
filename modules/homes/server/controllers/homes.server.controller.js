'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  Shop = mongoose.model('Shop'),
  Category = mongoose.model('Category'),
  Order = mongoose.model('Order'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

exports.cateName = function (req, res, next, catename) {
  req.catename = catename;
  next();
};

exports.getCate = function (req, res, next) {
  Category.find().sort('-created').exec(function (err, categories) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.categories = categories;
      next();
    }
  });
};

exports.getProducts = function (req, res, next) {
  Product.find({}, '_id name images price promotionprice percentofdiscount currency categories rate historylog shop').sort('-created').populate('categories').populate('shippings').populate('shop').exec(function (err, products) {
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

exports.historyProductsFilterOfMounth = function (req, res, next) {
  var products = req.products ? req.products : [];
  var items = [];
  var start = new Date();
  start.setDate(1);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(start.getMonth() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  products.forEach(function (product) {
    product = product ? product.toJSON() : {};
    product.mounthHistory = product.mounthHistory ? product.mounthHistory : [];
    product.historylog.forEach(function (his) {
      if (his.created >= start && his.created <= end) {
        product.mounthHistory.push(his);
      }
    });
    items.push(product);
  });

  items.sort((a, b) => { return (a.mounthHistory.length < b.mounthHistory.length) ? 1 : ((b.mounthHistory.length < a.mounthHistory.length) ? -1 : 0); });
  req.products = items;
  next();
};


exports.cookingShopPopular = function (req, res, next) {
  var shopsPopular = [];
  req.products.forEach(function (product) {
    if (product.shop) {
      if (shopsPopular.indexOf(product.shop._id.toString()) === -1) {
        shopsPopular.push(product.shop._id.toString());
      }
    }
  });
  Shop.find({
    '_id': {
      $in: shopsPopular
    }
  }, function (err, shops) {
    var datas = [];
    shops.forEach(function (shop) {
      datas.push({
        _id: shop._id,
        name: shop.name,
        image: shop.image ? shop.image : 'http://res.cloudinary.com/hgwy12jde/image/upload/v1508231334/download_n6ttru.png'
      });
    });
    req.shopPopular = datas;
    next();
  });
};


exports.cookingHighlight = function (req, res, next) {
  var datas = [];
  var products = req.products.slice(0, 5);
  products.forEach(function (product) {
    var data = {
      _id: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      promotionprice: product.promotionprice,
      percentofdiscount: product.percentofdiscount,
      currency: product.currency,
      rate: product.rate || 0,
      detail: product.detail
    };
    datas.push(data);
  });
  var items = [{
    name: 'Highlight',
    popularproducts: datas,
    popularshops: req.shopPopular.slice(0, 5),
    bestseller: []
  }];
  req.highlight = items;
  next();
};

exports.cookingData = function (req, res, next) {
  var items = [];
  items = items.concat(req.highlight);
  var item = {
    name: '',
    popularproducts: [],
    popularshops: [],
    bestseller: []
  };
  req.categories.forEach(function (cate) {
    item = {
      name: cate.name,
      popularproducts: [],
      popularshops: [],
      bestseller: []
    };
    req.products.forEach(function (product) {
      product.categories.forEach(function (catep) {
        if (cate._id.toString() === catep._id.toString()) {
          item.popularproducts.push({
            _id: product._id,
            name: product.name,
            image: product.images[0],
            price: product.price,
            promotionprice: product.promotionprice,
            percentofdiscount: product.percentofdiscount,
            currency: product.currency,
            rate: product.rate ? product.rate : 5
          });
          if (item.popularshops.length > 0) {

            var chkShop = false;
            if (product.shop) {
              item.popularshops.forEach(function (shopPop) {
                if (shopPop) {
                  if (product.shop._id.toString() === shopPop._id.toString()) {
                    chkShop = true;
                  }
                }
              });
              if (!chkShop) {
                item.popularshops.push({
                  _id: product.shop._id,
                  name: product.shop.name,
                  image: product.shop.image ? product.shop.image : 'http://res.cloudinary.com/hgwy12jde/image/upload/v1508231334/download_n6ttru.png'
                });
              }
            }
          } else {
            if (product.shop) {
              item.popularshops.push({
                _id: product.shop._id,
                name: product.shop.name,
                image: product.shop.image ? product.shop.image : 'http://res.cloudinary.com/hgwy12jde/image/upload/v1508231334/download_n6ttru.png'
              });
            }
          }
        }
      });
    });
    item.popularproducts.slice(0, 5);
    item.popularshops.slice(0, 5);
    items.push(item);
  });
  req.home = items;
  next();
};

exports.list = function (req, res) {
  res.jsonp({
    categories: req.home
  });
};

exports.cookingSeeAll = function (req, res, next) {
  var seeallProduct = [];
  var seeallShop = [];
  if (req.catename.toString() === 'Highlight') {
    req.products.forEach(function (product) {
      seeallProduct.push({
        _id: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        promotionprice: product.promotionprice,
        percentofdiscount: product.percentofdiscount,
        currency: product.currency,
        rate: product.rate ? product.rate : 5
      });
      if (product.shop) {
        if (seeallShop.indexOf(product.shop._id.toString()) === -1) {
          seeallShop.push(product.shop._id.toString());
        }
      }
    });
  } else {
    req.products.forEach(function (product) {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(function (cate) {
          if (cate && cate.name.toString() === req.catename.toString()) {
            seeallProduct.push({
              _id: product._id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              promotionprice: product.promotionprice,
              percentofdiscount: product.percentofdiscount,
              currency: product.currency,
              rate: product.rate ? product.rate : 5
            });
            if (product.shop) {
              if (seeallShop.indexOf(product.shop._id.toString()) === -1) {
                seeallShop.push(product.shop._id.toString());
              }
            }
          }
        });
      }
    });
  }

  req.seeallproduct = seeallProduct;
  req.shopsId = seeallShop;
  next();
};

exports.seeAllProduct = function (req, res) {
  res.jsonp({
    title: req.catename,
    items: req.seeallproduct
  });
};

exports.seeAllShop = function (req, res) {
  var shopsSeeAll = [];
  Shop.find({
    '_id': {
      $in: req.shopsId
    }
  }, function (err, shops) {
    shopsSeeAll = [];
    shops.forEach(function (shop) {
      shopsSeeAll.push({
        _id: shop._id,
        name: shop.name,
        image: shop.image ? shop.image : 'http://res.cloudinary.com/hgwy12jde/image/upload/v1508231334/download_n6ttru.png',
        rate: shop.rate || 5
      });
    });
    res.jsonp({
      title: req.catename,
      items: shopsSeeAll
    });
  });

};

exports.sellerShopId = function (req, res, next, shopId) {
  req.shopId = shopId;
  next();
};

exports.orderToday = function (req, res, next) {
  var start = new Date();
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setDate(start.getDate() + 1);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lt: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var today = 0;
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                today += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.ordersToday = today;
      next();
    }
  });
};

exports.orderMonth = function (req, res, next) {
  var start = new Date();
  start.setDate(1);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(start.getMonth() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lte: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var month = 0;
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง            
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                month += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.ordersMonth = month;
      next();
    }
  });
};

exports.orderYear = function (req, res, next) {
  var start = new Date();
  start.setDate(1);
  start.setMonth(0);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(12);
  end.setFullYear(start.getFullYear() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง  
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lt: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var year = 0;
      var categories = [];
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง                        
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                itm.product.categories.forEach(function (cate) {
                  if (categories.length > 0) {
                    var chk = false;

                    categories.forEach(function (subcate) {
                      if (cate.toString() === subcate.cate.toString()) {
                        subcate.qty += itm.qty;
                        chk = true;
                      }
                    });

                    if (!chk) {
                      categories.push({
                        cate: cate,
                        qty: itm.qty
                      });
                    }
                  } else {
                    categories.push({
                      cate: cate,
                      qty: itm.qty
                    });
                  }
                });
                year += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.bestCategory = categories;
      req.ordersYear = year;
      next();
    }
  });
};

exports.bestCateOfYear = function (req, res, next) {
  var bestcates = [];
  if (req.bestCategory.length === 1) {
    var bestQty1 = req.bestCategory[0].qty;
    req.bestCategory.forEach(function (cate) {
      if (cate.qty === bestQty1) {
        bestcates.push(cate.cate);
      }
    });
  } else if (req.bestCategory.length > 1) {
    req.bestCategory.sort((a, b) => { return (a.qty < b.qty) ? 1 : ((b.qty < a.qty) ? -1 : 0); });
    var bestQty2 = req.bestCategory[0].qty;
    req.bestCategory.forEach(function (cate) {
      if (cate.qty === bestQty2) {
        bestcates.push(cate.cate);
      }
    });
  }

  if (bestcates.length > 0) {
    Category.find({
      '_id': {
        $in: bestcates
      }
    }, function (err, categories) {
      var categoryList = [];
      categories.forEach(function (cate) {
        categoryList.push({
          cate: cate.name
        });
      });
      req.bestCate = categoryList;
      next();
    });
  } else {
    req.bestCate = [];
    next();
  }

};

exports.reportFirstMonth = function (req, res, next) {
  req.reports = [];
  req.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  var firstMonth = new Date();
  req.reports.push({
    title: req.monthNames[firstMonth.getMonth()] + '/' + firstMonth.getFullYear(),
    amount: req.ordersMonth
  });
  next();
};

exports.reportSecondMonth = function (req, res, next) {
  var start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - 1);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(start.getMonth() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง  
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lte: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var second = 0;
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง             
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                second += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.reports.push({
        title: req.monthNames[start.getMonth()] + '/' + start.getFullYear(),
        amount: second
      });
      next();
    }
  });
};

exports.reportThirdMonth = function (req, res, next) {
  var start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - 2);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(start.getMonth() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง  
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lte: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var third = 0;
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง            
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                third += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.reports.push({
        title: req.monthNames[start.getMonth()] + '/' + start.getFullYear(),
        amount: third
      });
      next();
    }
  });
};

exports.reportFourthMonth = function (req, res, next) {
  var start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - 3);
  start.setHours(0);
  start.setMinutes(0);
  start.setSeconds(0);
  var end = new Date();
  end.setMonth(start.getMonth() + 1);
  end.setDate(0);
  end.setHours(23);
  end.setMinutes(59);
  end.setSeconds(59);
  //status: 'complete' กรณีเอาจริง  
  Order.find({ status: { $nin: ['cancel'] }, created: { $gte: start, $lte: end } }).sort('-created').populate('items.product').exec(function (err, orders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var fourth = 0;
      orders.forEach(function (order) {
        order.items.forEach(function (itm) {
          if (itm.status === 'complete') { // เอา ออก กรณีเอาจริง                        
            if (itm.product && itm.product.shop) {
              if (itm.product.shop.toString() === req.shopId.toString()) {
                fourth += itm.totalamount && itm.totalamount > 0 ? itm.totalamount : itm.amount - itm.discount;
              }
            }
          }
        });
      });
      req.reports.push({
        title: req.monthNames[start.getMonth()] + '/' + start.getFullYear(),
        amount: fourth
      });
      next();
    }
  });
};

exports.homeSeller = function (req, res) {
  res.jsonp({
    items: {
      day: { amount: req.ordersToday },
      month: { amount: req.ordersMonth },
      year: { amount: req.ordersYear },
      categories: req.bestCate
    },
    report: req.reports
  });
};

exports.tokenRes = function (req, res) {
  res.jsonp(req.user);
};