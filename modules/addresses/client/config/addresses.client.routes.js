(function () {
  'use strict';

  angular
    .module('addresses')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('addresses', {
        abstract: true,
        url: '/addresses',
        template: '<ui-view/>'
      })
      .state('addresses.list', {
        url: '',
        templateUrl: 'modules/addresses/client/views/list-addresses.client.view.html',
        controller: 'AddressesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Addresses List'
        }
      })
      .state('addresses.create', {
        url: '/create',
        templateUrl: 'modules/addresses/client/views/form-address.client.view.html',
        controller: 'AddressesController',
        controllerAs: 'vm',
        resolve: {
          addressResolve: newAddress
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Addresses Create'
        }
      })
      .state('addresses.edit', {
        url: '/:addressId/edit',
        templateUrl: 'modules/addresses/client/views/form-address.client.view.html',
        controller: 'AddressesController',
        controllerAs: 'vm',
        resolve: {
          addressResolve: getAddress
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Address {{ addressResolve.name }}'
        }
      })
      .state('addresses.view', {
        url: '/:addressId',
        templateUrl: 'modules/addresses/client/views/view-address.client.view.html',
        controller: 'AddressesController',
        controllerAs: 'vm',
        resolve: {
          addressResolve: getAddress
        },
        data: {
          pageTitle: 'Address {{ addressResolve.name }}'
        }
      });
  }

  getAddress.$inject = ['$stateParams', 'AddressesService'];

  function getAddress($stateParams, AddressesService) {
    return AddressesService.get({
      addressId: $stateParams.addressId
    }).$promise;
  }

  newAddress.$inject = ['AddressesService'];

  function newAddress(AddressesService) {
    return new AddressesService();
  }
}());
