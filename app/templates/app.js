'use strict';
angular.module('<%= appname %>', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'js/main/views/home.html',
    controller: 'MainController'
  });

  $urlRouterProvider.otherwise('/');
})
;
