'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Address = mongoose.model('Address'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  address;

/**
 * Address routes tests
 */
describe('Address CRUD tests', function () {

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

    // Save a user to the test db and create new Address
    user.save(function () {
      address = {
        firstname:'amonrcat',
        lastname:'chantd',
        address: '6/3365',
        subdistrict: 'คลองถนน',
        district: 'สายไหม' ,
        province:'กรุงเทพ',
        postcode: '120021',
        tel: '054841415',
      };

      done();
    });
  });

  it('should be able to save a Address if logged in', function (done) {
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

        // Save a new Address
        agent.post('/api/addresses')
          .send(address)
          .expect(200)
          .end(function (addressSaveErr, addressSaveRes) {
            // Handle Address save error
            if (addressSaveErr) {
              return done(addressSaveErr);
            }

            // Get a list of Addresses
            agent.get('/api/addresses')
              .end(function (addressesGetErr, addressesGetRes) {
                // Handle Addresses save error
                if (addressesGetErr) {
                  return done(addressesGetErr);
                }

                // Get Addresses list
                var addresses = addressesGetRes.body;

                // Set assertions
                (addresses[0].user._id).should.equal(userId);
                (addresses[0].firstname).should.match('amonrcat');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Address if not logged in', function (done) {
    agent.post('/api/addresses')
      .send(address)
      .expect(403)
      .end(function (addressSaveErr, addressSaveRes) {
        // Call the assertion callback
        done(addressSaveErr);
      });
  });

  it('should not be able to save an Address if no name is provided', function (done) {
    // Invalidate name field
    address.firstname = '';

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

        // Save a new Address
        agent.post('/api/addresses')
          .send(address)
          .expect(400)
          .end(function (addressSaveErr, addressSaveRes) {
            // Set message assertion
            (addressSaveRes.body.message).should.match('Please fill Address firstname');

            // Handle Address save error
            done(addressSaveErr);
          });
      });
  });

  it('should be able to update an Address if signed in', function (done) {
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

        // Save a new Address
        agent.post('/api/addresses')
          .send(address)
          .expect(200)
          .end(function (addressSaveErr, addressSaveRes) {
            // Handle Address save error
            if (addressSaveErr) {
              return done(addressSaveErr);
            }

            // Update Address name
            address.firstname = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Address
            agent.put('/api/addresses/' + addressSaveRes.body._id)
              .send(address)
              .expect(200)
              .end(function (addressUpdateErr, addressUpdateRes) {
                // Handle Address update error
                if (addressUpdateErr) {
                  return done(addressUpdateErr);
                }

                // Set assertions
                (addressUpdateRes.body._id).should.equal(addressSaveRes.body._id);
                (addressUpdateRes.body.firstname).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Addresses if not signed in', function (done) {
    // Create new Address model instance
    var addressObj = new Address(address);

    // Save the address
    addressObj.save(function () {
      // Request Addresses
      request(app).get('/api/addresses')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Address if not signed in', function (done) {
    // Create new Address model instance
    var addressObj = new Address(address);

    // Save the Address
    addressObj.save(function () {
      request(app).get('/api/addresses/' + addressObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('firstname', address.firstname);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Address with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/addresses/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Address is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Address which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Address
    request(app).get('/api/addresses/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Address with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Address if signed in', function (done) {
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

        // Save a new Address
        agent.post('/api/addresses')
          .send(address)
          .expect(200)
          .end(function (addressSaveErr, addressSaveRes) {
            // Handle Address save error
            if (addressSaveErr) {
              return done(addressSaveErr);
            }

            // Delete an existing Address
            agent.delete('/api/addresses/' + addressSaveRes.body._id)
              .send(address)
              .expect(200)
              .end(function (addressDeleteErr, addressDeleteRes) {
                // Handle address error error
                if (addressDeleteErr) {
                  return done(addressDeleteErr);
                }

                // Set assertions
                (addressDeleteRes.body._id).should.equal(addressSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Address if not signed in', function (done) {
    // Set Address user
    address.user = user;

    // Create new Address model instance
    var addressObj = new Address(address);

    // Save the Address
    addressObj.save(function () {
      // Try deleting Address
      request(app).delete('/api/addresses/' + addressObj._id)
        .expect(403)
        .end(function (addressDeleteErr, addressDeleteRes) {
          // Set message assertion
          (addressDeleteRes.body.message).should.match('User is not authorized');

          // Handle Address error error
          done(addressDeleteErr);
        });

    });
  });

  it('should be able to get a single Address that has an orphaned user reference', function (done) {
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

          // Save a new Address
          agent.post('/api/addresses')
            .send(address)
            .expect(200)
            .end(function (addressSaveErr, addressSaveRes) {
              // Handle Address save error
              if (addressSaveErr) {
                return done(addressSaveErr);
              }

              // Set assertions on new Address
              (addressSaveRes.body.firstname).should.equal(address.firstname);
              should.exist(addressSaveRes.body.user);
              should.equal(addressSaveRes.body.user._id, orphanId);

              // force the Address to have an orphaned user reference
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

                    // Get the Address
                    agent.get('/api/addresses/' + addressSaveRes.body._id)
                      .expect(200)
                      .end(function (addressInfoErr, addressInfoRes) {
                        // Handle Address error
                        if (addressInfoErr) {
                          return done(addressInfoErr);
                        }

                        // Set assertions
                        (addressInfoRes.body._id).should.equal(addressSaveRes.body._id);
                        (addressInfoRes.body.firstname).should.equal(address.firstname);
                        should.equal(addressInfoRes.body.user, undefined);

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
      Address.remove().exec(done);
    });
  });
});
