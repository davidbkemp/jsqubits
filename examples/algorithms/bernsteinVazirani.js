/*
 * Bernstein-Vazirani Algorithm:
 * Given f: f(x) = x.u, determine u.
 */

/* global require:true, console:true, exports:true, __dirname:true */


(function () {
  const jsqubits = require(`${__dirname}/../../index`).jsqubits;

  const bernsteinVazirani = exports.bernsteinVazirani = function (f, numbits) {
    //  Create a |-> state as the target qubit.
    const targetQubit = jsqubits('|0>').subtract(jsqubits('|1>')).normalize();
    const inputQubits = new jsqubits.QState(numbits);
    const initialState = inputQubits.tensorProduct(targetQubit);

    const inputBits = {from: 1, to: numbits};
    const targetBit = 0;
    return initialState
      .hadamard(inputBits)
      .applyFunction(inputBits, targetBit, f)
      .hadamard(inputBits)
      .measure(inputBits)
      .asBitString();
  };

  const createHiddenStringFunction = exports.createHiddenStringFunction = function (hiddenString) {
    const hiddenStringAsNumber = parseInt(hiddenString, 2);
    return function (x) {
      let product = x & hiddenStringAsNumber;
      let result = 0;
      while (product > 0) {
        if (product % 2 === 1) result++;
        product >>= 1;
      }
      return result;
    };
  };

  const f = createHiddenStringFunction('01101');
  console.log(`Hidden string is: ${bernsteinVazirani(f, 5)}`);
}());
