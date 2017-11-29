(function () {
    'use strict';

    // Payments controller
    angular
        .module('payments')
        .controller('PaymentsCompleteController', PaymentsCompleteController);

    PaymentsCompleteController.$inject = ['$scope', '$state', '$window', 'Authentication', '$rootScope'];

    function PaymentsCompleteController($scope, $state, $window, Authentication, $rootScope) {
        $rootScope.isComplete = function(){
            return true;
        };
        $rootScope.isComplete();
    }
}());
