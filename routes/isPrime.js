var express = require('express');
var router = express.Router();
const responseTime = require('response-time')
const AWS = require('aws-sdk');
const maths = require('../mathsFunctions');
const app = require('../app');

// Used for header info later.
router.use(responseTime());

router.get('/', function (req, res) {
    var query = parseInt(req.query.number);
    const s3Key = `isPrime-${query}`;
    const redisKey = `isPrime:${query}`;
    const bucketName = app.bucketName;
    const redisClient = app.redisClient;
  
    // Try the cache
    return redisClient.get(redisKey, (err, result) => {
      if (result) {
        // Serve from Cache
        console.log('serving from cache')
        const resultJSON = JSON.parse(result);
        return res.render('isPrime',{ ...resultJSON, query: query, source: 'Redis Cache' });
      } else {
        console.log('nothing in cache, checking s3')
  
        // Check S3
        const params = { Bucket: bucketName, Key: s3Key };
  
        return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
          if (result) {
            // Serve from S3
            console.log('retrieved from s3:');
            console.log(result);
            const state = JSON.parse(result.Body);
  
            // Store in Redis Cache
            console.log('storing in cache')
            redisClient.setex(redisKey, 3600, JSON.stringify({
              response: state, source: 'Redis Cache'
            }));
  
            //return res.status(200).json({ calculation: 'isPrime', query: query, response: state , source: 'S3 Storage' });
            return res.render('isPrime',{ query: query, response: state , source: 's3 Storage'})
          } else {
            // Perform calculation
            console.log('nothing in s3 performing calculation')
            state = maths.isPrime(query)
  
            // Store in S3
            const body = JSON.stringify(state);
            const objectParams = { Bucket: bucketName, Key: s3Key, Body: body };
            const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
            uploadPromise.then(function (data) {
              console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
            });
  
            // Store in Redis Cache
            console.log('Storing in cache')
            redisClient.setex(redisKey, 3600, JSON.stringify({
              response: state, source: 'Redis Cache'
            }));
            return res.render('isPrime',{query: query, response: state , source: 'server calculation'});
            //return res.status(200).json({calculation: 'isPrime', query: query, response: state , source: 'server calculation'});
          }
        });
      }
    });
  });

  module.exports = router;