/*
 * jqc1 is able to take a unitary function f and determine its trace in an efficient manner.
 */

function dqc1(f, n) {
    var real = traceReal(f, n);
    var imaginary = traceImaginary(f, n);
    return jsqbits.complex(real, imaginary);
}

function traceReal(f, n) {
    return traceComponent(f, n, function(state){return state.rotateY(n, -Math.PI/2);});
}

function traceImaginary(f, n) {
    return -traceComponent(f, n, function(state){return state.rotateX(n, Math.PI/2);});
}

// Find the trace of f on n qbits along one of the X or Y axis
function traceComponent(f, n, rotation) {
    var numberOfMixedStates = Math.pow(2, n);
    var numberOfSamples = 1000;
    var sum = 0;
    for (var i = 0; i < numberOfSamples; i++) {
        var amplitudes = {};
        amplitudes[Math.floor(Math.random() * numberOfMixedStates)] = jsqbits.complex(1,0);
        var state = new jsqbits.QState(n+1, amplitudes).hadamard(n);
        state = f(state);
        sum += rotation(state).measure(n).result * -2 + 1;
    }
    var trace = numberOfMixedStates * sum / numberOfSamples;
    return trace;
}

var identity = function(state) {return state;};
var pauli_x = function(state) {return state.controlledX(1,0);};
var rotate_y = function(state) {return state.controlledYRotation(1, 0, Math.PI/2);};
//dqc1(identity, 1);
dqc1(rotate_y, 1);