(function () {
  'use strict';

  angular
    .module('payments')
    .controller('PaymentsListController', PaymentsListController);

  PaymentsListController.$inject = ['PaymentsService'];

  function PaymentsListController(PaymentsService) {
    var vm = this;

    vm.payments = PaymentsService.query();
  }
}());
