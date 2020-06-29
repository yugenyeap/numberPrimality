# Number Primality
NodeJS application to be run on AWS. Tests load of a server by calculating large prime numbers and stores calculations on redis caches and s3 buckets.

# Overview
This assignment was part of a cloud computing unit where we learnt about scalability and persistence of apps using AWS. The purpose of the assignment was to deploy an application onto AWS to automatically scale up and down server instances depending on how much processing power is requested from the application. This javascript web application performs simple calculations regarding prime numbers. If large calculations are requested in the application, the AWS server would scale up it's server instances to perform the calculations faster and scale down if nothing is beign used. Furthermore any calculations entered would be stored on a local redis cache and inside of an AWS s3 bucket for persistence purposes. Therefore instead of performing a calculation that had already been done, the program will check the redis cache and s3 storage to see if calculation has already been completed.

# Notes:
Unfortuantely as I no longer have a valid AWS educate starter account, I am unable to showcase the cloud computing element of this assignment. However the relevant code is still available in this repository and documentation is in the report. Upon running npm start, if a local redis cache is active, the application will calculate and store within the cache, otherwise it will be stuck in a loop looking for a non existent cache/s3 bucket.
