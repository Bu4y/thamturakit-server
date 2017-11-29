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
var app, agent, credentials, user, _user, admin, token;

/**
 * User routes tests
 */
describe('User Update Pushnotification have Token', function () {

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
    _user = {
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      tel: '22222'
    };

    user = new User(_user);

    // Save a user to the test db and create new article
    user.save(function (err) {
      should.not.exist(err);
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

  it('add pushnoti', function (done) {
    var data = {
      id: '1'
    };
    agent.put('/api/user/notification')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (notiErr, notiRes) {
        // Handle signin error
        if (notiErr) {
          return done(notiErr);
        }
        var userss = notiRes.body;
        (userss.pushnotifications.length).should.match(1);

        done();
      });
  });

  it('checkuser with tel', function (done) {
    var data = { tel: '22223' };
    agent.post('/api/auth/checkuserbytel')
      .send(data)
      .expect(200)
      .end(function (notiErr, notiRes) {
        // Handle signin error
        if (notiErr) {
          return done(notiErr);
        }
        var userss = notiRes.body;
        (userss).should.match(false);

        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(done);
  });
});
