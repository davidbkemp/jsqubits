var jsqbits = require('../lib/index').jsqbits;
var jsqbitsJasmineMatchers = require('./matchers');


describe('QState', function() {
    var complex = jsqbits.complex;
    var real = jsqbits.real;

    beforeEach(function() {
        this.addMatchers(jsqbitsJasmineMatchers);
    });

    describe('new', function(){
        it("will default amplitudes to the zero state |00...0>", function() {
            var x = new jsqbits.QState(3);
            expect(x.toString()).toEqual("|000>");
        });
    });

    describe('#toString', function() {
       it('will round off long decimals', function() {
           var x = jsqbits('|000>').hadamard(2);
           expect(x.toString()).toEqual('0.7071 |000> + 0.7071 |100>');
        });
       it('will nicely display negated states as subtraction', function() {
           var x = jsqbits('|100>').hadamard(2);
           expect(x.toString()).toEqual('0.7071 |000> - 0.7071 |100>');
        });
        it('will omit the amplitude when it is close to one', function() {
            var x = jsqbits('|000>').rotateX(1, 0.1).rotateX(1, -0.1);
            expect(x.toString()).toEqual('|000>');
        });
    });

    describe('#controlledApplicatinOfqBitOperator', function(){
        it("does nothing when the control bit is zero (one target)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction');
            var x = jsqbits('|001>').controlledApplicatinOfqBitOperator(2, 0, qbitFunction);
            expect(qbitFunction).not.toHaveBeenCalled();
            expect(x).toEql(jsqbits('|001>'));
        });
        it("does nothing when the control bit is zero (target range)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction');
            var targetBits = {from: 0, to: 1};
            var x = jsqbits('|001>').controlledApplicatinOfqBitOperator(2, targetBits, qbitFunction);
            expect(qbitFunction).not.toHaveBeenCalled();
            expect(x).toEql(jsqbits('|001>'));
        });
        it("does nothing when the control bit is zero (target array)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction');
            var x = jsqbits('|0001>').controlledApplicatinOfqBitOperator(3, [0, 2], qbitFunction);
            expect(qbitFunction).not.toHaveBeenCalled();
            expect(x).toEql(jsqbits('|0001>'));
        });
        it("invokes the qbitFunction when the control bit is one", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction')
                .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
            var x = jsqbits('|100>').controlledApplicatinOfqBitOperator(2, 0, qbitFunction);
            expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ONE, jsqbits.ZERO]);
            expect(x.amplitude('|100>')).toBeApprox(real(0.2));
            expect(x.amplitude('|101>')).toBeApprox(real(0.3));
        });
        it("flips the target bit when the control bit specifier is null", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction')
                .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
            var x = jsqbits('|000>').controlledApplicatinOfqBitOperator(null, 0, qbitFunction);
            expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ONE, jsqbits.ZERO]);
            expect(x.amplitude('|000>')).toBeApprox(real(0.2));
            expect(x.amplitude('|001>')).toBeApprox(real(0.3));
        });
        it("flips the target bits when the control bit is one (target bit range)", function() {
            var targetBits = {from: 0, to: 1};
            var qbitFunction = jasmine.createSpy('qbitFunction')
                .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
            var x = jsqbits('|101>').controlledApplicatinOfqBitOperator(2, targetBits, qbitFunction);
            expect(qbitFunction).toHaveBeenCalled();
            expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ZERO, jsqbits.ONE]);
            expect(qbitFunction.argsForCall[1]).toEql([real(0.2), jsqbits.ZERO]);
            expect(qbitFunction.argsForCall[2]).toEql([real(0.3), jsqbits.ZERO]);
            expect(x.amplitude('|100>')).toBeApprox(real(0.2));
            expect(x.amplitude('|101>')).toBeApprox(real(0.2));
            expect(x.amplitude('|110>')).toBeApprox(real(0.3));
            expect(x.amplitude('|111>')).toBeApprox(real(0.3));
        });
        it("flips the target bits when the control bit is one (target bit array)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction')
                .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
            var x = jsqbits('|1001>').controlledApplicatinOfqBitOperator(3, [0, 2], qbitFunction);
            expect(qbitFunction).toHaveBeenCalled();
            expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ZERO, jsqbits.ONE]);
            expect(qbitFunction.argsForCall[1]).toEql([real(0.2), jsqbits.ZERO]);
            expect(qbitFunction.argsForCall[2]).toEql([real(0.3), jsqbits.ZERO]);
            expect(x.amplitude('|1000>')).toBeApprox(real(0.2));
            expect(x.amplitude('|1001>')).toBeApprox(real(0.2));
            expect(x.amplitude('|1100>')).toBeApprox(real(0.3));
            expect(x.amplitude('|1101>')).toBeApprox(real(0.3));
        });
        it("does nothing when any of the control bits are zero (control bit range)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction');
            var controlBits = {from: 1, to: 2};
            var x = jsqbits('|101>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
            expect(qbitFunction).not.toHaveBeenCalled();
            expect(x).toEql(jsqbits('|101>'));
        });
        it("does nothing when any of the control bits are zero (control bit array)", function() {
            var qbitFunction = jasmine.createSpy('qbitFunction');
            var controlBits = [1,2];
            var x = jsqbits('|101>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
            expect(qbitFunction).not.toHaveBeenCalled();
            expect(x).toEql(jsqbits('|101>'));
        });
        it("invokes the qbitFunction when the control bits are all one (control bit range)", function() {
             var qbitFunction = jasmine.createSpy('qbitFunction')
                 .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
             var controlBits = {from: 1, to: 2};
             var x = jsqbits('|110>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
             expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ONE, jsqbits.ZERO]);
             expect(x.amplitude('|110>')).toBeApprox(real(0.2));
             expect(x.amplitude('|111>')).toBeApprox(real(0.3));
         });
        it("invokes the qbitFunction when the control bits are all one (control bit array)", function() {
             var qbitFunction = jasmine.createSpy('qbitFunction')
                 .andReturn({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)});
             var controlBits =  [1,3];
             var x = jsqbits('|1010>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
             expect(qbitFunction.argsForCall[0]).toEql([jsqbits.ONE, jsqbits.ZERO]);
             expect(x.amplitude('|1010>')).toBeApprox(real(0.2));
             expect(x.amplitude('|1011>')).toBeApprox(real(0.3));
         });
        it("throws an error when the control and target bits overlap", function() {
            var testFunction = function(){return {amplitudeOf0: real(0), amplitudeOf1: real(0)}};
            var badFunctionInvocation = function() {
                jsqbits("0000").controlledApplicatinOfqBitOperator({from:0, to:2}, {from:2, to:3}, testFunction);
            };
            expect(badFunctionInvocation).toThrow("control and target bits must not be the same nor overlap");
        });
    });

    describe('#x', function() {
        it("applies the Pauli x operator to (|0>)", function() {
            var x = jsqbits('|0>').x(0);
            expect(x.amplitude('|0>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|1>')).toEql(jsqbits.ONE);
        });
        it("applies the Pauli x operator to (|1>)", function() {
            var x = jsqbits('|1>').x(0);
            expect(x.amplitude('|0>')).toEql(jsqbits.ONE);
            expect(x.amplitude('|1>')).toEql(jsqbits.ZERO);
        });
    });

    describe('#controlledX', function(){
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|000>').controlledX(2, 0);
            expect(x.amplitude('|000>')).toBeApprox(jsqbits.ONE);
        });
       it("flips the target bit when the control bit is one", function() {
            var x = jsqbits('|100>').controlledX(2, 0);
           expect(x.amplitude('|101>')).toBeApprox(jsqbits.ONE);
        });
    });

    describe("#toffoli", function(){
        it("does nothing if any of the control bits are zero", function() {
            var x = jsqbits('|0010>').toffoli(3, 1, 0);
            expect(x.amplitude('|0010>')).toBeApprox(jsqbits.ONE);
        });
        it("flips the target bit when all of the control bits are one", function() {
            var x = jsqbits('|1010>').toffoli(3, 1, 0);
            expect(x.amplitude('|1011>')).toBeApprox(jsqbits.ONE);
         });
    });

    describe('#z', function() {
        it("applies the Pauli z operator to (|0>)", function() {
            var x = jsqbits('|0>').z(0);
            expect(x.amplitude('|0>')).toEql(jsqbits.ONE);
            expect(x.amplitude('|1>')).toEql(jsqbits.ZERO);
        });
        it("applies the Pauli z operator to (|1>)", function() {
            var x = jsqbits('|1>').z(0);
            expect(x.amplitude('|0>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|1>')).toEql(real(-1));
        });
    });

    describe('#controlledZ', function(){
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledZ(2, 0);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("flips the phase when both the control and target bits are one", function() {
            var x = jsqbits('|101>').controlledZ(2, 0);
            expect(x.amplitude('|101>')).toBeApprox(real(-1));
        });
        it("does nothing when an even number of the target bits are 1 when the control bit is one", function() {
            var targetBits = {from: 0, to: 1};
            var x = jsqbits('|111>').controlledZ(2, targetBits);
            expect(x.amplitude('|111>')).toBeApprox(jsqbits.ONE);
        });
    });

    describe('#y', function() {
        it("applies the Pauli y operator to (|0>)", function() {
            var x = jsqbits('|0>').y(0);
            expect(x.amplitude('|0>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|1>')).toEql(complex(0, 1));
        });
        it("applies the Pauli y operator to (|1>)", function() {
            var x = jsqbits('|1>').y(0);
            expect(x.amplitude('|0>')).toEql(complex(0, -1));
            expect(x.amplitude('|1>')).toEql(jsqbits.ZERO);
        });
    });

    describe('#controlledY', function(){
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledY(2, 0);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("applies the Pauli y operator when the control bit is one",  function() {
            var x = jsqbits('|101>').controlledY(0, 2);
            expect(x.amplitude('|001>')).toEql(complex(0, -1));
            expect(x.amplitude('|101>')).toEql(jsqbits.ZERO);
        });
    });

    describe('#s', function() {
        it("leaves |0> untouched", function() {
             var x = jsqbits('|0>').s(0);
             expect(x).toEql(jsqbits('|0>'));
         });
         it("multiplies the amplitude of |1> by i", function() {
             var x = jsqbits('|1>').s(0);
             expect(x.amplitude('|0>')).toEql(jsqbits.ZERO);
             expect(x.amplitude('|1>')).toEql(complex(0, 1));
        });
    });

    describe('#controlledS', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|100>').controlledS(0, 2);
            expect(x).toEql(jsqbits('|100>'));
        });
        it("applies the S operator when the control bit is one (target is 1)",  function() {
            var x = jsqbits('|101>').controlledS(0, 2);
            expect(x.amplitude('|101>')).toEql(complex(0, 1));
        });
        it("applies the S operator when the control bit is one (target is 0)",  function() {
            var x = jsqbits('|001>').controlledS(0, 2);
            expect(x).toEql(jsqbits('|001>'));
        });
    });

    describe('#t', function() {
        it("leaves |0> untouched", function() {
             var x = jsqbits('|0>').t(0);
             expect(x).toEql(jsqbits('|0>'));
         });
         it("multiplies the amplitude of |1> by e^(i pi/4)", function() {
             var x = jsqbits('|1>').t(0);
             expect(x.amplitude('|0>')).toEql(jsqbits.ZERO);
             expect(x.amplitude('|1>')).toBeApprox(complex(Math.cos(Math.PI/4), Math.sin(Math.PI/4)));
        });

    });

    describe('#controlledT', function(){
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|100>').controlledT(0, 2);
            expect(x).toEql(jsqbits('|100>'));
        });
        it("applies the T operator when the control bit is one (target is 1)",  function() {
            var x = jsqbits('|101>').controlledT(0, 2);
            expect(x.amplitude('|101>')).toBeApprox(complex(Math.cos(Math.PI/4), Math.sin(Math.PI/4)));
        });
        it("applies the T operator when the control bit is one (target is 0)",  function() {
            var x = jsqbits('|001>').controlledT(0, 2);
            expect(x).toEql(jsqbits('|001>'));
        });
        
    });

    describe('#hadamard', function() {
        it("applies the hadamard operation", function() {
            var x = jsqbits('|000>').hadamard(2);
            expect(x.amplitude('|000>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(x.amplitude('|001>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|010>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|011>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|100>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(x.amplitude('|101>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|110>')).toEql(jsqbits.ZERO);
            expect(x.amplitude('|111>')).toEql(jsqbits.ZERO);
        });

        it("is it's own inverse", function() {
            var x = jsqbits('|000>').hadamard(2).hadamard(2);
            expect(x.amplitude('|000>')).toBeApprox(jsqbits.ONE);
            expect(x.amplitude('|001>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|010>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|011>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|100>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|101>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|110>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|111>')).toBe(jsqbits.ZERO);
        });

        it("accepts an ALL parameter", function() {
            var x = jsqbits('|00>').hadamard(jsqbits.ALL);
            expect(x.amplitude('|00>')).toBeApprox(real(0.5));
            expect(x.amplitude('|01>')).toBeApprox(real(0.5));
            expect(x.amplitude('|10>')).toBeApprox(real(0.5));
            expect(x.amplitude('|11>')).toBeApprox(real(0.5));
        });

        it("accepts a bit range", function() {
            var x = jsqbits('|000>').hadamard({from:1, to:2});
            expect(x.amplitude('|000>')).toBeApprox(real(0.5));
            expect(x.amplitude('|001>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|010>')).toBeApprox(real(0.5));
            expect(x.amplitude('|011>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|100>')).toBeApprox(real(0.5));
            expect(x.amplitude('|101>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|110>')).toBeApprox(real(0.5));
            expect(x.amplitude('|111>')).toBe(jsqbits.ZERO);
        });
    });

    describe('#controlledHadamard', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledHadamard(2, 0);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("applies the Hadamard operator when the control bits are one", function() {
            var x = jsqbits('|111>').controlledHadamard({from: 1, to: 2}, 0);
            expect(x.amplitude('|110>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(x.amplitude('|111>')).toBeApprox(real(-1 / Math.sqrt(2)));
        });
    });

    describe('#rotateX', function() {
        it("rotates about the X axis", function() {
            var x = jsqbits('|00>').rotateX(1, Math.PI/4);

            expect(x.amplitude('|00>')).toBeApprox(real(Math.cos(Math.PI/8)));
            expect(x.amplitude('|01>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|10>')).toBeApprox(complex(0, -Math.sin(Math.PI/8)));
            expect(x.amplitude('|11>')).toBe(jsqbits.ZERO);
        });
        it("can be applied multiple times", function() {
            var x = jsqbits('|00>').rotateX(1, Math.PI/4).rotateX(1, Math.PI/4).rotateX(1, Math.PI/4);

            expect(x.amplitude('|00>')).toBeApprox(real(Math.cos(3*Math.PI/8)));
            expect(x.amplitude('|01>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|10>')).toBeApprox(complex(0, -Math.sin(3*Math.PI/8)));
            expect(x.amplitude('|11>')).toBe(jsqbits.ZERO);
        });
        it("is accepts an ALL parameter", function() {
            var x = jsqbits('|00>').rotateX(jsqbits.ALL, Math.PI/4);

            expect(x.amplitude('|00>')).toBeApprox(real(Math.cos(Math.PI/8) * Math.cos(Math.PI/8)));
            expect(x.amplitude('|01>')).toBeApprox(real(Math.cos(Math.PI/8)).multiply(complex(0, -Math.sin(Math.PI/8))));
            expect(x.amplitude('|10>')).toBeApprox(real(Math.cos(Math.PI/8)).multiply(complex(0, -Math.sin(Math.PI/8))));
            expect(x.amplitude('|11>')).toBeApprox(real(-Math.sin(Math.PI/8) * Math.sin(Math.PI/8)));
        });
    });

    describe('#controlledXRotation', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledXRotation(2, 0, Math.PI/4);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("rotates around the x axis when the control bit is one", function() {
            var x = jsqbits('|100>').controlledXRotation(2, 0, Math.PI/4);
            expect(x.amplitude('|100>')).toBeApprox(real(Math.cos(Math.PI/8)));
            expect(x.amplitude('|101>')).toBeApprox(complex(0, -Math.sin(Math.PI/8)));
        });
    });

    describe('#rotateY', function() {
        it("rotates about the Y axis", function() {
            var x = jsqbits('|00>').rotateY(1, Math.PI/4);
            expect(x.amplitude('|00>')).toBeApprox(real(Math.cos(Math.PI/8)));
            expect(x.amplitude('|01>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|10>')).toBeApprox(real(Math.sin(Math.PI/8)));
            expect(x.amplitude('|11>')).toBe(jsqbits.ZERO);
        });
        it("can be applied multiple times", function() {
            var x = jsqbits('|00>').rotateY(1, Math.PI/4).rotateY(1, Math.PI/4).rotateY(1, Math.PI/4);
            expect(x.amplitude('|00>')).toBeApprox(real(Math.cos(3*Math.PI/8)));
            expect(x.amplitude('|01>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|10>')).toBeApprox(real(Math.sin(3*Math.PI/8)));
            expect(x.amplitude('|11>')).toBe(jsqbits.ZERO);
        });
    });

    describe('#controlledYRotation', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledYRotation(2, 0, Math.PI/4);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("rotates around the y axis when the control bit is one", function() {
            var x = jsqbits('|100>').controlledYRotation(2, 0, Math.PI/4);
            expect(x.amplitude('|100>')).toBeApprox(real(Math.cos(Math.PI/8)));
            expect(x.amplitude('|101>')).toBeApprox(real(Math.sin(Math.PI/8)));
        });
    });

    describe('#rotateZ', function() {
        it("rotates about the Z axis (|0>)", function() {
            var x = jsqbits('|0>').rotateZ(0, Math.PI/4);
            expect(x.amplitude('|0>')).toBeApprox(complex(Math.cos(Math.PI/8), -Math.sin(Math.PI/8)));
            expect(x.amplitude('|1>')).toBe(jsqbits.ZERO);
        });
        it("rotates about the Z axis (|1>)", function() {
            var x = jsqbits('|1>').rotateZ(0, Math.PI/4);
            expect(x.amplitude('|0>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|1>')).toBeApprox(complex(Math.cos(Math.PI/8), Math.sin(Math.PI/8)));
        });
        it("can be applied multiple times", function() {
            var x = jsqbits('|0>').rotateZ(0, Math.PI/4).rotateZ(0, Math.PI/4).rotateZ(0, Math.PI/4);
            expect(x.amplitude('|0>')).toBeApprox(complex(Math.cos(3*Math.PI/8), -Math.sin(3*Math.PI/8)));
            expect(x.amplitude('|1>')).toBe(jsqbits.ZERO);
        });
    });

    describe('#controlledZRotation', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|001>').controlledZRotation(2, 0, Math.PI/4);
            expect(x).toEql(jsqbits('|001>'));
        });
        it("rotates around the z axis when the control bit is one", function() {
            var x = jsqbits('|100>').controlledZRotation(2, 0, Math.PI/4);
            expect(x.amplitude('|100>')).toBeApprox(complex(Math.cos(Math.PI/8), -Math.sin(Math.PI/8)));
            expect(x.amplitude('|101>')).toBe(jsqbits.ZERO);
        });
    });

    describe('#controlledR', function() {
       it("does nothing when the control bit is zero", function() {
           var originalState = jsqbits('|000>').hadamard(0);
           var x = originalState.controlledR(2, 0, Math.PI/4);
           expect(x.toString()).toBe(originalState.toString());
       });
       it("shifts the phase by e^(i angle) when the control bit is one", function() {
           var originalState = jsqbits('|100>').hadamard(0);
           var x = originalState.controlledR(2, 0, Math.PI/4);
           expect(x.toString()).toBe("0.7071 |100> + 0.5+0.5i |101>");
       });
    });


    describe('#r', function() {
       it("shifts the phase by the specified angle e^(i angle)", function() {
           var originalState = jsqbits('|0>').hadamard(0);
           var x = originalState.r(0, Math.PI/4);
           expect(x.toString()).toBe("0.7071 |0> + 0.5+0.5i |1>");
       });
    });

    describe('#controlledSwap', function() {
        it("does nothing when the control bit is zero", function() {
            expect(jsqbits("|010>").controlledSwap(2,1,0).toString()).toBe("|010>");
        });
        it("swaps the target bits when the control bit is one", function() {
            expect(jsqbits("|110>").controlledSwap(2,1,0).toString()).toBe("|101>");
        });
    });

    describe('#swap', function() {
        it("swaps the target bits", function() {
            expect(jsqbits("|10>").swap(1,0).toString()).toBe("|01>");
        });
    });

    describe('#not', function() {
        it("is an alias for x()", function() {
            expect(jsqbits.QState.prototype.not).toBe(jsqbits.QState.prototype.x);
        });
    });

    describe('#cnot', function() {
        it("does nothing when the control bit is zero", function() {
            var x = jsqbits('|000>').cnot(2, 0);
            expect(x).toEql(jsqbits('|000>'));
        });
        it("flips the target bit from zero to one when the control bit is one", function() {
            var x = jsqbits('|100>').cnot(2, 0);
            expect(x).toEql(jsqbits('|101>'));
        });
        it("flips the target bit from one to zero when the control bit is one", function() {
            var x = jsqbits('|101>').cnot(2, 0);
            expect(x).toEql(jsqbits('|100>'));
        });
    });

    describe('Simple combination of hadamard and cnot', function() {
        it("results in a phase kick back", function() {
            var x = jsqbits('|01>').hadamard(0).hadamard(1).cnot(1, 0).hadamard(0).hadamard(1);
            expect(x.amplitude('|00>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|01>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|10>')).toBe(jsqbits.ZERO);
            expect(x.amplitude('|11>')).toBeApprox(jsqbits.ONE);
        });
    });
    describe('#applyFunction', function() {
        it("invokes function with states (bit range)", function() {
            var f = jasmine.createSpy('f').andReturn(1);
            var x = jsqbits('|1000>').hadamard(2);
            x.applyFunction({from:1, to:2}, 0, f);
            expect(f).toHaveBeenCalled();
            expect(f.argsForCall).toContain([0]);
            expect(f.argsForCall).toContain([2]);
        });

        it("invokes function with states (single bit)", function() {
            var f = jasmine.createSpy('f').andReturn(1);
            var x = jsqbits('|1000>').hadamard(2);
            x.applyFunction(2, 0, f);
            expect(f.argsForCall).toContain([0]);
            expect(f.argsForCall).toContain([1]);
        });

        it ("does nothing when the funciton returns zero", function() {
            var f = jasmine.createSpy('f').andReturn(0);
            var x = jsqbits('|00>').applyFunction(1, 0, f);
            expect(f).toHaveBeenCalled();
            expect(x).toEql(jsqbits('|00>'));
        });

        it ("flips the target bit from zero to one when the function returns one", function() {
            var f = function(x) { return 1; };
            var x = jsqbits('|00>').applyFunction(1, 0, f);
            expect(x).toEql(jsqbits('|01>'));
        });

        it ("flips the target bit from one to zero when the function returns one", function() {
            var f = function(x) { return 1; };
            var x = jsqbits('|01>').applyFunction(1, 0, f);
            expect(x).toEql(jsqbits('|00>'));
        });

        it ("can flip multiple target bits", function() {
            var f = function(x) { return parseInt('101', 2); };
            var x = jsqbits('|1011>').applyFunction(3, {from: 0, to: 2}, f);
            expect(x).toEql(jsqbits('|1110>'));
        });

        it ("restricts flipping of target bits to those specified", function() {
            var f = function(x) { return parseInt('1101', 2); };
            var x = jsqbits('|1011>').applyFunction(3, {from: 0, to: 2}, f);
            expect(x).toEql(jsqbits('|1110>'));
        });
        it("throws exception when target and control bits overlap", function() {
            var badFunctionInvocation = function() {
              jsqbits("0000").applyFunction({from:0, to:2}, {from: 2, to:3}, function(x){return x;});
            };
            expect(badFunctionInvocation).toThrow("control and target bits must not be the same nor overlap");
        });
    });

    describe('#each', function() {
        it('should invoke a callback with a StateWithAmplitude', function(){
            var callBack = jasmine.createSpy('callBack');
            jsqbits('|10>').hadamard(1).each(callBack);
            expect(callBack).toHaveBeenCalled();
            expect(callBack.argsForCall.length).toEql(2);
            var stateWithAmplitude0 = callBack.argsForCall[0][0];
            var stateWithAmplitude2 = callBack.argsForCall[1][0];
            var index0 = stateWithAmplitude0.index;
            expect(index0 === '0' || index0 === '2').toBeTruthy();
            if(index0 === '2') {
                var tmp = stateWithAmplitude0;
                stateWithAmplitude0 = stateWithAmplitude2;
                stateWithAmplitude2 = tmp;
            }
            expect(stateWithAmplitude0.index).toBe('0');
            expect(stateWithAmplitude2.index).toBe('2');
            expect(stateWithAmplitude0.amplitude).toBeApprox(real(Math.sqrt(0.5)));
            expect(stateWithAmplitude2.amplitude).toBeApprox(real(-Math.sqrt(0.5)));
            expect(stateWithAmplitude0.asNumber()).toBe(0);
            expect(stateWithAmplitude2.asNumber()).toBe(2);
            expect(stateWithAmplitude0.asBitString()).toBe('00');
            expect(stateWithAmplitude2.asBitString()).toBe('10');
        });

        it('should break early when returned false', function(){
            var callCount = 0;
            jsqbits('|10>').hadamard(jsqbits.ALL).each(function(stateWithAmplitude){
                callCount++;
                if (callCount === 1) return false;
            });
            expect(callCount).toBe(1);
        });
    });

    describe('#measure', function(){
        var bitRange = {from:1, to:2};
        var stateToMeasure;
        beforeEach(function() {
//            0.5 |1000> + 0.5 |1001> + 0.5 |1100> + 0.5 |1101>
            stateToMeasure = jsqbits('|1000>').hadamard(2).hadamard(0);
        });

        it ("should return the new states for outcome of 00 (random returns 0)", function() {
            stateToMeasure.random = function() {return 0};
            var measurement = stateToMeasure.measure(bitRange);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(0);
            expect(newState.amplitude('|1000>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1001>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1100>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1101>')).toBe(jsqbits.ZERO);
        });

        it ("should return the new states for outcome of 00 (random returns 0.49)", function() {
            stateToMeasure.random = function() {return 0.49};
            var measurement = stateToMeasure.measure(bitRange);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(0);
            expect(newState.amplitude('|1000>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1001>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1100>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1101>')).toBe(jsqbits.ZERO);
        });

        it ("should return the new states for outcome of 10 (random returns 0.51)", function() {
            stateToMeasure.random = function() {return 0.51};
            var measurement = stateToMeasure.measure(bitRange);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(2);
            expect(newState.amplitude('|1000>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1001>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1100>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1101>')).toBeApprox(real(1 / Math.sqrt(2)));
        });

        it ("should return the new states for outcome of 10 (random returns 1.0)", function() {
            stateToMeasure.random = function() {return 1.0};
            var measurement = stateToMeasure.measure(bitRange);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(2);
            expect(newState.amplitude('|1000>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1001>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1100>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1101>')).toBeApprox(real(1 / Math.sqrt(2)));
        });

        it ("Can measure bit zero", function() {
            stateToMeasure.random = function() {return 1.0};
            var measurement = stateToMeasure.measure(0);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(1);
            expect(newState.amplitude('|1000>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1001>')).toBeApprox(real(1 / Math.sqrt(2)));
            expect(newState.amplitude('|1100>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1101>')).toBeApprox(real(1 / Math.sqrt(2)));
        });

        it ("Can measure all bits", function() {
            stateToMeasure.random = function() {return 0.49};
            var measurement = stateToMeasure.measure(jsqbits.ALL);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(parseInt('1001', 2));
            expect(newState.amplitude('|1000>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1001>')).toBeApprox(jsqbits.ONE);
            expect(newState.amplitude('|1100>')).toBe(jsqbits.ZERO);
            expect(newState.amplitude('|1101>')).toBe(jsqbits.ZERO);
        });

        it ("actually calls Math.random", function() {
            var measurement = stateToMeasure.measure(3);
            var newState = measurement.newState;
            expect(newState.numBits()).toBe(4);
            expect(measurement.result).toBe(1);
            expect(newState.amplitude('|1000>')).toBeApprox(real(0.5));
            expect(newState.amplitude('|1001>')).toBeApprox(real(0.5));
            expect(newState.amplitude('|1100>')).toBeApprox(real(0.5));
            expect(newState.amplitude('|1101>')).toBeApprox(real(0.5));
        });

    });

    describe('Measurement', function(){
        it('should have a asBitString() function', function(){
            expect(jsqbits('|0101>').measure({from:1, to:3}).asBitString()).toBe("010");
        });
    });

    describe('#kron', function(){
        it('should return the tensor product of two states', function() {
            var q1 = jsqbits('|01>').hadamard(0); /* sqrt(1/2)(|00> - |01> */
            var q2 = jsqbits('|100>').hadamard(2); /* sqrt(1/2) |000> - |100> */
            var newState = q1.kron(q2); /* Should be 0.5 (|00000> - |00100> - |01000> + |01100> */
            expect(newState.amplitude('|00000>')).toBeApprox(real(0.5));
            expect(newState.amplitude('|00100>')).toBeApprox(real(-0.5));
            expect(newState.amplitude('|01000>')).toBeApprox(real(-0.5));
            expect(newState.amplitude('|01100>')).toBeApprox(real(0.5));
        });
    });

    describe("#tensorProduct", function(){
        it("should be an alias for #kron", function() {
            var q1 = jsqbits('|01>').hadamard(0); /* sqrt(1/2)(|00> - |01> */
            var q2 = jsqbits('|100>').hadamard(2); /* sqrt(1/2) |000> - |100> */
            var newState = q1.tensorProduct(q2); /* Should be 0.5 (|00000> - |00100> - |01000> + |01100> */
            expect(newState.amplitude('|00000>')).toBeApprox(real(0.5));
            expect(newState.amplitude('|00100>')).toBeApprox(real(-0.5));
            expect(newState.amplitude('|01000>')).toBeApprox(real(-0.5));
            expect(newState.amplitude('|01100>')).toBeApprox(real(0.5));
        });
    });

    describe("#multiply", function(){
        it("should modify the global phase", function(){
            var q = jsqbits('|1>').hadamard(0).multiply(complex(3, -4));
            expect(q.amplitude("|0>")).toBeApprox(real(Math.sqrt(0.5)).multiply(complex(3, -4)));
            expect(q.amplitude("|1>")).toBeApprox(real(-Math.sqrt(0.5)).multiply(complex(3, -4)));
        });

        it("should accept non-complex numbers", function(){
            var q = jsqbits('|1>').hadamard(0).multiply(2);
            expect(q.amplitude("|0>")).toBeApprox(real(Math.sqrt(2)));
            expect(q.amplitude("|1>")).toBeApprox(real(-Math.sqrt(2)));
        });
    });

    describe("#add", function() {
        it("should add two quantum states together", function(){
//            NOTE: You will need to normalize afterwards to get a sensible answer!
            var q = jsqbits('|01>').hadamard(0).add(jsqbits('|00>')).add(jsqbits('|11>'));
            expect(q.amplitude("|00>")).toBeApprox(complex(1 + Math.sqrt(0.5)));
            expect(q.amplitude("|01>")).toBeApprox(complex(-Math.sqrt(0.5)));
            expect(q.amplitude("|11>")).toBeApprox(complex(1));
        });
    });

    describe("#subtract", function() {
        it("should subtract two quantum states together", function(){
//            NOTE: You will need to normalize afterwards to get a sensible answer!
            var q = jsqbits('|01>').hadamard(0).add(jsqbits('|00>')).subtract(jsqbits('|01>'));
            expect(q.toString()).toBe("1.7071 |00> - 1.7071 |01>");
        });
    });

    describe("#normalize", function(){
        it("should normalize the amplitudes", function() {
            var q = jsqbits('|0>')
                .multiply(complex(3,4))
                .add(jsqbits('|1>').multiply(complex(0,1)));
            q = q.normalize();
            var factor = 1/Math.sqrt(25 + 1);
            expect(q.amplitude('|1>')).toBeApprox(complex(0, factor));
            expect(q.amplitude('|0>')).toBeApprox(complex(3,4).multiply(complex(factor)));
        });
    });
});
