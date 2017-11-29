'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Category = mongoose.model('Category'),
  Shop = mongoose.model('Shop'),
  Shipping = mongoose.model('Shipping'),
  Product = mongoose.model('Product');

/**
 * Globals
 */
var user,
  category,
  shop,
  shipping,
  product;

/**
 * Unit tests
 */

describe('Product Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });
    category = new Category({
      name: 'แฟชั่น'
    });
    shop = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      },
      user: user
    });
    shipping = new Shipping({
      name: 'Shipping Name',
      detail: 'ส่งด่วน',
      price: 300,
      duedate: 2,
      user: user
    });
    user.save(function () {
      shipping.save(function () {
        shop.save(function () {
          category.save(function () {
            product = new Product({
              name: 'Product Name',
              detail: 'Product detail',
              price: 100,
              promotionprice: 80,
              percentofdiscount: 20,
              currency: 'Product currency',
              images: ['Product images'],
              reviews: [{
                topic: 'Product reviews topic',
                comment: 'Product reviews comment',
                rate: 5,
                created: new Date()
              }],
              shippings: [{ shippingtype: shipping, shippingprice: 100 }],
              categories: category,
              cod: false,
              shop: shop,
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
      return product.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      product.name = '';

      return product.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without price', function (done) {
      product.price = null;

      return product.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without images', function (done) {
      product.images = [];

      return product.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without shippings', function (done) {
      product.shippings = [];

      return product.save(function (err) {
        should.exist(err);
        done();
      });
    });

  });

  afterEach(function (done) {
    Product.remove().exec(function () {
      Category.remove().exec(function () {
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
