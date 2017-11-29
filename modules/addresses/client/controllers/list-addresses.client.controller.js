(function () {
  'use strict';

  angular
    .module('addresses')
    .controller('AddressesListController', AddressesListController);

  AddressesListController.$inject = ['AddressesService'];

  function AddressesListController(AddressesService) {
    var vm = this;

    vm.addresses = AddressesService.query();
  }
}());
