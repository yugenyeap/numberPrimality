var express = require('express');
var router = express.Router();
const responseTime = require('response-time')
const AWS = require('aws-sdk');
const maths = require('../mathsFunctions')
const app = require('../app');

// Used for header info later.
router.use(responseTime());

router.get('/', function (req, res) {
  var storageList =[];
  var list = req.query.list.split(",");

  list.forEach(element => {
    storageList.push(parseInt(element));
  });
  const s3Key = `batchPrime-${storageList}`;
  const redisKey = `batchPrime:${storageList}`
  const bucketName = app.bucketName;
  const redisClient = app.redisClient;

  // Try the cache
  return redisClient.get(redisKey, (err, result) => {
    if (result) {
      // Serve from Cache
      console.log('serving from cache')
      const resultJSON = JSON.parse(result);
      return res.render('batchPrime',{ ...resultJSON, query: storageList, source: 'redis cache' });
    } else {
      console.log('nothing in cache, checking s3')

      // Check S3
      const params = { Bucket: bucketName, Key: s3Key };

      return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
        if (result) {
          // Serve from S3
          console.log('retrieved from s3:');
          console.log(result);
          const primes = JSON.parse(result.Body);

          // Store in Redis Cache
          console.log('storing in cache')
          redisClient.setex(redisKey, 3600, JSON.stringify({
            query: list,response: primes, source: 'Redis Cache'
          }));

          return res.render('batchPrime',{ query: storageList, response: primes , source: 's3 storage'}); 
        } else {
          // Perform calculation
          console.log('nothing in s3 performing calculation')
          var list = req.query.list.split(",");
          console.log(list);
          var primes = [];

          for (var number in list) {
            var num = parseInt(list[number]);

            primes.push(maths.isPrime(num));
          }

          // Store in S3
          const body = JSON.stringify(primes);
          const objectParams = { Bucket: app.bucketName, Key: s3Key, Body: body };
          const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
          uploadPromise.then(function (data) {
            console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
          });

          // Store in Redis Cache
          console.log('Storing in cache')
          redisClient.setex(redisKey, 3600, JSON.stringify({
            query: list, response : primes, source: 'Redis Cache'
          }));

          return res.render('batchPrime',{ query: list, response: primes , source: 'server calculation'}); 

        }
      });
    }
  });
});

  module.exports = router;
  