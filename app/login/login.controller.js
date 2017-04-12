angular.module('altbry')
  .controller('loginController', loginController);


function loginController($scope, $state, globalDataService, localStorageService) {
  var vm = this;
  vm.hideForm = globalDataService.currentUser !== undefined;


  if (localStorageService.get('error_login')) {
    var error = localStorageService.get('error_login');
    vm.errorLogin = error.replace('LOGIN_ERROR:', '');
  } else if (localStorageService.get('autologin') === true) {
    $state.go('main.dashboard');
  }

  vm.logout = function () {
    $state.go('logout');
  };

  vm.login = function () {
    localStorageService.remove('error_login');
    var userLogged = {user: $scope.username, pass: sha256($scope.password)};
    if ($scope.autologin) {
      localStorageService.set('autologin', true);
    } else {
      localStorageService.set('autologin', false);
    }
    localStorageService.set('userlogged', userLogged);
    $state.go('main.dashboard');
  };
}
