'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Addresses Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/addresses',
      permissions: '*'
    }, {
      resources: '/api/addresses/:addressId',
      permissions: '*'
    }, {
      resources: '/api/addressbyuser',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/addresses',
      permissions: ['get', 'post']
    }, {
      resources: '/api/addresses/:addressId',
      permissions: ['get']
    }, {
      resources: '/api/addressbyuser',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/addresses',
      permissions: ['get']
    }, {
      resources: '/api/addresses/:addressId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Addresses Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Address is being processed and the current user created it then allow any manipulation
  if (req.address && req.user && req.address.user && req.address.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
