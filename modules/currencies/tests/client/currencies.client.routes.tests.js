(function () {
  'use strict';

  describe('Currencies Route Tests', function () {
    // Initialize global variables
    var $scope,
      CurrenciesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CurrenciesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CurrenciesService = _CurrenciesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('currencies');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/currencies');
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
          CurrenciesController,
          mockCurrency;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('currencies.view');
          $templateCache.put('modules/currencies/client/views/view-currency.client.view.html', '');

          // create mock Currency
          mockCurrency = new CurrenciesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Currency Name'
          });

          // Initialize Controller
          CurrenciesController = $controller('CurrenciesController as vm', {
            $scope: $scope,
            currencyResolve: mockCurrency
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:currencyId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.currencyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            currencyId: 1
          })).toEqual('/currencies/1');
        }));

        it('should attach an Currency to the controller scope', function () {
          expect($scope.vm.currency._id).toBe(mockCurrency._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/currencies/client/views/view-currency.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CurrenciesController,
          mockCurrency;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('currencies.create');
          $templateCache.put('modules/currencies/client/views/form-currency.client.view.html', '');

          // create mock Currency
          mockCurrency = new CurrenciesService();

          // Initialize Controller
          CurrenciesController = $controller('CurrenciesController as vm', {
            $scope: $scope,
            currencyResolve: mockCurrency
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.currencyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/currencies/create');
        }));

        it('should attach an Currency to the controller scope', function () {
          expect($scope.vm.currency._id).toBe(mockCurrency._id);
          expect($scope.vm.currency._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/currencies/client/views/form-currency.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CurrenciesController,
          mockCurrency;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('currencies.edit');
          $templateCache.put('modules/currencies/client/views/form-currency.client.view.html', '');

          // create mock Currency
          mockCurrency = new CurrenciesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Currency Name'
          });

          // Initialize Controller
          CurrenciesController = $controller('CurrenciesController as vm', {
            $scope: $scope,
            currencyResolve: mockCurrency
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:currencyId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.currencyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            currencyId: 1
          })).toEqual('/currencies/1/edit');
        }));

        it('should attach an Currency to the controller scope', function () {
          expect($scope.vm.currency._id).toBe(mockCurrency._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/currencies/client/views/form-currency.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
