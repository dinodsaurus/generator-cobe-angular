"use strict";
class stackList{
  constructor(){
    this.technologies = ["Angular", "SASS", "Modernizer", "Gulp"];
  }
}
angular.module("<%= appname %>")
.directive("stackList", function() {
  return {
    restrict: "A",
    template: "<ul><li ng-repeat='tech in stack.technologies'>{{tech}}</li></ul>",
    controller: stackList,
    controllerAs: "stack"
  };
});
