angular.module('altbry')
  .factory('websocketFactory', function (globalDataService, $websocket) {

    var dataStream = $websocket('wss://active.brytonsport.com/sockjs/555/a8n4j1b9/websocket');

    function replaceAll(target, search, replacement) {
      return target.split(search).join(replacement);
    }

    function parseSend(obj) {
      var js = JSON.stringify(obj);
      js = replaceAll(js, '"', '\\"');
      return '"' + js + '"';
    }

    function parseReceivedMessage(msg) {
      if (msg.msg === 'ping') {
        dataStream.send(parseSend({msg: 'pong'}));
      } else if (msg.msg === 'connected') {
        globalDataService.currentUser = msg.session;
      } else if (msg.msg === 'added' && msg.collection === 'userActivities') {
        globalDataService.addData({id: msg.id, data: msg.fields});
      } else if (msg.msg === 'result' && msg.id === '-1') {
        globalDataService.selectedActivity = msg;
      }
    }

    dataStream.onError(function (error) {
      console.log('WS ERROR', error);
    });

    dataStream.onMessage(function (message) {

      if (message.data.length === 1) {
        return;
      }
      var clean = message.data.replace('a["', '').replace('"]', '');
      var msg = replaceAll(clean, '\\"', '"');
      try {
        parseReceivedMessage(JSON.parse(msg));
      } catch (e) {
        // console.log(e);
        // console.log(msg);
      }
    });

    return {
      send: function (msg) {
        dataStream.send(parseSend(msg));
      },
      close: function () {
        dataStream.close();
      }
    };
  });
