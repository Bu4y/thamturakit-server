(function () {
  'use strict';

  describe('Addresses Route Tests', function () {
    // Initialize global variables
    var $scope,
      AddressesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AddressesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AddressesService = _AddressesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('addresses');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/addresses');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          AddressesController,
          mockAddress;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('addresses.view');
          $templateCache.put('modules/addresses/client/views/view-address.client.view.html', '');

          // create mock Address
          mockAddress = new AddressesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Address Name'
          });

          // Initialize Controller
          AddressesController = $controller('AddressesController as vm', {
            $scope: $scope,
            addressResolve: mockAddress
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:addressId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.addressResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            addressId: 1
          })).toEqual('/addresses/1');
        }));

        it('should attach an Address to the controller scope', function () {
          expect($scope.vm.address._id).toBe(mockAddress._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/addresses/client/views/view-address.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          AddressesController,
          mockAddress;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('addresses.create');
          $templateCache.put('modules/addresses/client/views/form-address.client.view.html', '');

          // create mock Address
          mockAddress = new AddressesService();

          // Initialize Controller
          AddressesController = $controller('AddressesController as vm', {
            $scope: $scope,
            addressResolve: mockAddress
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.addressResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/addresses/create');
        }));

        it('should attach an Address to the controller scope', function () {
          expect($scope.vm.address._id).toBe(mockAddress._id);
          expect($scope.vm.address._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/addresses/client/views/form-address.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          AddressesController,
          mockAddress;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('addresses.edit');
          $templateCache.put('modules/addresses/client/views/form-address.client.view.html', '');

          // create mock Address
          mockAddress = new AddressesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Address Name'
          });

          // Initialize Controller
          AddressesController = $controller('AddressesController as vm', {
            $scope: $scope,
            addressResolve: mockAddress
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:addressId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.addressResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            addressId: 1
          })).toEqual('/addresses/1/edit');
        }));

        it('should attach an Address to the controller scope', function () {
          expect($scope.vm.address._id).toBe(mockAddress._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/addresses/client/views/form-address.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
