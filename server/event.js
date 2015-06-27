var express = require('express');

var router = express.Router();

module.exports = function(connection) {

  router.post('/add', function(request, response) {
    if (request.user) {
      connection.execute('insert into events (name, creator_id) values (?, ?)',
        [request.params.name, request.user.id], function(error)
      {
        if (error) {
          response.json({type: 'error', error: error});
        } else {
          response.json({type: 'success'});
        }
      });
    } else {
      response.json({type: 'error', error: {message: 'Not signed in'}});
    }
  });

  router.post('/search', function(request, response) {
    connection.execute('select * from events where longitude > ? and longitude < ?' +
      ' and latitude > ? and latitude < ? and date(starts) = date(now() + interval ? day)',
      [(
        request.params.lowerLongitude,
        request.params.upperLongitude,
        request.params.lowerLatitude,
        request.params.upperLatitude,
        request.params.inDays
      )], function(error, rows)
    {
      if (error) {
        response.json({type: 'error', error: error});
      } else {
        response.json({type: 'success', events: rows});
      }
    });
  });

}
