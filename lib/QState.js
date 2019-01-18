import Measurement, {QStateComponent} from './Measurement'
import Complex from './Complex'
import validateArgs from './utils/validateArgs'
import typecheck from './utils/typecheck';
import Constants from './constants'

function parseBitString(bitString) {
  // Strip optional 'ket' characters to support |0101>
  bitString = bitString.replace(/^\|/, '').replace(/>$/, '');
  return {value: parseInt(bitString, 2), length: bitString.length};
}

function sparseAssign(array, index, value) {
  // Try to avoid assigning values and try to make zero exactly zero.
  if (value.magnitude() > Constants.roundToZero) {
    array[index] = value;
  }
}

/*
  Add amplitude to the existing amplitude for state in the amplitudes object
  Keep the object sparse by deleting values close to zero.
 */
function sparseAdd(amplitudes, state, amplitude) {
  const newAmplitude = (amplitudes[state] || Complex.ZERO).add(amplitude);
  if (newAmplitude.magnitude() > Constants.roundToZero) {
    amplitudes[state] = newAmplitude
  } else {
    delete amplitudes[state]
  }
}

function convertBitQualifierToBitRange(bits, numBits) {
  if (bits == null) {
    throw new Error('bit qualification must be supplied');
  } else if (bits === Constants.ALL) {
    return {from: 0, to: numBits - 1};
  } else if (typecheck.isNumber(bits)) {
    return {from: bits, to: bits};
  } else if (bits.from != null && bits.to != null) {
    if (bits.from > bits.to) {
      throw new Error('bit range must have "from" being less than or equal to "to"');
    }
    return bits;
  } else {
    throw new Error('bit qualification must be either: a number, Constants.ALL, or {from: n, to: m}');
  }
}


function validateControlAndTargetBitsDontOverlap(controlBits, targetBits) {
  // TODO: Find out if it would sometimes be faster to put one of the bit collections into a hash-set first.
  // Also consider allowing validation to be disabled.
  for (let i = 0; i < controlBits.length; i++) {
    const controlBit = controlBits[i];
    for (let j = 0; j < targetBits.length; j++) {
      if (controlBit === targetBits[j]) {
        throw new Error('control and target bits must not be the same nor overlap');
      }
    }
  }
}

function chooseRandomBasisState(qState) {
  const randomNumber = qState.random();
  let randomStateString;
  let accumulativeSquareAmplitudeMagnitude = 0;
  qState.each((stateWithAmplitude) => {
    const magnitude = stateWithAmplitude.amplitude.magnitude();
    accumulativeSquareAmplitudeMagnitude += magnitude * magnitude;
    randomStateString = stateWithAmplitude.index;
    return accumulativeSquareAmplitudeMagnitude <= randomNumber;
  });
  return parseInt(randomStateString, 10);
}

function bitRangeAsArray(low, high) {
  if (low > high) {
    throw new Error('bit range must have `from` being less than or equal to `to`');
  }
  const result = [];
  for (let i = low; i <= high; i++) {
    result.push(i);
  }
  return result;
}

function convertBitQualifierToBitArray(bits, numBits) {
  if (bits == null) {
    throw new Error('bit qualification must be supplied');
  }
  if (typecheck.isArray(bits)) {
    return bits;
  }
  if (typecheck.isNumber(bits)) {
    return [bits];
  }
  if (bits === Constants.ALL) {
    return bitRangeAsArray(0, numBits - 1);
  }
  if (bits.from != null && bits.to != null) {
    return bitRangeAsArray(bits.from, bits.to);
  }
  throw new Error('bit qualification must be either: a number, an array of numbers, Constants.ALL, or {from: n, to: m}');
}


function createBitMask(bits) {
  let mask = null;
  if (bits) {
    mask = 0;
    for (let i = 0; i < bits.length; i++) {
      mask += (1 << bits[i]);
    }
  }
  return mask;
}

const hadamardMatrix = [
  [Complex.SQRT1_2, Complex.SQRT1_2],
  [Complex.SQRT1_2, Complex.SQRT1_2.negate()]
];

const xMatrix = [
  [Complex.ZERO, Complex.ONE],
  [Complex.ONE, Complex.ZERO]
];

const yMatrix = [
  [Complex.ZERO, new Complex(0, -1)],
  [new Complex(0, 1), Complex.ZERO]
];

const zMatrix = [
  [Complex.ONE, Complex.ZERO],
  [Complex.ZERO, Complex.ONE.negate()]
];

const sMatrix = [
  [Complex.ONE, Complex.ZERO],
  [Complex.ZERO, new Complex(0, 1)]
];

const tMatrix = [
  [Complex.ONE, Complex.ZERO],
  [Complex.ZERO, new Complex(Math.SQRT1_2, Math.SQRT1_2)]
];

export default class QState {
  constructor(numBits, amplitudes) {
    validateArgs(arguments, 1, 'new QState() must be supplied with number of bits (optionally with amplitudes as well)');
    amplitudes = amplitudes || [Constants.ONE];

    this.numBits = () => {
      return numBits;
    };

    this.amplitude = (basisState) => {
      const numericIndex = typecheck.isString(basisState)
        ? parseBitString(basisState).value
        : basisState;
      return amplitudes[numericIndex] || Complex.ZERO;
    };

    this.each = (callBack) => {
      const indices = Object.keys(amplitudes);
      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        const returnValue = callBack(new QStateComponent(numBits, index, amplitudes[index]));
        // NOTE: Want to continue on void and null returns!
        if (returnValue === false) break;
      }
    }
  }

  static fromBits(bitString) {
    validateArgs(arguments, 1, 1, 'Must supply a bit string');
    const parsedBitString = parseBitString(bitString);
    const amplitudes = {};
    amplitudes[parsedBitString.value] = Constants.ONE;
    return new QState(parsedBitString.length, amplitudes);
  }


  multiply(amount) {
    if (typecheck.isNumber(amount)) {
      amount = new Complex(amount);
    }
    const amplitudes = {};
    this.each((oldAmplitude) => {
      amplitudes[oldAmplitude.index] = oldAmplitude.amplitude.multiply(amount);
    });
    return new QState(this.numBits(), amplitudes);
  }

  add(otherState) {
    const amplitudes = {};
    this.each((stateWithAmplitude) => {
      amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude;
    });
    otherState.each((stateWithAmplitude) => {
      const existingValue = amplitudes[stateWithAmplitude.index] || Complex.ZERO;
      amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.add(existingValue);
    });
    return new QState(this.numBits(), amplitudes);
  }

  subtract(otherState) {
    return this.add(otherState.multiply(-1));
  }

  tensorProduct(otherState) {
    const amplitudes = {};
    this.each((basisWithAmplitudeA) => {
      otherState.each((otherBasisWithAmplitude) => {
        const newBasisState = (basisWithAmplitudeA.asNumber() << otherState.numBits()) + otherBasisWithAmplitude.asNumber();
        const newAmplitude = basisWithAmplitudeA.amplitude.multiply(otherBasisWithAmplitude.amplitude);
        amplitudes[newBasisState] = newAmplitude;
      });
    });
    return new QState(this.numBits() + otherState.numBits(), amplitudes);
  }

  kron = this.tensorProduct;

  static applyOperatorMatrix(matrix, bitValue, amplitude) {
    return [
      matrix[0][bitValue].multiply(amplitude),
      matrix[1][bitValue].multiply(amplitude)
    ]
  }

  controlledHadamard(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledHadamard()');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, hadamardMatrix);
  }

  hadamard(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to hadamard() as either a single index or a range.');
    return this.controlledHadamard(null, targetBits);
  }

  controlledXRotation(controlBits, targetBits, angle) {
    validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledXRotation()');
    const halfAngle = angle / 2;
    const cosine = new Complex(Math.cos(halfAngle));
    const negativeISine = new Complex(0, -Math.sin(halfAngle));

    const rotationMatrix = [
      [cosine, negativeISine],
      [negativeISine, cosine]
    ];

    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
  }

  rotateX(targetBits, angle) {
    validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateX.');
    return this.controlledXRotation(null, targetBits, angle);
  }

  controlledYRotation(controlBits, targetBits, angle) {
    validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledYRotation()');
    const halfAngle = angle / 2;
    const cosine = new Complex(Math.cos(halfAngle));
    const sine = new Complex(Math.sin(halfAngle));
    const rotationMatrix = [
      [cosine, sine.negate()],
      [sine, cosine]
    ];

    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
  }


  rotateY(targetBits, angle) {
    validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateY.');
    return this.controlledYRotation(null, targetBits, angle);
  }

  controlledZRotation(controlBits, targetBits, angle) {
    validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle to controlledZRotation()');
    const halfAngle = angle / 2;
    const cosine = new Complex(Math.cos(halfAngle));
    const iSine = new Complex(0, Math.sin(halfAngle));
    const rotationMatrix = [
      [cosine.subtract(iSine), Complex.ZERO],
      [Complex.ZERO, cosine.add(iSine)]
    ];
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
  }

  rotateZ(targetBits, angle) {
    validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateZ.');
    return this.controlledZRotation(null, targetBits, angle);
  }

  controlledR(controlBits, targetBits, angle) {
    validateArgs(arguments, 3, 3, 'Must supply control and target bits, and an angle to controlledR().');
    const cosine = new Complex(Math.cos(angle));
    const iSine = new Complex(0, Math.sin(angle));
    const rotationMatrix = [
      [Complex.ONE, Complex.ZERO],
      [Complex.ZERO, cosine.add(iSine)]
    ];
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
  }

  r(targetBits, angle) {
    validateArgs(arguments, 2, 2, 'Must supply target bits and angle to r().');
    return this.controlledR(null, targetBits, angle);
  }


  R = this.r;

  controlledX(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to cnot() / controlledX().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, xMatrix);
  }

  cnot = this.controlledX;

  x(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to x() / not().');
    return this.controlledX(null, targetBits);
  }

  not = this.x;
  X = this.x;

  controlledY(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledY().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, yMatrix);
  }

  y(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to y().');
    return this.controlledY(null, targetBits);
  }

  Y = this.y;

  controlledZ(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledZ().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, zMatrix);
  }

  z(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to z().');
    return this.controlledZ(null, targetBits);
  }

  Z = this.z;

  controlledS(controlBits, targetBits) {
    //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/2)
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledS().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, sMatrix);
  }

  s(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to s().');
    return this.controlledS(null, targetBits);
  }

  S = this.s;

  controlledT(controlBits, targetBits) {
    //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/4)
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledT().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, tMatrix);
  }

  t(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to t().');
    return this.controlledT(null, targetBits);
  }

  T = this.t;

  controlledSwap(controlBits, targetBit1, targetBit2) {
    validateArgs(arguments, 3, 3, 'Must supply controlBits, targetBit1, and targetBit2 to controlledSwap()');
    const newAmplitudes = {};
    if (controlBits != null) {
      controlBits = convertBitQualifierToBitArray(controlBits, this.numBits());
    }
    //        TODO: make sure targetBit1 and targetBit2 are not contained in controlBits.
    const controlBitMask = createBitMask(controlBits);
    const bit1Mask = 1 << targetBit1;
    const bit2Mask = 1 << targetBit2;
    this.each((stateWithAmplitude) => {
      const state = stateWithAmplitude.asNumber();
      let newState = state;
      if (controlBits == null || ((state & controlBitMask) === controlBitMask)) {
        const newBit2 = ((state & bit1Mask) >> targetBit1) << targetBit2;
        const newBit1 = ((state & bit2Mask) >> targetBit2) << targetBit1;
        newState = (state & ~bit1Mask & ~bit2Mask) | newBit1 | newBit2;
      }
      newAmplitudes[newState] = stateWithAmplitude.amplitude;
    });
    return new QState(this.numBits(), newAmplitudes);
  }

  swap(targetBit1, targetBit2) {
    validateArgs(arguments, 2, 2, 'Must supply targetBit1 and targetBit2 to swap()');
    return this.controlledSwap(null, targetBit1, targetBit2);
  }

  /**
   * Toffoli takes one or more control bits (conventionally two) and one target bit.
   */
  toffoli(/* controlBit, controlBit, ..., targetBit */) {
    validateArgs(arguments, 2, 'At least one control bit and a target bit must be supplied to calls to toffoli()');
    const targetBit = arguments[arguments.length - 1];
    const controlBits = [];
    for (let i = 0; i < arguments.length - 1; i++) {
      controlBits.push(arguments[i]);
    }
    return this.controlledX(controlBits, targetBit);
  }

  static applyToOneBit(controlBits, targetBit, operatorMatrix, qState) {
    const newAmplitudes = {};
    const targetBitMask = 1 << targetBit;
    const inverseTargetBitMask = ~targetBitMask;
    const controlBitMask = createBitMask(controlBits);

    qState.each((stateWithAmplitude) => {
      const state = stateWithAmplitude.asNumber();
      if (controlBits == null || ((state & controlBitMask) === controlBitMask)) {
        const bitValue = ((targetBitMask & state) > 0) ? 1 : 0;
        const result = QState.applyOperatorMatrix(operatorMatrix, bitValue, stateWithAmplitude.amplitude);
        const zeroState = state & inverseTargetBitMask;
        const oneState = state | targetBitMask;
        sparseAdd(newAmplitudes, zeroState, result[0]);
        sparseAdd(newAmplitudes, oneState, result[1]);
      } else {
        newAmplitudes[state] = stateWithAmplitude.amplitude
      }
    });

    return new QState(qState.numBits(), newAmplitudes);
  }

  controlledApplicationOfqBitOperator(controlBits, targetBits, operatorMatrix) {
    validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and qbitFunction to controlledApplicationOfqBitOperator().');
    const targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
    let controlBitArray = null;
    if (controlBits != null) {
      controlBitArray = convertBitQualifierToBitArray(controlBits, this.numBits());
      validateControlAndTargetBitsDontOverlap(controlBitArray, targetBitArray);
    }
    let result = this;
    for (let i = 0; i < targetBitArray.length; i++) {
      const targetBit = targetBitArray[i];
      result = QState.applyToOneBit(controlBitArray, targetBit, operatorMatrix, result);
    }
    return result;
  }

  applyFunction(inputBits, targetBits, functionToApply) {
    function validateTargetBitRangesDontOverlap(inputBitRange, targetBitRange) {
      if ((inputBitRange.to >= targetBitRange.from) && (targetBitRange.to >= inputBitRange.from)) {
        throw new Error('control and target bits must not be the same nor overlap');
      }
    }

    validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and functionToApply to applyFunction().');
    const qState = this;
    const inputBitRange = convertBitQualifierToBitRange(inputBits, this.numBits());
    const targetBitRange = convertBitQualifierToBitRange(targetBits, this.numBits());
    validateTargetBitRangesDontOverlap(inputBitRange, targetBitRange);
    const newAmplitudes = {};
    const statesThatCanBeSkipped = {};
    const highBitMask = (1 << (inputBitRange.to + 1)) - 1;
    const targetBitMask = ((1 << (1 + targetBitRange.to - targetBitRange.from)) - 1) << targetBitRange.from;

    this.each((stateWithAmplitude) => {
      const state = stateWithAmplitude.asNumber();
      if (statesThatCanBeSkipped[stateWithAmplitude.index]) return;
      const input = (state & highBitMask) >> inputBitRange.from;
      const result = (functionToApply(input) << targetBitRange.from) & targetBitMask;
      const resultingState = state ^ result;
      if (resultingState === state) {
        sparseAssign(newAmplitudes, state, stateWithAmplitude.amplitude);
      } else {
        statesThatCanBeSkipped[resultingState] = true;
        sparseAssign(newAmplitudes, state, qState.amplitude(resultingState));
        sparseAssign(newAmplitudes, resultingState, stateWithAmplitude.amplitude);
      }
    });

    return new QState(this.numBits(), newAmplitudes);
  }

  // Define random() as a function so that clients can replace it with their own
  // e.g.
  // jsqubits.QState.prototype.random = function() {.....};
  /* eslint-disable-next-line class-methods-use-this */
  random() {
    return Math.random();
  }

  normalize() {
    const amplitudes = {};
    let sumOfMagnitudeSqaures = 0;
    this.each((stateWithAmplitude) => {
      const magnitude = stateWithAmplitude.amplitude.magnitude();
      sumOfMagnitudeSqaures += magnitude * magnitude;
    });
    const scale = new Complex(1 / Math.sqrt(sumOfMagnitudeSqaures));
    this.each((stateWithAmplitude) => {
      amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.multiply(scale);
    });
    return new QState(this.numBits(), amplitudes);
  }

  measure(bits) {
    validateArgs(arguments, 1, 1, 'Must supply bits to be measured to measure().');
    const numBits = this.numBits();
    const bitArray = convertBitQualifierToBitArray(bits, numBits);
    const chosenState = chooseRandomBasisState(this);
    const bitMask = createBitMask(bitArray);
    const maskedChosenState = chosenState & bitMask;

    const newAmplitudes = {};
    this.each((stateWithAmplitude) => {
      const state = stateWithAmplitude.asNumber();
      if ((state & bitMask) === maskedChosenState) {
        newAmplitudes[state] = stateWithAmplitude.amplitude;
      }
    });

    // Measurement outcome is the "value" of the measured bits.
    // It probably only makes sense when the bits make an adjacent block.
    let measurementOutcome = 0;
    for (let bitIndex = numBits - 1; bitIndex >= 0; bitIndex--) {
      if (bitArray.indexOf(bitIndex) >= 0) {
        measurementOutcome <<= 1;
        if (chosenState & (1 << bitIndex)) {
          measurementOutcome += 1;
        }
      }
    }

    const newState = new QState(this.numBits(), newAmplitudes).normalize();
    return new Measurement(bitArray.length, measurementOutcome, newState);
  }

  qft(targetBits) {
    function qft(qstate, targetBitArray) {
      const bitIndex = targetBitArray[0];
      if (targetBitArray.length > 1) {
        qstate = qft(qstate, targetBitArray.slice(1));
        for (let index = 1; index < targetBitArray.length; index++) {
          const otherBitIndex = targetBitArray[index];
          const angle = 2 * Math.PI / (1 << (index + 1));
          qstate = qstate.controlledR(bitIndex, otherBitIndex, angle);
        }
      }
      return qstate.hadamard(bitIndex);
    }

    function reverseBits(qstate, targetBitArray) {
      while (targetBitArray.length > 1) {
        qstate = qstate.swap(targetBitArray[0], targetBitArray[targetBitArray.length - 1]);
        targetBitArray = targetBitArray.slice(1, targetBitArray.length - 1);
      }
      return qstate;
    }

    validateArgs(arguments, 1, 1, 'Must supply bits to be measured to qft().');
    const targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
    const newState = qft(this, targetBitArray);
    return reverseBits(newState, targetBitArray);
  }

  eql(other) {
    function lhsAmplitudesHaveMatchingRhsAmplitudes(lhs, rhs) {
      let result = true;
      lhs.each((stateWithAmplitude) => {
        result = stateWithAmplitude.amplitude.eql(rhs.amplitude(stateWithAmplitude.asNumber()));
        // Returning false short-circuits our "each" method.
        // This is cludgy.  Really should be using a forAll method.
        return result;
      });
      return result;
    }

    if (!other) return false;
    if (!(other instanceof QState)) return false;
    if (this.numBits() !== other.numBits()) return false;
    return lhsAmplitudesHaveMatchingRhsAmplitudes(this, other) &&
        lhsAmplitudesHaveMatchingRhsAmplitudes(other, this);
  }

  equal = this.eql;

  toString() {
    function formatAmplitude(amplitude, formatFlags) {
      const amplitudeString = amplitude.format(formatFlags);
      return amplitudeString === '1' ? '' : `(${amplitudeString})`;
    }

    function compareStatesWithAmplitudes(a, b) {
      return a.asNumber() - b.asNumber();
    }

    function sortedNonZeroStates(qState) {
      const nonZeroStates = [];
      qState.each((stateWithAmplitude) => {
        nonZeroStates.push(stateWithAmplitude);
      });
      nonZeroStates.sort(compareStatesWithAmplitudes);
      return nonZeroStates;
    }

    let stateWithAmplitude;
    let result = '';
    const formatFlags = {decimalPlaces: 4};
    const nonZeroStates = sortedNonZeroStates(this);
    for (let i = 0; i < nonZeroStates.length; i++) {
      if (result !== '') result += ' + ';
      stateWithAmplitude = nonZeroStates[i];
      result = `${result + formatAmplitude(stateWithAmplitude.amplitude, formatFlags)}|${stateWithAmplitude.asBitString()}>`;
    }
    return result;
  }
}
