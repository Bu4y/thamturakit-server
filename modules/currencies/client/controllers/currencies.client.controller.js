(function () {
  'use strict';

  // Currencies controller
  angular
    .module('currencies')
    .controller('CurrenciesController', CurrenciesController);

  CurrenciesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'currencyResolve'];

  function CurrenciesController ($scope, $state, $window, Authentication, currency) {
    var vm = this;

    vm.authentication = Authentication;
    vm.currency = currency;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Currency
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.currency.$remove($state.go('currencies.list'));
      }
    }

    // Save Currency
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.currencyForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.currency._id) {
        vm.currency.$update(successCallback, errorCallback);
      } else {
        vm.currency.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('currencies.view', {
          currencyId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
