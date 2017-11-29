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
  token,
  shipping;

/**
 * Shipping routes tests
 */
describe('Shipping CRUD tests with Token Base Authen', function () {

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
        detail: 'ส่งด่วน',
        price: 300,
        duedate: 2,
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

  it('should be able to save a shipping if logged in with token', function (done) {
    // Save a new shipping
    agent.post('/api/shippings')
      .set('authorization', 'Bearer ' + token)
      .send(shipping)
      .expect(200)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Handle shipping save error
        if (shippingSaveErr) {
          return done(shippingSaveErr);
        }

        // Get a list of shippings
        agent.get('/api/shippings')
          .end(function (shippingsGetErr, shippingsGetRes) {
            // Handle shippings save error
            if (shippingsGetErr) {
              return done(shippingsGetErr);
            }

            // Get shippings list
            var shippings = shippingsGetRes.body;

            // Set assertions
            //(shippings[0].user.loginToken).should.equal(token);
            // (shippings.items[0].name).should.match('shipping name');
            (shippings[0].name).should.match('Shipping name');
            (shippings[0].detail).should.match('ส่งด่วน');


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to update a shipping if logged in with token', function (done) {
    // Save a new shipping
    agent.post('/api/shippings')
      .set('authorization', 'Bearer ' + token)
      .send(shipping)
      .expect(200)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Handle shipping save error
        if (shippingSaveErr) {
          return done(shippingSaveErr);
        }
        // var shippings = shippingSaveRes.body;
        // (shippings.name).should.equal('shipping name');
        shipping.name = "test Shipping";
        agent.put('/api/shippings/' + shippingSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shipping)
          .expect(200)
          .end(function (shippingUpdateErr, shippingUpdateRes) {
            // Handle shipping save error
            if (shippingUpdateErr) {
              return done(shippingUpdateErr);
            }

            // Get a list of shippings
            agent.get('/api/shippings')
              .end(function (shippingsGetErr, shippingsGetRes) {
                // Handle shippings save error
                if (shippingsGetErr) {
                  return done(shippingsGetErr);
                }

                // Get shippings list
                var shippings = shippingsGetRes.body;

                // Set assertions
                (shippings[0].name).should.equal('test Shipping');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a shipping if logged in with token', function (done) {
    // Save a new shipping
    agent.post('/api/shippings')
      .set('authorization', 'Bearer ' + token)
      .send(shipping)
      .expect(200)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Handle shipping save error
        if (shippingSaveErr) {
          return done(shippingSaveErr);
        }
        agent.get('/api/shippings')
          .end(function (shippi2ngsGetErr, shippi2ngsGetRes) {
            // Handle shippings save error
            if (shippi2ngsGetErr) {
              return done(shippi2ngsGetErr);
            }
            var shippings = shippi2ngsGetRes.body;

            (shippings.length).should.match(1);
            (shippings[0].name).should.match(shipping.name);

            agent.delete('/api/shippings/' + shippingSaveRes.body._id)
              .set('authorization', 'Bearer ' + token)
              .send(shipping)
              .expect(200)
              .end(function (shippingUpdateErr, shippingUpdateRes) {
                // Handle shipping save error
                if (shippingUpdateErr) {
                  return done(shippingUpdateErr);
                }
                // Get a list of shippings
                agent.get('/api/shippings')
                  .end(function (shippingsGetErr, shippingsGetRes) {
                    // Handle shippings save error
                    if (shippingsGetErr) {
                      return done(shippingsGetErr);
                    }

                    // Get shippings list
                    var shippings = shippingsGetRes.body;

                    // Set assertions
                    (shippings.length).should.match(0);
                    // Call the assertion callback
                    done();
                  });
              });
          });
      });
  });

  it('should be able to get List a shipping if logged in with token', function (done) {
    // Save a new shipping
    agent.post('/api/shippings')
      .set('authorization', 'Bearer ' + token)
      .send(shipping)
      .expect(200)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Handle shipping save error
        if (shippingSaveErr) {
          return done(shippingSaveErr);
        }

        // Get a list of shippings
        agent.get('/api/shippings')
          .end(function (shippingsGetErr, shippingsGetRes) {
            // Handle shippings save error
            if (shippingsGetErr) {
              return done(shippingsGetErr);
            }

            // Get shippings list
            var shippings = shippingsGetRes.body;

            // Set assertions
            (shippings.length).should.match(1);
            (shippings[0].name).should.match(shipping.name);
            (shippings[0].detail).should.match(shipping.detail);
            (shippings[0].duedate).should.match(shipping.duedate);
            (shippings[0].price).should.match(shipping.price);

            done();
          });
      });
  });

  it('should be able to get By ID a shipping if logged in with token', function (done) {
    // Save a new shipping
    agent.post('/api/shippings')
      .set('authorization', 'Bearer ' + token)
      .send(shipping)
      .expect(200)
      .end(function (shippingSaveErr, shippingSaveRes) {
        // Handle shipping save error
        if (shippingSaveErr) {
          return done(shippingSaveErr);
        }

        var shippingObj = shippingSaveRes.body;
        agent.get('/api/shippings/' + shippingSaveRes.body._id)
          .send(shipping)
          .expect(200)
          .end(function (shippingGetErr, shippingsGetRes) {
            // Handle shipping save error
            if (shippingGetErr) {
              return done(shippingGetErr);
            }
            // Get shippings list
            var shipping = shippingsGetRes.body;

            // Set assertions
            (shipping.name).should.match(shipping.name);
            (shipping.detail).should.match(shipping.detail);
            (shipping.duedate).should.match(shipping.duedate);
            (shipping.price).should.match(shipping.price);
            done();
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shipping.remove().exec(done);
    });
  });
});
