(function () {
  'use strict';

  // Addresses controller
  angular
    .module('addresses')
    .controller('AddressesController', AddressesController);

  AddressesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'addressResolve'];

  function AddressesController ($scope, $state, $window, Authentication, address) {
    var vm = this;

    vm.authentication = Authentication;
    vm.address = address;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Address
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.address.$remove($state.go('addresses.list'));
      }
    }

    // Save Address
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.addressForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.address._id) {
        vm.address.$update(successCallback, errorCallback);
      } else {
        vm.address.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('addresses.view', {
          addressId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
