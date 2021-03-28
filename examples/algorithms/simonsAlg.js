/**
 * Simon's algorithm.
 * See https://en.wikipedia.org/wiki/Simon's_algorithm
 */

import jsqubits from '../../lib/index.js'

const jsqubitsmath = jsqubits.QMath

function singleRunOfSimonsCircuit(f, numbits) {
  const inputBits = {
    from: numbits,
    to: 2 * numbits - 1
  };
  const targetBits = {
    from: 0,
    to: numbits - 1
  };
  const qbits = new jsqubits.QState(2 * numbits)
    .hadamard(inputBits)
    .applyFunction(inputBits, targetBits, f)
    .hadamard(inputBits);
  return qbits.measure(inputBits).result;
}

function findPotentialSolution(f, numBits) {
  let nullSpace = null;
  const results = [];
  let estimatedNumberOfIndependentSolutions = 0;
  for (let count = 0; count < 10 * numBits; count++) {
    const result = singleRunOfSimonsCircuit(f, numBits);
    if (results.indexOf(result) < 0) {
      results.push(result);
      estimatedNumberOfIndependentSolutions++;
      if (estimatedNumberOfIndependentSolutions === numBits - 1) {
        nullSpace = jsqubitsmath.findNullSpaceMod2(results, numBits);
        if (nullSpace.length === 1) break;
        estimatedNumberOfIndependentSolutions = numBits - nullSpace.length;
      }
    }
  }
  if (nullSpace === null) throw 'Could not find a solution';
  return nullSpace[0];
}

const simonsAlgorithm = function (f, numBits) {
  if (arguments.length !== 2) throw new Error('Must supply a function and number of bits');
  const solution = findPotentialSolution(f, numBits);
  return (f(0) === f(solution)) ? solution : 0;
};

const testFunction000 = (function () {
  const mapping = [3, 1, 4, 5, 7, 2, 0, 6];
  return function (x) {
    return mapping[x];
  };
}());

const testFunction110 = function (x) {
  const mapping = ['101', '010', '000', '110', '000', '110', '101', '010'];
  return parseInt(mapping[x], 2);
};

const testFunction011 = function (x) {
  const mapping = ['010', '110', '110', '010', '100', '110', '110', '100'];
  return parseInt(mapping[x], 2);
};

const testFunction1010 = (function () {
  const key = 0b1010;
  const mapping = [];
  const valuesUsed = [];
  for (let i = 0; i < 16; i++) {
    if (mapping[i] === undefined) {
      var value;
      for (; ;) {
        value = Math.floor(Math.random() * 16);
        if (valuesUsed.indexOf(value) < 0) break;
      }
      mapping[i] = value;
      mapping[i ^ key] = value;
      valuesUsed.push(value);
    }
  }
  return function (x) {
    return mapping[x];
  };
}());

console.log(`The special string for testFunction000 is ${simonsAlgorithm(testFunction000, 3)
  .toString(2)}`);
console.log(`The special string for testFunction011 is ${simonsAlgorithm(testFunction011, 3)
  .toString(2)}`);
console.log(`The special string for testFunction110 is ${simonsAlgorithm(testFunction110, 3)
  .toString(2)}`);
console.log(`The special string for testFunction1010 is ${simonsAlgorithm(testFunction1010, 4)
  .toString(2)}`);
