function requestErrorNotifier($q, $injector) {
  return {
    responseError: function (response) {

      var toastr = $injector.get('toastr');
      // Session has expired
      if (response.status === 401 && response.data.error_description === 'The access token provided has expired.') {
        //do nothing
      } else if (response.status === 400 && response.data.error_description === 'Invalid username and password combination') {
        toastr.error('Invalid Username and/or password!', 'Error ' + response.status, {
          closeButton: true,
          allowHtml: false,
          timeOut: 10000,
          extendedTimeOut: 10000
        });
      } else {
        toastr.error('Something went wrong... Try. If error persists contact us', response.status + ' ' + response.statusText, {
          closeButton: true,
          allowHtml: false,
          timeOut: 10000,
          extendedTimeOut: 10000
        });
      }

      return $q.reject(response);
    }
  };
}


angular.module('altbry')
  .factory('requestErrorNotifier', requestErrorNotifier);
