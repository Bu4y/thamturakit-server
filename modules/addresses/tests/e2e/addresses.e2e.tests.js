'use strict';

describe('Addresses E2E Tests:', function () {
  describe('Test Addresses page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/addresses');
      expect(element.all(by.repeater('address in addresses')).count()).toEqual(0);
    });
  });
});
