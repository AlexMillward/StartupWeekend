var express = require('express');

var router = express.Router();

module.exports = function(connection) {

  router.post('/add', function(request, response) {
    console.log(request.user, request.body);
    if (request.user) {
      if (request.body && request.body.hasOwnProperty('name') &&
        request.body.hasOwnProperty('start_time') &&
        request.body.hasOwnProperty('longitude') &&
        request.body.hasOwnProperty('latitude'))
      {
        connection.execute('insert into events (name, creator_id, ' +
          'start_time, longitude, latitude) values (?, ?, ?, ?, ?)',
          [request.body.name, request.user.id, request.body.start_time,
          request.body.longitude, request.body.latitude], function(error)
        {
          if (error) {
            response.json({type: 'error', error: error});
          } else {
            response.json({type: 'success'});
          }
        });
      } else {
        response.json({type: 'error', error: {message: 'Invalid parameters'}});
      }
    } else {
      response.json({type: 'error', error: {message: 'Not signed in'}});
    }
  });

  router.post('/search', function(request, response) {
    connection.execute('select * from events where (longitude > ?) and (longitude < ?)' +
      ' and (latitude > ?) and (latitude < ?) and (date(start_time) = date(now() + interval ? day))',
      [
        request.body.lowerLongitude,
        request.body.upperLongitude,
        request.body.lowerLatitude,
        request.body.upperLatitude,
        request.body.inDays
      ], function(error, rows)
    {
      if (error) {
        console.log(error);
        response.json({type: 'error', error: error});
      } else {
        response.json({type: 'success', events: rows});
      }
    });
  });

  return router;

}
