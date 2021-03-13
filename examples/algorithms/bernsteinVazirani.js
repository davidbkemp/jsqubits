/*
 * Bernstein-Vazirani Algorithm:
 * Given f: f(x) = x.u, determine u.
 */

import Q from '../../lib/index.js'
const jsqubits = Q

export function bernsteinVazirani(f, numbits) {
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
}

export function createHiddenStringFunction(hiddenString) {
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
}

const f = createHiddenStringFunction('01101');
console.log(`Hidden string is: ${bernsteinVazirani(f, 5)}`);
