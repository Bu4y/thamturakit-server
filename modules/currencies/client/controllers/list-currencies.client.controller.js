(function () {
  'use strict';

  angular
    .module('currencies')
    .controller('CurrenciesListController', CurrenciesListController);

  CurrenciesListController.$inject = ['CurrenciesService'];

  function CurrenciesListController(CurrenciesService) {
    var vm = this;

    vm.currencies = CurrenciesService.query();
  }
}());
