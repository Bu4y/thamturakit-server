'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User'),
    jwt = require('jsonwebtoken');

var secret = 'keepitquiet';

module.exports = function() {
    // Use local strategy
    passport.use('local', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            User.findOne({
                username: username
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }

                var tokenPayload = {
                    username: user.username,
                    loginExpires: user.loginExpires
                };

                // add token and exp date to user object
                user.loginToken = jwt.sign(tokenPayload, secret);
                user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours

                // save user object to update database
                user.save(function(err) {
                    if(err){
                        done(err);
                    } else {
                        done(null, user);
                    }
                });

            });
        }
    ));
};
