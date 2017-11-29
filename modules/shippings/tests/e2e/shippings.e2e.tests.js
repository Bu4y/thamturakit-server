'use strict';

describe('Shippings E2E Tests:', function () {
  describe('Test Shippings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shippings');
      expect(element.all(by.repeater('shipping in shippings')).count()).toEqual(0);
    });
  });
});
