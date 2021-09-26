'use strict';

function padState(state, numBits) {
  const paddingLength = numBits - state.length;
  for (let i = 0; i < paddingLength; i++) {
    state = `0${state}`;
  }
  return state;
}

class Measurement {
  constructor(numBits, result, newState) {
    this.numBits = numBits;
    this.result = result;
    this.newState = newState;
  }

  toString() {
    return `{result: ${this.result}, newState: ${this.newState}}`;
  }

  asBitString() {
    return padState(this.result.toString(2), this.numBits);
  }
}

class QStateComponent {
  constructor(numBits, index, amplitude) {
    this.numBits = numBits;
    this.index = index;
    this.amplitude = amplitude;
  }

  asNumber() {
    return parseInt(this.index, 10);
  }

  asBitString() {
    return padState(parseInt(this.index, 10).toString(2), this.numBits);
  }
}

function validateArgs(args, minimum, ...remainingArgs) {
  let maximum = 10000;
  let message = `Must supply at least ${minimum} parameters.`;
  if (remainingArgs.length > 2) throw new Error('Internal error: too many arguments to validateArgs');
  if (remainingArgs.length === 2) {
    [maximum, message] = remainingArgs;
  } else if (remainingArgs.length === 1) {
    [message] = remainingArgs;
  }
  if (args.length < minimum || args.length > maximum) {
    throw message;
  }
}

const TYPES = {
  NULL: '[object Null]',
  OBJECT: '[object Object]',
  ARRAY: '[object Array]',
  STRING: '[object String]',
  NUMBER: '[object Number]',
  BOOLEAN: '[object Boolean]',
  DATE: '[object Date]',
  UNDEFINED: '[object Undefined]',
  REGEXP: '[object RegExp]',
};

const getType = (prop) => {
  return Object.prototype.toString.call(prop);
};

const isNull = (prop) => {
  return getType(prop) === TYPES.NULL;
};

const isObject = (prop) => {
  return getType(prop) === TYPES.OBJECT;
};

const isArray = (prop) => {
  return getType(prop) === TYPES.ARRAY;
};

const isString = (prop) => {
  return getType(prop) === TYPES.STRING;
};

const isNumber = (prop) => {
  return getType(prop) === TYPES.NUMBER;
};

const isBoolean = (prop) => {
  return getType(prop) === TYPES.BOOLEAN;
};

const isDate = (prop) => {
  return getType(prop) === TYPES.DATE;
};

const isUndefined = (prop) => {
  return getType(prop) === TYPES.UNDEFINED;
};

const isRegExp = (prop) => {
  return getType(prop) === TYPES.REGEXP;
};

var typecheck = {
  isNull,
  isObject,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isUndefined,
  isRegExp,
};

class Complex {
  constructor(real, imaginary) {
    validateArgs(arguments, 1, 2, 'Must supply a real, and optionally an imaginary, argument to Complex()');
    imaginary = imaginary || 0;
    this.real = real;
    this.imaginary = imaginary;
  }

  add(other) {
    validateArgs(arguments, 1, 1, 'Must supply 1 parameter to add()');
    if (typecheck.isNumber(other)) {
      return new Complex(this.real + other, this.imaginary);
    }
    return new Complex(this.real + other.real, this.imaginary + other.imaginary);
  }

  multiply(other) {
    validateArgs(arguments, 1, 1, 'Must supply 1 parameter to multiply()');
    if (typecheck.isNumber(other)) {
      return new Complex(this.real * other, this.imaginary * other);
    }
    return new Complex(
      this.real * other.real - this.imaginary * other.imaginary,
      this.real * other.imaginary + this.imaginary * other.real
    );
  }

  conjugate() {
    return new Complex(this.real, -this.imaginary);
  }

  toString() {
    if (this.imaginary === 0) return `${this.real}`;
    let imaginaryString;
    if (this.imaginary === 1) {
      imaginaryString = 'i';
    } else if (this.imaginary === -1) {
      imaginaryString = '-i';
    } else {
      imaginaryString = `${this.imaginary}i`;
    }
    if (this.real === 0) return imaginaryString;
    const sign = (this.imaginary < 0) ? '' : '+';
    return this.real + sign + imaginaryString;
  }

  inspect() {
    return this.toString();
  }

  format(options) {
    let realValue = this.real;
    let imaginaryValue = this.imaginary;
    if (options && options.decimalPlaces != null) {
      const roundingMagnitude = Math.pow(10, options.decimalPlaces);
      realValue = Math.round(realValue * roundingMagnitude) / roundingMagnitude;
      imaginaryValue = Math.round(imaginaryValue * roundingMagnitude) / roundingMagnitude;
    }
    const objectToFormat = new Complex(realValue, imaginaryValue);
    return objectToFormat.toString();
  }

  negate() {
    return new Complex(-this.real, -this.imaginary);
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
  }

  phase() {
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    return Math.atan2(this.imaginary, this.real);
  }


  subtract(other) {
    validateArgs(arguments, 1, 1, 'Must supply 1 parameter to subtract()');
    if (typecheck.isNumber(other)) {
      return new Complex(this.real - other, this.imaginary);
    }
    return new Complex(this.real - other.real, this.imaginary - other.imaginary);
  }

  eql(other) {
    if (!(other instanceof Complex)) return false;
    return this.real === other.real && this.imaginary === other.imaginary;
  }

  equal(other) {
    return this.eql(other);
  }

  equals(other) {
    return this.eql(other);
  }

  closeTo(other) {
    return Math.abs(this.real - other.real) < 0.0001 && Math.abs(this.imaginary - other.imaginary) < 0.0001;
  }

}

/*
 * These should all be made static constants once Safari supports them.
 */
Complex.ZERO = new Complex(0, 0);
Complex.ONE = new Complex(1, 0);
Complex.SQRT2 = new Complex(Math.SQRT2, 0);
Complex.SQRT1_2 = new Complex(Math.SQRT1_2, 0);

function parseBitString(bitString) {
  // Strip optional 'ket' characters to support |0101>
  bitString = bitString.replace(/^\|/, '').replace(/>$/, '');
  return {value: parseInt(bitString, 2), length: bitString.length};
}

function sparseAssign(array, index, value) {
  // Try to avoid assigning values and try to make zero exactly zero.
  if (value.magnitude() > QState.roundToZero) {
    array[index] = value;
  }
}

/*
  Add amplitude to the existing amplitude for state in the amplitudes object
  Keep the object sparse by deleting values close to zero.
 */
function sparseAdd(amplitudes, state, amplitude) {
  const newAmplitude = (amplitudes[state] || Complex.ZERO).add(amplitude);
  if (newAmplitude.magnitude() > QState.roundToZero) {
    amplitudes[state] = newAmplitude;
  } else {
    delete amplitudes[state];
  }
}

function convertBitQualifierToBitRange(bits, numBits) {
  if (bits == null) {
    throw new Error('bit qualification must be supplied');
  } else if (bits === QState.ALL) {
    return {from: 0, to: numBits - 1};
  } else if (typecheck.isNumber(bits)) {
    return {from: bits, to: bits};
  } else if (bits.from != null && bits.to != null) {
    if (bits.from > bits.to) {
      throw new Error('bit range must have "from" being less than or equal to "to"');
    }
    return bits;
  } else {
    throw new Error('bit qualification must be either: a number, QState.ALL, or {from: n, to: m}');
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
  if (bits === QState.ALL) {
    return bitRangeAsArray(0, numBits - 1);
  }
  if (bits.from != null && bits.to != null) {
    return bitRangeAsArray(bits.from, bits.to);
  }
  throw new Error('bit qualification must be either: a number, an array of numbers, QState.ALL, or {from: n, to: m}');
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

class QState {
  constructor(numBits, amplitudes) {
    validateArgs(arguments, 1, 'new QState() must be supplied with number of bits (optionally with amplitudes as well)');
    amplitudes = amplitudes || [Complex.ONE];

    this.numBits = () => {
      return numBits;
    };

    this.amplitude = (basisState) => {
      const numericIndex = typecheck.isString(basisState) ? parseBitString(basisState).value : basisState;
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
    };
  }

  static fromBits(bitString) {
    validateArgs(arguments, 1, 1, 'Must supply a bit string');
    const parsedBitString = parseBitString(bitString);
    const amplitudes = {};
    amplitudes[parsedBitString.value] = Complex.ONE;
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

  kron(otherState) {
    return this.tensorProduct(otherState);
  }

  static applyOperatorMatrix(matrix, bitValue, amplitude) {
    return [
      matrix[0][bitValue].multiply(amplitude),
      matrix[1][bitValue].multiply(amplitude)
    ];
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


  R(targetBits, angle) {
    return this.r(targetBits, angle);
  }

  controlledX(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to cnot() / controlledX().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, xMatrix);
  }

  cnot(controlBits, targetBits) {
    return this.controlledX(controlBits, targetBits);
  }

  x(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to x() / not().');
    return this.controlledX(null, targetBits);
  }

  not(targetBits) {
    return this.x(targetBits);
  }

  X(targetBits) {
    return this.x(targetBits);
  }

  controlledY(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledY().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, yMatrix);
  }

  y(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to y().');
    return this.controlledY(null, targetBits);
  }

  Y(targetBits) {
    return this.y(targetBits);
  }

  controlledZ(controlBits, targetBits) {
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledZ().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, zMatrix);
  }

  z(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to z().');
    return this.controlledZ(null, targetBits);
  }

  Z(targetBits) {
    return this.z(targetBits);
  }

  controlledS(controlBits, targetBits) {
    //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/2)
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledS().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, sMatrix);
  }

  s(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to s().');
    return this.controlledS(null, targetBits);
  }

  S(targetBits) {
    return this.s(targetBits);
  }

  controlledT(controlBits, targetBits) {
    //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/4)
    validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledT().');
    return this.controlledApplicationOfqBitOperator(controlBits, targetBits, tMatrix);
  }

  t(targetBits) {
    validateArgs(arguments, 1, 1, 'Must supply target bits to t().');
    return this.controlledT(null, targetBits);
  }

  T(targetBits) {
    return this.t(targetBits);
  }

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
        newAmplitudes[state] = stateWithAmplitude.amplitude;
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

  equal(other) {
    return this.eql(other);
  }

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

// Amplitudes with magnitudes smaller than QState.roundToZero this are rounded off to zero.
QState.roundToZero = 0.0000001;

// Make this a static constants once Safari supports it
QState.ALL = "ALL";

/**
 * Return x^y mod m
 */
function powerMod(x, y, m) {
  if (y === 0) return 1;
  if (y === 1) return x;
  const halfY = Math.floor(y / 2);
  const powerHalfY = powerMod(x, halfY, m);
  let result = (powerHalfY * powerHalfY) % m;
  if (y % 2 === 1) result = (x * result) % m;
  return result;
}

function approximatelyInteger(x) {
  return Math.abs(x - Math.round(x)) < 0.0000001;
}

/**
 * Return x such that n = x^y for some prime number x, or otherwise return 0.
 */
function powerFactor(n) {
  const log2n = Math.log(n) / Math.log(2);
  // Try values of root_y(n) starting at log2n and working your way down to 2.
  let y = Math.floor(log2n);
  if (log2n === y) {
    return 2;
  }
  y--;
  for (; y > 1; y--) {
    const x = Math.pow(n, 1 / y);
    if (approximatelyInteger(x)) {
      return Math.round(x);
    }
  }
  return 0;
}

/**
 * Greatest common divisor
 */
function gcd(a, b) {
  while (b !== 0) {
    const c = a % b;
    a = b;
    b = c;
  }
  return a;
}

/**
 * Least common multiple
 */
function lcm(a, b) {
  return a * b / gcd(a, b);
}

function roundTowardsZero(value) {
  return value >= 0 ? Math.floor(value) : Math.ceil(value);
}

/**
 * Find the continued fraction representation of a number.
 * @param the value to be converted to a continued faction.
 * @param the precision with which to compute (eg. 0.01 will compute values until the fraction is at least as precise as 0.01).
 * @return An object {quotients: quotients, numerator: numerator, denominator: denominator} where quotients is
 * an array of the quotients making up the continued fraction whose value is within the specified precision of the targetValue,
 * and where numerator and denominator are the integer values to which the continued fraction evaluates.
 */
function continuedFraction(targetValue, precision) {
  let firstValue;
  let remainder;
  if (Math.abs(targetValue) >= 1) {
    firstValue = roundTowardsZero(targetValue);
    remainder = targetValue - firstValue;
  } else {
    firstValue = 0;
    remainder = targetValue;
  }
  let twoAgo = {numerator: 1, denominator: 0};
  let oneAgo = {numerator: firstValue, denominator: 1};
  const quotients = [firstValue];

  while (Math.abs(targetValue - (oneAgo.numerator / oneAgo.denominator)) > precision) {
    const reciprocal = 1 / remainder;
    const quotient = roundTowardsZero(reciprocal);
    remainder = reciprocal - quotient;
    quotients.push(quotient);
    const current = {numerator: quotient * oneAgo.numerator + twoAgo.numerator, denominator: quotient * oneAgo.denominator + twoAgo.denominator};
    twoAgo = oneAgo;
    oneAgo = current;
  }

  let {numerator, denominator} = oneAgo;
  if (oneAgo.denominator < 0) {
    numerator *= -1;
    denominator *= -1;
  }
  return {quotients, numerator, denominator};
}

//--------------

function cloneArray(a) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i];
  }
  return result;
}

/**
 * Find the null space in modulus 2 arithmetic of a matrix of binary values
 * @param matrix matrix of binary values represented using an array of numbers
 * whose bit values are the entries of a matrix rowIndex.
 * @param width the width of the matrix.
 */
function findNullSpaceMod2(matrix, width) {
  const transformedMatrix = cloneArray(matrix);
  /**
   * Try to make row pivotRowIndex / column colIndex a pivot
   * swapping rows if necessary.
   */
  function attemptToMakePivot(colIndex, pivotRowIndex) {
    const colBitMask = 1 << colIndex;
    if (colBitMask & transformedMatrix[pivotRowIndex]) return;
    for (let rowIndex = pivotRowIndex + 1; rowIndex < transformedMatrix.length; rowIndex++) {
      if (colBitMask & transformedMatrix[rowIndex]) {
        const tmp = transformedMatrix[pivotRowIndex];
        transformedMatrix[pivotRowIndex] = transformedMatrix[rowIndex];
        transformedMatrix[rowIndex] = tmp;
        return;
      }
    }
  }

  /**
   * Zero out the values above and below the pivot (using mod 2 arithmetic).
   */
  function zeroOutAboveAndBelow(pivotColIndex, pivotRowIndex) {
    const pivotRow = transformedMatrix[pivotRowIndex];
    const colBitMask = 1 << pivotColIndex;
    for (let rowIndex = 0; rowIndex < transformedMatrix.length; rowIndex++) {
      if (rowIndex !== pivotRowIndex && (colBitMask & transformedMatrix[rowIndex])) {
        transformedMatrix[rowIndex] ^= pivotRow;
      }
    }
  }

  /**
   * Reduce 'a' to reduced row echelon form,
   * and keep track of which columns are pivot columns in pivotColumnIndexes.
   */
  function makeReducedRowEchelonForm(pivotColumnIndexes) {
    let pivotRowIndex = 0;
    for (let pivotColIndex = width - 1; pivotColIndex >= 0; pivotColIndex--) {
      attemptToMakePivot(pivotColIndex, pivotRowIndex);
      const colBitMask = 1 << pivotColIndex;
      if (colBitMask & transformedMatrix[pivotRowIndex]) {
        pivotColumnIndexes[pivotRowIndex] = pivotColIndex;
        zeroOutAboveAndBelow(pivotColIndex, pivotRowIndex);
        pivotRowIndex++;
      }
    }
  }

  /**
   * Add to results, special solutions corresponding to the specified non-pivot column colIndex.
   */
  function specialSolutionForColumn(pivotColumnIndexes, colIndex, pivotNumber) {
    const columnMask = 1 << colIndex;
    let specialSolution = columnMask;
    for (let rowIndex = 0; rowIndex < pivotNumber; rowIndex++) {
      if (transformedMatrix[rowIndex] & columnMask) {
        specialSolution += 1 << pivotColumnIndexes[rowIndex];
      }
    }
    return specialSolution;
  }

  /**
   * Find the special solutions to the mod-2 equation Ax=0 for matrix a.
   */
  function specialSolutions(pivotColumnIndexes) {
    const results = [];
    let pivotNumber = 0;
    let nextPivotColumnIndex = pivotColumnIndexes[pivotNumber];
    for (let colIndex = width - 1; colIndex >= 0; colIndex--) {
      if (colIndex === nextPivotColumnIndex) {
        pivotNumber++;
        nextPivotColumnIndex = pivotColumnIndexes[pivotNumber];
      } else {
        results.push(specialSolutionForColumn(pivotColumnIndexes, colIndex, pivotNumber));
      }
    }
    return results;
  }

  const pivotColumnIndexes = [];
  makeReducedRowEchelonForm(pivotColumnIndexes);
  return specialSolutions(pivotColumnIndexes);
}

var QMath = {
  powerMod,
  powerFactor,
  gcd,
  lcm,
  continuedFraction,
  findNullSpaceMod2
};

var QMath$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  powerMod: powerMod,
  powerFactor: powerFactor,
  gcd: gcd,
  lcm: lcm,
  continuedFraction: continuedFraction,
  findNullSpaceMod2: findNullSpaceMod2,
  'default': QMath
});

function Qubits(bitString) {
  return QState.fromBits(bitString);
}

Qubits.complex = (real, imaginary) => {
  return new Complex(real, imaginary);
};

Qubits.real = (real) => {
  return new Complex(real, 0);
};

Qubits.QMath = QMath$1;
Qubits.Complex = Complex;
Qubits.QState = QState;
Qubits.Measurement = Measurement;
Qubits.QStateComponent = QStateComponent;
Qubits.ALL = QState.ALL;

Qubits.ZERO = Complex.ZERO;
Qubits.ONE = Complex.ONE;
Qubits.SQRT2 = Complex.SQRT2;
Qubits.SQRT1_2 = Complex.SQRT1_2;

module.exports = Qubits;
