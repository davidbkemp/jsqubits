/*
 * Deutsch's Algorithm.
 * Determine the value of (f(0) + f(1)) mod 2 with a single invocation of f (where f is a single bit function)
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global require:true, console:true, exports:true, __dirname:true */

(function () {
    "use strict";
    var jsqbits = require(__dirname + '/../lib/index').jsqbits;

    var deutsch = exports.deutsch = function(f) {
       return jsqbits('|01>').hadamard(jsqbits.ALL).applyFunction(1, 0, f).hadamard(jsqbits.ALL).measure(1).result;
    };

    var f = function(x) {return (x + 1) % 2;};

    console.log("(f(0) + f(1)) mod 2 = " + deutsch(f));
})();


