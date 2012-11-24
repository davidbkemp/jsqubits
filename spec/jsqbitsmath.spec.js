var jsqbitsmath = require('../lib/index').jsqbitsmath;
var jsqbitsJasmineMatchers = require('./matchers');

describe("jsqbitsmath", function() {
    beforeEach(function() {
        this.addMatchers(jsqbitsJasmineMatchers);
    });

    describe("#powerMod", function(){
        it("should return 1 for x^0 mod 35", function() {
            expect(jsqbitsmath.powerMod(2, 0, 35)).toBe(1);
        });
        it("should give 16 for 2^4 mod 35", function(){
            expect(jsqbitsmath.powerMod(2, 4, 35)).toBe(16);
        });
        it("should give 32 for 2^5 mod 35", function(){
            expect(jsqbitsmath.powerMod(2, 5, 35)).toBe(32);
        });
        it("should give 11 for 3^4 mod 70", function(){
            expect(jsqbitsmath.powerMod(3, 4, 70)).toBe(11);
        });
    });

    describe("#primePowerFactor", function(){
        it("should return 0 for 35", function() {
            expect(jsqbitsmath.powerFactor(35)).toBe(0);
        });
        it("should return 2 for 2^6", function() {
            expect(jsqbitsmath.powerFactor(Math.pow(2,6))).toBe(2);
        });
        it("should return 5 for 5^6", function() {
            expect(jsqbitsmath.powerFactor(Math.pow(5,6))).toBe(5);
        });
    });

    describe("#nullSpace", function() {
        it("should solve Ax=0 (single solution)", function() {
            var a = [
                parseInt('001', 2),
                parseInt('111', 2),
                parseInt('110', 2),
                parseInt('000', 2)
            ];
            var results = jsqbitsmath.findNullSpaceMod2(a, 3);
            expect(results).toEqual([parseInt('110', 2)]);
        });

        it("should solve Ax=0 (three bits in solution)", function() {
            var a = [
                parseInt('101', 2),
                parseInt('011', 2),
            ];
            var results = jsqbitsmath.findNullSpaceMod2(a, 3);
            expect(results).toEqual([parseInt('111', 2)]);
        });

        it("should solve Ax=0 (many solutions)", function() {
//            Should reduce to
//            0101101
//            0000011
            var a = [
                parseInt('0101110', 2),
                parseInt('0101101', 2)
            ];
            var results = jsqbitsmath.findNullSpaceMod2(a, 7);
            expect(results.sort()).toEqual([
                parseInt('1000000', 2),
                parseInt('0010000', 2),
                parseInt('0101000', 2),
                parseInt('0100100', 2),
                parseInt('0100011', 2),
            ].sort());
        });
    });

    describe("gcd", function() {
        it("should compute the greatest common divisor of 27 and 18 as 9", function() {
            expect(jsqbitsmath.gcd(27, 18)).toEqual(9);
            expect(jsqbitsmath.gcd(18, 27)).toEqual(9);
        });
        it("should compute the greatest common divisor of 27 and 12 as 3", function() {
            expect(jsqbitsmath.gcd(27, 12)).toEqual(3);
            expect(jsqbitsmath.gcd(12, 27)).toEqual(3);
        });
    });


    describe("lcm", function() {
        it("should compute the least common multiple of 7 and 6 as 42", function() {
            expect(jsqbitsmath.lcm(7, 6)).toEqual(42);
            expect(jsqbitsmath.lcm(6, 7)).toEqual(42);
        });
        it("should compute the least common multiple of 9 and 18 as 18", function() {
            expect(jsqbitsmath.lcm(9, 18)).toEqual(18);
            expect(jsqbitsmath.lcm(18, 9)).toEqual(18);
        });
    });

    describe("continuedFraction", function() {
        it("should compute the continued fraction of 1/3", function() {
            var results = jsqbitsmath.continuedFraction(1/3, 0.0001);
            expect(results.numerator).toEqual(1);
            expect(results.denominator).toEqual(3);
            expect(results.quotients).toEqual([0,3]);
        });

        it("should compute the continued fraction of 11/13", function() {
            var results = jsqbitsmath.continuedFraction(11/13, 0.0001);
            expect(results.numerator).toEqual(11);
            expect(results.denominator).toEqual(13);
            expect(results.quotients).toEqual([0,1,5,2]);
        });

        it("should stop when the desired accuracy is reached", function() {
            var results = jsqbitsmath.continuedFraction(Math.PI, 0.000001);
            expect(results.numerator).toEqual(355);
            expect(results.denominator).toEqual(113);
            expect(results.quotients).toEqual([3,7,15,1]);
        });

        it("should work for negative numbers", function() {
            var results = jsqbitsmath.continuedFraction(-Math.PI, 0.000001);
            expect(results.numerator).toEqual(-355);
            expect(results.denominator).toEqual(113);
            expect(results.quotients).toEqual([-3,-7,-15,-1]);
        });
    });

});