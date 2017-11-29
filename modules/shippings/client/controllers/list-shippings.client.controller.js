(function () {
  'use strict';

  angular
    .module('shippings')
    .controller('ShippingsListController', ShippingsListController);

  ShippingsListController.$inject = ['ShippingsService'];

  function ShippingsListController(ShippingsService) {
    var vm = this;

    vm.shippings = ShippingsService.query();
  }
}());
