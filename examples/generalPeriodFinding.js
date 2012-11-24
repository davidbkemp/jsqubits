/**
 * General case of the "Period Finding" problem.
 * For any function where f(x) = f(x + r), this algorithm will find r.
 * Examples are:
 *  function(x) {return x % 17;}
 *  function(x) {return 30 + Math.round(30 * Math.sin(Math.PI * x / 10));}
 *  function(x) {return (x % 17) == 0 ? 1 : 0;} // NOTE: This often fails!
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global require:true, console:true, exports:true, __dirname:true */

(function () {
    "use strict";

    var jsqbits = require(__dirname + '/../lib/index').jsqbits;
    var jsqbitsmath = require(__dirname + '/../lib/index').jsqbitsmath;


    var findPeriod = exports.findPeriod = function(f, upperLimit) {
        // The number of qubits in the quantum circuit used as "input" and "output" bits to f are numInBits and numOutBits respectively.
        // They limit the size of r for which we can find the period to 2^numOutBits.
        var numOutBits = Math.ceil(Math.log(upperLimit)/Math.log(2));
        var numInBits = 2 * numOutBits;
        var inputRange = Math.pow(2, numInBits);
        var outputRange = Math.pow(2, numOutBits);
        var accuracyRequiredForContinuedFraction = 1/(2 * outputRange * outputRange);
        var outBits = {from: 0, to: numOutBits - 1};
        var inputBits = {from: numOutBits, to: numOutBits + numInBits - 1};
        var attempts = 0;
        var successes = 0;
        var bestSoFar = 1;
        var bestSoFarIsAPeriod = false;
        var f0 = f(0);

        // This function contains the actual quantum computation part of the algorithm.
        // It returns either the frequency of the function f or some integer multiple (where "frequency" is the number of times the period of f will fit into 2^numInputBits)
        function determineFrequency(f) {
            var qstate = new jsqbits.QState(numInBits + numOutBits).hadamard(inputBits);
            qstate = qstate.applyFunction(inputBits, outBits, f);
            // We do not need to measure the outBits, but it does speed up the simulation.
            qstate = qstate.measure(outBits).newState;
            return qstate.qft(inputBits).measure(inputBits).result;
        }

        console.log("Using " + numOutBits + " output bits and " + numInBits + " input bits");

        // If we have had numOutBits successful "samples" then we have probably got the right answer.
        // But give up and use our best value so far if we have had too many attempts.
        while(successes < numOutBits && attempts < 2 * numOutBits) {

            var sample = determineFrequency(f);

            // Each "sample" has a high probability of being approximately equal to some integer multiple of (inputRange/r) rounded to the nearest integer.
            // So we use a continued fraction function to find r (or a divisor of r).
            var continuedFraction = jsqbitsmath.continuedFraction(sample/inputRange, accuracyRequiredForContinuedFraction);
            // The denominator is a "candidate" for being r or a divisor of r (hence we need to find the least common multiple of several of these).
            var candidateDivisor = continuedFraction.denominator;
            console.log("Candidate divisor of r: " + candidateDivisor);
            // Reduce the chances of getting the wrong answer by ignoring obviously wrong results!
            if (candidateDivisor <= outputRange && candidateDivisor > 1) {
                // The period r should be the least common multiple of all of our candidate values (each is of the form k*r for random integer k).
                var lcm = jsqbitsmath.lcm(candidateDivisor, bestSoFar);
                if (lcm <= outputRange) {
                    console.log("This is a good candidate.");
                    bestSoFar = lcm;
                    if (f(bestSoFar) === f0) bestSoFarIsAPeriod = true;
                    successes++;
                } else if(!bestSoFarIsAPeriod && f(candidateDivisor) === f0) {
                    // It can occasionally happen that our current best estimate of the period is a complete dead end, but we stumble across a much better one.
                    console.log("This is a much better candidate");
                    bestSoFar = candidateDivisor;
                    bestSoFarIsAPeriod = true;
                    successes++;
                }
            }
            attempts++;
            console.log("Least common multiple: " + bestSoFar + ". Attempts: " + attempts + ". Good candidates: " + successes);
        }

        return bestSoFar;
    };

    // A function where f(x) = f(x+r) for some r (to be found).
    var f = function(x) {return x % 19;};
    // Provide a guarantee on the upper limit of the period.
    var upperLimit = 20;

    var period = findPeriod(f, upperLimit);

    if (f(0) === f(period)) {
        console.log("The period of your function is " + period);
    } else {
        console.log("Could not find period.  Best effort was: " + period);
    }

})();
