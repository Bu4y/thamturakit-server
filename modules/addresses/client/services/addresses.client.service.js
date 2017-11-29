// Addresses service used to communicate Addresses REST endpoints
(function () {
  'use strict';

  angular
    .module('addresses')
    .factory('AddressesService', AddressesService);

  AddressesService.$inject = ['$resource'];

  function AddressesService($resource) {
    return $resource('api/addresses/:addressId', {
      addressId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
