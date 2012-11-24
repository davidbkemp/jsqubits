/*
 * Deutsch-Jozsa Algorithm
 * Given a function over n bits that returns 0 or 1, and is guaranteed to be either constant or balanced
 * the Deutsch-Jozsa algorithm determines whether it is constant or balanced after only one invocation of the function.
 * Returns true if the function is constant.
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global require:true, console:true, exports:true, __dirname:true */

(function () {
    "use strict";
    var jsqbits = require(__dirname + '/../lib/index').jsqbits;

    var deutschJozsa = exports.deutschJozsa = function (f) {
        var inputBits = {from: 1, to: 3};
        var result = jsqbits('|0001>')
                .hadamard(jsqbits.ALL)
                .applyFunction(inputBits, 0, f)
                .hadamard(inputBits)
                .measure(inputBits)
                .result;
        return result === 0;
    };

    function shuffle(a) {
        for (var i = 0; i < a.length; i++) {
            var j = Math.floor(Math.random() * a.length);
            var x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    var createBalancedFunction = exports.createBalancedFunction = function() {
        // Return 0 for exactly half the possible inputs and 1 for the rest.
        var nums = [0,1,2,3,4,5,6,7];
        shuffle(nums);
        return function(x) { return nums[x] < 4 ? 0 : 1; };
    };

    console.log("deutschJozsa(function(x) { return 0; }) equals " + deutschJozsa(function() { return 0; }));
    console.log("deutschJozsa(function(x) { return 1; }) equals " + deutschJozsa(function() { return 1; }));
    console.log("deutschJozsa(function(x) { return x; }) equals " + deutschJozsa(function(x) { return x; }));
    console.log("deutschJozsa(balancedFunction) equals " + deutschJozsa(createBalancedFunction()));
})();
