/* enable envdot */
const envdot = require('dotenv');
envdot.config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');
const User = require("./model/User.js");

const passport = require('passport');
const session = require('express-session');
const initializePassport = require("./passport-config.js");

var app = express();
/* initiallise passport and session */

const foundUserByName = async (username) => {
  try {
    const found = await User.findOne({username: username});
    return found;
    
  } catch (error) {
    next(error);
  }
};
const foundUserByID = async (_id) => {
  try {
    const found = await User.findById(_id);
    return found;
    
  } catch (error) {
    next(error);
  }
};

initializePassport(passport, foundUserByName, foundUserByID);
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));/* this ensures the form data can be interpreted as json */
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/* connect to mongDB */
const mongDB = "mongodb://localhost:27017/session2db";
mongoose.Promise = Promise;
mongoose.connect(mongDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error when connecting mongoDB"));

module.exports = app;
