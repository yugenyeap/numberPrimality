var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const redis = require('redis');
const AWS = require('aws-sdk');

//Routes
var indexRouter = require('./routes/index');
var isPrimeRouter = require('./routes/isPrime');
var nextPrimeRouter = require('./routes/nextPrime');
var batchPrimeRouter = require('./routes/batchPrime');
var factoriseRouter = require('./routes/factorise');
var orderPrimeRouter = require('./routes/orderPrime');

// Create unique bucket name
const bucketName = 'prime-number-buckets';

// Create a promise on S3 service object
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();

// Handle promise fulfilled/rejected states
bucketPromise.then(function (data) {
  console.log("Successfully created " + bucketName);
}).catch(function (err) {
  console.error(err, err.stack);
});

// This section will change for Cloud Services
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.log("Error " + err);
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/isPrime', isPrimeRouter);
app.use('/nextPrime', nextPrimeRouter);
app.use('/batchPrime', batchPrimeRouter);
app.use('/factorise', factoriseRouter);
app.use('/orderPrime', orderPrimeRouter);

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
exports.bucketName = bucketName;
exports.redisClient = redisClient
