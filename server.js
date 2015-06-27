var fs = require('fs');
var mysql = require('mysql2');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'FCXysS4UjG0yW0bqy1h3', saveUninitialized: true, resave: false}));
app.use(passport.initialize());
app.use(passport.session());

var connection = mysql.createConnection({
  host: 'sw.cztpnl40s1bu.eu-west-1.rds.amazonaws.com',
  user: 'root',
  password: 'sw2015pass',
  database: 'sw',
  port: 3306,
  multipleStatements: true
});

app.use('/', express.static('public'));
app.use('/include', express.static('bower_components'));

app.use('/authenticate', require('./server/authenticate')(connection));
app.use('/users', require('./server/user')(connection));

connection.connect();

connection.query(fs.readFileSync('./schema.sql', 'utf8'), function(error) {
  if (error) {
    console.log(error);
    connection.end();
    throw error;
  }
})

var server = app.listen(3000);
