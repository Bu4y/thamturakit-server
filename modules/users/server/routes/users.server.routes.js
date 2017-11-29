'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller'),
    core = require('../../../core/server/controllers/core.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(core.requiresLoginToken, users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(core.requiresLoginToken, users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/user/notification').put(core.requiresLoginToken, users.notificationUser);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
