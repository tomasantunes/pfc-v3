var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require("mysql2");
var mysql2 = require('mysql2/promise');
var secretConfig = require('./secret-config');
var session = require('express-session');
const readerXLS = require('xlsx');
var fileUpload = require('express-fileupload');
const fs = require("fs");
const csv = require('fast-csv');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var viewsRouter = require('./routes/views');
var bpiRouter = require('./routes/bpi');
var expensesRouter = require('./routes/expenses');
var returnsRouter = require('./routes/returns');
var savingsRouter = require('./routes/savings');
var polymarketRouter = require('./routes/polymarket');
var santanderRouter = require('./routes/santander');
var revolutRouter = require('./routes/revolut');
var t212Router = require('./routes/trading212');
var coinbaseRouter = require('./routes/coinbase');
var binanceRouter = require('./routes/binance');
var estimatedDataRouter = require('./routes/estimated-data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

app.use(session({
  secret: secretConfig.SESSION_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use('/', authRouter);
app.use('/', bpiRouter);
app.use('/', expensesRouter);
app.use('/', returnsRouter);
app.use('/', savingsRouter);
app.use('/', polymarketRouter);
app.use('/', santanderRouter);
app.use('/', revolutRouter);
app.use('/', t212Router);
app.use('/', coinbaseRouter);
app.use('/', binanceRouter);
app.use('/', estimatedDataRouter);
app.use('/', indexRouter);
app.use(express.static(path.resolve(__dirname) + '/frontend/dist'));
app.use('/', viewsRouter);

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

module.exports = app;
