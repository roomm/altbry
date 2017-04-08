angular.module('altbry')
  .factory('globalDataService', function () {

    var globalData = {};

    globalData.currentUser = undefined;
    globalData.activityList = [];
    globalData.selectedActivity = undefined;

    globalData.setData = function (data) {
      globalData.activityList = data;
    };

    globalData.addData = function (data) {
      globalData.activityList.push(data);
    };

    globalData.clearData = function () {
      globalData.activityList = undefined;
    };

    globalData.containsObject = function (obj, list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
          return true;
        }
      }
      return false;
    };

    return globalData;
  });
