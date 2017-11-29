'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cart = mongoose.model('Cart'),
  Product = mongoose.model('Product'),
  Shipping = mongoose.model('Shipping'),
  Shop = mongoose.model('Shop');

/**
 * Globals
 */
var user,
  cart,
  product,
  shipping,
  shop;

/**
 * Unit tests
 */
describe('Cart Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    shipping = new Shipping({
      shipping: {
        detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
        name: 'ส่งแบบส่งด่วน',
        price: 0
      }
    });

    shop = new Shop({
      name: 'Shop name'
    });

    product = new Product({
      name: 'Crossfit WorldWide Event',
      image: 'https://images-eu.ssl-images-amazon.com/images/G/02/AMAZON-FASHION/2016/SHOES/SPORT/MISC/Nikemobilefootball',
      price: 20000,
      promotionprice: 18000,
      percentofdiscount: 10,
      currency: 'THB',
      shop: shop,
      shippings: [shipping]
    });

    user.save(function () {
      shipping.save(function () {
        shop.save(function () {
          product.save(function () {
            cart = new Cart({
              items: [{
                product: product,
                qty: 1,
                amount: 20000,
                discount: 2000,
                totalamount: 18000
              }],
              amount: 20000,
              discount: 2000,
              totalamount: 18000,
              user: user
            });
            done();
          });
        });
      });
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return cart.save(function (err) {
        should.not.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Cart.remove().exec(function () {
      Product.remove().exec(function () {
        Shop.remove().exec(function () {
          Shipping.remove().exec(function () {
            User.remove().exec(function () {
              done();
            });
          });
        });
      });
    });
  });
});
