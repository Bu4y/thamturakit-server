'use strict';
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // We are going to protect /api routes with JWT
  app.use('/api', core.requiresLoginToken);
  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);



  // Define application route
  app.route('/*').get(core.renderIndex);
};
