angular.module('altbry')
  .config(function ($httpProvider, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, localStorageServiceProvider, toastrConfig, cfpLoadingBarProvider) {
    // Add interceptors to "system"
    $httpProvider.interceptors.push('requestErrorNotifier');

    //Loading screen config
    cfpLoadingBarProvider.spinnerTemplate = '<div id="loader-wrapper"><div id="loader"></div></div>';

    // LocalStorageService configuration (https://github.com/grevory/angular-local-storage)
    //prefix to avoid overwriting any local storage variables from the rest of your app
    localStorageServiceProvider.setPrefix('altbry');

    //More info at https://github.com/Foxandxss/angular-toastr
    angular.extend(toastrConfig, {
      positionClass: 'toast-top-full-width'
    });

    $ocLazyLoadProvider.config({
      debug: false,
      events: true
    });

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'login/login.view.html',
        controller: 'loginController',
        controllerAs: 'vm',
        resolve: {
          loadMyFiles: function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              {
                name: 'altbry',
                files: [
                  'login/login.controller.js'
                ]
              }
            );
          }
        }
      })
      .state('main', {
        url: '/altbry',
        controller: 'navigationController',
        controllerAs: 'vm',
        templateUrl: 'navbar/navbar.view.html',
        resolve: {
          loadMyFiles: function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              {
                name: 'altbry',
                files: [
                  'navbar/navbar.controller.js'
                ]
              }
            );
          }
        }
      })
      .state('main.dashboard', {
        url: '/dashboard',
        templateUrl: 'dashboard/dashboard.view.html',
        controller: 'dashboardController',
        controllerAs: 'vm',
        resolve: {
          loadMyFiles: function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              {
                name: 'altbry',
                files: [
                  'dashboard/dashboard.controller.js'
                ]
              }
            );
          }
        }
      });
  });



