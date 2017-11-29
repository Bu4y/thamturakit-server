'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Payment = mongoose.model('Payment'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  payment;

/**
 * Payment routes tests
 */
describe('Payment CRUD token tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Payment
    user.save(function () {
      payment = {
        payment: [{
          name: 'Payment name',
          image: 'Payment Image'
        }],
        counterservice: [{
          name: 'Counterservice name',
          image: 'Counterservice Image'
        }]
      };

      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;
          done();
        });
    });
  });


  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Payment if logged in with token', function (done) {
    // Save a new Payment
    agent.post('/api/payments')
      .set('authorization', 'Bearer ' + token)
      .send(payment)
      .expect(200)
      .end(function (paymentSaveErr, paymentSaveRes) {
        // Handle payment save error
        if (paymentSaveErr) {
          return done(paymentSaveErr);
        }

        // Get a list of payment
        agent.get('/api/payments')
          .end(function (paymentsGetErr, paymentsGetRes) {
            // Handle payment save error
            if (paymentsGetErr) {
              return done(paymentsGetErr);
            }

            // Get payment list
            var payments = paymentsGetRes.body;

            // Set assertions
            (payments[0].payment[0].name).should.match(payment.payment[0].name);



            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get List a Payment if logged in with token', function (done) {
    // Save a new Payment
    agent.post('/api/payments')
      .set('authorization', 'Bearer ' + token)
      .send(payment)
      .expect(200)
      .end(function (paymentSaveErr, paymentSaveRes) {
        // Handle Payment save error
        if (paymentSaveErr) {
          return done(paymentSaveErr);
        }

        // Get a list of Payment
        agent.get('/api/payments')
          .end(function (paymentsGetErr, paymentsGetRes) {
            // Handle Payment save error
            if (paymentsGetErr) {
              return done(paymentsGetErr);
            }

            // Get Payment list
            var payments = paymentsGetRes.body;

            // Set assertions
            (payments.length).should.match(1);
            (payments[0]._id).should.match(paymentSaveRes.body._id);
            (payments[0].payment[0].name).should.match(payment.payment[0].name);
            (payments[0].payment[0].image).should.match(payment.payment[0].image);


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get By ID a Payment if logged in with token', function (done) {
    // Save a new Payment
    agent.post('/api/payments')
      .set('authorization', 'Bearer ' + token)
      .send(payment)
      .expect(200)
      .end(function (paymentSaveErr, paymentSaveRes) {
        // Handle Payment save error
        if (paymentSaveErr) {
          return done(paymentSaveErr);
        }
        agent.get('/api/payments/' + paymentSaveRes.body._id)
          // .send(shop)
          // .expect(200)
          .end(function (paymentsGetErr, paymentsGetRes) {
            // Handle Payment save error
            if (paymentsGetErr) {
              return done(paymentsGetErr);
            }
            // Get Payment list
            var payments = paymentsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (payments.payment[0].name).should.match(payment.payment[0].name);
            (payments.payment[0].image).should.match(payment.payment[0].image);
            done();
          });
      });
  });

  it('should be able to update a Payment if logged in with token', function (done) {
    // Save a new Payment
    agent.post('/api/payments')
      .set('authorization', 'Bearer ' + token)
      .send(payment)
      .expect(200)
      .end(function (paymentSaveErr, paymentSaveRes) {
        // Handle Payment save error
        if (paymentSaveErr) {
          return done(paymentSaveErr);
        }

        payment.payment[0].name = "test payment";
        agent.put('/api/payments/' + paymentSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(payment)
          .expect(200)
          .end(function (paymentUpdateErr, paymentUpdateRes) {
            // Handle Payment save error
            if (paymentUpdateErr) {
              return done(paymentUpdateErr);
            }
            // Get a list of Payment
            agent.get('/api/payments')
              .end(function (paymentsGetErr, paymentsGetRes) {
                // Handle Payment save error
                if (paymentsGetErr) {
                  return done(paymentsGetErr);
                }

                // Get Payment list
                var payments = paymentsGetRes.body;

                // Set assertions
                (payments[0].payment[0].name).should.match('test payment');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a Payment if logged in with token', function (done) {
    // Save a new Payment
    agent.post('/api/payments')
      .set('authorization', 'Bearer ' + token)
      .send(payment)
      .expect(200)
      .end(function (paymentSaveErr, paymentSaveRes) {
        // Handle Payment save error
        if (paymentSaveErr) {
          return done(paymentSaveErr);
        }

        agent.delete('/api/payments/' + paymentSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(payment)
          .expect(200)
          .end(function (paymentUpdateErr, paymentUpdateRes) {
            // Handle Payment save error
            if (paymentUpdateErr) {
              return done(paymentUpdateErr);
            }
            // Get a list of Payment
            agent.get('/api/payments')
              .end(function (paymentsGetErr, paymentsGetRes) {
                // Handle Payment save error
                if (paymentsGetErr) {
                  return done(paymentsGetErr);
                }

                // Get Payment list
                var payments = paymentsGetRes.body;

                // Set assertions
                (payments.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Payment.remove().exec(done);
    });
  });
});
