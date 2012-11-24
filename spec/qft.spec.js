var jsqbits = require('../lib/index').jsqbits;
var jsqbitsmath = require('../lib/index').jsqbitsmath;

describe('QState.qft (Quantum Fourier Transform)', function() {
    var complex = jsqbits.complex;
    var real = jsqbits.real;

    beforeEach(function() {
        this.addMatchers(jsqbits.JasmineMatchers);
    });

    it('Should be a Hadamard when applied to one bit', function() {
        var initialState = jsqbits("|0>").add(jsqbits("|1>")).normalize();
        var newState = initialState.qft([0]);
        expect(newState.toString()).toEqual("|0>");
    });

    it('Should be a Hadamard when applied to all zeros', function() {
        var initialState = jsqbits("|00>");
        var newState = initialState.qft([0,1]);
        expect(newState.toString()).toEqual("0.5 |00> + 0.5 |01> + 0.5 |10> + 0.5 |11>");
    });

    it('Should return state to all zeros when applied twice.', function() {
        var initialState = jsqbits("|0000>");
        var newState = initialState.hadamard(jsqbits.ALL).qft(jsqbits.ALL);
        expect(newState.toString()).toEqual("|0000>");
    });

    it('Should transform |01> correctly', function(){
        var initialState = jsqbits("|01>");
        var newState = initialState.qft(jsqbits.ALL);
        expect(newState.toString()).toEqual("0.5 |00> + 0.5i |01> - 0.5 |10> - 0.5i |11>");
    });

    it('Should transform |001> correctly', function(){
        var initialState = jsqbits("|001>");
        var newState = initialState.qft(jsqbits.ALL);
        expect(newState.toString()).toEqual("0.3536 |000> + 0.25+0.25i |001> + 0.3536i |010> - 0.25-0.25i |011> - 0.3536 |100> - 0.25+0.25i |101> - 0.3536i |110> + 0.25-0.25i |111>");
    });

    it('Should transform |010> correctly', function(){
        var initialState = jsqbits("|010>");
        var newState = initialState.qft(jsqbits.ALL);
        expect(newState.toString()).toEqual("0.3536 |000> + 0.3536i |001> - 0.3536 |010> - 0.3536i |011> + 0.3536 |100> + 0.3536i |101> - 0.3536 |110> - 0.3536i |111>");
    });

    it('Should find the frequency of a simple periodic state', function() {
        var initialState = jsqbits("|000>").add(jsqbits("|100>")).normalize();
        var newState = initialState.qft([0,1,2]);
        expect(newState.toString()).toEqual("0.5 |000> + 0.5 |010> + 0.5 |100> + 0.5 |110>");
    });

    it('Should find the frequency of a simple periodic state offset by 1', function() {
        var initialState = jsqbits("|001>").add(jsqbits("|101>")).normalize();
        var newState = initialState.qft([0,1,2]);
        expect(newState.toString()).toEqual("0.5 |000> + 0.5i |010> - 0.5 |100> - 0.5i |110>");
    });

    it('Should find the frequency of a simple periodic function', function(){
        var inputBits = {from: 2, to:4};
        var outBits = {from:0, to:1};
        var gcd = 0;
//        Do this 10 times since it is random :-)
        for (var i = 0; i < 10; i ++) {
            var qstate = jsqbits("|00000>").hadamard(inputBits);
            qstate = qstate.applyFunction(inputBits, outBits, function(x) {return x % 4});
            var result = qstate.qft(inputBits).measure(inputBits).result;
            gcd = jsqbitsmath.gcd(gcd, result);
        }
        expect(gcd).toEqual(2);
    });
});