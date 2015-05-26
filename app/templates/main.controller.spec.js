"use strict";

describe("Main Conttroller tests", function(){
  var scope,controller;

  beforeEach(module("<%= appname %>"));

  describe("List of awesome things", function () {
    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller("MainController as main", {
        $scope: scope
      });
    }));

    it("should define more than 5 awesome things", inject(function() {
      expect(angular.isArray(scope.main.awesomeThings)).toBeTruthy();
      expect(scope.main.awesomeThings.length > 5).toBeTruthy();
    }));

    it("should have rank defined ", inject(function() {
      var rand = Math.floor((Math.random() * scope.main.awesomeThings.length));
      expect(scope.main.awesomeThings[rand].rank).toBeDefined();
    }));
  });
});
