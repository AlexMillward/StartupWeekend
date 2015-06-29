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
    connection.execute('select * from events where (date(start_time) = date(now() + interval ? day))',
      [
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

  router.get('/attending/:id', function(request, response) {
    if (request.user) {
      connection.execute('select * from user_events where user_id=? and event_id=? limit 1',
        [request.user.id, request.params.id], function(error, rows)
      {
        if (error) {
          response.json({type: 'error'});
        } else if (rows.length == 0) {
          response.json({type: 'fail'});
        } else {
          response.json({type: 'success'});
        }
      });
    } else {
      response.json({type: 'fail'});
    }
  });

  router.get('/register_attendance/:id', function(request, response) {
    if (request.user) {
      connection.execute('insert ignore into user_events (user_id, event_id) values (?, ?)',
        [request.user.id, request.params.id], function(error)
      {
        if (error) {
          response.json({type: 'error'});
        } else {
          response.json({type: 'success'});
        }
      });
    } else {
      response.json({type: 'fail'});
    }
  });

  router.get('/timeline', function(request, response) {
    if (request.user) {
      connection.execute('select events.id, events.start_time, events.longitude, events.latitude, events.name, events.image_url ' +
        'from user_events inner join events on user_events.event_id = events.id where user_id=? order by events.start_time desc',
        [request.user.id], function(error, rows)
      {
        if (error) {
          response.json({type: 'error', error: error});
        } else {
          response.json({type: 'success', events: rows});
        }
      });
    }
  });

  return router;

}
