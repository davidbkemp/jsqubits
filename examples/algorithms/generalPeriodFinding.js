/**
 * General case of the "Period Finding" problem.
 * For any function where f(x) = f(x + r), this algorithm will find r.
 * Examples are:
 *  function(x) {return x % 17;}
 *  function(x) {return 30 + Math.round(30 * Math.sin(Math.PI * x / 10));}
 *  function(x) {return (x % 17) == 0 ? 1 : 0;} // NOTE: This often fails!
 */

/* global require:true, console:true, exports:true, __dirname:true */

(function () {
  const jsqubits = require(`${__dirname}/../../index`).jsqubits;
  const jsqubitsmath = require(`${__dirname}/../../index`).jsqubitsmath;


  const findPeriod = exports.findPeriod = function (f, upperLimit) {
    // The number of qubits in the quantum circuit used as "input" and "output" bits to f are numInBits and numOutBits respectively.
    // They limit the size of r for which we can find the period to 2^numOutBits.
    const numOutBits = Math.ceil(Math.log(upperLimit) / Math.log(2));
    const numInBits = 2 * numOutBits;
    const inputRange = Math.pow(2, numInBits);
    const outputRange = Math.pow(2, numOutBits);
    const accuracyRequiredForContinuedFraction = 1 / (2 * outputRange * outputRange);
    const outBits = {from: 0, to: numOutBits - 1};
    const inputBits = {from: numOutBits, to: numOutBits + numInBits - 1};
    let attempts = 0;
    let successes = 0;
    let bestSoFar = 1;
    let bestSoFarIsAPeriod = false;
    const f0 = f(0);

    // This function contains the actual quantum computation part of the algorithm.
    // It returns either the frequency of the function f or some integer multiple (where "frequency" is the number of times the period of f will fit into 2^numInputBits)
    function determineFrequency(f) {
      let qstate = new jsqubits.QState(numInBits + numOutBits).hadamard(inputBits);
      qstate = qstate.applyFunction(inputBits, outBits, f);
      // We do not need to measure the outBits, but it does speed up the simulation.
      qstate = qstate.measure(outBits).newState;
      return qstate.qft(inputBits).measure(inputBits).result;
    }

    console.log(`Using ${numOutBits} output bits and ${numInBits} input bits`);

    // If we have had numOutBits successful "samples" then we have probably got the right answer.
    // But give up and use our best value so far if we have had too many attempts.
    while (successes < numOutBits && attempts < 2 * numOutBits) {
      const sample = determineFrequency(f);

      // Each "sample" has a high probability of being approximately equal to some integer multiple of (inputRange/r) rounded to the nearest integer.
      // So we use a continued fraction function to find r (or a divisor of r).
      const continuedFraction = jsqubitsmath.continuedFraction(sample / inputRange, accuracyRequiredForContinuedFraction);
      // The denominator is a "candidate" for being r or a divisor of r (hence we need to find the least common multiple of several of these).
      const candidateDivisor = continuedFraction.denominator;
      console.log(`Candidate divisor of r: ${candidateDivisor}`);
      // Reduce the chances of getting the wrong answer by ignoring obviously wrong results!
      if (candidateDivisor <= outputRange && candidateDivisor > 1) {
        // The period r should be the least common multiple of all of our candidate values (each is of the form k*r for random integer k).
        const lcm = jsqubitsmath.lcm(candidateDivisor, bestSoFar);
        if (lcm <= outputRange) {
          console.log('This is a good candidate.');
          bestSoFar = lcm;
          if (f(bestSoFar) === f0) bestSoFarIsAPeriod = true;
          successes++;
        } else if (!bestSoFarIsAPeriod && f(candidateDivisor) === f0) {
          // It can occasionally happen that our current best estimate of the period is a complete dead end, but we stumble across a much better one.
          console.log('This is a much better candidate');
          bestSoFar = candidateDivisor;
          bestSoFarIsAPeriod = true;
          successes++;
        }
      }
      attempts++;
      console.log(`Least common multiple: ${bestSoFar}. Attempts: ${attempts}. Good candidates: ${successes}`);
    }

    return bestSoFar;
  };

    // A function where f(x) = f(x+r) for some r (to be found).
  const f = function (x) { return x % 19; };
  // Provide a guarantee on the upper limit of the period.
  const upperLimit = 20;

  const period = findPeriod(f, upperLimit);

  if (f(0) === f(period)) {
    console.log(`The period of your function is ${period}`);
  } else {
    console.log(`Could not find period.  Best effort was: ${period}`);
  }
}());
