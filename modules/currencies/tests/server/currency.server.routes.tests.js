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
  currency;

/**
 * Currency routes tests
 */
describe('Currency CRUD tests', function () {

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

      done();
    });
  });

  it('should be able to save a Currency if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Currency
        agent.post('/api/currencies')
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
                (currencies[0].user._id).should.equal(userId);
                (currencies[0].name).should.match('Currency name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Currency if not logged in', function (done) {
    agent.post('/api/currencies')
      .send(currency)
      .expect(403)
      .end(function (currencySaveErr, currencySaveRes) {
        // Call the assertion callback
        done(currencySaveErr);
      });
  });

  it('should not be able to save an Currency if no name is provided', function (done) {
    // Invalidate name field
    currency.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Currency
        agent.post('/api/currencies')
          .send(currency)
          .expect(400)
          .end(function (currencySaveErr, currencySaveRes) {
            // Set message assertion
            (currencySaveRes.body.message).should.match('Please fill Currency name');

            // Handle Currency save error
            done(currencySaveErr);
          });
      });
  });

  it('should be able to update an Currency if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Currency
        agent.post('/api/currencies')
          .send(currency)
          .expect(200)
          .end(function (currencySaveErr, currencySaveRes) {
            // Handle Currency save error
            if (currencySaveErr) {
              return done(currencySaveErr);
            }

            // Update Currency name
            currency.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Currency
            agent.put('/api/currencies/' + currencySaveRes.body._id)
              .send(currency)
              .expect(200)
              .end(function (currencyUpdateErr, currencyUpdateRes) {
                // Handle Currency update error
                if (currencyUpdateErr) {
                  return done(currencyUpdateErr);
                }

                // Set assertions
                (currencyUpdateRes.body._id).should.equal(currencySaveRes.body._id);
                (currencyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Currencies if not signed in', function (done) {
    // Create new Currency model instance
    var currencyObj = new Currency(currency);

    // Save the currency
    currencyObj.save(function () {
      // Request Currencies
      request(app).get('/api/currencies')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Currency if not signed in', function (done) {
    // Create new Currency model instance
    var currencyObj = new Currency(currency);

    // Save the Currency
    currencyObj.save(function () {
      request(app).get('/api/currencies/' + currencyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', currency.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Currency with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/currencies/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Currency is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Currency which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Currency
    request(app).get('/api/currencies/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Currency with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Currency if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Currency
        agent.post('/api/currencies')
          .send(currency)
          .expect(200)
          .end(function (currencySaveErr, currencySaveRes) {
            // Handle Currency save error
            if (currencySaveErr) {
              return done(currencySaveErr);
            }

            // Delete an existing Currency
            agent.delete('/api/currencies/' + currencySaveRes.body._id)
              .send(currency)
              .expect(200)
              .end(function (currencyDeleteErr, currencyDeleteRes) {
                // Handle currency error error
                if (currencyDeleteErr) {
                  return done(currencyDeleteErr);
                }

                // Set assertions
                (currencyDeleteRes.body._id).should.equal(currencySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Currency if not signed in', function (done) {
    // Set Currency user
    currency.user = user;

    // Create new Currency model instance
    var currencyObj = new Currency(currency);

    // Save the Currency
    currencyObj.save(function () {
      // Try deleting Currency
      request(app).delete('/api/currencies/' + currencyObj._id)
        .expect(403)
        .end(function (currencyDeleteErr, currencyDeleteRes) {
          // Set message assertion
          (currencyDeleteRes.body.message).should.match('User is not authorized');

          // Handle Currency error error
          done(currencyDeleteErr);
        });

    });
  });

  it('should be able to get a single Currency that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Currency
          agent.post('/api/currencies')
            .send(currency)
            .expect(200)
            .end(function (currencySaveErr, currencySaveRes) {
              // Handle Currency save error
              if (currencySaveErr) {
                return done(currencySaveErr);
              }

              // Set assertions on new Currency
              (currencySaveRes.body.name).should.equal(currency.name);
              should.exist(currencySaveRes.body.user);
              should.equal(currencySaveRes.body.user._id, orphanId);

              // force the Currency to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Currency
                    agent.get('/api/currencies/' + currencySaveRes.body._id)
                      .expect(200)
                      .end(function (currencyInfoErr, currencyInfoRes) {
                        // Handle Currency error
                        if (currencyInfoErr) {
                          return done(currencyInfoErr);
                        }

                        // Set assertions
                        (currencyInfoRes.body._id).should.equal(currencySaveRes.body._id);
                        (currencyInfoRes.body.name).should.equal(currency.name);
                        should.equal(currencyInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
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
