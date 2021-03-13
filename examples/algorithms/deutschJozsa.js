/*
 * Deutsch-Jozsa Algorithm
 * Given a function over n bits that returns 0 or 1, and is guaranteed to be either constant or balanced
 * the Deutsch-Jozsa algorithm determines whether it is constant or balanced after only one invocation of the function.
 * Returns true if the function is constant.
 */

import Q from '../../lib/index.js'

const jsqubits = Q

export function deutschJozsa(f) {
  const inputBits = {
    from: 1,
    to: 3
  };
  const result = jsqubits('|0001>')
    .hadamard(jsqubits.ALL)
    .applyFunction(inputBits, 0, f)
    .hadamard(inputBits)
    .measure(inputBits)
    .result;
  return result === 0;
};

function shuffle(a) {
  for (let i = 0; i < a.length; i++) {
    const j = Math.floor(Math.random() * a.length);
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

export function createBalancedFunction() {
  // Return 0 for exactly half the possible inputs and 1 for the rest.
  const nums = [0, 1, 2, 3, 4, 5, 6, 7];
  shuffle(nums);
  return function (x) {
    return nums[x] < 4 ? 0 : 1;
  };
};

console.log(`deutschJozsa(function(x) { return 0; }) equals ${deutschJozsa(() => {
  return 0;
})}`);
console.log(`deutschJozsa(function(x) { return 1; }) equals ${deutschJozsa(() => {
  return 1;
})}`);
console.log(`deutschJozsa(function(x) { return x; }) equals ${deutschJozsa((x) => {
  return x;
})}`);
console.log(`deutschJozsa(balancedFunction) equals ${deutschJozsa(createBalancedFunction())}`);
