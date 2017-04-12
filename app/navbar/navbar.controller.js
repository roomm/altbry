angular.module('altbry')
  .controller('navigationController', navigationController);

function navigationController($state, globalDataService, localStorageService, websocketFactory) {
  var vm = this;

  vm.changeState = changeState;
  vm.logout = logout;

  function logout() {
    localStorageService.remove('userlogged');
    localStorageService.remove('autologin');
    websocketFactory.close();
    $state.go('login');
  }

  function changeState(state) {
    if (globalDataService.currentUser === undefined) {
      $state.go('login');
    } else {
      $state.go(state);
    }
  }
}

