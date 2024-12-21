/* jshint -W030 */
import * as chai from 'chai';
import jsqubits from '../lib/index.js';
const jsqubitsmath = jsqubits.QMath;
const {expect} = chai;

describe('Simple Quantum Algorithms', () => {
  const ALL = jsqubits.ALL;

  var shuffle = function (a) {
    for (let i = 0; i < a.length; i++) {
      const j = Math.floor(Math.random() * a.length);
      const x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
  };

  describe('Super dense coding', () => {
    const superDense = function (input) {
      let state = jsqubits('|00>').hadamard(0).cnot(0, 1);

      //            Alice prepares her qbit
      const alice = 1;
      if (input.charAt(0) === '1') {
        state = state.z(alice);
      }
      if (input.charAt(1) === '1') {
        state = state.x(alice);
      }

      //            Alice sends her qbit to Bob
      const bob = 0;
      state = state.cnot(alice, bob).hadamard(alice);
      return state.measure(ALL).asBitString();
    };

    it('should transmit 00', () => {
      expect(superDense('00')).to.equal('00');
    });

    it('should transmit 01', () => {
      expect(superDense('01')).to.equal('01');
    });

    it('should transmit 10', () => {
      expect(superDense('10')).to.equal('10');
    });

    it('should transmit 11', () => {
      expect(superDense('11')).to.equal('11');
    });
  });

  describe('Simple search', () => {
    const createOracle = function (match) { return function (x) { return x === match ? 1 : 0; }; };

    const simpleSearch = function (f) {
      const inputBits = {from: 1, to: 2};
      return jsqubits('|001>')
        .hadamard(ALL)
        .applyFunction(inputBits, 0, f)
        .hadamard(inputBits)
        .z(inputBits)
        .controlledZ(2, 1)
        .hadamard(inputBits)
        .measure(inputBits)
        .result;
    };

    it('should find f00', () => {
      expect(simpleSearch(createOracle(0))).to.equal(0);
    });

    it('should find f01', () => {
      expect(simpleSearch(createOracle(1))).to.equal(1);
    });

    it('should find f10', () => {
      expect(simpleSearch(createOracle(2))).to.equal(2);
    });

    it('should find f11', () => {
      expect(simpleSearch(createOracle(3))).to.equal(3);
    });
  });

  describe('Quantum Teleportation', () => {
    const applyTeleportation = function (state) {
      const alicesMeasurement = state.cnot(2, 1).hadamard(2).measure({from: 1, to: 2});
      let resultingState = alicesMeasurement.newState;
      if (alicesMeasurement.result & 1) {
        resultingState = resultingState.x(0);
      }
      if (alicesMeasurement.result & 2) {
        resultingState = resultingState.z(0);
      }
      return resultingState;
    };

    it('should support transmition of quantum state from Alice to Bob', () => {
      const stateToBeTransmitted = jsqubits('|0>').rotateX(0, Math.PI / 3).rotateZ(0, Math.PI / 5);
      const initialState = jsqubits('|000>').hadamard(1).cnot(1, 0).rotateX(2, Math.PI / 3)
        .rotateZ(2, Math.PI / 5);
      const stateToBeTransmitted0 = stateToBeTransmitted.amplitude('|0>');
      const stateToBeTransmitted1 = stateToBeTransmitted.amplitude('|1>');
      const finalState = applyTeleportation(initialState);
      // By this stage, only bit zero has not been measured and it should have the same state the original state to be transmitted.
      let receivedAmplitudeFor0 = null;
      let receivedAmplitudeFor1 = null;
      finalState.each((stateWithAmplitude) => {
        if (stateWithAmplitude.asNumber() % 2 == 0) {
          if (receivedAmplitudeFor0 != null) throw 'Should only have one state with bit 0 being 0';
          receivedAmplitudeFor0 = stateWithAmplitude.amplitude;
        } else {
          if (receivedAmplitudeFor1 != null) throw 'Should only have one state with bit 0 being 1';
          receivedAmplitudeFor1 = stateWithAmplitude.amplitude;
        }
      });
      expect(receivedAmplitudeFor0.closeTo(stateToBeTransmitted0)).to.be.true;
      expect(receivedAmplitudeFor1.closeTo(stateToBeTransmitted1)).to.be.true;
    });
  });

  describe("Deutsch's algorithm", () => {
    const deutsch = function (f) {
      return jsqubits('|01>').hadamard(jsqubits.ALL).applyFunction(1, 0, f).hadamard(jsqubits.ALL)
        .measure(1).result;
    };

    it('should compute 0 for fixed function returning 1', () => {
      const f = function (x) { return 1; };
      expect(deutsch(f)).to.equal(0);
    });
    it('should compute 0 for fixed function returning 0', () => {
      const f = function (x) { return 0; };
      expect(deutsch(f)).to.equal(0);
    });
    it('should compute 1 for identity function', () => {
      const f = function (x) { return x; };
      expect(deutsch(f)).to.equal(1);
    });
    it('should compute 1 for not function', () => {
      const f = function (x) { return (x + 1) % 2; };
      expect(deutsch(f)).to.equal(1);
    });
  });

  describe('Deutsch-Jozsa algorithm', () => {
    const deutschJozsa = function (f) {
      const inputBits = {from: 1, to: 3};
      const result = jsqubits('|0001>')
        .hadamard(ALL)
        .applyFunction(inputBits, 0, f)
        .hadamard(inputBits)
        .measure(inputBits)
        .result;
      return result === 0;
    };

    const createBalancedFunction = function () {
      // Return 0 for exactly half the possible inputs and 1 for the rest.
      const nums = [0, 1, 2, 3, 4, 5, 6, 7];
      shuffle(nums);
      return function (x) { return nums[x] < 4 ? 0 : 1; };
    };

    it('should return true if function always returns zero', () => {
      expect(deutschJozsa((x) => { return 0; })).to.equal(true);
    });

    it('should return true if function always returns one', () => {
      expect(deutschJozsa((x) => { return 1; })).to.equal(true);
    });

    it('should return false if function is balanced', () => {
      expect(deutschJozsa(createBalancedFunction())).to.equal(false);
    });
  });

  describe("Simon's algorithm", () => {
    const singleRunOfSimonsCircuit = function (f, numbits) {
      const inputBits = {from: numbits, to: 2 * numbits - 1};
      const targetBits = {from: 0, to: numbits - 1};
      const qbits = new jsqubits.QState(2 * numbits)
        .hadamard(inputBits)
        .applyFunction(inputBits, targetBits, f)
        .hadamard(inputBits);
      return qbits.measure(inputBits).result;
    };

    //      TODO: Make this a litte easier to read!
    const findPotentialSolution = function (f, numBits) {
      let nullSpace = null;
      const results = [];
      let estimatedNumberOfIndependentSolutions = 0;
      for (let count = 0; count < 10 * numBits; count++) {
        const result = singleRunOfSimonsCircuit(f, numBits);
        if (results.indexOf(result) < 0) {
          results.push(result);
          estimatedNumberOfIndependentSolutions++;
          if (estimatedNumberOfIndependentSolutions == numBits - 1) {
            nullSpace = jsqubitsmath.findNullSpaceMod2(results, numBits);
            if (nullSpace.length == 1) break;
            estimatedNumberOfIndependentSolutions = numBits - nullSpace.length;
          }
        }
      }
      if (nullSpace === null) throw 'Could not find a solution';
      return nullSpace[0];
    };

    const simonsAlgorithm = function (f, numBits) {
      const solution = findPotentialSolution(f, numBits);
      return (f(0) === f(solution)) ? solution : 0;
    };

    it('should find the right key (not identity)', () => {
      const testFunction = function (x) {
        const mapping = ['101', '010', '000', '110', '000', '110', '101', '010'];
        return parseInt(mapping[x], 2);
      };
      expect(simonsAlgorithm(testFunction, 3).toString(2)).to.equal('110');
    });

    it('should find the right key (identity)', () => {
      const mapping = [0, 1, 2, 3, 4, 5, 6, 7];
      shuffle(mapping);
      const permutation = function (x) {
        return mapping[x];
      };
      expect(simonsAlgorithm(permutation, 3)).to.equal(0);
    });
  });
});
