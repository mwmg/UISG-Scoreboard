var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('test:pass@ds013545.mlab.com:13545/scoreboard'); 
//locally: 127.0.0.1:27017/scoreboard
//external DB: test:pass@ds013545.mlab.com:13545/scoreboard


// Including Passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');

//Routes
var routes = require('./routes/index');
var pastevents = require('./routes/pastevents');
var liveevents = require('./routes/liveevents');
var manager = require('./routes/manager')(passport);

var app = express();
var server = require('http').Server(app);
//Socket.io
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// Make our socket.io server accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

//Configuring Passport
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

app.use('/', routes);
app.use('/pastevents', pastevents);
app.use('/live', liveevents);
app.use('/manager', manager);

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport, db);

//Start sockets for existent live events
var collection = db.get('liveevents');
  collection.find({},{},function(e,docs){
    var game = require('./game.js');
    for (var x in docs){
      game(io,db,docs[x].room);
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = {app: app, server: server}; //export both app and server
