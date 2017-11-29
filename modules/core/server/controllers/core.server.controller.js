'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};

/**
 * Require login token routing middleware
 */
exports.requiresLoginToken = function (req, res, next) {
  //check for login token here
  if (!req.headers.authorization) {
    next();
  } else {
    if (req.headers.authorization.indexOf('Bearer') !== -1) {
      var loginToken = req.headers.authorization.replace('Bearer ', '');
      // query DB for the user corresponding to the token and act accordingly
      User.findOne({
        loginToken: loginToken,
        loginExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!user) {
          return res.status(401).send({
            message: 'Token is incorrect or has expired. Please login again'
          });
        }
        if (err) {
          return res.status(500).send({
            message: 'There was an internal server error processing your login token'
          });
        }

        // bind user object to request and continue
        req.user = user;
        //res.json(user);
        next();
      });
    } else {
      return res.status(500).send({
        message: 'There was an internal server error processing your login token'
      });
    }

  }
};
