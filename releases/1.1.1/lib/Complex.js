import validateArgs from './utils/validateArgs'
import typecheck from './utils/typecheck';

export default class Complex {
  constructor(real, imaginary) {
    validateArgs(arguments, 1, 2, 'Must supply a real, and optionally an imaginary, argument to Complex()')
    imaginary = imaginary || 0
    this.real = real
    this.imaginary = imaginary
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
    return this.toString()
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

  equal = this.eql
  equals = this.eql

  closeTo(other) {
    return Math.abs(this.real - other.real) < 0.0001 && Math.abs(this.imaginary - other.imaginary) < 0.0001
  }

  static ONE = new Complex(1, 0);
  static ZERO = new Complex(0, 0);
  static SQRT2 = new Complex(Math.SQRT2, 0);
  static SQRT1_2 = new Complex(Math.SQRT1_2, 0);
}
