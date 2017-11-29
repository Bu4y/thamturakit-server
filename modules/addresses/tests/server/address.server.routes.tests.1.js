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
  token,
  address;

/**
 * Address routes tests
 */
describe('Address CRUD tests with Token Base Authen', function () {

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
        firstname: 'amonrcat',
        lastname: 'chantd',
        address: '6/3365',
        subdistrict: 'คลองถนน',
        district: 'สายไหม',
        province: 'กรุงเทพ',
        postcode: '10220',
        tel: '054841415',
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

  it('should be able to save a address if logged in with token', function (done) {
    // Save a new address
    agent.post('/api/addresses')
      .set('authorization', 'Bearer ' + token)
      .send(address)
      .expect(200)
      .end(function (addressSaveErr, addressSaveRes) {
        // Handle address save error
        if (addressSaveErr) {
          return done(addressSaveErr);
        }
        //Get a list of addresss
        agent.get('/api/addresses')
          .end(function (addressesGetErr, addressesGetRes) {
            // Handle addresss save error
            if (addressesGetErr) {
              return done(addressesGetErr);
            }

            // Get addresss list
            var addresses = addressesGetRes.body;

            // Set assertions
            //(addresss[0].user.loginToken).should.equal(token);
            (addresses[0].firstname).should.match(address.firstname);
            // (addresses[0].location.lat).should.not.match(undefined);
            // (addresses[0].location.lng).should.not.match(undefined);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to update a address if logged in with token', function (done) {
    // Save a new address
    agent.post('/api/addresses')
      .set('authorization', 'Bearer ' + token)
      .send(address)
      .expect(200)
      .end(function (addressSaveErr, addressSaveRes) {
        // Handle address save error
        if (addressSaveErr) {
          return done(addressSaveErr);
        }
        //Get a list of addresss
        address.firstname = "test address";
        agent.put('/api/addresses/' + addressSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(address)
          .expect(200)
          .end(function (addressesGetErr, addressesGetRes) {
            // Handle addresss save error
            if (addressesGetErr) {
              return done(addressesGetErr);
            }
            agent.get('/api/addresses')
              .end(function (addressesGetErr, addressesGetRes) {
                // Handle addresss save error
                if (addressesGetErr) {
                  return done(addressesGetErr);
                }

                // Get addresss list
                var addresses = addressesGetRes.body;

                // Set assertions
                //(addresss[0].user.loginToken).should.equal(token);
                (addresses[0].firstname).should.match('test address');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a address if logged in with token', function (done) {
    // Save a new address
    agent.post('/api/addresses')
      .set('authorization', 'Bearer ' + token)
      .send(address)
      .expect(200)
      .end(function (addressSaveErr, addressSaveRes) {
        // Handle address save error
        if (addressSaveErr) {
          return done(addressSaveErr);
        }
        agent.get('/api/addresses')
          .end(function (addressngsGetErr, addressngsGetRes) {
            // Handle addresss save error
            if (addressngsGetErr) {
              return done(addressngsGetErr);
            }
            var addresss = addressngsGetRes.body;

            (addresss.length).should.match(1);
            // (addresss[0].name).should.match(address.name);

            agent.delete('/api/addresses/' + addressSaveRes.body._id)
              .set('authorization', 'Bearer ' + token)
              .send(address)
              .expect(200)
              .end(function (addressUpdateErr, addressUpdateRes) {
                // Handle address save error
                if (addressUpdateErr) {
                  return done(addressUpdateErr);
                }
                // Get a list of addresss
                agent.get('/api/addresses')
                  .end(function (addresssGetErr, addresssGetRes) {
                    // Handle addresss save error
                    if (addresssGetErr) {
                      return done(addresssGetErr);
                    }

                    // Get addresss list
                    var addresss = addresssGetRes.body;

                    // Set assertions
                    (addresss.length).should.match(0);
                    // Call the assertion callback
                    done();
                  });
              });
          });
      });
  });

  it('should be able to get List a address if logged in with token', function (done) {
    // Save a new address
    agent.post('/api/addresses')
      .set('authorization', 'Bearer ' + token)
      .send(address)
      .expect(200)
      .end(function (addressSaveErr, addressSaveRes) {
        // Handle address save error
        if (addressSaveErr) {
          return done(addressSaveErr);
        }

        // Get a list of addresss
        agent.get('/api/addresses')
          .end(function (addresssGetErr, addresssGetRes) {
            // Handle addresss save error
            if (addresssGetErr) {
              return done(addresssGetErr);
            }

            // Get addresss list
            var addresss = addresssGetRes.body;

            // Set assertions
            (addresss.length).should.match(1);
            (addresss[0].firstname).should.match(address.firstname);
            (addresss[0].lastname).should.match(address.lastname);
            (addresss[0].address).should.match(address.address);
            (addresss[0].subdistrict).should.match(address.subdistrict);
            (addresss[0].district).should.match(address.district);
            (addresss[0].province).should.match(address.province);
            (addresss[0].postcode).should.match(address.postcode);
            (addresss[0].tel).should.match(address.tel);


            done();
          });
      });
  });

  it('should be able to get By ID a address if logged in with token', function (done) {
    // Save a new address
    agent.post('/api/addresses')
      .set('authorization', 'Bearer ' + token)
      .send(address)
      .expect(200)
      .end(function (addressSaveErr, addressSaveRes) {
        // Handle address save error
        if (addressSaveErr) {
          return done(addressSaveErr);
        }

        agent.get('/api/addresses/' + addressSaveRes.body._id)
          .send(address)
          .expect(200)
          .end(function (addressGetErr, addresssGetRes) {
            // Handle address save error
            if (addressGetErr) {
              return done(addressGetErr);
            }
            // Get addresss list
            var addresss = addresssGetRes.body;

            // Set assertions
            (addresss.firstname).should.match(address.firstname);
            (addresss.lastname).should.match(address.lastname);
            (addresss.address).should.match(address.address);
            (addresss.subdistrict).should.match(address.subdistrict);
            (addresss.district).should.match(address.district);
            (addresss.province).should.match(address.province);
            (addresss.postcode).should.match(address.postcode);
            (addresss.tel).should.match(address.tel);
            done();
          });
      });
  });

  it('should be able to get a address by user if logged in with token', function (done) {
    // Save a new address
    var addressObj = new Address(address);
    var addressObj2 = new Address(address);
    addressObj.user = user;
    addressObj.save();
    addressObj2.save();
    agent.get('/api/addressbyuser')
      .set('authorization', 'Bearer ' + token)
      .end(function (addressGetErr, addresssGetRes) {
        // Handle address save error
        if (addressGetErr) {
          return done(addressGetErr);
        }
        // Get addresss list
        var addresss = addresssGetRes.body;

        // Set assertions
        (addresss.address.length).should.match(1);
        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Address.remove().exec(done);
    });
  });
});
