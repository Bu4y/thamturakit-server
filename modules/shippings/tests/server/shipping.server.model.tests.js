'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shipping = mongoose.model('Shipping');

/**
 * Globals
 */
var user,
  shipping;

/**
 * Unit tests
 */
describe('Shipping Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      shipping = new Shipping({
        name: 'Shipping Name',
        detail:'ส่งด่วน',
        price: 300,
        duedate: 2,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return shipping.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      shipping.name = '';

      return shipping.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without detail', function(done) {
      shipping.detail = '';

      return shipping.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without price', function(done) {
      shipping.price = null;

      return shipping.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without duedate', function(done) {
      shipping.duedate = null;

      return shipping.save(function(err) {
        should.exist(err);
        done();
      });
    });



  });

  afterEach(function(done) {
    Shipping.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
