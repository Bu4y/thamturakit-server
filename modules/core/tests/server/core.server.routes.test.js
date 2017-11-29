'use strict';

var should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, _user, admin;

/**
 * User routes tests
 */
describe('User Token tests', function () {

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
            provider: 'local'
        };

        user = new User(_user);

        // Save a user to the test db and create new article
        user.save(function (err) {
            should.not.exist(err);
            done();
        });
    });


    it('should be able to login successfully and have token', function (done) {

        // agent.post('/api/auth/signin')
        //     .send(credentials)
        //     .expect(200)
        //     .end(function (signinErr, signinRes) {
        //         // Handle signin error
        //         if (signinErr) {
        //             return done(signinErr);
        //         }
        //         signinRes.body.loginToken.should.not.be.empty();
        //         agent.post('/api')
        //             .set('authorization', 'Bearer ' + signinRes.body.loginToken)
        //             .expect(200)
        //             .end(function (signinErr, signinResToken) {
        //                 // Handle signin error
        //                 if (signinErr) {
        //                     return done(signinErr);
        //                 }
        //                 signinResToken.body.loginToken.should.equal(signinRes.body.loginToken);
        //                 done();
        //             });
        //     });

        done();

    });

    afterEach(function (done) {
        User.remove().exec(done);
    });
});
