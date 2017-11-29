'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Shippings Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/shippings',
      permissions: '*'
    }, {
      resources: '/api/shippings/:shippingId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/shippings',
      permissions: ['get', 'post']
    }, {
      resources: '/api/shippings/:shippingId',
      permissions: ['get', 'put']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/shippings',
      permissions: ['get']
    }, {
      resources: '/api/shippings/:shippingId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Shippings Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Shipping is being processed and the current user created it then allow any manipulation
  if (req.shipping && req.user && req.shipping.user && req.shipping.user.id === req.user.id) {
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
