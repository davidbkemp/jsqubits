
/**
 * Special case of the "Period Finding" problem.
 * For any function where f(x) = f(x + r) such that r is a power of two, this algorithm will find r.
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global require:true, console:true, exports:true, __dirname:true */

(function () {
    "use strict";
    var jsqbits = require(__dirname + '/../lib/index').jsqbits;
    var jsqbitsmath = require(__dirname + '/../lib/index').jsqbitsmath;


    var findPeriod = exports.findPeriod = function(f, upperLimit) {
        // The number of qubits in the quantum circuit used as "input" and "output" bits to f are numInBits and numOutBits respectively.
        // This number determines the size of the quantum circuit.  It will have 2 * numOutBits qubits.
        // It limits the size of r for which we can find the period to 2^numOutBits.
        // For the special case where r is a power of 2, we can use the same number of input qubits as output qubits.
        var numOutBits = Math.ceil(Math.log(upperLimit)/Math.log(2));
        var numInBits = numOutBits;
        var outBits = {from: 0, to: numOutBits - 1};
        var inputBits = {from: numOutBits, to: numOutBits + numInBits - 1};
        // gcd is the greatest common divisor of all the frequency samples found so far.
        var gcd = 0;

        // This function contains the actual quantum computation part of the algorithm.
        // It returns either the frequency of the function f or some integer multiple (where "frequency" is the number of times the period of f will fit into 2^numInputBits)
        function determineFrequency(f) {
            var qstate = new jsqbits.QState(numInBits + numOutBits).hadamard(inputBits);
            qstate = qstate.applyFunction(inputBits, outBits, f);
            // We do not need to measure the outBits, but it does speed up the simulation.
            qstate = qstate.measure(outBits).newState;
            return qstate.qft(inputBits).measure(inputBits).result;
        }

    //        Do this multiple times and get the GCD.
        for (var i = 0; i < numOutBits; i ++) {
            gcd = jsqbitsmath.gcd(gcd, determineFrequency(f));
        }
        return Math.pow(2, numInBits)/gcd;
    };

//    var f = promptForFunction("Enter a function where f(x) = f(x+r) for some r that is a factor of " + Math.pow(2, numOutBits), "function(x) {return x % 16;}");
    var f = function(x) { return x % 16; };
    // Provide a guarantee on the upper limit of the period.
    var upperLimit = 32;

    console.log("The period of your function is " + findPeriod(f, upperLimit));
})();