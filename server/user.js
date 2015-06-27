var express = require('express');

var router = express.Router();

module.exports = function(connection) {

  router.get('/current', function(request, response) {
    connection.execute('select * from users where id=? limit 1',
      [request.user.id], function(error, rows)
    {
      if (error) {
        response.json({type: 'error', error: error});
      } else if (rows.length == 0) {
        response.json({type: 'error', error: {message: 'Invalid user'}});
      } else {
        response.json({type: 'success', user: rows[0]});
      }
    });
  });

  return router;

};
