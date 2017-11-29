(function () {
  'use strict';

  describe('Shippings Controller Tests', function () {
    // Initialize global variables
    var ShippingsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ShippingsService,
      mockShipping;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ShippingsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ShippingsService = _ShippingsService_;

      // create mock Shipping
      mockShipping = new ShippingsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Shipping Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Shippings controller.
      ShippingsController = $controller('ShippingsController as vm', {
        $scope: $scope,
        shippingResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleShippingPostData;

      beforeEach(function () {
        // Create a sample Shipping object
        sampleShippingPostData = new ShippingsService({
          name: 'Shipping Name'
        });

        $scope.vm.shipping = sampleShippingPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (ShippingsService) {
        // Set POST response
        $httpBackend.expectPOST('api/shippings', sampleShippingPostData).respond(mockShipping);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Shipping was created
        expect($state.go).toHaveBeenCalledWith('shippings.view', {
          shippingId: mockShipping._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/shippings', sampleShippingPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Shipping in $scope
        $scope.vm.shipping = mockShipping;
      });

      it('should update a valid Shipping', inject(function (ShippingsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/shippings\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('shippings.view', {
          shippingId: mockShipping._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (ShippingsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/shippings\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Shippings
        $scope.vm.shipping = mockShipping;
      });

      it('should delete the Shipping and redirect to Shippings', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/shippings\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('shippings.list');
      });

      it('should should not delete the Shipping and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
