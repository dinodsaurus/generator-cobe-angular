class UserService{
  constructor(){
    this.user = "Your favorite user!";
  }
}
angular.module("<%= appname %>").service("UserService", UserService);
