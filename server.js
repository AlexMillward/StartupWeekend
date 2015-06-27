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

var connection = mysql.createConnection({
  host: 'sw.cztpnl40s1bu.eu-west-1.rds.amazonaws.com',
  user: 'root',
  password: 'sw2015pass',
  database: 'sw',
  port: 3306
});

app.use('/', express.static('public'));
app.use('/include', express.static('bower_components'));

app.use('/authenticate', require('./server/authenticate')(connection));

connection.connect();

console.log('connected');

var server = app.listen(3000);
