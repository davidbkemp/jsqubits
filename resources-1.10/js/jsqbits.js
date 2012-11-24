/**
 *    Copyright 2012 David Kemp

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * For documentation, and the latest version, see http://www.jsqbits.org/
 */

/*jshint eqnull:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, nonew:true, regexp:true, undef:true, unused:true, strict:true, trailing:true */
/*global module:true */

function jsqbits(bitString) {
    "use strict";
    return jsqbits.QState.fromBits(bitString);
}

/* Allow this module to used within node and stand-alone. */
if (typeof module !== 'undefined') {
    module.exports = jsqbits;
}

(function() {
    "use strict";

    jsqbits.Complex = function(real, imaginary) {
        validateArgs(arguments, 1, 2, 'Must supply a real, and optionally an imaginary, argument to Complex()');
        imaginary = imaginary || 0;
        this.real = function() {return real;};
        this.imaginary = function() {return imaginary;};
    };

    jsqbits.Complex.prototype.add = function(other) {
        validateArgs(arguments, 1, 1, 'Must supply 1 parameter to add()');
        if (typeof other === 'number') {
            return new jsqbits.Complex(this.real() + other, this.imaginary());
        }
        return new jsqbits.Complex(this.real() + other.real(), this.imaginary() + other.imaginary());
    };

    jsqbits.Complex.prototype.multiply = function(other) {
        validateArgs(arguments, 1, 1, 'Must supply 1 parameter to multiply()');
        if (typeof other === 'number') {
            return new jsqbits.Complex(this.real() * other, this.imaginary() * other);
        }
        return new jsqbits.Complex(this.real() * other.real() - this.imaginary() * other.imaginary(),
                    this.real() * other.imaginary() + this.imaginary() * other.real());
    };

    jsqbits.Complex.prototype.conjugate = function() {
        return new jsqbits.Complex(this.real(), -this.imaginary());
    };

    jsqbits.Complex.prototype.toString = function() {
        if (this.imaginary() === 0) return "" + this.real();
        var imaginaryString;
        if (this.imaginary() === 1) {
            imaginaryString = 'i';
        } else if (this.imaginary() === -1) {
            imaginaryString = '-i';
        } else {
            imaginaryString = this.imaginary() + 'i';
        }
        if (this.real() === 0) return imaginaryString;
        var sign = (this.imaginary() < 0) ? "" : "+";
        return this.real() + sign + imaginaryString;
    };

    jsqbits.Complex.prototype.format = function(options) {
        var realValue = this.real();
        var imaginaryValue = this.imaginary();
        if (options && options.decimalPlaces != null) {
            var roundingMagnitude = Math.pow(10, options.decimalPlaces);
            realValue = Math.round(realValue * roundingMagnitude) /roundingMagnitude;
            imaginaryValue = Math.round(imaginaryValue * roundingMagnitude) /roundingMagnitude;
        }
        var objectToFormat = new jsqbits.Complex(realValue, imaginaryValue);
        var prefix = '';
        if (options && options.spacedSign) {
            if (objectToFormat.real() > 0) {
                prefix = ' + ';
            } else if (objectToFormat.real() < 0) {
                prefix = ' - ';
                objectToFormat = objectToFormat.negate();
            } else if (objectToFormat.imaginary() >= 0) {
                prefix = ' + ';
            } else {
                prefix = ' - ';
                objectToFormat = objectToFormat.negate();
            }
        }
        return prefix + (objectToFormat.toString());
    };

    jsqbits.Complex.prototype.negate = function() {
        return new jsqbits.Complex(-this.real(), -this.imaginary());
    };

    jsqbits.Complex.prototype.magnitude = function() {
        return Math.sqrt(this.real() * this.real() + this.imaginary() * this.imaginary());
    };

    jsqbits.Complex.prototype.subtract = function(other) {
        validateArgs(arguments, 1, 1, 'Must supply 1 parameter to subtract()');
        if (typeof other === 'number') {
            return new jsqbits.Complex(this.real() - other, this.imaginary());
        }
        return new jsqbits.Complex(this.real() - other.real(), this.imaginary() - other.imaginary());
    };

    jsqbits.Complex.prototype.eql = function(other) {
        if (!(other instanceof jsqbits.Complex)) return false;
        return this.real() === other.real() && this.imaginary() === other.imaginary();
    };

    jsqbits.Complex.ZERO = new jsqbits.Complex(0,0);
    jsqbits.ZERO = jsqbits.Complex.ZERO;
    jsqbits.ONE = new jsqbits.Complex(1, 0);

    jsqbits.complex = function(real, imaginary) {
        return new Complex(real, imaginary);
    };

    jsqbits.real = function(real) {
        return new Complex(real, 0);
    };

    var Complex = jsqbits.Complex;
    var complex = jsqbits.complex;
    var real = jsqbits.real;

    jsqbits.ALL = 'ALL';

    // Amplitudes with magnitudes smaller than jsqbits.roundToZero this are rounded off to zero.
    jsqbits.roundToZero = 0.0000001;

    jsqbits.Measurement = function(numBits, result, newState) {
        this.numBits = numBits;
        this.result = result;
        this.newState = newState;
    };

    jsqbits.Measurement.prototype.toString = function() {
        return "{result: " + this.result + ", newState: " + this.newState + "}";
    };

    jsqbits.Measurement.prototype.asBitString = function() {
        return padState(this.result.toString(2), this.numBits);
    };

    jsqbits.StateWithAmplitude = function(numBits, index, amplitude) {
        this.numBits = numBits;
        this.index = index;
        this.amplitude = amplitude;
    };

    jsqbits.StateWithAmplitude.prototype.asNumber = function() {
        return parseInt(this.index, 10);
    };

    jsqbits.StateWithAmplitude.prototype.asBitString = function() {
        return padState(parseInt(this.index, 10).toString(2), this.numBits);
    };

    jsqbits.QState = function(numBits, amplitudes) {
        validateArgs(arguments, 1, 'new QState() must be supplied with number of bits (optionally with amplitudes as well)');
        amplitudes = amplitudes || [jsqbits.ONE];

        this.numBits = function () {
            return numBits;
        };

        this.amplitude = function(basisState) {
            validateArgs(arguments, 1, 1, 'Must supply an index to amplitude()');
            var numericIndex = (typeof basisState === 'string') ? parseBitString(basisState).value : basisState;
            return amplitudes[numericIndex] || Complex.ZERO;
        };

        this.each = function(callBack) {
            validateArgs(arguments, 1, 1, "Must supply a callback function to each()");
            for (var index in amplitudes) {
                if (amplitudes.hasOwnProperty(index)) {
                    var returnValue = callBack(new jsqbits.StateWithAmplitude(numBits, index, amplitudes[index]));
                    // NOTE: Want to continue on void and null returns!
                    if(returnValue === false) break;
                }
            }
        };
    };

    jsqbits.QState.fromBits = function(bitString) {
        validateArgs(arguments, 1, 1, 'Must supply a bit string');
        var parsedBitString = parseBitString(bitString);
        var amplitudes = {};
        amplitudes[parsedBitString.value] = jsqbits.ONE;
        return new jsqbits.QState(parsedBitString.length, amplitudes);
    };

    jsqbits.QState.prototype.multiply = function(amount) {
        if (typeof amount === 'number') {
            amount = real(amount);
        }
        var amplitudes = {};
        this.each(function(oldAmplitude) {
            amplitudes[oldAmplitude.index] = oldAmplitude.amplitude.multiply(amount);
        });
        return new jsqbits.QState(this.numBits(), amplitudes);
    };

    jsqbits.QState.prototype.add = function(otherState) {
        var amplitudes = {};
        this.each(function(stateWithAmplitude) {
            amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude;
        });
        otherState.each(function(stateWithAmplitude) {
            var existingValue = amplitudes[stateWithAmplitude.index] || Complex.ZERO;
            amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.add(existingValue);
        });
        return new jsqbits.QState(this.numBits(), amplitudes);
    };

    jsqbits.QState.prototype.subtract = function(otherState) {
        return this.add(otherState.multiply(-1));
    };

    jsqbits.QState.prototype.tensorProduct = function(otherState) {
        var amplitudes = {};
        this.each(function(basisWithAmplitudeA) {
            otherState.each(function(otherBasisWithAmplitude) {
                var newBasisState = (basisWithAmplitudeA.asNumber() << otherState.numBits()) + otherBasisWithAmplitude.asNumber();
                var newAmplitude = basisWithAmplitudeA.amplitude.multiply(otherBasisWithAmplitude.amplitude);
                amplitudes[newBasisState] = newAmplitude;
            });
        });
        return new jsqbits.QState(this.numBits() + otherState.numBits(), amplitudes);
    };

    jsqbits.QState.prototype.kron  = jsqbits.QState.prototype.tensorProduct;

    jsqbits.QState.prototype.controlledHadamard = (function() {
        var squareRootOfOneHalf = real(1 / Math.sqrt(2));
        return function(controlBits, targetBits) {
            validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledHadamard()');
            return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1) {
                var newAmplitudeOf0 = amplitudeOf0.add(amplitudeOf1).multiply(squareRootOfOneHalf);
                var newAmplitudeOf1 = amplitudeOf0.subtract(amplitudeOf1).multiply(squareRootOfOneHalf);
                return {amplitudeOf0: newAmplitudeOf0, amplitudeOf1: newAmplitudeOf1};
            });
        };
    })();

    jsqbits.QState.prototype.hadamard = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to hadamard() as either a single index or a range.');
        return this.controlledHadamard(null, targetBits);
    };

    jsqbits.QState.prototype.controlledXRotation = function(controlBits, targetBits, angle) {
        validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledXRotation()');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            var halfAngle = angle / 2;
            var cos = real(Math.cos(halfAngle));
            var negative_i_sin = complex(0, -Math.sin(halfAngle));
            var newAmplitudeOf0 = amplitudeOf0.multiply(cos).add(amplitudeOf1.multiply(negative_i_sin));
            var newAmplitudeOf1 = amplitudeOf0.multiply(negative_i_sin).add(amplitudeOf1.multiply(cos));
            return {amplitudeOf0: newAmplitudeOf0, amplitudeOf1: newAmplitudeOf1};
        });
    };

    jsqbits.QState.prototype.rotateX = function(targetBits, angle) {
        validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateX.');
        return this.controlledXRotation(null, targetBits, angle);
    };

    jsqbits.QState.prototype.controlledYRotation = function(controlBits, targetBits, angle) {
        validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle, to controlledYRotation()');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            var halfAngle = angle / 2;
            var cos = real(Math.cos(halfAngle));
            var sin = real(Math.sin(halfAngle));
            var newAmplitudeOf0 = amplitudeOf0.multiply(cos).add(amplitudeOf1.multiply(sin.negate()));
            var newAmplitudeOf1 = amplitudeOf0.multiply(sin).add(amplitudeOf1.multiply(cos));
            return {amplitudeOf0: newAmplitudeOf0, amplitudeOf1: newAmplitudeOf1};
        });
    };

    jsqbits.QState.prototype.rotateY = function(targetBits, angle) {
        validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateY.');
        return this.controlledYRotation(null, targetBits, angle);
    };

    jsqbits.QState.prototype.controlledZRotation = function(controlBits, targetBits, angle) {
        validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and an angle to controlledZRotation()');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            var halfAngle = angle / 2;
            var cos = real(Math.cos(halfAngle));
            var i_sin = complex(0, Math.sin(halfAngle));
            var newAmplitudeOf0 = amplitudeOf0.multiply(cos.subtract(i_sin));
            var newAmplitudeOf1 = amplitudeOf1.multiply(cos.add(i_sin));
            return {amplitudeOf0: newAmplitudeOf0, amplitudeOf1: newAmplitudeOf1};
        });
    };

    jsqbits.QState.prototype.rotateZ = function(targetBits, angle) {
        validateArgs(arguments, 2, 2, 'Must supply target bits and angle to rotateZ.');
        return this.controlledZRotation(null, targetBits, angle);
    };

    jsqbits.QState.prototype.controlledR = function(controlBits, targetBits, angle) {
        validateArgs(arguments, 3, 3, 'Must supply control and target bits, and an angle to controlledR().');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            var cos = real(Math.cos(angle));
            var i_sin = complex(0, Math.sin(angle));
            var newAmplitudeOf0 = amplitudeOf0;
            var newAmplitudeOf1 = amplitudeOf1.multiply(cos.add(i_sin));
            return {amplitudeOf0: newAmplitudeOf0, amplitudeOf1: newAmplitudeOf1};
        });
    };

    jsqbits.QState.prototype.r = function(targetBits, angle) {
        validateArgs(arguments, 2, 2, 'Must supply target bits and angle to r().');
        return this.controlledR(null, targetBits, angle);
    };

    jsqbits.QState.prototype.R = jsqbits.QState.prototype.r;

    jsqbits.QState.prototype.controlledX = function(controlBits, targetBits) {
        validateArgs(arguments, 2, 2, 'Must supply control and target bits to cnot() / controlledX().');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            return {amplitudeOf0: amplitudeOf1, amplitudeOf1: amplitudeOf0};
        });
    };

    jsqbits.QState.prototype.cnot = jsqbits.QState.prototype.controlledX;

    jsqbits.QState.prototype.x = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to x() / not().');
        return this.controlledX(null, targetBits);
    };

    jsqbits.QState.prototype.not = jsqbits.QState.prototype.x;
    jsqbits.QState.prototype.X = jsqbits.QState.prototype.x;

    jsqbits.QState.prototype.controlledY = function(controlBits, targetBits) {
        validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledY().');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits,  function(amplitudeOf0, amplitudeOf1){
            return {amplitudeOf0: amplitudeOf1.multiply(complex(0, -1)), amplitudeOf1: amplitudeOf0.multiply(complex(0, 1))};
        });
    };

    jsqbits.QState.prototype.y = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to y().');
        return this.controlledY(null, targetBits);
    };

    jsqbits.QState.prototype.Y = jsqbits.QState.prototype.y;

    jsqbits.QState.prototype.controlledZ = function(controlBits, targetBits) {
        validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledZ().');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            return {amplitudeOf0: amplitudeOf0, amplitudeOf1: amplitudeOf1.negate()};
        });
    };

    jsqbits.QState.prototype.z = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to z().');
        return this.controlledZ(null, targetBits);
    };

    jsqbits.QState.prototype.Z = jsqbits.QState.prototype.z;

    jsqbits.QState.prototype.controlledS = function(controlBits, targetBits) {
//        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/2)
        validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledS().');
        return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
            return {amplitudeOf0: amplitudeOf0, amplitudeOf1: amplitudeOf1.multiply(complex(0, 1))};
        });
    };

    jsqbits.QState.prototype.s = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to s().');
        return this.controlledS(null, targetBits);
    };

    jsqbits.QState.prototype.S = jsqbits.QState.prototype.s;

    jsqbits.QState.prototype.controlledT =  (function() {
//        Note this could actually be implemented as controlledR(controlBits, targetBits, PI/4)
        var expPiOn4 = complex(1 / Math.sqrt(2), 1 / Math.sqrt(2));
        return function(controlBits, targetBits) {
            validateArgs(arguments, 2, 2, 'Must supply control and target bits to controlledT().');
            return this.controlledApplicatinOfqBitOperator(controlBits, targetBits, function(amplitudeOf0, amplitudeOf1){
                return {amplitudeOf0: amplitudeOf0, amplitudeOf1: amplitudeOf1.multiply(expPiOn4)};
            });
        };
    })();

    jsqbits.QState.prototype.t = function(targetBits) {
        validateArgs(arguments, 1, 1, 'Must supply target bits to t().');
        return this.controlledT(null, targetBits);
    };

    jsqbits.QState.prototype.T = jsqbits.QState.prototype.t;

    jsqbits.QState.prototype.controlledSwap = function(controlBits, targetBit1, targetBit2) {
        validateArgs(arguments, 3, 3, "Must supply controlBits, targetBit1, and targetBit2 to controlledSwap()");
        var newAmplitudes = {};
        if (controlBits != null) {
            controlBits = convertBitQualifierToBitArray(controlBits, this.numBits());
        }
//        TODO: make sure targetBit1 and targetBit2 are not contained in controlBits.
        var controlBitMask = createControlBitMask(controlBits);
        var bit1Mask = 1 << targetBit1;
        var bit2Mask = 1 << targetBit2;
        this.each(function(stateWithAmplitude){
            var state = stateWithAmplitude.asNumber();
            var newState = state;
            if (controlBits == null || ((state & controlBitMask) === controlBitMask)) {
                var newBit2 = ((state & bit1Mask) >> targetBit1) << targetBit2;
                var newBit1 = ((state & bit2Mask) >>  targetBit2) << targetBit1;
                newState = (state & ~bit1Mask & ~bit2Mask) | newBit1 | newBit2;
            }
            newAmplitudes[newState] = stateWithAmplitude.amplitude;
        });
        return new jsqbits.QState(this.numBits(), newAmplitudes);
    };

    jsqbits.QState.prototype.swap = function(targetBit1, targetBit2) {
        validateArgs(arguments, 2, 2, "Must supply targetBit1 and targetBit2 to swap()");
        return this.controlledSwap(null, targetBit1, targetBit2);
    };

    /**
     * Toffoli takes one or more control bits (conventionally two) and one target bit.
     */
    jsqbits.QState.prototype.toffoli = function(/* controlBit, controlBit, ..., targetBit */) {
        validateArgs(arguments, 2, 'At least one control bit and a target bit must be supplied to calls to toffoli()');
        var targetBit = arguments[arguments.length - 1];
        var controlBits = [];
        for (var i = 0; i < arguments.length - 1; i++) {
            controlBits.push(arguments[i]);
        }
        return this.controlledX(controlBits, targetBit);
    };

    jsqbits.QState.prototype.controlledApplicatinOfqBitOperator = (function() {

        function validateTargetBitRangesDontOverlap(controlBits, targetBits) {
            // TODO: Find out if it would sometimes be faster to put one of the bit collections into a hash-set first.
            // Also consider allowing validation to be disabled.
            for (var i = 0; i < controlBits.length; i++) {
                var controlBit = controlBits[i];
                for (var j = 0; j < targetBits.length; j++) {
                    if (controlBit === targetBits[j]) {
                        throw "control and target bits must not be the same nor overlap";
                    }
                }
            }
        }

        function applyToOneBit(controlBits, targetBit, qbitFunction, qState) {
            var newAmplitudes = {};
            var statesThatCanBeSkipped = {};
            var targetBitMask = 1 << targetBit;
            var controlBitMask = createControlBitMask(controlBits);
            qState.each(function(stateWithAmplitude) {
                var state = stateWithAmplitude.asNumber();
                if (statesThatCanBeSkipped[stateWithAmplitude.index]) return;
                statesThatCanBeSkipped[state ^ targetBitMask] = true;
                var indexOf1 = state | targetBitMask;
                var indexOf0 = indexOf1 - targetBitMask;
                if (controlBits == null || ((state & controlBitMask) === controlBitMask)) {
                    var result = qbitFunction(qState.amplitude(indexOf0), qState.amplitude(indexOf1));
                    sparseAssign(newAmplitudes, indexOf0, result.amplitudeOf0);
                    sparseAssign(newAmplitudes, indexOf1, result.amplitudeOf1);
                } else {
                    sparseAssign(newAmplitudes, indexOf0, qState.amplitude(indexOf0));
                    sparseAssign(newAmplitudes, indexOf1, qState.amplitude(indexOf1));
                }
            });

            return new jsqbits.QState(qState.numBits(), newAmplitudes);
        }

        return function(controlBits, targetBits, qbitFunction) {
            validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and qbitFunction to controlledApplicatinOfqBitOperator().');
            var targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
            var controlBitArray = null;
            if (controlBits != null) {
                controlBitArray = convertBitQualifierToBitArray(controlBits, this.numBits());
                validateTargetBitRangesDontOverlap(controlBitArray, targetBitArray);
            }
            var result = this;
            for (var i = 0; i < targetBitArray.length; i++) {
                var targetBit = targetBitArray[i];
                result = applyToOneBit(controlBitArray, targetBit, qbitFunction, result);
            }
            return result;
        };
    })();

    jsqbits.QState.prototype.applyFunction = (function() {

        function validateTargetBitRangesDontOverlap(controlBits, targetBits) {
            if ((controlBits.to >= targetBits.from) && (targetBits.to >= controlBits.from)) {
                throw "control and target bits must not be the same nor overlap";
            }
        }

        return function(inputBits, targetBits, functionToApply) {
            validateArgs(arguments, 3, 3, 'Must supply control bits, target bits, and functionToApply to applyFunction().');
            var qState = this;
            var inputBitRange = convertBitQualifierToBitRange(inputBits, this.numBits());
            var targetBitRange = convertBitQualifierToBitRange(targetBits, this.numBits());
            validateTargetBitRangesDontOverlap(inputBitRange, targetBitRange);
            var newAmplitudes = {};
            var statesThatCanBeSkipped = {};
            var highBitMask = (1 << (inputBitRange.to + 1)) - 1;
            var targetBitMask = ((1 << (1 + targetBitRange.to - targetBitRange.from)) - 1) << targetBitRange.from;

            this.each(function (stateWithAmplitude) {
                var state = stateWithAmplitude.asNumber();
                if (statesThatCanBeSkipped[stateWithAmplitude.index]) return;
                var input = (state & highBitMask) >> inputBitRange.from;
                var result = (functionToApply(input) << targetBitRange.from) & targetBitMask;
                var resultingState = state ^ result;
                if (resultingState === state) {
                    sparseAssign(newAmplitudes, state, stateWithAmplitude.amplitude);
                } else {
                    statesThatCanBeSkipped[resultingState] = true;
                    sparseAssign(newAmplitudes, state, qState.amplitude(resultingState));
                    sparseAssign(newAmplitudes, resultingState, stateWithAmplitude.amplitude);
                }
            });

            return new jsqbits.QState(this.numBits(), newAmplitudes);
        };
    })();

    jsqbits.QState.prototype.random = Math.random;

    jsqbits.QState.prototype.normalize = function() {
        var amplitudes = {};
        var sumOfMagnitudeSqaures = 0;
        this.each(function (stateWithAmplitude) {
            var magnitude = stateWithAmplitude.amplitude.magnitude();
            sumOfMagnitudeSqaures += magnitude * magnitude;
        });
        var scale = real(1 / Math.sqrt(sumOfMagnitudeSqaures));
        this.each(function (stateWithAmplitude) {
            amplitudes[stateWithAmplitude.index] = stateWithAmplitude.amplitude.multiply(scale);
        });
        return new jsqbits.QState(this.numBits(), amplitudes);

    };

    jsqbits.QState.prototype.measure = function(bits) {
        validateArgs(arguments, 1, 1, 'Must supply bits to be measured to measure().');
        var bitRange = convertBitQualifierToBitRange(bits, this.numBits());
        var randomNumber = this.random();
        var randomStateString;
        var accumulativeSquareAmplitudeMagnitude = 0;
        this.each(function(stateWithAmplitude) {
            var magnitude = stateWithAmplitude.amplitude.magnitude();
            accumulativeSquareAmplitudeMagnitude += magnitude * magnitude;
            randomStateString = stateWithAmplitude.index;
            if (accumulativeSquareAmplitudeMagnitude > randomNumber) {
                return false;
            }
        });

        var randomState = parseInt(randomStateString, 10);

        var highBitMask = (1 << (bitRange.to + 1)) - 1;
        var measurementOutcome = (randomState & highBitMask) >> bitRange.from;

        var newAmplitudes = {};
        this.each(function(stateWithAmplitude) {
            var state = stateWithAmplitude.asNumber();
            var comparisonState = (state & highBitMask) >> bitRange.from;
            if (comparisonState === measurementOutcome) {
                newAmplitudes[state] = stateWithAmplitude.amplitude;
            }
        });

        var numBitsMeasured = bitRange.to - bitRange.from + 1;
        var newState = new jsqbits.QState(this.numBits(), newAmplitudes).normalize();
        return new jsqbits.Measurement(numBitsMeasured, measurementOutcome, newState);
    };

    jsqbits.QState.prototype.qft = function(targetBits) {

        function qft(qstate, targetBits) {
            var bitIndex = targetBits[0];
            if (targetBits.length > 1) {
                qstate = qft(qstate, targetBits.slice(1));
                for(var index = 1; index < targetBits.length; index++) {
                    var otherBitIndex = targetBits[index];
                    var angle = 2 * Math.PI / (1 << (index + 1));
                    qstate = qstate.controlledR(bitIndex, otherBitIndex, angle);
                }
            }
            return qstate.hadamard(bitIndex);
        }

        function reverseBits(qstate, targetBits) {
            while (targetBits.length > 1) {
                qstate = qstate.swap(targetBits[0], targetBits[targetBits.length - 1]);
                targetBits = targetBits.slice(1, targetBits.length - 1);
            }
            return qstate;
        }

        validateArgs(arguments, 1, 1, 'Must supply bits to be measured to qft().');
        var targetBitArray = convertBitQualifierToBitArray(targetBits, this.numBits());
        var newState = qft(this, targetBitArray);
        return reverseBits(newState, targetBitArray);
    };

    jsqbits.QState.prototype.eql = function(other) {
        var stateString;
        if (!other) return false;
        if (!(other instanceof jsqbits.QState)) return false;
        if (this.numBits() !== other.numBits()) return false;
        for (stateString in this.amplitudes) {
            if (this.amplitudes.hasOwnProperty(stateString) &&
                !this.amplitudes[stateString].eql(other.amplitudes[stateString])) return false;
        }
        for (stateString in other.amplitudes) {
            if (other.amplitudes.hasOwnProperty(stateString) &&
                !this.amplitudes[stateString].eql(other.amplitudes[stateString])) return false;
        }
        return true;
    };

    jsqbits.QState.prototype.toString = (function() {

        function formatAmplitude(amplitude, formatFlags) {
            var amplitudeString = amplitude.format(formatFlags);
            return amplitudeString === '1' ? '' : amplitudeString + " ";
        }

        function compareStatesWithAmplitudes(a, b)
        {
            return a.asNumber() - b.asNumber();
        }

        function sortedNonZeroStates(qState) {
            var nonZeroStates = [];
            qState.each(function(stateWithAmplitude){
                nonZeroStates.push(stateWithAmplitude);
            });
            nonZeroStates.sort(compareStatesWithAmplitudes);
            return nonZeroStates;
        }

        return function() {
            var result, formatFlags, nonZeroStates, stateWithAmplitude, i;
            result = '';
            formatFlags = {decimalPlaces: 4};
            nonZeroStates = sortedNonZeroStates(this);
            for (i = 0; i < nonZeroStates.length; i++) {
                if (result !== '') formatFlags.spacedSign = true;
                stateWithAmplitude = nonZeroStates[i];
                result = result + formatAmplitude(stateWithAmplitude.amplitude, formatFlags) + "|" + stateWithAmplitude.asBitString() + ">";
            }
            return result;
        };
    })();

    function validateArgs(args, minimum) {
        var maximum = 10000;
        var message = 'Must supply at least ' + minimum + ' parameters.';
        if (arguments.length > 4) throw "Internal error: too many arguments to validateArgs";
        if (arguments.length === 4) {
            maximum = arguments[2];
            message = arguments[3];
        } else if (arguments.length === 3) {
            message = arguments[2];
        }
        if (args.length < minimum || args.length > maximum) {
            throw message;
        }
    }

    function parseBitString(bitString) {
        // Strip optional 'ket' characters to support |0101>
        bitString = bitString.replace(/^\|/,'').replace(/>$/,'');
        return {value: parseInt(bitString, 2), length: bitString.length};
    }

    function sparseAssign(array, index, value) {
        // Try to avoid assigning values and try to make zero exactly zero.
        if (value.magnitude() > jsqbits.roundToZero) {
            array[index] = value;
        }
    }

    function convertBitQualifierToBitRange(bits, numBits) {
        if (bits == null) {
            throw "bit qualification must be supplied";
        } else if (bits === jsqbits.ALL) {
            return {from: 0, to: numBits - 1};
        } else if (typeof bits === 'number') {
            return {from: bits, to: bits};
        } else if (bits.from != null && bits.to != null) {
            if (bits.from > bits.to) {
                throw "bit range must have 'from' being less than or equal to 'to'";
            }
            return bits;
        } else {
            throw "bit qualification must be either: a number, jsqbits.ALL, or {from: n, to: m}";
        }
    }

    function bitRangeAsArray(low, high) {
        if (low > high) {
            throw "bit range must have 'from' being less than or equal to 'to'";
        }
        var result = [];
        for (var i = low; i <= high; i++) {
            result.push(i);
        }
        return result;
    }

    function convertBitQualifierToBitArray(bits, numBits) {
        if (bits == null) {
            throw "bit qualification must be supplied";
        }
        if (bits instanceof Array) {
            return bits;
        }
        if (typeof bits === 'number') {
            return [bits];
        }
        if (bits === jsqbits.ALL) {
            return bitRangeAsArray(0, numBits - 1);
        }
        if (bits.from != null && bits.to != null) {
            return bitRangeAsArray(bits.from, bits.to);
        }
        throw "bit qualification must be either: a number, an array or numbers, jsqbits.ALL, or {from: n, to: m}";
    }

    function padState(state, numBits) {
        var paddingLength = numBits - state.length;
        for (var i = 0; i < paddingLength; i++) {
            state = '0' + state;
        }
        return state;
    }

    function createControlBitMask(controlBits) {
        var controlBitMask = null;
        if (controlBits) {
            controlBitMask = 0;
            for (var i = 0; i < controlBits.length; i++) {
                controlBitMask += (1 << controlBits[i]);
            }
        }
        return controlBitMask;
    }

})();
