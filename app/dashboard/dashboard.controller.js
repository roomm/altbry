angular.module('altbry')
  .controller('dashboardController', function ($state, $scope, globalDataService, websocketFactory, localStorageService) {
    var vm = this;

    if (localStorageService.get('userlogged')) {
      var userlogged = localStorageService.get('userlogged');
      websocketFactory.send({msg: 'connect', version: '1', support: ['1', 'pre2', 'pre1']});
      websocketFactory.send({msg: 'method', method: 'login', params: [{user: {email: userlogged.user}, password: {digest: userlogged.pass, algorithm: 'sha-256'}}], id: '2'});
    } else {
      $state.go('login');
    }

    websocketFactory.send({msg: 'sub', id: 'cGwhAYagRg47GLiK5', name: 'activityList', 'params': []});

    $scope.$watchCollection(function () {
      return globalDataService.activityList;
    }, function (newNames, oldNames) {
      globalDataService.activityList.forEach(function (item) {
        var activity = {title: item.data.name, start: new Date(item.data.local_start_time * 1000), id: item.id, stick: true};
        if (!containsObject(activity, vm.calendarActivityList[0])) {
          vm.calendarActivityList[0].push(activity);
        }
      });
    });


    $scope.$watch(function () {
      return globalDataService.selectedActivity;
    }, function (newValue, oldValue) {
      console.log('selected from controller', globalDataService.selectedActivity);
    });


    vm.calendarActivityList = [[]];

    vm.uiConfig = {
      calendar: {
        firstDay: 1,
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
        height: 450,
        editable: false,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        buttonText: {
          today:    'hoy',
          month:    'mes',
          week:     'semana',
          day:      'día',
          list:     'lista'
        },

        eventClick: eventClicked
        // eventDrop: $scope.alertOnDrop,
        // eventResize: $scope.alertOnResize,
        // eventRender: $scope.eventRender
      }
    };


    vm.eventClicked = eventClicked;


    function eventClicked(date, jsEvent, view) {
      console.log('get activity');
      websocketFactory.send({msg: 'method', method: 'activity.detail.2', params: [date.id], id: '-1'});
    }


    function containsObject(obj, list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
          return true;
        }
      }

      return false;
    }

  });
