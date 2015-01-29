'use strict';
angular.module('<%= appname %>')
.directive('ngCity', function() {
  return {
    restrict: 'A',
    template: '<div class="sparkline"><h4>Weather for {{city}}</h4></div>',
    controller: function($scope, $http) {
      $scope.city = "Zagreb";
    }
  };
});
