(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsController', PaymentsController);

  PaymentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'paymentResolve'];

  function PaymentsController ($scope, $state, $window, Authentication, payment) {
    var vm = this;

    vm.authentication = Authentication;
    vm.payment = payment;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Payment
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.payment.$remove($state.go('payments.list'));
      }
    }

    // Save Payment
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.paymentForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.payment._id) {
        vm.payment.$update(successCallback, errorCallback);
      } else {
        vm.payment.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('payments.view', {
          paymentId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
