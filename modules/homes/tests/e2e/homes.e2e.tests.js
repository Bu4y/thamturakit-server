'use strict';

describe('Homes E2E Tests:', function () {
  describe('Test Homes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/homes');
      expect(element.all(by.repeater('home in homes')).count()).toEqual(0);
    });
  });
});
