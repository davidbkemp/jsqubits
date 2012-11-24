/*
 * Super Dense Coding.
 * If Alice and Bob share a pair of entangled qubits, then Alice can encode two classical bits into her one entangled qubit,
 * send it to Bob, and Bob can decode it with the help of his entangled qubit.
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global require:true, console:true, exports:true, __dirname:true */

(function () {
    "use strict";
    var jsqbits = require(__dirname + '/../lib/index').jsqbits;

    var superDense = exports.superDense = function (input) {
        var state = jsqbits('|00>').add(jsqbits('|11>')).normalize();

        console.log("Initial Bell State: " + state);

    //            Alice prepares her qbit
        var alice = 1;
        if (input.charAt(0) === '1') {
            state = state.z(alice);
        }
        if (input.charAt(1) === '1') {
            state = state.x(alice);
        }

        console.log("State after Alice prepares her qubit (the first one): " + state);
    //            Alice sends her qbit to Bob
        var bob = 0;
        state = state.cnot(alice, bob).hadamard(alice);

        console.log("State after Bob receives Alice's qubit and 'decodes' it: " + state);
        return state.measure(jsqbits.ALL).asBitString();
    };

//    var input = prompt("Two bit string to send", "10");
    var input = "10";
    var result = superDense(input);
    console.log("Decoded string is: " + result);

})();