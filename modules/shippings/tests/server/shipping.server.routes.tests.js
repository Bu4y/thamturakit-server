'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shipping = mongoose.model('Shipping'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shipping;

/**
 * Shipping routes tests
 */
describe('Shipping CRUD tests', function () {

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

    // Save a user to the test db and create new Shipping
    user.save(function () {
      shipping = {
        name: 'Shipping name',
        detail:'ส่งด่วน',
        price: 300,
        duedate: 2,
      };

      done();
    });
  });

  it('should be able to save a Shipping if logged in', function (done) {
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

        // Save a new Shipping
        agent.post('/api/shippings')
          .send(shipping)
          .expect(200)
          .end(function (shippingSaveErr, shippingSaveRes) {
            // Handle Shipping save error
            if (shippingSaveErr) {
              return done(shippingSaveErr);
            }

            // Get a list of Shippings
            agent.get('/api/shippings')
              .end(function (shippingsGetErr, shippingsGetRes) {
                // Handle Shippings save error
                if (shippingsGetErr) {
                  return done(shippingsGetErr);
                }

                // Get Shippings list
                var shippings = shippingsGetRes.body;

                // Set assertions
                (shippings[0].user._id).should.equal(userId);
                (shippings[0].name).should.match('Shipping name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Shipping if not logged in', function (done) {
    agent.post('/api/shippings')
      .send(shipping)
      .expect(403)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Call the assertion callback
        done(shippingSaveErr);
      });
  });

  it('should not be able to save an Shipping if no name is provided', function (done) {
    // Invalidate name field
    shipping.name = '';

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

        // Save a new Shipping
        agent.post('/api/shippings')
          .send(shipping)
          .expect(400)
          .end(function (shippingSaveErr, shippingSaveRes) {
            // Set message assertion
            (shippingSaveRes.body.message).should.match('Please fill Shipping name');

            // Handle Shipping save error
            done(shippingSaveErr);
          });
      });
  });

  it('should be able to update an Shipping if signed in', function (done) {
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

        // Save a new Shipping
        agent.post('/api/shippings')
          .send(shipping)
          .expect(200)
          .end(function (shippingSaveErr, shippingSaveRes) {
            // Handle Shipping save error
            if (shippingSaveErr) {
              return done(shippingSaveErr);
            }

            // Update Shipping name
            shipping.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Shipping
            agent.put('/api/shippings/' + shippingSaveRes.body._id)
              .send(shipping)
              .expect(200)
              .end(function (shippingUpdateErr, shippingUpdateRes) {
                // Handle Shipping update error
                if (shippingUpdateErr) {
                  return done(shippingUpdateErr);
                }

                // Set assertions
                (shippingUpdateRes.body._id).should.equal(shippingSaveRes.body._id);
                (shippingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Shippings if not signed in', function (done) {
    // Create new Shipping model instance
    var shippingObj = new Shipping(shipping);

    // Save the shipping
    shippingObj.save(function () {
      // Request Shippings
      request(app).get('/api/shippings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Shipping if not signed in', function (done) {
    // Create new Shipping model instance
    var shippingObj = new Shipping(shipping);

    // Save the Shipping
    shippingObj.save(function () {
      request(app).get('/api/shippings/' + shippingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', shipping.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Shipping with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/shippings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Shipping is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Shipping which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Shipping
    request(app).get('/api/shippings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Shipping with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Shipping if signed in', function (done) {
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

        // Save a new Shipping
        agent.post('/api/shippings')
          .send(shipping)
          .expect(200)
          .end(function (shippingSaveErr, shippingSaveRes) {
            // Handle Shipping save error
            if (shippingSaveErr) {
              return done(shippingSaveErr);
            }

            // Delete an existing Shipping
            agent.delete('/api/shippings/' + shippingSaveRes.body._id)
              .send(shipping)
              .expect(200)
              .end(function (shippingDeleteErr, shippingDeleteRes) {
                // Handle shipping error error
                if (shippingDeleteErr) {
                  return done(shippingDeleteErr);
                }

                // Set assertions
                (shippingDeleteRes.body._id).should.equal(shippingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Shipping if not signed in', function (done) {
    // Set Shipping user
    shipping.user = user;

    // Create new Shipping model instance
    var shippingObj = new Shipping(shipping);

    // Save the Shipping
    shippingObj.save(function () {
      // Try deleting Shipping
      request(app).delete('/api/shippings/' + shippingObj._id)
        .expect(403)
        .end(function (shippingDeleteErr, shippingDeleteRes) {
          // Set message assertion
          (shippingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Shipping error error
          done(shippingDeleteErr);
        });

    });
  });

  it('should be able to get a single Shipping that has an orphaned user reference', function (done) {
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

          // Save a new Shipping
          agent.post('/api/shippings')
            .send(shipping)
            .expect(200)
            .end(function (shippingSaveErr, shippingSaveRes) {
              // Handle Shipping save error
              if (shippingSaveErr) {
                return done(shippingSaveErr);
              }

              // Set assertions on new Shipping
              (shippingSaveRes.body.name).should.equal(shipping.name);
              should.exist(shippingSaveRes.body.user);
              should.equal(shippingSaveRes.body.user._id, orphanId);

              // force the Shipping to have an orphaned user reference
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

                    // Get the Shipping
                    agent.get('/api/shippings/' + shippingSaveRes.body._id)
                      .expect(200)
                      .end(function (shippingInfoErr, shippingInfoRes) {
                        // Handle Shipping error
                        if (shippingInfoErr) {
                          return done(shippingInfoErr);
                        }

                        // Set assertions
                        (shippingInfoRes.body._id).should.equal(shippingSaveRes.body._id);
                        (shippingInfoRes.body.name).should.equal(shipping.name);
                        should.equal(shippingInfoRes.body.user, undefined);

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
      Shipping.remove().exec(done);
    });
  });
});
