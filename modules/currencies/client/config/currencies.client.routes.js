(function () {
  'use strict';

  angular
    .module('currencies')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('currencies', {
        abstract: true,
        url: '/currencies',
        template: '<ui-view/>'
      })
      .state('currencies.list', {
        url: '',
        templateUrl: 'modules/currencies/client/views/list-currencies.client.view.html',
        controller: 'CurrenciesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Currencies List'
        }
      })
      .state('currencies.create', {
        url: '/create',
        templateUrl: 'modules/currencies/client/views/form-currency.client.view.html',
        controller: 'CurrenciesController',
        controllerAs: 'vm',
        resolve: {
          currencyResolve: newCurrency
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Currencies Create'
        }
      })
      .state('currencies.edit', {
        url: '/:currencyId/edit',
        templateUrl: 'modules/currencies/client/views/form-currency.client.view.html',
        controller: 'CurrenciesController',
        controllerAs: 'vm',
        resolve: {
          currencyResolve: getCurrency
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Currency {{ currencyResolve.name }}'
        }
      })
      .state('currencies.view', {
        url: '/:currencyId',
        templateUrl: 'modules/currencies/client/views/view-currency.client.view.html',
        controller: 'CurrenciesController',
        controllerAs: 'vm',
        resolve: {
          currencyResolve: getCurrency
        },
        data: {
          pageTitle: 'Currency {{ currencyResolve.name }}'
        }
      });
  }

  getCurrency.$inject = ['$stateParams', 'CurrenciesService'];

  function getCurrency($stateParams, CurrenciesService) {
    return CurrenciesService.get({
      currencyId: $stateParams.currencyId
    }).$promise;
  }

  newCurrency.$inject = ['CurrenciesService'];

  function newCurrency(CurrenciesService) {
    return new CurrenciesService();
  }
}());
