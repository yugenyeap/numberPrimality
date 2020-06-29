// Actual math :)

function factorise(number) {

    if (isPrime(number) == true) {
      return 0;
    }
    var primes = [];
  
    for (var i = 2; i < Math.round(Math.sqrt(number)) + 1; i += 1) {
      if (number % i == 0) {
  
        primes.push([i, Math.round(number / i)]);
        //primes.push();
  
      }
    }
  
    return primes;
  }
  
  
  // This function accepts an integer input and returns true if it is prime,
  // false otherwise
  function isPrime(number) {
  
    if (number < 2) {
      return false;
    }
  
    // Checks if the number is 2 (only even prime number)
    if (number === 2) {
      return true;
  
      // Checks if number is even (but not 2)
      // Evens cannot be prime except for 2
    } else if (number % 2 == 0) {
      return false;
  
      // Only odd numbers can be prime (after 2)
    } else {
  
      // This is for efficiency
      for (var i = 3; i < Math.round(Math.sqrt(number)) + 1; i += 2) {
        if (number % i == 0) {
          return false;
        }
      }
    }
    return true;
  
  }
  
  function orderPrime(number) {
    var counter = 0;
    var iterator = 2;
    while (counter != number) {
      if (isPrime(iterator) == true) {
        counter += 1;
  
        if (counter == number) {
          return iterator
        }
      }
  
      iterator += 1;
    }
  }

  module.exports.factorise = factorise;
  module.exports.isPrime = isPrime;
  module.exports.orderPrime = orderPrime;