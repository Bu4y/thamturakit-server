// Currencies service used to communicate Currencies REST endpoints
(function () {
  'use strict';

  angular
    .module('currencies')
    .factory('CurrenciesService', CurrenciesService);

  CurrenciesService.$inject = ['$resource'];

  function CurrenciesService($resource) {
    return $resource('api/currencies/:currencyId', {
      currencyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
