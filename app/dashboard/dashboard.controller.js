angular.module('altbry')
  .controller('dashboardController', function ($state, $scope, globalDataService, websocketFactory, localStorageService, globalFunctions, $timeout, $http) {
    var vm = this;

    // Global variables
    vm.calendarActivityList = [[]];
    vm.selectedSummary = undefined;
    vm.summaryFields = [
      {
        field: 'total_elapsed_time',
        icon: '/images/chrono.png',
        name: 'duracion',
        transform: function (value) {
          return globalFunctions.formatSeconds(value);
        },
        units: ''
      },
      {
        field: 'total_moving_time',
        icon: '/images/chrono.png',
        name: 'tiempo en mov.',
        transform: function (value) {
          return globalFunctions.formatSeconds(value);
        },
        units: ''
      },
      {
        field: 'total_distance',
        icon: '/images/distance.png',
        name: 'distancia',
        transform: function (value) {
          var dist = value / 1000;
          return Math.round(dist * 100) / 100;
        },
        units: 'Km'
      },
      {
        field: 'avg_speed',
        icon: '/images/speedavg.png',
        name: 'vel. media',
        transform: function (value) {
          var vel = value * 3.6;
          return Math.round(vel * 100) / 100;
        },
        units: 'Km/h'
      },
      {
        field: 'max_speed',
        icon: '/images/speedmax.png',
        name: 'vel. max.',
        transform: function (value) {
          var vel = value * 3.6;
          return Math.round(vel * 100) / 100;
        },
        units: 'Km/h'
      },
      {
        field: 'avg_heart_rate',
        icon: '/images/heartrate.png',
        name: 'fc media',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'max_heart_rate',
        icon: '/images/heartrate.png',
        name: 'fc max.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'avg_cadence',
        icon: '',
        name: 'cadencia med.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'avg_running_cadence',
        icon: '',
        name: 'cadencia med. mov.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'max_cadence',
        icon: '',
        name: 'cadencia max.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'max_running_cadence',
        icon: '',
        name: 'cadencia max. mov.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'avg_power',
        icon: '',
        name: 'potencia med.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'max_power',
        icon: '',
        name: 'potencia max.',
        transform: function (value) {
          return value;
        },
        units: ''
      },
      {
        field: 'total_ascent',
        icon: '/images/hillup.png',
        name: 'ascenso',
        transform: function (value) {
          return value;
        },
        units: 'm'
      },
      {
        field: 'total_descent',
        icon: '/images/hilldown.png',
        name: 'descenso',
        transform: function (value) {
          return value;
        },
        units: 'm'
      },
      {
        field: 'max_altitude',
        icon: '/images/altitudemax.png',
        name: 'altitud máx.',
        transform: function (value) {
          return Math.round(value * 100) / 100;
        },
        units: 'm'
      },
      {
        field: 'min_altitude',
        icon: '/images/altitudemin.png',
        name: 'altitud mín',
        transform: function (value) {
          return Math.round(value * 100) / 100;
        },
        units: 'm'
      },
      {
        field: 'max_temperature',
        icon: '/images/tempmax.png',
        name: 'temp. máx',
        transform: function (value) {
          return value;
        },
        units: 'ºC'
      },
      {
        field: 'min_temperature',
        icon: '/images/tempmin.png',
        name: 'temp. mín.',
        transform: function (value) {
          return value;
        },
        units: 'ºC'
      },
      {
        field: 'avg_temperature',
        icon: '/images/tempavg.png',
        name: 'temp. media',
        transform: function (value) {
          return value;
        },
        units: 'ºC'
      },
      {
        field: 'total_calories',
        icon: '/images/calories.png',
        name: 'calorías',
        transform: function (value) {
          return value;
        },
        units: 'Kcal'
      }
      // 'uphill_time',
      // 'uphill_dist',
      // 'uphill_avg_speed',
      // 'uphill_grade',
      // 'uphill_avg_bpm',
      // 'uphill_avg_rpm',
      // 'downhill_time',
      // 'downhill_dist',
      // 'downhill_avg_speed',
      // 'downhill_grade',
      // 'downhill_avg_bpm',
      // 'downhill_avg_rpm'
    ];
    vm.selectedGroupDistance = '1000';
    vm.markerPosition = undefined;
    vm.selectedTab = 0;
    //<editor-fold desc="LOGIN">
    // User Logging data check
    if (localStorageService.get('userlogged')) {
      var userlogged = localStorageService.get('userlogged');
      websocketFactory.send({msg: 'connect', version: '1', support: ['1', 'pre2', 'pre1']});
      websocketFactory.send({
        msg: 'method',
        method: 'login',
        params: [{user: {email: userlogged.user}, password: {digest: userlogged.pass, algorithm: 'sha-256'}}],
        id: '2'
      });
    } else {
      $state.go('login');
    }

    // watch for bad login
    $scope.$watch(function () {
      return globalDataService.currentUser;
    }, function (newValue) {
      if (newValue !== undefined && newValue.startsWith('LOGIN_ERROR')) {
        localStorageService.remove('userlogged');
        localStorageService.remove('autologin');
        localStorageService.set('error_login', newValue);
        $state.go('login');
      } else {
        localStorageService.remove('error_login');
      }
    });
    //</editor-fold>

    // Get Activity List (for calendar)
    websocketFactory.send({msg: 'sub', id: 'cGwhAYagRg47GLiK5', name: 'activityList', 'params': []});

    //<editor-fold desc="Watchers">

    // Every received activity is pushed to calendar
    $scope.$watchCollection(function () {
      return globalDataService.activityList;
    }, function () {
      globalDataService.activityList.forEach(function (item) {
        var activity = {
          title: item.data.name,
          start: new Date(item.data.local_start_time * 1000),
          id: item.id,
          summary: item.data.summary,
          stick: true
        };
        if (!globalDataService.containsObject(activity, vm.calendarActivityList[0])) {
          vm.calendarActivityList[0].push(activity);
        }
      });
    });

    // Received activity details
    $scope.$watch(function () {
      return globalDataService.selectedActivity;
    }, function (newValue) {
      console.log('selected', globalDataService.selectedActivity);
      if (newValue !== undefined) {
        vm.loadMap();
        vm.loadMainChart();
        vm.loadHeartRateChart();
        vm.loadRhythmChart(1000);
        vm.loadIbpAnalysis();
      }
    });

    //</editor-fold>

    //<editor-fold desc="Chart Config">
    // Calendar config
    vm.calendarConfig = {
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
          today: 'hoy',
          month: 'mes',
          week: 'semana',
          day: 'día',
          list: 'lista'
        },

        eventClick: function (date) {
          vm.selectedSummary = date.summary;
          websocketFactory.send({msg: 'method', method: 'activity.detail.2', params: [date.id], id: '-1'});
        }
      }
    };

    // Map Config
    vm.mapConfig = {
      center: undefined,
      routePoints: []
    };

    // Main Chart Config
    vm.mainAnalysisChartConfig = {
      credits: {
        enabled: false
      },
      chart: {
        zoomType: 'xy'
      },
      title: {
        text: ''
      },
      xAxis: {
        tickInterval: 50,
        allowDecimals: true,
        categories: []
      },
      yAxis: [
        {
          title: {
            text: 'Altura'
          },
          labels: {
            format: '{value} m'
          },
          opposite: false
        },
        {
          title: {
            text: 'Frecuencia Cardiaca'
          },
          labels: {
            format: '{value} bmp'
          },
          opposite: true
        },
        {
          title: {
            text: 'Velocidad'
          },
          labels: {
            format: '{value} Km/h'
          },
          opposite: true
        }
      ],
      tooltip: {
        shared: true
      },
      plotOptions: {
        series: {
          point: {
            events: {
              mouseOver: function () {
                var pos = vm.mapConfig.routePoints[this.index];
                if (pos !== undefined) {
                  vm.markerPosition = pos[0] + ',' + pos[1];
                  vm.mapConfig.center =pos[0] + ',' + pos[1];
                  $scope.$apply();
                }
              }
            }
          }
        }
      },
      series: [
        {
          type: 'area',
          name: 'Altura',
          data: [],
          tooltip: {
            valueSuffix: ' m'
          }
        },
        {
          yAxis: 1,
          type: 'line',
          name: 'Ritmo cardíaco',
          data: [],
          tooltip: {
            valueSuffix: ' bmp'
          }
        },
        {
          yAxis: 2,
          type: 'line',
          name: 'Velocidad',
          data: [],
          tooltip: {
            valueSuffix: ' Km/h'
          }
        }
      ]
    };

    //Heartrate Config
    vm.heartRateChartConfig = {
      credits: {
        enabled: false
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Ritmo Cardíaco'
      },
      tooltip: {
        // pointFormat: '<b>{point.percentage:.1f}%</b>'
        pointFormatter: function () {
          var time = vm.selectedSummary.total_elapsed_time;
          time = Math.round(time * (this.percentage)) / 100;
          time = globalFunctions.formatSeconds(time);

          return 'Porcentaje: <b>' + Math.round(this.percentage * 100) / 100 + '</b><br>' +
            'Tiempo: <b>' + time + '</b>';
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [
        {
          name: 'Frecuencia cardíaca',
          colorByPoint: true,
          data: [
            {name: 'Zona 1', y: null, color: '#ffa8a3'},
            {name: 'Zona 2', y: null, color: '#f77d76'},
            {name: 'Zona 3', y: null, color: '#ef554c'},
            {name: 'Zona 4', y: null, color: '#e72f25'},
            {name: 'Zona 5', y: null, color: '#a80c00'}
          ]

        }]
    };

    vm.rhythmChartConfig = {
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      xAxis: {
        // tickInterval: 50,
        allowDecimals: true,
        categories: [],
        labels: {
          formatter: function () {
            if (this.isLast === true) {
              return '<' + (this.value + 1) * (vm.selectedGroupDistance / 1000) + ' Km';
            }
            return (this.value + 1) * (vm.selectedGroupDistance / 1000) + ' Km';
          }
        }
      },
      yAxis: [
        {
          title: {
            text: 'Tiempo'
          },
          labels: {
            formatter: function () {
              return globalFunctions.formatSeconds(this.value);
            }
          }
        }
      ],
      tooltip: {
        formatter: function () {
          var time = globalFunctions.formatSeconds(this.y);
          var speed = 1 / ( ((this.y / vm.selectedGroupDistance) / 3600) * 1000);
          speed = Math.round(speed * 100) / 100;

          return 'Tiempo: <b>' + time + '</b><br>' +
            'Velocidad: <b>' + speed + ' Km/h</b>';
        }
      },
      series: [
        {
          type: 'column',
          name: 'Ritmo',
          data: []
        }
      ]
    };

    //</editor-fold>

    vm.changedTab = changedTab;
    vm.fieldFilter = fieldFilter;
    vm.loadMap = loadMap;
    vm.loadMainChart = loadMainChart;
    vm.loadHeartRateChart = loadHeartRateChart;
    vm.loadRhythmChart = loadRhythmChart;
    vm.loadIbpAnalysis = loadIbpAnalysis;

    //<editor-fold desc="Public Functions">
    function changedTab() {
      if (typeof vm.rhythmChartConfig.getChartObj === 'function') {
        $timeout(function () {
          vm.rhythmChartConfig.getChartObj().reflow();
        }, 50);
      }
    }

    function fieldFilter(item) {
      return item.transform(vm.selectedSummary[item.field]) !== 0;
    }

    function loadMap() {
      var totalSamples = globalDataService.selectedActivity.result.samples.length;
      var indexCenter = Math.round(totalSamples / 2);
      var initialLat = undefined;
      var initialLng = undefined;
      while (initialLat === undefined && indexCenter < totalSamples) {
        initialLat = globalDataService.selectedActivity.result.samples[indexCenter].position_lat;
        initialLng = globalDataService.selectedActivity.result.samples[indexCenter].position_long;
        vm.mapConfig.center = initialLat + ', ' + initialLng;
        indexCenter++;
      }
      vm.mapConfig.routePoints = [];
      var points = [];
      globalDataService.selectedActivity.result.samples.forEach(function (item) {
        if (item.hasOwnProperty('position_lat')) {
          points.push([item.position_lat, item.position_long]);
        }
      });
      vm.mapConfig.routePoints = points;
    }

    function loadMainChart() {
      var altitude = [];
      var hr = [];
      var speed = [];
      var xaxis = [];

      var startTime = globalDataService.selectedActivity.result.samples[0].timestamp;

      globalDataService.selectedActivity.result.samples.forEach(function (item, index) {

        var time = item.timestamp - startTime;
        xaxis.push(globalFunctions.formatSeconds(time));
        // Add altitude to chart
        if (item.hasOwnProperty('altitude')) {
          altitude.push(Math.round(item.altitude * 100) / 100);
        } else {
          var alt = altitude[index - 1];
          if (alt === undefined) {
            alt = 0;
          }
          altitude.push(alt);
        }
        // Add HeartRate to chart
        if (item.hasOwnProperty('heart_rate')) {
          hr.push(item.heart_rate);
        } else {
          var ahr = hr[index - 1];
          if (ahr === undefined) {
            ahr = 0;
          }
          hr.push(ahr);
        }
        // Add speed to chart
        if (item.hasOwnProperty('speed')) {
          speed.push(Math.round((item.speed * 3.6) * 100) / 100);
        } else {
          var aspeed = speed[index - 1];
          if (aspeed === undefined) {
            aspeed = 0;
          }
          speed.push(aspeed);
        }
      });
      vm.mainAnalysisChartConfig.xAxis.categories = xaxis;
      vm.mainAnalysisChartConfig.series[0].data = altitude;
      vm.mainAnalysisChartConfig.series[1].data = hr;
      vm.mainAnalysisChartConfig.series[2].data = speed;


    }

    function loadHeartRateChart() {
      var zones = {
        zone1: [],
        zone2: [],
        zone3: [],
        zone4: [],
        zone5: []
      };

      var maxHR = globalDataService.selectedActivity.result.vendor.performance.mhr;
      var count = 0;

      globalDataService.selectedActivity.result.samples.forEach(function (item) {
        if (item.hasOwnProperty('heart_rate')) {
          var hr = item.heart_rate;
          count++;
          var hrPrcent = (hr / maxHR) * 100;
          if (hrPrcent < 60) {
            zones.zone1.push(hr);
          } else if (hrPrcent >= 60 && hrPrcent < 70) {
            zones.zone2.push(hr);
          } else if (hrPrcent >= 70 && hrPrcent < 80) {
            zones.zone3.push(hr);
          } else if (hrPrcent >= 80 && hrPrcent < 90) {
            zones.zone4.push(hr);
          } else if (hrPrcent >= 90 && hrPrcent < 110) {
            zones.zone5.push(hr);
          }
        }
      });
      vm.heartRateChartConfig.series[0].data[0].y = Math.round(((zones.zone1.length / count) * 100) * 100) / 100;
      vm.heartRateChartConfig.series[0].data[1].y = Math.round(((zones.zone2.length / count) * 100) * 100) / 100;
      vm.heartRateChartConfig.series[0].data[2].y = Math.round(((zones.zone3.length / count) * 100) * 100) / 100;
      vm.heartRateChartConfig.series[0].data[3].y = Math.round(((zones.zone4.length / count) * 100) * 100) / 100;
      vm.heartRateChartConfig.series[0].data[4].y = Math.round(((zones.zone5.length / count) * 100) * 100) / 100;

    }

    function loadRhythmChart(distanceGroup) {
      var previousPoint = null;
      var rythms = [];
      globalDataService.selectedActivity.result.samples.forEach(function (item) {
        if (!item.hasOwnProperty('distance')) {
          return;
        }

        if (previousPoint === null) {
          previousPoint = item;
        } else {
          if (item.distance - previousPoint.distance >= distanceGroup) {
            rythms.push(item.timestamp - previousPoint.timestamp);
            previousPoint = null;
          }
        }
      });

      var lastItem = globalDataService.selectedActivity.result.samples[globalDataService.selectedActivity.result.samples.length - 1];
      rythms.push(lastItem.timestamp - previousPoint.timestamp);
      vm.rhythmChartConfig.series[0].data = rythms;
    }

    function loadIbpAnalysis() {

      var gpx = '<?xml version="1.0" encoding="UTF-8"?><gpx creator="AlBryGPX" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">';

      var date = new Date(null);
      date.setSeconds(globalDataService.selectedActivity.result.local_start_time);
      gpx += '<metadata><time>' + date.toISOString() + '</time></metadata>';
      gpx += '<trk><name>Ride</name><trkseg>';
      globalDataService.selectedActivity.result.samples.forEach(function (item) {

        var pointDate = new Date(null);
        pointDate.setSeconds(item.timestamp);

        gpx += '<trkpt lat="' + item.position_lat + '" lon="' + item.position_long + '">' +
          '<ele>' + item.altitude + '</ele>' +
          '<time>' + pointDate.toISOString() + '</time>' +
          '<extensions>' +
          '<gpxtpx:TrackPointExtension>' +
          '<gpxtpx:atemp>' + item.temperature + '</gpxtpx:atemp>' +
          '<gpxtpx:hr>' + item.heart_rate + '</gpxtpx:hr>' +
          '</gpxtpx:TrackPointExtension>' +
          '</extensions>' +
          '</trkpt>';
      });

      gpx += '</trkseg></trk></gpx>';


      var fd = new FormData();
      var blob = new Blob([gpx], {type: 'text/xml'});
      var file = new File([blob], 'ride.gpx');
      fd.append('file', file);
      fd.append('key', '####');

      $http.post('http://www.ibpindex.com/api/', fd, {
        headers: {'Content-Type': undefined}
      }).then(function (response) {
        console.log(response);
      }, function (response) {
        console.log('ERROR', response);
      });
    }

    //</editor-fold>

  });

