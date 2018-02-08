/*
 * Super Dense Coding.
 * If Alice and Bob share a pair of entangled qubits, then Alice can encode two classical bits into her one entangled qubit,
 * send it to Bob, and Bob can decode it with the help of his entangled qubit.
 */

/* global require:true, console:true, exports:true, __dirname:true */

(function () {
  const jsqubits = require(`${__dirname}/../../index`).jsqubits;

  const superDense = exports.superDense = function (input) {
    let state = jsqubits('|00>').add(jsqubits('|11>')).normalize();

    console.log(`Initial Bell State: ${state}`);

    //            Alice prepares her qbit
    const alice = 1;
    if (input.charAt(0) === '1') {
      state = state.z(alice);
    }
    if (input.charAt(1) === '1') {
      state = state.x(alice);
    }

    console.log(`State after Alice prepares her qubit (the first one): ${state}`);
    //            Alice sends her qbit to Bob
    const bob = 0;
    state = state.cnot(alice, bob).hadamard(alice);

    console.log(`State after Bob receives Alice's qubit and 'decodes' it: ${state}`);
    return state.measure(jsqubits.ALL).asBitString();
  };

  //    var input = prompt("Two bit string to send", "10");
  const input = '10';
  const result = superDense(input);
  console.log(`Decoded string is: ${result}`);
}());
