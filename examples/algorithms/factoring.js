/*
 * Shor's factoring algorithm.
 * See https://cs.uwaterloo.ca/~watrous/lecture-notes/519/11.pdf
 */

import Q from '../../lib/index.js'

const jsqubits = Q
const jsqubitsmath = Q.QMath

function computeOrder(a, n) {
  var numOutBits = Math.ceil(Math.log(n) / Math.log(2));
  var numInBits = 2 * numOutBits;
  var inputRange = Math.pow(2, numInBits);
  var outputRange = Math.pow(2, numOutBits);
  var accuracyRequiredForContinuedFraction = 1 / (2 * outputRange * outputRange);
  var outBits = {
    from: 0,
    to: numOutBits - 1
  };
  var inputBits = {
    from: numOutBits,
    to: numOutBits + numInBits - 1
  };
  var f = function (x) {
    return jsqubitsmath.powerMod(a, x, n);
  };
  var f0 = f(0);

  // This function contains the actual quantum computation part of the algorithm.
  // It returns either the frequency of the function f or some integer multiple (where "frequency" is the number of times the period of f will fit into 2^numInputBits)
  function determineFrequency(f) {
    var qstate = new jsqubits.QState(numInBits + numOutBits).hadamard(inputBits);
    qstate = qstate.applyFunction(inputBits, outBits, f);
    // We do not need to measure the outBits, but it does speed up the simulation.
    qstate = qstate.measure(outBits).newState;
    return qstate.qft(inputBits)
      .measure(inputBits).result;
  }

  // Determine the period of f (i.e. find r such that f(x) = f(x+r).
  function findPeriod() {
    var bestSoFar = 1;

    for (var attempts = 0; attempts < 2 * numOutBits; attempts++) {
      // NOTE: Here we take advantage of the fact that, for Shor's algorithm, we know that f(x) = f(x+i) ONLY when i is an integer multiple of the rank r.
      if (f(bestSoFar) === f0) {
        console.log('The period of ' + a + '^x mod ' + n + ' is ' + bestSoFar);
        return bestSoFar;
      }

      var sample = determineFrequency(f);

      // Each "sample" has a high probability of being approximately equal to some integer multiple of (inputRange/r) rounded to the nearest integer.
      // So we use a continued fraction function to find r (or a divisor of r).
      var continuedFraction = jsqubitsmath.continuedFraction(sample / inputRange, accuracyRequiredForContinuedFraction);
      // The denominator is a "candidate" for being r or a divisor of r (hence we need to find the least common multiple of several of these).
      var candidateDivisor = continuedFraction.denominator;
      console.log('Candidate divisor of r: ' + candidateDivisor);
      // Reduce the chances of getting the wrong answer by ignoring obviously wrong results!
      if (candidateDivisor > 1 && candidateDivisor <= outputRange) {
        if (f(candidateDivisor) === f0) {
          console.log('This is a multiple of the rank.');
          bestSoFar = candidateDivisor;
        } else {
          var lcm = jsqubitsmath.lcm(candidateDivisor, bestSoFar);
          if (lcm <= outputRange) {
            console.log('This is a good candidate.');
            bestSoFar = lcm;
          }
        }
      }
      console.log('Least common multiple so far: ' + bestSoFar + '. Attempts: ' + attempts);
    }
    console.log('Giving up trying to find rank of ' + a + ' after ' + attempts + ' attempts.');
    return 'failed';
  }

  // Step 2: compute the period of a^x mod n
  return findPeriod();
}

const factor = function (n) {

  if (n % 2 === 0) {
    // Is even.  No need for any quantum computing!
    return 2;
  }

  var powerFactor = jsqubitsmath.powerFactor(n);
  if (powerFactor > 1) {
    // Is a power factor.  No need for anything quantum!
    return powerFactor;
  }

  for (var attempts = 0; attempts < 8; attempts++) {
    // Step 1: chose random number between 2 and n
    var randomChoice = 2 + Math.floor(Math.random() * (n - 2));
    console.log('Step 1: chose random number between 2 and ' + n + '.  Chosen: ' + randomChoice);
    var gcd = jsqubitsmath.gcd(randomChoice, n);
    if (gcd > 1) {
      // Lucky guess. n  and randomly chosen randomChoice  have a common factor = gcd
      console.log('Lucky guess.  ' + n + ' and randomly chosen ' + randomChoice + ' have a common factor = ' + gcd);
      return gcd;
    }

    var r = computeOrder(randomChoice, n);
    if (r !== 'failed' && r % 2 !== 0) {
      console.log('Need a period with an even number.  Sadly, ' + r + ' is not even.');
    } else if (r !== 'failed' && r % 2 === 0) {
      var powerMod = jsqubitsmath.powerMod(randomChoice, r / 2, n);
      var candidateFactor = jsqubitsmath.gcd(powerMod - 1, n);
      console.log('Candidate Factor computed from period = ' + candidateFactor);
      if (candidateFactor > 1 && n % candidateFactor === 0) {
        return candidateFactor;
      }
    }
    console.log('Try again.');
  }
  return 'failed';
};


var startTime = new Date();
var n = 35;
var result = factor(n);
console.log('One of the factors of ' + n + ' is ' + result);
console.log('Time taken in seconds: ' + ((new Date().getTime()) - startTime.getTime()) / 1000);
