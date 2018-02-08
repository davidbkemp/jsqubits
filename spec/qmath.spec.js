import chai from 'chai'
import jsqubits from '../lib'
const jsqubitsmath = jsqubits.QMath
const {expect} = chai

describe('jsqubitsmath', () => {
  describe('#powerMod', () => {
    it('should return 1 for x^0 mod 35', () => {
      expect(jsqubitsmath.powerMod(2, 0, 35)).to.equal(1);
    });
    it('should give 16 for 2^4 mod 35', () => {
      expect(jsqubitsmath.powerMod(2, 4, 35)).to.equal(16);
    });
    it('should give 32 for 2^5 mod 35', () => {
      expect(jsqubitsmath.powerMod(2, 5, 35)).to.equal(32);
    });
    it('should give 11 for 3^4 mod 70', () => {
      expect(jsqubitsmath.powerMod(3, 4, 70)).to.equal(11);
    });
  });

  describe('#primePowerFactor', () => {
    it('should return 0 for 35', () => {
      expect(jsqubitsmath.powerFactor(35)).to.equal(0);
    });
    it('should return 2 for 2^6', () => {
      expect(jsqubitsmath.powerFactor(Math.pow(2, 6))).to.equal(2);
    });
    it('should return 5 for 5^6', () => {
      expect(jsqubitsmath.powerFactor(Math.pow(5, 6))).to.equal(5);
    });
  });

  describe('#nullSpace', () => {
    it('should solve Ax=0 (single solution)', () => {
      const a = [
        0b001,
        0b111,
        0b110,
        0b000
      ];
      const results = jsqubitsmath.findNullSpaceMod2(a, 3);
      expect(results).to.deep.equal([0b110]);
    });

    it('should solve Ax=0 (three bits in solution)', () => {
      const a = [
        0b101,
        0b011,
      ];
      const results = jsqubitsmath.findNullSpaceMod2(a, 3);
      expect(results).to.deep.equal([0b111]);
    });

    it('should solve Ax=0 (many solutions)', () => {
      //            Should reduce to
      //            0101101
      //            0000011
      const a = [
        0b0101110,
        0b0101101
      ];
      const results = jsqubitsmath.findNullSpaceMod2(a, 7);
      expect(results.sort()).to.deep.equal([
        0b1000000,
        0b0010000,
        0b0101000,
        0b0100100,
        0b0100011,
      ].sort());
    });
  });

  describe('gcd', () => {
    it('should compute the greatest common divisor of 27 and 18 as 9', () => {
      expect(jsqubitsmath.gcd(27, 18)).to.equal(9);
      expect(jsqubitsmath.gcd(18, 27)).to.equal(9);
    });
    it('should compute the greatest common divisor of 27 and 12 as 3', () => {
      expect(jsqubitsmath.gcd(27, 12)).to.equal(3);
      expect(jsqubitsmath.gcd(12, 27)).to.equal(3);
    });
  });

  describe('lcm', () => {
    it('should compute the least common multiple of 7 and 6 as 42', () => {
      expect(jsqubitsmath.lcm(7, 6)).to.equal(42);
      expect(jsqubitsmath.lcm(6, 7)).to.equal(42);
    });
    it('should compute the least common multiple of 9 and 18 as 18', () => {
      expect(jsqubitsmath.lcm(9, 18)).to.equal(18);
      expect(jsqubitsmath.lcm(18, 9)).to.equal(18);
    });
  });

  describe('continuedFraction', () => {
    it('should compute the continued fraction of 1/3', () => {
      const results = jsqubitsmath.continuedFraction(1 / 3, 0.0001);
      expect(results.numerator).to.equal(1);
      expect(results.denominator).to.equal(3);
      expect(results.quotients).to.deep.equal([0, 3]);
    });

    it('should compute the continued fraction of 11/13', () => {
      const results = jsqubitsmath.continuedFraction(11 / 13, 0.0001);
      expect(results.numerator).to.equal(11);
      expect(results.denominator).to.equal(13);
      expect(results.quotients).to.deep.equal([0, 1, 5, 2]);
    });

    it('should stop when the desired accuracy is reached', () => {
      const results = jsqubitsmath.continuedFraction(Math.PI, 0.000001);
      expect(results.numerator).to.equal(355);
      expect(results.denominator).to.equal(113);
      expect(results.quotients).to.deep.equal([3, 7, 15, 1]);
    });

    it('should work for negative numbers', () => {
      const results = jsqubitsmath.continuedFraction(-Math.PI, 0.000001);
      expect(results.numerator).to.equal(-355);
      expect(results.denominator).to.equal(113);
      expect(results.quotients).to.deep.equal([-3, -7, -15, -1]);
    });
  });
});
