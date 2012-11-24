var jsqbits = require('../lib/index').jsqbits;
var jsqbitsJasmineMatchers = require('./matchers');

describe('Complex', function() {
    var complex = function(real, imaginary) {
        return new jsqbits.Complex(real, imaginary);
    };

    var w;
    var x;
    var y;
    beforeEach(function() {
        w = complex(-4, 3);
        x = complex(1, 3);
        y = complex(10, 30);
        this.addMatchers(jsqbitsJasmineMatchers);
    });

    describe("construction", function() {
        it("should use a default imaginary value of zero", function() {
            var z = complex(3);
            expect(z.real()).toEqual(3);
            expect(z.imaginary()).toEqual(0);
        });
    });

    describe('#add', function() {
        it("adds complex numbers", function() {
            var z = x.add(y);
            expect(z.real()).toEqual(11);
            expect(z.imaginary()).toEqual(33);
        });

        it ("adds real numbers", function(){
            var z = x.add(5);
            expect(z.real()).toEqual(6);
            expect(z.imaginary()).toEqual(x.imaginary());
        });
    });

    describe('#multiply', function() {
        it("multiplies complex numbers", function() {
            var z = x.multiply(y);
            expect(z.real()).toEqual(10 - 90);
            expect(z.imaginary()).toEqual(60);
        });
        it("multiplies real numbers", function() {
            var z = y.multiply(5);
            expect(z.real()).toEqual(50);
            expect(z.imaginary()).toEqual(150);
        });
    });

    describe('#negate', function() {
        it("negates complex numbers", function() {
            var z = x.negate();
            expect(z.real()).toEqual(-1);
            expect(z.imaginary()).toEqual(-3);
        });
    });

    describe('#magnitude', function() {
        it('returns the magnitude', function() {
            expect(w.magnitude()).toEqual(5);
        });
    });

    describe('#subtract', function() {
        it('subtracts real numbers', function(){
            expect(y.subtract(2)).toEql(complex(8, 30));
        });
        it('subtracts complex numbers', function(){
            expect(y.subtract(w)).toEql(complex(14, 27));
        });
    });

    describe("#conjugate", function() {
       it('returns the complex conjugate', function() {
           expect(x.conjugate()).toEql(complex(1, -3));
       });
    });

    describe("#real", function(){
        it("should create a complex number", function(){
            expect(jsqbits.real(3)).toBeApprox(complex(3, 0));
        });
    });

    describe("#toString", function(){
        it("should format the complex number", function(){
            expect(complex(-1.23, 3.4).toString()).toEqual('-1.23+3.4i');
        });
    });

    describe('#format', function() {
        it('should use toString when no options', function() {
            expect(complex(-1.23, 3.4).format()).toEqual('-1.23+3.4i');
        });
        it('should drop the 1 if imaginary value is 1', function() {
            expect(complex(-1.23, 1).format()).toEqual('-1.23+i');
        });
        it('should drop the 1 if imaginary value is -1', function() {
            expect(complex(-1.23, -1).format()).toEqual('-1.23-i');
        });
        it('should round off decimal places when requested', function() {
            expect(complex(-1.235959, 3.423523).format({decimalPlaces: 3})).toEqual('-1.236+3.424i');
        });

        it ('should prefix with spaced sign when requested (positive real)', function() {
            expect(complex(1.235959, -3.423523).format({decimalPlaces: 3, spacedSign: true})).toEqual(' + 1.236-3.424i');
        });
        it ('should prefix with spaced sign when requested (negative real)', function() {
            expect(complex(-1.235959, 3.423523).format({decimalPlaces: 3, spacedSign: true})).toEqual(' - 1.236-3.424i');
        });
        it ('should prefix with spaced sign when requested (zero real, positive imaginary)', function() {
            expect(complex(0, 3.423523).format({decimalPlaces: 3, spacedSign: true})).toEqual(' + 3.424i');
        });
        it ('should prefix with spaced sign when requested (zero real, negative imaginary)', function() {
            expect(complex(0, -3.423523).format({decimalPlaces: 3, spacedSign: true})).toEqual(' - 3.424i');
        });
    });
});

