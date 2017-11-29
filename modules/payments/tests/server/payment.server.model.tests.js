'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Payment = mongoose.model('Payment');

/**
 * Globals
 */
var user,
  payment;

/**
 * Unit tests
 */
describe('Payment Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function () {
      payment = new Payment({
        payment: [{
          name: 'Payment name',
          image: 'Payment Image'
        }],
        counterservice: [{
          name: 'Payment name',
          image: 'Payment Image'
        }],
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(0);
      return payment.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function (done) {
      payment.payment[0].name = null;

      return payment.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without counterservice', function (done) {
      payment.counterservice[0].name = null;

      return payment.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Payment.remove().exec(function () {
      User.remove().exec(function () {
        done();
      });
    });
  });
});
