angular.module('altbry')
  .controller('navigationController', navigationController);


function navigationController($state, globalDataService, $cookieStore) {
  var vm = this;

  // vm.globalData = $cookieStore.get('globals') || {};
  // globalDataService.setData(vm.globalData);

  vm.changeState = changeState;

  function changeState(state) {
    if (globalDataService.currentUser === undefined) {
      $state.go('login');
    } else {
      $state.go(state);
    }
  }
}

