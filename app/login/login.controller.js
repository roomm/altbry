angular.module('altbry')
  .controller('loginController', loginController);


function loginController($scope, $state, globalDataService, localStorageService) {
  var vm = this;
  vm.hideForm = globalDataService.currentUser !== undefined;

  vm.logout = function () {
    $state.go('logout');
  };

  vm.login = function () {
    var userLogged = {user: $scope.username, pass: sha256($scope.password)};
    localStorageService.set('userlogged', userLogged);
    $state.go('main.dashboard');
  };
}
