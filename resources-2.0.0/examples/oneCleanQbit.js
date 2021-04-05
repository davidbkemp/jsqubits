/*
 * jqc1 is able to take a unitary function f and determine its trace in an efficient manner.
 */

function dqc1(f, n) {
  const real = traceReal(f, n);
  const imaginary = traceImaginary(f, n);
  return jsqubits.complex(real, imaginary);
}

function traceReal(f, n) {
  return traceComponent(f, n, (state) => { return state.rotateY(n, -Math.PI / 2); });
}

function traceImaginary(f, n) {
  return -traceComponent(f, n, (state) => { return state.rotateX(n, Math.PI / 2); });
}

// Find the trace of f on n qbits along one of the X or Y axis
function traceComponent(f, n, rotation) {
  const numberOfMixedStates = Math.pow(2, n);
  const numberOfSamples = 1000;
  let sum = 0;
  for (let i = 0; i < numberOfSamples; i++) {
    const amplitudes = {};
    amplitudes[Math.floor(Math.random() * numberOfMixedStates)] = jsqubits.complex(1, 0);
    let state = new jsqubits.QState(n + 1, amplitudes).hadamard(n);
    state = f(state);
    sum += rotation(state).measure(n).result * -2 + 1;
  }
  const trace = numberOfMixedStates * sum / numberOfSamples;
  return trace;
}

const identity = function (state) { return state; };
const pauli_x = function (state) { return state.controlledX(1, 0); };
const rotate_y = function (state) { return state.controlledYRotation(1, 0, Math.PI / 2); };
// dqc1(identity, 1);
dqc1(rotate_y, 1);
