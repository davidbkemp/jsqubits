'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Measurement = require('./Measurement');

var _Measurement2 = _interopRequireDefault(_Measurement);

var _Complex = require('./Complex');

var _Complex2 = _interopRequireDefault(_Complex);

var _validateArgs = require('./utils/validateArgs');

var _validateArgs2 = _interopRequireDefault(_validateArgs);

var _typecheck = require('./utils/typecheck');

var _typecheck2 = _interopRequireDefault(_typecheck);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function parseBitString(bitString) {
  // Strip optional 'ket' characters to support |0101>
  bitString = bitString.replace(/^\|/, '').replace(/>$/, '');
  return { value: parseInt(bitString, 2), length: bitString.length };
}

function sparseAssign(array, index, value) {
  // Try to avoid assigning values and try to make zero exactly zero.
  if (value.magnitude() > _constants2.default.roundToZero) {
    array[index] = value;
  }
}

/*
  Add amplitude to the existing amplitude for state in the amplitudes object
  Keep the object sparse by deleting values close to zero.
 */
function sparseAdd(amplitudes, state, amplitude) {
  var newAmplitude = (amplitudes[state] || _Complex2.default.ZERO).add(amplitude);
  if (newAmplitude.magnitude() > _constants2.default.roundToZero) {
    amplitudes[state] = newAmplitude;
  } else {
    delete amplitudes[state];
  }
}

function convertBitQualifierToBitRange(bits, numBits) {
  if (bits == null) {
    throw new Error('bit qualification must be supplied');
  } else if (bits === _constants2.default.ALL) {
    return { from: 0, to: numBits - 1 };
  } else if (_typecheck2.default.isNumber(bits)) {
    return { from: bits, to: bits };
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
  for (var i = 0; i < controlBits.length; i++) {
    var controlBit = controlBits[i];
    for (var j = 0; j < targetBits.length; j++) {
      if (controlBit === targetBits[j]) {
        throw new Error('control and target bits must not be the same nor overlap');
      }
    }
  }
}

function chooseRandomBasisState(qState) {
  var randomNumber = qState.random();
  var randomStateString = void 0;
  var accumulativeSquareAmplitudeMagnitude = 0;
  qState.each(function (stateWithAmplitude) {
    var magnitude = stateWithAmplitude.amplitude.magnitude();
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
  var result = [];
  for (var i = low; i <= high; i++) {
    result.push(i);
  }
  return result;
}

function convertBitQualifierToBitArray(bits, numBits) {
  if (bits == null) {
    throw new Error('bit qualification must be supplied');
  }
  if (_typecheck2.default.isArray(bits)) {
    return bits;
  }
  if (_typecheck2.default.isNumber(bits)) {
    return [bits];
  }
  if (bits === _constants2.default.ALL) {
    return bitRangeAsArray(0, numBits - 1);
  }
  if (bits.from != null && bits.to != null) {
    return bitRangeAsArray(bits.from, bits.to);
  }
  throw new Error('bit qualification must be either: a number, an array of numbers, Constants.ALL, or {from: n, to: m}');
}

function createBitMask(bits) {
  var mask = null;
  if (bits) {
    mask = 0;
    for (var i = 0; i < bits.length; i++) {
      mask += 1 << bits[i];
    }
  }
  return mask;
}

var hadamardMatrix = [[_Complex2.default.SQRT1_2, _Complex2.default.SQRT1_2], [_Complex2.default.SQRT1_2, _Complex2.default.SQRT1_2.negate()]];

var xMatrix = [[_Complex2.default.ZERO, _Complex2.default.ONE], [_Complex2.default.ONE, _Complex2.default.ZERO]];

var yMatrix = [[_Complex2.default.ZERO, new _Complex2.default(0, -1)], [new _Complex2.default(0, 1), _Complex2.default.ZERO]];

var zMatrix = [[_Complex2.default.ONE, _Complex2.default.ZERO], [_Complex2.default.ZERO, _Complex2.default.ONE.negate()]];

var sMatrix = [[_Complex2.default.ONE, _Complex2.default.ZERO], [_Complex2.default.ZERO, new _Complex2.default(0, 1)]];

var tMatrix = [[_Complex2.default.ONE, _Complex2.default.ZERO], [_Complex2.default.ZERO, new _Complex2.default(Math.SQRT1_2, Math.SQRT1_2)]];

var QState = function () {
  function QState(numBits, amplitudes) {
    _classCallCheck(this, QState);

    this.kron = this.tensorProduct;
    this.R = this.r;
    this.cnot = this.controlledX;
    this.not = this.x;
    this.X = this.x;
    this.Y = this.y;
    this.Z = this.z;
    this.S = this.s;
    this.T = this.t;
    this.equal = this.eql;

    (0, _validateArgs2.default)(arguments, 1, 'new QState() must be supplied with number of bits (optionally with amplitudes as well)');
    amplitudes = amplitudes || [_constants2.default.ONE];

    this.numBits = function () {
      return numBits;
    };

    this.amplitude = function (basisState) {
      var numericIndex = _typecheck2.default.isString(basisState) ? parseBitString(basisState).value : basisState;
      return amplitudes[numericIndex] || _Complex2.default.ZERO;
    };

    this.each = function (callBack) {
      var indices = Object.keys(amplitudes);
      for (var i = 0; i < indices.length; i++) {
        var index = indices[i];
        var returnValue = callBack(new _Measurement.QStateComponent(numBits, index, amplitudes[index]));
        // NOTE: Want to continue on void and null returns!
        if (returnValue === false) break;
      }
    };
  }

  _createClass(QState, [{
    key: 'multiply',
    value: function multiply(amount) {
      if (_typecheck2.default.isNumber(amount)) {
        amount = new _Complex2.default(amount);
      }
      var amplitudes = {};
      this.each(function (oldAmplitude) {
        amplitudes[oldAmplitude.index] = oldAmplitude.amplitude.multiply(amount);
      });
      return new QState(this.numBits(), amplitudes);
    }
  }, {
    key: 'add',
    value: function add(otherState) {
      var amplitudes = {};
      this.each(function (stateWithAmplitude) {
        amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude;
      });
      otherState.each(function (stateWithAmplitude) {
        var existingValue = amplitudes[stateWithAmplitude.index] || _Complex2.default.ZERO;
        amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.add(existingValue);
      });
      return new QState(this.numBits(), amplitudes);
    }
  }, {
    key: 'subtract',
    value: function subtract(otherState) {
      return this.add(otherState.multiply(-1));
    }
  }, {
    key: 'tensorProduct',
    value: function tensorProduct(otherState) {
      var amplitudes = {};
      this.each(function (basisWithAmplitudeA) {
        otherState.each(function (otherBasisWithAmplitude) {
          var newBasisState = (basisWithAmplitudeA.asNumber() << otherState.numBits()) + otherBasisWithAmplitude.asNumber();
          var newAmplitude = basisWithAmplitudeA.amplitude.multiply(otherBasisWithAmplitude.amplitude);
          amplitudes[newBasisState] = newAmplitude;
        });
      });
      return new QState(this.numBits() + otherState.numBits(), amplitudes);
    }
  }, {
    key: 'controlledHadamard',
    value: function controlledHadamard(controlBits, targetBits) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to controlledHadamard()');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, hadamardMatrix);
    }
  }, {
    key: 'hadamard',
    value: function hadamard(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to hadamard() as either a single index or a range.');
      return this.controlledHadamard(null, targetBits);
    }
  }, {
    key: 'controlledXRotation',
    value: function controlledXRotation(controlBits, targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledXRotation()');
      var halfAngle = angle / 2;
      var cosine = new _Complex2.default(Math.cos(halfAngle));
      var negativeISine = new _Complex2.default(0, -Math.sin(halfAngle));

      var rotationMatrix = [[cosine, negativeISine], [negativeISine, cosine]];

      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
    }
  }, {
    key: 'rotateX',
    value: function rotateX(targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply target bits and angle to rotateX.');
      return this.controlledXRotation(null, targetBits, angle);
    }
  }, {
    key: 'controlledYRotation',
    value: function controlledYRotation(controlBits, targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledYRotation()');
      var halfAngle = angle / 2;
      var cosine = new _Complex2.default(Math.cos(halfAngle));
      var sine = new _Complex2.default(Math.sin(halfAngle));
      var rotationMatrix = [[cosine, sine.negate()], [sine, cosine]];

      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
    }
  }, {
    key: 'rotateY',
    value: function rotateY(targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply target bits and angle to rotateY.');
      return this.controlledYRotation(null, targetBits, angle);
    }
  }, {
    key: 'controlledZRotation',
    value: function controlledZRotation(controlBits, targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control bits, target bits, and an angle to controlledZRotation()');
      var halfAngle = angle / 2;
      var cosine = new _Complex2.default(Math.cos(halfAngle));
      var iSine = new _Complex2.default(0, Math.sin(halfAngle));
      var rotationMatrix = [[cosine.subtract(iSine), _Complex2.default.ZERO], [_Complex2.default.ZERO, cosine.add(iSine)]];
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
    }
  }, {
    key: 'rotateZ',
    value: function rotateZ(targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply target bits and angle to rotateZ.');
      return this.controlledZRotation(null, targetBits, angle);
    }
  }, {
    key: 'controlledR',
    value: function controlledR(controlBits, targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control and target bits, and an angle to controlledR().');
      var cosine = new _Complex2.default(Math.cos(angle));
      var iSine = new _Complex2.default(0, Math.sin(angle));
      var rotationMatrix = [[_Complex2.default.ONE, _Complex2.default.ZERO], [_Complex2.default.ZERO, cosine.add(iSine)]];
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, rotationMatrix);
    }
  }, {
    key: 'r',
    value: function r(targetBits, angle) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply target bits and angle to r().');
      return this.controlledR(null, targetBits, angle);
    }
  }, {
    key: 'controlledX',
    value: function controlledX(controlBits, targetBits) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to cnot() / controlledX().');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, xMatrix);
    }
  }, {
    key: 'x',
    value: function x(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to x() / not().');
      return this.controlledX(null, targetBits);
    }
  }, {
    key: 'controlledY',
    value: function controlledY(controlBits, targetBits) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to controlledY().');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, yMatrix);
    }
  }, {
    key: 'y',
    value: function y(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to y().');
      return this.controlledY(null, targetBits);
    }
  }, {
    key: 'controlledZ',
    value: function controlledZ(controlBits, targetBits) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to controlledZ().');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, zMatrix);
    }
  }, {
    key: 'z',
    value: function z(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to z().');
      return this.controlledZ(null, targetBits);
    }
  }, {
    key: 'controlledS',
    value: function controlledS(controlBits, targetBits) {
      //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/2)
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to controlledS().');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, sMatrix);
    }
  }, {
    key: 's',
    value: function s(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to s().');
      return this.controlledS(null, targetBits);
    }
  }, {
    key: 'controlledT',
    value: function controlledT(controlBits, targetBits) {
      //        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/4)
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply control and target bits to controlledT().');
      return this.controlledApplicationOfqBitOperator(controlBits, targetBits, tMatrix);
    }
  }, {
    key: 't',
    value: function t(targetBits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply target bits to t().');
      return this.controlledT(null, targetBits);
    }
  }, {
    key: 'controlledSwap',
    value: function controlledSwap(controlBits, targetBit1, targetBit2) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply controlBits, targetBit1, and targetBit2 to controlledSwap()');
      var newAmplitudes = {};
      if (controlBits != null) {
        controlBits = convertBitQualifierToBitArray(controlBits, this.numBits());
      }
      //        TODO: make sure targetBit1 and targetBit2 are not contained in controlBits.
      var controlBitMask = createBitMask(controlBits);
      var bit1Mask = 1 << targetBit1;
      var bit2Mask = 1 << targetBit2;
      this.each(function (stateWithAmplitude) {
        var state = stateWithAmplitude.asNumber();
        var newState = state;
        if (controlBits == null || (state & controlBitMask) === controlBitMask) {
          var newBit2 = (state & bit1Mask) >> targetBit1 << targetBit2;
          var newBit1 = (state & bit2Mask) >> targetBit2 << targetBit1;
          newState = state & ~bit1Mask & ~bit2Mask | newBit1 | newBit2;
        }
        newAmplitudes[newState] = stateWithAmplitude.amplitude;
      });
      return new QState(this.numBits(), newAmplitudes);
    }
  }, {
    key: 'swap',
    value: function swap(targetBit1, targetBit2) {
      (0, _validateArgs2.default)(arguments, 2, 2, 'Must supply targetBit1 and targetBit2 to swap()');
      return this.controlledSwap(null, targetBit1, targetBit2);
    }

    /**
     * Toffoli takes one or more control bits (conventionally two) and one target bit.
     */

  }, {
    key: 'toffoli',
    value: function toffoli() /* controlBit, controlBit, ..., targetBit */{
      (0, _validateArgs2.default)(arguments, 2, 'At least one control bit and a target bit must be supplied to calls to toffoli()');
      var targetBit = arguments[arguments.length - 1];
      var controlBits = [];
      for (var i = 0; i < arguments.length - 1; i++) {
        controlBits.push(arguments[i]);
      }
      return this.controlledX(controlBits, targetBit);
    }
  }, {
    key: 'controlledApplicationOfqBitOperator',
    value: function controlledApplicationOfqBitOperator(controlBits, targetBits, operatorMatrix) {
      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control bits, target bits, and qbitFunction to controlledApplicationOfqBitOperator().');
      var targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
      var controlBitArray = null;
      if (controlBits != null) {
        controlBitArray = convertBitQualifierToBitArray(controlBits, this.numBits());
        validateControlAndTargetBitsDontOverlap(controlBitArray, targetBitArray);
      }
      var result = this;
      for (var i = 0; i < targetBitArray.length; i++) {
        var targetBit = targetBitArray[i];
        result = QState.applyToOneBit(controlBitArray, targetBit, operatorMatrix, result);
      }
      return result;
    }
  }, {
    key: 'applyFunction',
    value: function applyFunction(inputBits, targetBits, functionToApply) {
      function validateTargetBitRangesDontOverlap(inputBitRange, targetBitRange) {
        if (inputBitRange.to >= targetBitRange.from && targetBitRange.to >= inputBitRange.from) {
          throw new Error('control and target bits must not be the same nor overlap');
        }
      }

      (0, _validateArgs2.default)(arguments, 3, 3, 'Must supply control bits, target bits, and functionToApply to applyFunction().');
      var qState = this;
      var inputBitRange = convertBitQualifierToBitRange(inputBits, this.numBits());
      var targetBitRange = convertBitQualifierToBitRange(targetBits, this.numBits());
      validateTargetBitRangesDontOverlap(inputBitRange, targetBitRange);
      var newAmplitudes = {};
      var statesThatCanBeSkipped = {};
      var highBitMask = (1 << inputBitRange.to + 1) - 1;
      var targetBitMask = (1 << 1 + targetBitRange.to - targetBitRange.from) - 1 << targetBitRange.from;

      this.each(function (stateWithAmplitude) {
        var state = stateWithAmplitude.asNumber();
        if (statesThatCanBeSkipped[stateWithAmplitude.index]) return;
        var input = (state & highBitMask) >> inputBitRange.from;
        var result = functionToApply(input) << targetBitRange.from & targetBitMask;
        var resultingState = state ^ result;
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

  }, {
    key: 'random',
    value: function random() {
      return Math.random();
    }
  }, {
    key: 'normalize',
    value: function normalize() {
      var amplitudes = {};
      var sumOfMagnitudeSqaures = 0;
      this.each(function (stateWithAmplitude) {
        var magnitude = stateWithAmplitude.amplitude.magnitude();
        sumOfMagnitudeSqaures += magnitude * magnitude;
      });
      var scale = new _Complex2.default(1 / Math.sqrt(sumOfMagnitudeSqaures));
      this.each(function (stateWithAmplitude) {
        amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.multiply(scale);
      });
      return new QState(this.numBits(), amplitudes);
    }
  }, {
    key: 'measure',
    value: function measure(bits) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply bits to be measured to measure().');
      var numBits = this.numBits();
      var bitArray = convertBitQualifierToBitArray(bits, numBits);
      var chosenState = chooseRandomBasisState(this);
      var bitMask = createBitMask(bitArray);
      var maskedChosenState = chosenState & bitMask;

      var newAmplitudes = {};
      this.each(function (stateWithAmplitude) {
        var state = stateWithAmplitude.asNumber();
        if ((state & bitMask) === maskedChosenState) {
          newAmplitudes[state] = stateWithAmplitude.amplitude;
        }
      });

      // Measurement outcome is the "value" of the measured bits.
      // It probably only makes sense when the bits make an adjacent block.
      var measurementOutcome = 0;
      for (var bitIndex = numBits - 1; bitIndex >= 0; bitIndex--) {
        if (bitArray.indexOf(bitIndex) >= 0) {
          measurementOutcome <<= 1;
          if (chosenState & 1 << bitIndex) {
            measurementOutcome += 1;
          }
        }
      }

      var newState = new QState(this.numBits(), newAmplitudes).normalize();
      return new _Measurement2.default(bitArray.length, measurementOutcome, newState);
    }
  }, {
    key: 'qft',
    value: function qft(targetBits) {
      function qft(qstate, targetBitArray) {
        var bitIndex = targetBitArray[0];
        if (targetBitArray.length > 1) {
          qstate = qft(qstate, targetBitArray.slice(1));
          for (var index = 1; index < targetBitArray.length; index++) {
            var otherBitIndex = targetBitArray[index];
            var angle = 2 * Math.PI / (1 << index + 1);
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

      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply bits to be measured to qft().');
      var targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
      var newState = qft(this, targetBitArray);
      return reverseBits(newState, targetBitArray);
    }
  }, {
    key: 'eql',
    value: function eql(other) {
      function lhsAmplitudesHaveMatchingRhsAmplitudes(lhs, rhs) {
        var result = true;
        lhs.each(function (stateWithAmplitude) {
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
      return lhsAmplitudesHaveMatchingRhsAmplitudes(this, other) && lhsAmplitudesHaveMatchingRhsAmplitudes(other, this);
    }
  }, {
    key: 'toString',
    value: function toString() {
      function formatAmplitude(amplitude, formatFlags) {
        var amplitudeString = amplitude.format(formatFlags);
        return amplitudeString === '1' ? '' : '(' + amplitudeString + ')';
      }

      function compareStatesWithAmplitudes(a, b) {
        return a.asNumber() - b.asNumber();
      }

      function sortedNonZeroStates(qState) {
        var nonZeroStates = [];
        qState.each(function (stateWithAmplitude) {
          nonZeroStates.push(stateWithAmplitude);
        });
        nonZeroStates.sort(compareStatesWithAmplitudes);
        return nonZeroStates;
      }

      var stateWithAmplitude = void 0;
      var result = '';
      var formatFlags = { decimalPlaces: 4 };
      var nonZeroStates = sortedNonZeroStates(this);
      for (var i = 0; i < nonZeroStates.length; i++) {
        if (result !== '') result += ' + ';
        stateWithAmplitude = nonZeroStates[i];
        result = result + formatAmplitude(stateWithAmplitude.amplitude, formatFlags) + '|' + stateWithAmplitude.asBitString() + '>';
      }
      return result;
    }
  }], [{
    key: 'fromBits',
    value: function fromBits(bitString) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply a bit string');
      var parsedBitString = parseBitString(bitString);
      var amplitudes = {};
      amplitudes[parsedBitString.value] = _constants2.default.ONE;
      return new QState(parsedBitString.length, amplitudes);
    }
  }, {
    key: 'applyOperatorMatrix',
    value: function applyOperatorMatrix(matrix, bitValue, amplitude) {
      return [matrix[0][bitValue].multiply(amplitude), matrix[1][bitValue].multiply(amplitude)];
    }
  }, {
    key: 'applyToOneBit',
    value: function applyToOneBit(controlBits, targetBit, operatorMatrix, qState) {
      var newAmplitudes = {};
      var targetBitMask = 1 << targetBit;
      var inverseTargetBitMask = ~targetBitMask;
      var controlBitMask = createBitMask(controlBits);

      qState.each(function (stateWithAmplitude) {
        var state = stateWithAmplitude.asNumber();
        if (controlBits == null || (state & controlBitMask) === controlBitMask) {
          var bitValue = (targetBitMask & state) > 0 ? 1 : 0;
          var result = QState.applyOperatorMatrix(operatorMatrix, bitValue, stateWithAmplitude.amplitude);
          var zeroState = state & inverseTargetBitMask;
          var oneState = state | targetBitMask;
          sparseAdd(newAmplitudes, zeroState, result[0]);
          sparseAdd(newAmplitudes, oneState, result[1]);
        } else {
          newAmplitudes[state] = stateWithAmplitude.amplitude;
        }
      });

      return new QState(qState.numBits(), newAmplitudes);
    }
  }]);

  return QState;
}();

exports.default = QState;