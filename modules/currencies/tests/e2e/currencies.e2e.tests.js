'use strict';

describe('Currencies E2E Tests:', function () {
  describe('Test Currencies page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/currencies');
      expect(element.all(by.repeater('currency in currencies')).count()).toEqual(0);
    });
  });
});
