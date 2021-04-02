'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validateArgs = require('./utils/validateArgs');

var _validateArgs2 = _interopRequireDefault(_validateArgs);

var _typecheck = require('./utils/typecheck');

var _typecheck2 = _interopRequireDefault(_typecheck);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Complex = function () {
  function Complex(real, imaginary) {
    _classCallCheck(this, Complex);

    this.equal = this.eql;
    this.equals = this.eql;

    (0, _validateArgs2.default)(arguments, 1, 2, 'Must supply a real, and optionally an imaginary, argument to Complex()');
    imaginary = imaginary || 0;
    this.real = real;
    this.imaginary = imaginary;
  }

  _createClass(Complex, [{
    key: 'add',
    value: function add(other) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply 1 parameter to add()');
      if (_typecheck2.default.isNumber(other)) {
        return new Complex(this.real + other, this.imaginary);
      }
      return new Complex(this.real + other.real, this.imaginary + other.imaginary);
    }
  }, {
    key: 'multiply',
    value: function multiply(other) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply 1 parameter to multiply()');
      if (_typecheck2.default.isNumber(other)) {
        return new Complex(this.real * other, this.imaginary * other);
      }
      return new Complex(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
    }
  }, {
    key: 'conjugate',
    value: function conjugate() {
      return new Complex(this.real, -this.imaginary);
    }
  }, {
    key: 'toString',
    value: function toString() {
      if (this.imaginary === 0) return '' + this.real;
      var imaginaryString = void 0;
      if (this.imaginary === 1) {
        imaginaryString = 'i';
      } else if (this.imaginary === -1) {
        imaginaryString = '-i';
      } else {
        imaginaryString = this.imaginary + 'i';
      }
      if (this.real === 0) return imaginaryString;
      var sign = this.imaginary < 0 ? '' : '+';
      return this.real + sign + imaginaryString;
    }
  }, {
    key: 'inspect',
    value: function inspect() {
      return this.toString();
    }
  }, {
    key: 'format',
    value: function format(options) {
      var realValue = this.real;
      var imaginaryValue = this.imaginary;
      if (options && options.decimalPlaces != null) {
        var roundingMagnitude = Math.pow(10, options.decimalPlaces);
        realValue = Math.round(realValue * roundingMagnitude) / roundingMagnitude;
        imaginaryValue = Math.round(imaginaryValue * roundingMagnitude) / roundingMagnitude;
      }
      var objectToFormat = new Complex(realValue, imaginaryValue);
      return objectToFormat.toString();
    }
  }, {
    key: 'negate',
    value: function negate() {
      return new Complex(-this.real, -this.imaginary);
    }
  }, {
    key: 'magnitude',
    value: function magnitude() {
      return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }
  }, {
    key: 'phase',
    value: function phase() {
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
      return Math.atan2(this.imaginary, this.real);
    }
  }, {
    key: 'subtract',
    value: function subtract(other) {
      (0, _validateArgs2.default)(arguments, 1, 1, 'Must supply 1 parameter to subtract()');
      if (_typecheck2.default.isNumber(other)) {
        return new Complex(this.real - other, this.imaginary);
      }
      return new Complex(this.real - other.real, this.imaginary - other.imaginary);
    }
  }, {
    key: 'eql',
    value: function eql(other) {
      if (!(other instanceof Complex)) return false;
      return this.real === other.real && this.imaginary === other.imaginary;
    }
  }, {
    key: 'closeTo',
    value: function closeTo(other) {
      return Math.abs(this.real - other.real) < 0.0001 && Math.abs(this.imaginary - other.imaginary) < 0.0001;
    }
  }]);

  return Complex;
}();

Complex.ONE = new Complex(1, 0);
Complex.ZERO = new Complex(0, 0);
Complex.SQRT2 = new Complex(Math.SQRT2, 0);
Complex.SQRT1_2 = new Complex(Math.SQRT1_2, 0);
exports.default = Complex;