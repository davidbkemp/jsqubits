import chai from 'chai'
import Q from '../lib'
const {expect} = chai

describe('Complex', () => {
  const complex = Q.complex

  let w;
  let x;
  let y;
  beforeEach(() => {
    w = complex(-4, 3);
    x = complex(1, 3);
    y = complex(10, 30)
  });

  describe('construction', () => {
    it('should use a default imaginary value of zero', () => {
      const z = complex(3);
      expect(z.real).to.equal(3);
      expect(z.imaginary).to.equal(0);
    });
  });

  describe('#add', () => {
    it('adds complex numbers', () => {
      const z = x.add(y);
      expect(z.real).to.equal(11);
      expect(z.imaginary).to.equal(33);
    });

    it('adds real numbers', () => {
      const z = x.add(5);
      expect(z.real).to.equal(6);
      expect(z.imaginary).to.equal(x.imaginary);
    });
  });

  describe('#multiply', () => {
    it('multiplies complex numbers', () => {
      const z = x.multiply(y);
      expect(z.real).to.equal(10 - 90);
      expect(z.imaginary).to.equal(60);
    });
    it('multiplies real numbers', () => {
      const z = y.multiply(5);
      expect(z.real).to.equal(50);
      expect(z.imaginary).to.equal(150);
    });
  });

  describe('#negate', () => {
    it('negates complex numbers', () => {
      const z = x.negate();
      expect(z.real).to.equal(-1);
      expect(z.imaginary).to.equal(-3);
    });
  });

  describe('#magnitude', () => {
    it('returns the magnitude', () => {
      expect(w.magnitude()).to.equal(5);
    });
  });

  describe('#phase', () => {
    it('returns the correct phase for 1', () => {
      const p = complex(1, 0).phase()
      expect(p).to.be.closeTo(0, Q.roundToZero);
    });
    it('returns the correct phase for i', () => {
      expect(complex(0, 1).phase()).to.be.closeTo(Math.PI / 2, Q.roundToZero);
    });

    it('returns the correct phase for -1', () => {
      expect(complex(-1, 0).phase()).to.be.closeTo(Math.PI, Q.roundToZero);
    });
    it('returns the correct phase for -i', () => {
      expect(complex(0, -1).phase()).to.be.closeTo(-Math.PI / 2, Q.roundToZero);
    });
    it('returns the correct phase for 0', () => {
      expect(complex(0, 0).phase()).to.be.closeTo(0, Q.roundToZero);
    });
    it('returns the correct phase for 1+i', () => {
      expect(complex(1, 1).phase()).to.be.closeTo(Math.PI / 4, Q.roundToZero);
    });
    it('returns the correct phase for -1+i', () => {
      expect(complex(-1, 1).phase()).to.be.closeTo(3 * Math.PI / 4, Q.roundToZero);
    });
    it('returns the correct phase for -1-i', () => {
      expect(complex(-1, -1).phase()).to.be.closeTo(-3 * Math.PI / 4, Q.roundToZero);
    });
    it('returns the correct phase for 1-i', () => {
      expect(complex(1, -1).phase()).to.be.closeTo(-Math.PI / 4, Q.roundToZero);
    });
  });

  describe('#subtract', () => {
    it('subtracts real numbers', () => {
      expect(y.subtract(2).equal(complex(8, 30))).to.be.true;
    });
    it('subtracts complex numbers', () => {
      expect(y.subtract(w).equal(complex(14, 27))).to.be.true;
    });
  });

  describe('#conjugate', () => {
    it('returns the complex conjugate', () => {
      expect(x.conjugate().equal(complex(1, -3))).to.be.true;
    });
  });

  describe('#real', () => {
    it('should create a complex number', () => {
      expect(Q.real(3).closeTo(complex(3, 0))).to.be.true;
    });
  });

  describe('#toString', () => {
    it('should format the complex number', () => {
      expect(complex(-1.23, 3.4).toString()).to.equal('-1.23+3.4i');
    });
  });

  describe('#format', () => {
    it('should use toString when no options', () => {
      expect(complex(-1.23, 3.4).format()).to.equal('-1.23+3.4i');
    });
    it('should drop the 1 if imaginary value is 1', () => {
      expect(complex(-1.23, 1).format()).to.equal('-1.23+i');
    });
    it('should drop the 1 if imaginary value is -1', () => {
      expect(complex(-1.23, -1).format()).to.equal('-1.23-i');
    });
    it('should round off decimal places when requested', () => {
      expect(complex(-1.235959, 3.423523).format({decimalPlaces: 3})).to.equal('-1.236+3.424i');
    });
  });
});

