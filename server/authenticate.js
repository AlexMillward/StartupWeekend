var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(connection) {

  var router = express.Router();

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(user, done) {
    connection.execute('select * from users where id=? limit 1', [user.id],
      function(error, rows)
    {
      if (error) {
        done(error);
      } else if (rows.length == 0) {
        done(null, false);
      } else {
        console.log(rows[0]);
        done(null, rows[0]);
      }
    });
  });

  passport.use(new FacebookStrategy({
    clientID: '1580875758829558',
    clientSecret: '9f3fd0f2a67f6041e6257cd958d59e55',
    callbackURL: '/authenticate/facebook/callback'
  }, function(accessToken, refreshToken, profile) {
    connection.execute('insert into users (id, name, accessToken) values (?, ?, ?) ' +
      'on duplicate key update id=values(id), name=values(name), accessToken=values(accessToken)',
      [profile.id, profile.displayName, accessToken], function(error)
    {
      if (error) {
        done(error);
      } else {
        done(null, {
          id: profile.id,
          name: profile.displayName,
          accessToken: accessToken
        });
      }
    });
  }));

  router.get('/facebook', passport.authenticate('facebook'));

  router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/', failureRedirect: '/'
  }));

  return router;

};
