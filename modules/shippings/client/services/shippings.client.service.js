// Shippings service used to communicate Shippings REST endpoints
(function () {
  'use strict';

  angular
    .module('shippings')
    .factory('ShippingsService', ShippingsService);

  ShippingsService.$inject = ['$resource'];

  function ShippingsService($resource) {
    return $resource('api/shippings/:shippingId', {
      shippingId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
