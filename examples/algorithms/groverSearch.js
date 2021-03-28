/**
 * Grover's search algorithm.
 * See https://en.wikipedia.org/wiki/Grover's_algorithm
 */

import jsqubits from '../../lib/index.js'

function amplifyTargetAmplitude(qstate, f, inputBits) {
  // This is the core of Grover's algorithm. It amplifies the amplitude of the state for which f(x) = 1

  // Phase flip the target.
  qstate = qstate.applyFunction(inputBits, 0, f);
  // Reflect about the mean
  qstate = qstate.hadamard(inputBits)
    .applyFunction(inputBits, 0, function (x) {
      return x === 0 ? 1 : 0;
    })
    .hadamard(inputBits);
  return qstate;
}

function search(f, range) {
  var qstate,
    attempts,
    amplifications;
  var numBits = Math.ceil(Math.log(range) / Math.log(2));
  var inputBits = {
    from: 1,
    to: numBits
  };
  var requiredNumberOfAmplifications = Math.floor(Math.sqrt(range) * Math.PI / 4);
  var result = 0;

  for (attempts = 0; f(result) !== 1 && attempts < 6; attempts++) {
    qstate = new jsqubits.QState(numBits).tensorProduct(jsqubits('|1>'))
      .hadamard(jsqubits.ALL);
    for (amplifications = 0; amplifications < requiredNumberOfAmplifications; amplifications++) {
      qstate = amplifyTargetAmplitude(qstate, f, inputBits);
      console.log('Amplified ' + amplifications + ' times.');
    }
    result = qstate.measure(inputBits).result;
  }

  if (f(result) !== 1) {
    console.log('Giving up after ' + attempts + ' attempts');
    result = 'failed';
  }

  return result;
}

//    A function: f(x) = 1 for exactly one x, and f(x) = 0 otherwise
var range = 128;
var f = function (x) {
  return x === 97 ? 1 : 0;
};

var startTime = new Date();
var result = search(f, range);
var timeTaken = ((new Date().getTime()) - startTime.getTime()) / 1000;
console.log('The desired value is ' + result);
console.log('Time taken in seconds: ' + timeTaken);
