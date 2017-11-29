(function () {
  'use strict';

  angular
    .module('payments')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('payments', {
        abstract: true,
        url: '/payments',
        template: '<ui-view/>'
      })
      .state('payments.list', {
        url: '',
        templateUrl: 'modules/payments/client/views/list-payments.client.view.html',
        controller: 'PaymentsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Payments List'
        }
      })
      .state('payments.completed', {
        url: '/completed',
        templateUrl: 'modules/payments/client/views/complete-payment.client.view.html'
      })
      .state('payments.create', {
        url: '/create',
        templateUrl: 'modules/payments/client/views/form-payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        resolve: {
          paymentResolve: newPayment
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Payments Create'
        }
      })
      .state('payments.edit', {
        url: '/:paymentId/edit',
        templateUrl: 'modules/payments/client/views/form-payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        resolve: {
          paymentResolve: getPayment
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Payment {{ paymentResolve.name }}'
        }
      })
      .state('payments.view', {
        url: '/:paymentId',
        templateUrl: 'modules/payments/client/views/view-payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        resolve: {
          paymentResolve: getPayment
        },
        data: {
          pageTitle: 'Payment {{ paymentResolve.name }}'
        }
      });
  }

  getPayment.$inject = ['$stateParams', 'PaymentsService'];

  function getPayment($stateParams, PaymentsService) {
    return PaymentsService.get({
      paymentId: $stateParams.paymentId
    }).$promise;
  }

  newPayment.$inject = ['PaymentsService'];

  function newPayment(PaymentsService) {
    return new PaymentsService();
  }
}());
