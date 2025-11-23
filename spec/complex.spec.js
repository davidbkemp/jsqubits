/* jshint -W030 */
import * as chai from 'chai';
import Q from '../lib/index.js';
const {expect} = chai;
const QState = Q.QState;
const complex = Q.complex;

describe('Complex', function() {
  let w;
  let x;
  let y;

  beforeEach(function() {
    w = complex(-4, 3);
    x = complex(1, 3);
    y = complex(10, 30);
  });

  describe('construction', function() {
    it('should use a default imaginary value of zero', function() {
      const z = complex(3);
      expect(z.real).to.equal(3);
      expect(z.imaginary).to.equal(0);
    });
  });

  describe('#add', function() {
    it('adds complex numbers', function() {
      const z = x.add(y);
      expect(z.real).to.equal(11);
      expect(z.imaginary).to.equal(33);
    });

    it('adds real numbers', function() {
      const z = x.add(5);
      expect(z.real).to.equal(6);
      expect(z.imaginary).to.equal(x.imaginary);
    });
  });

  describe('#multiply', function() {
    it('multiplies complex numbers', function() {
      const z = x.multiply(y);
      expect(z.real).to.equal(10 - 90);
      expect(z.imaginary).to.equal(60);
    });

    it('multiplies real numbers', function() {
      const z = y.multiply(5);
      expect(z.real).to.equal(50);
      expect(z.imaginary).to.equal(150);
    });
  });

  describe('#negate', function() {
    it('negates complex numbers', function() {
      const z = x.negate();
      expect(z.real).to.equal(-1);
      expect(z.imaginary).to.equal(-3);
    });
  });

  describe('#magnitude', function() {
    it('returns the magnitude', function() {
      expect(w.magnitude()).to.equal(5);
    });
  });

  describe('#phase', function() {
    it('returns the correct phase for 1', function() {
      const p = complex(1, 0).phase();
      expect(p).to.be.closeTo(0, QState.roundToZero);
    });

    it('returns the correct phase for i', function() {
      expect(complex(0, 1).phase()).to.be.closeTo(Math.PI / 2, QState.roundToZero);
    });

    it('returns the correct phase for -1', function() {
      expect(complex(-1, 0).phase()).to.be.closeTo(Math.PI, QState.roundToZero);
    });

    it('returns the correct phase for -i', function() {
      expect(complex(0, -1).phase()).to.be.closeTo(-Math.PI / 2, QState.roundToZero);
    });

    it('returns the correct phase for 0', function() {
      expect(complex(0, 0).phase()).to.be.closeTo(0, QState.roundToZero);
    });

    it('returns the correct phase for 1+i', function() {
      expect(complex(1, 1).phase()).to.be.closeTo(Math.PI / 4, QState.roundToZero);
    });

    it('returns the correct phase for -1+i', function() {
      expect(complex(-1, 1).phase()).to.be.closeTo(3 * Math.PI / 4, QState.roundToZero);
    });

    it('returns the correct phase for -1-i', function() {
      expect(complex(-1, -1).phase()).to.be.closeTo(-3 * Math.PI / 4, QState.roundToZero);
    });

    it('returns the correct phase for 1-i', function() {
      expect(complex(1, -1).phase()).to.be.closeTo(-Math.PI / 4, QState.roundToZero);
    });
  });

  describe('#subtract', function() {
    it('subtracts real numbers', function() {
      expect(y.subtract(2).equal(complex(8, 30))).to.be.true;
    });

    it('subtracts complex numbers', function() {
      expect(y.subtract(w).equal(complex(14, 27))).to.be.true;
    });
  });

  describe('#conjugate', function() {
    it('returns the complex conjugate', function() {
      expect(x.conjugate().equal(complex(1, -3))).to.be.true;
    });
  });

  describe('#real', function() {
    it('should create a complex number', function() {
      expect(Q.real(3).closeTo(complex(3, 0))).to.be.true;
    });
  });

  describe('#toString', function() {
    it('should format the complex number', function() {
      expect(complex(-1.23, 3.4).toString()).to.equal('-1.23+3.4i');
    });
  });

  describe('#format', function() {
    it('should use toString when no options', function() {
      expect(complex(-1.23, 3.4).format()).to.equal('-1.23+3.4i');
    });

    it('should drop the 1 if imaginary value is 1', function() {
      expect(complex(-1.23, 1).format()).to.equal('-1.23+i');
    });

    it('should drop the 1 if imaginary value is -1', function() {
      expect(complex(-1.23, -1).format()).to.equal('-1.23-i');
    });

    it('should round off decimal places when requested', function() {
      expect(complex(-1.235959, 3.423523).format({decimalPlaces: 3})).to.equal('-1.236+3.424i');
    });
  });
});
