(function () {
  'use strict';

  angular
    .module('shippings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shippings', {
        abstract: true,
        url: '/shippings',
        template: '<ui-view/>'
      })
      .state('shippings.list', {
        url: '',
        templateUrl: 'modules/shippings/client/views/list-shippings.client.view.html',
        controller: 'ShippingsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Shippings List'
        }
      })
      .state('shippings.create', {
        url: '/create',
        templateUrl: 'modules/shippings/client/views/form-shipping.client.view.html',
        controller: 'ShippingsController',
        controllerAs: 'vm',
        resolve: {
          shippingResolve: newShipping
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Shippings Create'
        }
      })
      .state('shippings.edit', {
        url: '/:shippingId/edit',
        templateUrl: 'modules/shippings/client/views/form-shipping.client.view.html',
        controller: 'ShippingsController',
        controllerAs: 'vm',
        resolve: {
          shippingResolve: getShipping
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Shipping {{ shippingResolve.name }}'
        }
      })
      .state('shippings.view', {
        url: '/:shippingId',
        templateUrl: 'modules/shippings/client/views/view-shipping.client.view.html',
        controller: 'ShippingsController',
        controllerAs: 'vm',
        resolve: {
          shippingResolve: getShipping
        },
        data: {
          pageTitle: 'Shipping {{ shippingResolve.name }}'
        }
      });
  }

  getShipping.$inject = ['$stateParams', 'ShippingsService'];

  function getShipping($stateParams, ShippingsService) {
    return ShippingsService.get({
      shippingId: $stateParams.shippingId
    }).$promise;
  }

  newShipping.$inject = ['ShippingsService'];

  function newShipping(ShippingsService) {
    return new ShippingsService();
  }
}());
