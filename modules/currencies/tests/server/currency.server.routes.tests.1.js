'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Currency = mongoose.model('Currency'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  currency;

/**
 * Currency routes tests
 */
describe('Currency CRUD tests with Token Base Authen', function () {

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

    // Save a user to the test db and create new Currency
    user.save(function () {
      currency = {
        name: 'Currency name'
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

  it('should be able to save a Currency if logged in', function (done) {
    agent.post('/api/currencies')
      .set('authorization', 'Bearer ' + token)
      .send(currency)
      .expect(200)
      .end(function (currencySaveErr, currencySaveRes) {
        // Handle Currency save error
        if (currencySaveErr) {
          return done(currencySaveErr);
        }

        // Get a list of Currencies
        agent.get('/api/currencies')
          .end(function (currenciesGetErr, currenciesGetRes) {
            // Handle Currencies save error
            if (currenciesGetErr) {
              return done(currenciesGetErr);
            }

            // Get Currencies list
            var currencies = currenciesGetRes.body;

            // Set assertions
            (currencies[0].user._id).should.equal(user.id);
            (currencies[0].name).should.match('Currency name');

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to update a Currency if logged in', function (done) {
    agent.post('/api/currencies')
      .set('authorization', 'Bearer ' + token)
      .send(currency)
      .expect(200)
      .end(function (currencySaveErr, currencySaveRes) {
        // Handle Currency save error
        if (currencySaveErr) {
          return done(currencySaveErr);
        }
        currency.name = 'new Cur';
        agent.put('/api/currencies/' + currencySaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(currency)
          .expect(200)
          .end(function (currencyUpdateErr, currencyUpdateRes) {
            // Handle Currency save error
            if (currencyUpdateErr) {
              return done(currencyUpdateErr);
            }

            // Get a list of Currencies
            agent.get('/api/currencies/' + currencyUpdateRes.body._id)
              .end(function (currenciesGetErr, currenciesGetRes) {
                // Handle Currencies save error
                if (currenciesGetErr) {
                  return done(currenciesGetErr);
                }

                // Get Currencies list
                var currencies = currenciesGetRes.body;

                // Set assertions
                (currencies.user._id).should.equal(user.id);
                (currencies.name).should.match('new Cur');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to save a Currency if logged in', function (done) {
    agent.post('/api/currencies')
      .set('authorization', 'Bearer ' + token)
      .send(currency)
      .expect(200)
      .end(function (currencySaveErr, currencySaveRes) {
        // Handle Currency save error
        if (currencySaveErr) {
          return done(currencySaveErr);
        }

        agent.delete('/api/currencies/' + currencySaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(currency)
          .expect(200)
          .end(function (currencyDeleteErr, currencyDeleteRes) {
            // Handle Currency save error
            if (currencyDeleteErr) {
              return done(currencyDeleteErr);
            }

            // Get a list of Currencies
            agent.get('/api/currencies')
              .end(function (currenciesGetErr, currenciesGetRes) {
                // Handle Currencies save error
                if (currenciesGetErr) {
                  return done(currenciesGetErr);
                }

                // Get Currencies list
                var currencies = currenciesGetRes.body;

                // Set assertions
                (currencies.length).should.equal(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Currency.remove().exec(done);
    });
  });
});
