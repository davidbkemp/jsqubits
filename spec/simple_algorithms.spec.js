var jsqbits = require('../lib/index').jsqbits;
var jsqbitsmath = require('../lib/index').jsqbitsmath;
var jsqbitsJasmineMatchers = require('./matchers');

describe('Simple Quantum Algorithms', function() {
    var ALL = jsqbits.ALL;
    beforeEach(function() {
        this.addMatchers(jsqbitsJasmineMatchers);
    });

    describe("Super dense coding", function() {

        var superDense = function(input) {
            var state = jsqbits('|00>').hadamard(0).cnot(0,1);

//            Alice prepares her qbit
            var alice = 1;
            if (input.charAt(0) === '1') {
                state = state.z(alice);
            }
            if (input.charAt(1) === '1') {
                state = state.x(alice);
            }

//            Alice sends her qbit to Bob
            var bob = 0;
            state = state.cnot(alice, bob).hadamard(alice);
            return state.measure(ALL).asBitString();
        };

        it ("should transmit 00", function() {
            expect(superDense('00')).toBe('00');
        });

        it ("should transmit 01", function() {
            expect(superDense('01')).toBe('01');
        });

        it ("should transmit 10", function() {
            expect(superDense('10')).toBe('10');
        });

        it ("should transmit 11", function() {
            expect(superDense('11')).toBe('11');
        });
    });

    describe("Simple search", function(){
        var createOracle = function(match) { return function(x) {return x == match ? 1 : 0} };

        var simpleSearch = function(f) {
            var inputBits = {from: 1, to: 2};
            return jsqbits('|001>')
                    .hadamard(ALL)
                    .applyFunction(inputBits, 0, f)
                    .hadamard(inputBits)
                    .z(inputBits)
                    .controlledZ(2, 1)
                    .hadamard(inputBits)
                    .measure(inputBits)
                    .result;
        };

        it ("should find f00", function() {
            expect(simpleSearch(createOracle(0))).toBe(0);
        });

        it ("should find f01", function() {
            expect(simpleSearch(createOracle(1))).toBe(1);
        });

        it ("should find f10", function() {
            expect(simpleSearch(createOracle(2))).toBe(2);
        });

        it ("should find f11", function() {
            expect(simpleSearch(createOracle(3))).toBe(3);
        });
    });

    describe("Quantum Teleportation", function(){

        var applyTeleportation = function(state) {
            var alicesMeasurement = state.cnot(2, 1).hadamard(2).measure({from: 1, to: 2});
            var resultingState = alicesMeasurement.newState;
            if (alicesMeasurement.result & 1) {
                resultingState = resultingState.x(0);
            }
            if (alicesMeasurement.result & 2) {
                resultingState = resultingState.z(0);
            }
            return resultingState;
        };

        it ("should support transmition of quantum state from Alice to Bob", function(){
            var stateToBeTransmitted = jsqbits("|0>").rotateX(0, Math.PI/3).rotateZ(0, Math.PI/5);
            var initialState = jsqbits("|000>").hadamard(1).cnot(1,0).rotateX(2, Math.PI/3).rotateZ(2, Math.PI/5);
            var stateToBeTransmitted0 = stateToBeTransmitted.amplitude('|0>');
            var stateToBeTransmitted1 = stateToBeTransmitted.amplitude('|1>');
            var finalState = applyTeleportation(initialState);
            // By this stage, only bit zero has not been measured and it should have the same state the original state to be transmitted.
            var receivedAmplitudeFor0 = null;
            var receivedAmplitudeFor1 = null;
            finalState.each(function(stateWithAmplitude) {
                if (stateWithAmplitude.asNumber() % 2 == 0) {
                    if (receivedAmplitudeFor0 != null) throw "Should only have one state with bit 0 being 0";
                    receivedAmplitudeFor0 = stateWithAmplitude.amplitude;
                } else {
                    if (receivedAmplitudeFor1 != null) throw "Should only have one state with bit 0 being 1";
                    receivedAmplitudeFor1 = stateWithAmplitude.amplitude;
                }
            });
            expect(receivedAmplitudeFor0).toBeApprox(stateToBeTransmitted0);
            expect(receivedAmplitudeFor1).toBeApprox(stateToBeTransmitted1);
        });
    });

    describe("Deutsch's algorithm", function() {

        var deutsch = function(f) {
           return jsqbits('|01>').hadamard(jsqbits.ALL).applyFunction(1, 0, f).hadamard(jsqbits.ALL).measure(1).result;
        };

        it("should compute 0 for fixed function returning 1", function() {
            var f = function(x) {return 1;};
            expect(deutsch(f)).toBe(0);
        });
        it("should compute 0 for fixed function returning 0", function() {
            var f = function(x) {return 0;};
            expect(deutsch(f)).toBe(0);
        });
        it("should compute 1 for identity function", function() {
            var f = function(x) {return x;};
            expect(deutsch(f)).toBe(1);
        });
        it("should compute 1 for not function", function() {
            var f = function(x) {return (x + 1) % 2;};
            expect(deutsch(f)).toBe(1);
        });
    });

    describe("Deutsch-Jozsa algorithm", function() {
        var deutschJozsa = function(f) {
            var inputBits = {from: 1, to: 3};
            var result = jsqbits('|0001>')
                    .hadamard(ALL)
                    .applyFunction(inputBits, 0, f)
                    .hadamard(inputBits)
                    .measure(inputBits)
                    .result;
            return result === 0;
        };

        var createBalancedFunction = function() {
            // Return 0 for exactly half the possible inputs and 1 for the rest.
            var nums = [0,1,2,3,4,5,6,7];
            shuffle(nums);
            return function(x) { return nums[x] < 4 ? 0 : 1 };
        };

        it("should return true if function always returns zero", function() {
            expect(deutschJozsa(function(x) { return 0; })).toBe(true);
        });

        it("should return true if function always returns one", function() {
            expect(deutschJozsa(function(x) { return 1; })).toBe(true);
        });

        it("should return false if function is balanced", function() {
            expect(deutschJozsa(createBalancedFunction())).toBe(false);
        });
    });

    describe("Simon's algorithm", function() {

        var singleRunOfSimonsCircuit = function(f, numbits) {
            var inputBits = {from: numbits, to: 2 * numbits - 1};
            var targetBits = {from: 0, to: numbits - 1};
            var qbits = new jsqbits.QState(2 * numbits)
                    .hadamard(inputBits)
                    .applyFunction(inputBits, targetBits, f)
                    .hadamard(inputBits);
            return qbits.measure(inputBits).result;
        }

        //      TODO: Make this a litte easier to read!
        var findPotentialSolution = function(f, numBits) {
            var nullSpace = null;
            var results = [];
            var estimatedNumberOfIndependentSolutions = 0;
            for(var count = 0; count < 10 * numBits; count++) {
                var result = singleRunOfSimonsCircuit(f, numBits);
                if (results.indexOf(result) < 0) {
                    results.push(result);
                    estimatedNumberOfIndependentSolutions++;
                    if (estimatedNumberOfIndependentSolutions == numBits - 1) {
                        nullSpace = jsqbitsmath.findNullSpaceMod2(results, numBits);
                        if (nullSpace.length == 1) break;
                        estimatedNumberOfIndependentSolutions = numBits - nullSpace.length;
                    }
                }
            }
            if (nullSpace === null) throw "Could not find a solution";
            return nullSpace[0];
        }

        var simonsAlgorithm = function(f, numBits) {
            var solution = findPotentialSolution(f, numBits);
            return (f(0) === f(solution)) ? solution : 0;
         };

        it("should find the right key (not identity)", function() {
            var testFunction = function(x) {
                var mapping = ['101', '010', '000', '110', '000', '110', '101', '010'];
                return parseInt(mapping[x], 2);
            };
            expect(simonsAlgorithm(testFunction, 3).toString(2)).toEqual('110');
        });

        it("should find the right key (identity)", function() {
            var mapping = [0, 1, 2, 3, 4, 5, 6, 7];
            shuffle(mapping);
            var permutation = function(x) {
                 return mapping[x];
             };
            expect(simonsAlgorithm(permutation, 3)).toEqual(0);
        });
    });


    var shuffle = function(a) {
        for (var i = 0; i < a.length; i++) {
            var j = Math.floor(Math.random() * a.length);
            var x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    };

});