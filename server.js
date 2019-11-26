const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
require('./conference-connections-api/models/db');
require('./conference-connections-api/config/passport');

const routesApi = require('./conference-connections-api/routes/index');
const profileApi = require('./conference-connections-api/routes/profile');
const attendeeApi = require('./conference-connections-api/routes/attendees');



const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(passport.initialize());
app.use('/api/auth', routesApi);
app.use('/api/profile', passport.authenticate('jwt', {session:false}), profileApi);
app.use('/api/attendee', passport.authenticate('jwt', {session:false}), attendeeApi);
app.listen(8000, () => {
  console.log('Server Started!')
});

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  } else {
    res.status(404);
    res.json({
                "message": "route not found",
                "err":  err.name + ": " + err.message
              })
  }
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

module.exports = app;
