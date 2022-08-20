var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
var session = require('express-session')
const fileUpload = require('express-fileupload')

const db = require('./config/connection');
const passport = require('passport')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/public', express.static(path.resolve('./public')));
//app.use(fileUpload())
app.use(session({ secret: "key", resave: true, saveUninitialized: true, cookie: { maxAge: 600000 } }))


app.use(passport.initialize());
app.use(passport.session());


db.connect((err) => {
  if (err) console.log('Connection error' + err);
  else console.log("Database Connected to mongodb");
});

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log("error ", err.status);
  res.locals.errPage = err.status;
  //res.render('error');
  res.render('add404ERR', { layout: "loginLayout", admin: req.session.admin });
});

module.exports = app;
