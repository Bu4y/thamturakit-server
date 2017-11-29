(function () {
  'use strict';

  // Shippings controller
  angular
    .module('shippings')
    .controller('ShippingsController', ShippingsController);

  ShippingsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shippingResolve'];

  function ShippingsController ($scope, $state, $window, Authentication, shipping) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shipping = shipping;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Shipping
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.shipping.$remove($state.go('shippings.list'));
      }
    }

    // Save Shipping
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.shippingForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.shipping._id) {
        vm.shipping.$update(successCallback, errorCallback);
      } else {
        vm.shipping.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('shippings.view', {
          shippingId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
