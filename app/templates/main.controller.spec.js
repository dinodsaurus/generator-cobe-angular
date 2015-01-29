'use strict';

describe('Home Conttroller tests', function(){
  var scope,controller;

  beforeEach(module('<%= appname %>'));

  describe('List of awesome things', function () {
    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller('Main', {
        $scope: scope
      });
    }));

    it('should define more than 5 awesome things', inject(function() {
      expect(angular.isArray(scope.awesomeThings)).toBeTruthy();
      expect(scope.awesomeThings.length > 5).toBeTruthy();
    }));

    it('should have rank defined ', inject(function() {
      var rand = Math.floor((Math.random() * scope.awesomeThings.length));
      expect(scope.awesomeThings[rand].rank).toBeDefined();
    }));
  });
});
