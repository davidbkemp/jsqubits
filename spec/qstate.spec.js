import chai from 'chai'
import sinon from 'sinon'
import assert from 'assert'
import jsqubits from '../lib'

const jsqubitsmath = jsqubits.QMath
const {expect} = chai

describe('QState', () => {
  const complex = jsqubits.complex;
  const real = jsqubits.real;

  describe('new', () => {
    it('will default amplitudes to the zero state |00...0>', () => {
      const x = new jsqubits.QState(3);
      expect(x.toString()).to.equal('|000>');
    });
  });

  describe('#toString', () => {
    it('will use parenthesis to avoid ambiguity', () => {
      const a = []; a[0] = a[1] = jsqubits.complex(-0.5, -0.5);
      const x = new jsqubits.QState(1, a);
      expect(x.toString()).to.equal('(-0.5-0.5i)|0> + (-0.5-0.5i)|1>');
    });
    it('will round off long decimals', () => {
      const a = []; a[0] = a[1] = jsqubits.complex(Math.SQRT1_2, 0);
      const x = new jsqubits.QState(1, a);
      expect(x.toString()).to.equal('(0.7071)|0> + (0.7071)|1>');
    });
    it('will omit the amplitude when it is close to one', () => {
      const x = jsqubits('|000>').rotateX(1, 0.1).rotateX(1, -0.1);
      expect(x.toString()).to.equal('|000>');
    });
  });

  describe('#eql', () => {
    it('will be true for equal states', () => {
      const state1 = jsqubits('|010>').hadamard(1);
      const state2 = jsqubits('|010>').hadamard(1);
      expect(state1.equal(state2)).to.be.true;
    });

    it('will be false when the amplitudes differ', () => {
      const state1 = jsqubits('|01>').hadamard(0);
      const state2 = jsqubits('|00>').hadamard(0);
      expect(state1.equal(state2)).to.be.false;
    });

    it('will be false when the states differ', () => {
      expect(jsqubits('|01>').equal(jsqubits('|10>'))).to.be.false;
    });

    it('will be false when the number of qubits differ', () => {
      const state1 = jsqubits('|0>').hadamard(0);
      const state2 = jsqubits('|00>').hadamard(0);
      expect(state1.equal(state2)).to.be.false;
    });

    it('will be false when one state has more non-zero amplitudes than the other', () => {
      // Note: these obscure cases occur when the states are not normalized.
      expect(jsqubits('|00>').add(jsqubits('|01>')).equal(jsqubits('|00>'))).to.be.false;
      expect(jsqubits('|00>').equal(jsqubits('|00>').add(jsqubits('|01>')))).to.be.false;
    });
  });

  describe('#controlledApplicatinOfqBitOperator', () => {
    it('does nothing when the control bit is zero (one target)', () => {
      const qbitFunction = sinon.spy();
      const x = jsqubits('|001>').controlledApplicatinOfqBitOperator(2, 0, qbitFunction);
      assert.equal(qbitFunction.callCount, 0);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('does nothing when the control bit is zero (target range)', () => {
      const qbitFunction = sinon.spy();
      const targetBits = {from: 0, to: 1};
      const x = jsqubits('|001>').controlledApplicatinOfqBitOperator(2, targetBits, qbitFunction);
      assert.equal(qbitFunction.callCount, 0);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('does nothing when the control bit is zero (target array)', () => {
      const qbitFunction = sinon.spy();
      const x = jsqubits('|0001>').controlledApplicatinOfqBitOperator(3, [0, 2], qbitFunction);
      assert.equal(qbitFunction.callCount, 0);
      expect(x.equal(jsqubits('|0001>'))).to.be.true;
    });
    it('invokes the qbitFunction when the control bit is one', () => {
      const f = () => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)})
      const qbitFunction = sinon.spy(f);
      const x = jsqubits('|100>').controlledApplicatinOfqBitOperator(2, 0, qbitFunction);
      assert.deepEqual(qbitFunction.getCall(0).args, [jsqubits.ONE, jsqubits.ZERO]);
      expect(x.amplitude('|100>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|101>').closeTo(real(0.3))).to.be.true;
    });
    it('flips the target bit when the control bit specifier is null', () => {
      const f = () => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)})
      const qbitFunction = sinon.spy(f);
      const x = jsqubits('|000>').controlledApplicatinOfqBitOperator(null, 0, qbitFunction);
      assert.deepEqual(qbitFunction.getCall(0).args, [jsqubits.ONE, jsqubits.ZERO]);
      expect(x.amplitude('|000>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|001>').closeTo(real(0.3))).to.be.true;
    });
    it('flips the target bits when the control bit is one (target bit range)', () => {
      const targetBits = {from: 0, to: 1};
      const f = () => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)})
      const qbitFunction = sinon.spy(f)
      const x = jsqubits('|101>').controlledApplicatinOfqBitOperator(2, targetBits, qbitFunction);
      expect(qbitFunction.called).to.be.true;
      let ar = qbitFunction.getCall(0).args
      let result = [jsqubits.ZERO, jsqubits.ONE]
      assert.deepEqual(ar, result);
      ar = qbitFunction.getCall(1).args
      result = [real(0.2), jsqubits.ZERO]
      assert.equal(ar[0].equal(result[0]) && ar[1].equal(result[1]), true);
      ar = qbitFunction.getCall(2).args
      result = [real(0.3), jsqubits.ZERO]
      assert.equal(ar[0].equal(result[0]) && ar[1].equal(result[1]), true);
      expect(x.amplitude('|100>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|101>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|110>').closeTo(real(0.3))).to.be.true;
      expect(x.amplitude('|111>').closeTo(real(0.3))).to.be.true;
    });
    it('flips the target bits when the control bit is one (target bit array)', () => {
      const qbitFunction = sinon.spy(() => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)}))
      const x = jsqubits('|1001>').controlledApplicatinOfqBitOperator(3, [0, 2], qbitFunction);
      expect(qbitFunction.called).to.be.true;
      assert.deepEqual(qbitFunction.getCall(0).args, [jsqubits.ZERO, jsqubits.ONE]);
      let ar = qbitFunction.getCall(1).args
      let result = [real(0.2), jsqubits.ZERO]
      assert.equal(ar[0].equal(result[0]) && ar[1].equal(result[1]), true);

      ar = qbitFunction.getCall(2).args
      result = [real(0.3), jsqubits.ZERO]
      assert.equal(ar[0].equal(result[0]) && ar[1].equal(result[1]), true);
      expect(x.amplitude('|1000>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|1001>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|1100>').closeTo(real(0.3))).to.be.true;
      expect(x.amplitude('|1101>').closeTo(real(0.3))).to.be.true;
    });
    it('does nothing when any of the control bits are zero (control bit range)', () => {
      const qbitFunction = sinon.spy();
      const controlBits = {from: 1, to: 2};
      const x = jsqubits('|101>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
      expect(qbitFunction.called).not.to.be.true;
      expect(x.equal(jsqubits('|101>'))).to.be.true;
    });
    it('does nothing when any of the control bits are zero (control bit array)', () => {
      const qbitFunction = sinon.spy();
      const controlBits = [1, 2];
      const x = jsqubits('|101>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
      expect(qbitFunction.called).not.to.be.true;
      expect(x.equal(jsqubits('|101>'))).to.be.true;
    });
    it('invokes the qbitFunction when the control bits are all one (control bit range)', () => {
      const qbitFunction = sinon.spy(() => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)}))
      const controlBits = {from: 1, to: 2};
      const x = jsqubits('|110>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
      assert.deepEqual(qbitFunction.getCall(0).args, [jsqubits.ONE, jsqubits.ZERO]);
      expect(x.amplitude('|110>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|111>').closeTo(real(0.3))).to.be.true;
    });
    it('invokes the qbitFunction when the control bits are all one (control bit array)', () => {
      const qbitFunction = sinon.spy(() => ({amplitudeOf0: real(0.2), amplitudeOf1: real(0.3)}))
      const controlBits = [1, 3];
      const x = jsqubits('|1010>').controlledApplicatinOfqBitOperator(controlBits, 0, qbitFunction);
      const args = qbitFunction.getCall(0).args
      assert.deepEqual(args, [jsqubits.ONE, jsqubits.ZERO]);
      expect(x.amplitude('|1010>').closeTo(real(0.2))).to.be.true;
      expect(x.amplitude('|1011>').closeTo(real(0.3))).to.be.true;
    });
    it('throws an error when the control and target bits overlap', () => {
      const testFunction = function () { return {amplitudeOf0: real(0), amplitudeOf1: real(0)} };
      const badFunctionInvocation = function () {
        jsqubits('0000').controlledApplicatinOfqBitOperator({from: 0, to: 2}, {from: 2, to: 3}, testFunction);
      };
      expect(badFunctionInvocation).to.throw('control and target bits must not be the same nor overlap');
    });
  });

  describe('#x', () => {
    it('applies the Pauli x operator to (|0>)', () => {
      const x = jsqubits('|0>').x(0);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ONE)).to.be.true;
    });
    it('applies the Pauli x operator to (|1>)', () => {
      const x = jsqubits('|1>').x(0);
      expect(x.amplitude('|0>').equal(jsqubits.ONE)).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledX', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|000>').controlledX(2, 0);
      expect(x.amplitude('|000>').closeTo(jsqubits.ONE)).to.be.true;
    });
    it('flips the target bit when the control bit is one', () => {
      const x = jsqubits('|100>').controlledX(2, 0);
      expect(x.amplitude('|101>').closeTo(jsqubits.ONE)).to.be.true;
    });
  });

  describe('#toffoli', () => {
    it('does nothing if any of the control bits are zero', () => {
      const x = jsqubits('|0010>').toffoli(3, 1, 0);
      expect(x.amplitude('|0010>').closeTo(jsqubits.ONE)).to.be.true;
    });
    it('flips the target bit when all of the control bits are one', () => {
      const x = jsqubits('|1010>').toffoli(3, 1, 0);
      expect(x.amplitude('|1011>').closeTo(jsqubits.ONE)).to.be.true;
    });
  });

  describe('#z', () => {
    it('applies the Pauli z operator to (|0>)', () => {
      const x = jsqubits('|0>').z(0);
      expect(x.amplitude('|0>').equal(jsqubits.ONE)).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ZERO)).to.be.true;
    });
    it('applies the Pauli z operator to (|1>)', () => {
      const x = jsqubits('|1>').z(0);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').equal(real(-1))).to.be.true;
    });
  });

  describe('#controlledZ', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledZ(2, 0);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('flips the phase when both the control and target bits are one', () => {
      const x = jsqubits('|101>').controlledZ(2, 0);
      expect(x.amplitude('|101>').closeTo(real(-1))).to.be.true;
    });
    it('does nothing when an even number of the target bits are 1 when the control bit is one', () => {
      const targetBits = {from: 0, to: 1};
      const x = jsqubits('|111>').controlledZ(2, targetBits);
      expect(x.amplitude('|111>').closeTo(jsqubits.ONE)).to.be.true;
    });
  });

  describe('#y', () => {
    it('applies the Pauli y operator to (|0>)', () => {
      const x = jsqubits('|0>').y(0);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').equal(complex(0, 1))).to.be.true;
    });
    it('applies the Pauli y operator to (|1>)', () => {
      const x = jsqubits('|1>').y(0);
      expect(x.amplitude('|0>').equal(complex(0, -1))).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledY', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledY(2, 0);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('applies the Pauli y operator when the control bit is one', () => {
      const x = jsqubits('|101>').controlledY(0, 2);
      expect(x.amplitude('|001>').equal(complex(0, -1))).to.be.true;
      expect(x.amplitude('|101>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#s', () => {
    it('leaves |0> untouched', () => {
      const x = jsqubits('|0>').s(0);
      expect(x.equal(jsqubits('|0>'))).to.be.true;
    });
    it('multiplies the amplitude of |1> by i', () => {
      const x = jsqubits('|1>').s(0);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').equal(complex(0, 1))).to.be.true;
    });
  });

  describe('#controlledS', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|100>').controlledS(0, 2);
      expect(x.equal(jsqubits('|100>'))).to.be.true;
    });
    it('applies the S operator when the control bit is one (target is 1)', () => {
      const x = jsqubits('|101>').controlledS(0, 2);
      expect(x.amplitude('|101>').equal(complex(0, 1))).to.be.true;
    });
    it('applies the S operator when the control bit is one (target is 0)', () => {
      const x = jsqubits('|001>').controlledS(0, 2);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
  });

  describe('#t', () => {
    it('leaves |0> untouched', () => {
      const x = jsqubits('|0>').t(0);
      expect(x.equal(jsqubits('|0>'))).to.be.true;
    });
    it('multiplies the amplitude of |1> by e^(i pi/4)', () => {
      const x = jsqubits('|1>').t(0);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').closeTo(complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)))).to.be.true;
    });
  });

  describe('#controlledT', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|100>').controlledT(0, 2);
      expect(x.equal(jsqubits('|100>'))).to.be.true;
    });
    it('applies the T operator when the control bit is one (target is 1)', () => {
      const x = jsqubits('|101>').controlledT(0, 2);
      expect(x.amplitude('|101>').closeTo(complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)))).to.be.true;
    });
    it('applies the T operator when the control bit is one (target is 0)', () => {
      const x = jsqubits('|001>').controlledT(0, 2);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
  });

  describe('#hadamard', () => {
    it('applies the hadamard operation', () => {
      const x = jsqubits('|000>').hadamard(2);
      expect(x.amplitude('|000>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(x.amplitude('|001>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|010>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|011>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|100>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(x.amplitude('|101>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|110>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|111>').equal(jsqubits.ZERO)).to.be.true;
    });

    it("is it's own inverse", () => {
      const x = jsqubits('|000>').hadamard(2).hadamard(2);
      expect(x.amplitude('|000>').closeTo(jsqubits.ONE)).to.be.true;
      expect(x.amplitude('|001>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|010>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|011>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|100>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|101>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|110>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|111>').equal(jsqubits.ZERO)).to.be.true;
    });

    it('accepts an ALL parameter', () => {
      const x = jsqubits('|00>').hadamard(jsqubits.ALL);
      expect(x.amplitude('|00>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|01>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|10>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|11>').closeTo(real(0.5))).to.be.true;
    });

    it('accepts a bit range', () => {
      const x = jsqubits('|000>').hadamard({from: 1, to: 2});
      expect(x.amplitude('|000>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|001>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|010>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|011>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|100>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|101>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|110>').closeTo(real(0.5))).to.be.true;
      expect(x.amplitude('|111>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledHadamard', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledHadamard(2, 0);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('applies the Hadamard operator when the control bits are one', () => {
      const x = jsqubits('|111>').controlledHadamard({from: 1, to: 2}, 0);
      expect(x.amplitude('|110>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(x.amplitude('|111>').closeTo(real(-1 / Math.sqrt(2)))).to.be.true;
    });
  });

  describe('#rotateX', () => {
    it('rotates about the X axis', () => {
      const x = jsqubits('|00>').rotateX(1, Math.PI / 4);

      expect(x.amplitude('|00>').closeTo(real(Math.cos(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|01>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|10>').closeTo(complex(0, -Math.sin(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|11>').equal(jsqubits.ZERO)).to.be.true;
    });
    it('can be applied multiple times', () => {
      const x = jsqubits('|00>').rotateX(1, Math.PI / 4).rotateX(1, Math.PI / 4).rotateX(1, Math.PI / 4);

      expect(x.amplitude('|00>').closeTo(real(Math.cos(3 * Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|01>')).to.equal(jsqubits.ZERO);
      expect(x.amplitude('|10>').closeTo(complex(0, -Math.sin(3 * Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|11>')).to.equal(jsqubits.ZERO);
    });
    it('is accepts an ALL parameter', () => {
      const x = jsqubits('|00>').rotateX(jsqubits.ALL, Math.PI / 4);

      expect(x.amplitude('|00>').closeTo(real(Math.cos(Math.PI / 8) * Math.cos(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|01>').closeTo(real(Math.cos(Math.PI / 8)).multiply(complex(0, -Math.sin(Math.PI / 8))))).to.be.true;
      expect(x.amplitude('|10>').closeTo(real(Math.cos(Math.PI / 8)).multiply(complex(0, -Math.sin(Math.PI / 8))))).to.be.true;
      expect(x.amplitude('|11>').closeTo(real(-Math.sin(Math.PI / 8) * Math.sin(Math.PI / 8)))).to.be.true;
    });
  });

  describe('#controlledXRotation', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledXRotation(2, 0, Math.PI / 4);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('rotates around the x axis when the control bit is one', () => {
      const x = jsqubits('|100>').controlledXRotation(2, 0, Math.PI / 4);
      expect(x.amplitude('|100>').closeTo(real(Math.cos(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|101>').closeTo(complex(0, -Math.sin(Math.PI / 8)))).to.be.true;
    });
  });

  describe('#rotateY', () => {
    it('rotates about the Y axis', () => {
      const x = jsqubits('|00>').rotateY(1, Math.PI / 4);
      expect(x.amplitude('|00>').closeTo(real(Math.cos(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|01>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|10>').closeTo(real(Math.sin(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|11>').equal(jsqubits.ZERO)).to.be.true;
    });
    it('can be applied multiple times', () => {
      const x = jsqubits('|00>').rotateY(1, Math.PI / 4).rotateY(1, Math.PI / 4).rotateY(1, Math.PI / 4);
      expect(x.amplitude('|00>').closeTo(real(Math.cos(3 * Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|01>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|10>').closeTo(real(Math.sin(3 * Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|11>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledYRotation', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledYRotation(2, 0, Math.PI / 4);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('rotates around the y axis when the control bit is one', () => {
      const x = jsqubits('|100>').controlledYRotation(2, 0, Math.PI / 4);
      expect(x.amplitude('|100>').closeTo(real(Math.cos(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|101>').closeTo(real(Math.sin(Math.PI / 8)))).to.be.true;
    });
  });

  describe('#rotateZ', () => {
    it('rotates about the Z axis (|0>)', () => {
      const x = jsqubits('|0>').rotateZ(0, Math.PI / 4);
      expect(x.amplitude('|0>').closeTo(complex(Math.cos(Math.PI / 8), -Math.sin(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ZERO)).to.be.true;
    });
    it('rotates about the Z axis (|1>)', () => {
      const x = jsqubits('|1>').rotateZ(0, Math.PI / 4);
      expect(x.amplitude('|0>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|1>').closeTo(complex(Math.cos(Math.PI / 8), Math.sin(Math.PI / 8)))).to.be.true;
    });
    it('can be applied multiple times', () => {
      const x = jsqubits('|0>').rotateZ(0, Math.PI / 4).rotateZ(0, Math.PI / 4).rotateZ(0, Math.PI / 4);
      expect(x.amplitude('|0>').closeTo(complex(Math.cos(3 * Math.PI / 8), -Math.sin(3 * Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|1>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledZRotation', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|001>').controlledZRotation(2, 0, Math.PI / 4);
      expect(x.equal(jsqubits('|001>'))).to.be.true;
    });
    it('rotates around the z axis when the control bit is one', () => {
      const x = jsqubits('|100>').controlledZRotation(2, 0, Math.PI / 4);
      expect(x.amplitude('|100>').closeTo(complex(Math.cos(Math.PI / 8), -Math.sin(Math.PI / 8)))).to.be.true;
      expect(x.amplitude('|101>').equal(jsqubits.ZERO)).to.be.true;
    });
  });

  describe('#controlledR', () => {
    it('does nothing when the control bit is zero', () => {
      const originalState = jsqubits('|000>').hadamard(0);
      const x = originalState.controlledR(2, 0, Math.PI / 4);
      expect(x.toString()).to.equal(originalState.toString());
    });
    it('shifts the phase by e^(i angle) when the control bit is one', () => {
      const originalState = jsqubits('|100>').hadamard(0);
      const x = originalState.controlledR(2, 0, Math.PI / 4);
      expect(x.toString()).to.equal('(0.7071)|100> + (0.5+0.5i)|101>');
    });
  });


  describe('#r', () => {
    it('shifts the phase by the specified angle e^(i angle)', () => {
      const originalState = jsqubits('|0>').hadamard(0);
      const x = originalState.r(0, Math.PI / 4);
      expect(x.toString()).to.equal('(0.7071)|0> + (0.5+0.5i)|1>');
    });
  });

  describe('#controlledSwap', () => {
    it('does nothing when the control bit is zero', () => {
      expect(jsqubits('|010>').controlledSwap(2, 1, 0).toString()).to.equal('|010>');
    });
    it('swaps the target bits when the control bit is one', () => {
      expect(jsqubits('|110>').controlledSwap(2, 1, 0).toString()).to.equal('|101>');
    });
  });

  describe('#swap', () => {
    it('swaps the target bits', () => {
      expect(jsqubits('|10>').swap(1, 0).toString()).to.equal('|01>');
    });
  });

  describe('#cnot', () => {
    it('does nothing when the control bit is zero', () => {
      const x = jsqubits('|000>').cnot(2, 0);
      expect(x.equal(jsqubits('|000>'))).to.be.true;
    });
    it('flips the target bit from zero to one when the control bit is one', () => {
      const x = jsqubits('|100>').cnot(2, 0);
      expect(x.equal(jsqubits('|101>'))).to.be.true;
    });
    it('flips the target bit from one to zero when the control bit is one', () => {
      const x = jsqubits('|101>').cnot(2, 0);
      expect(x.equal(jsqubits('|100>'))).to.be.true;
    });
  });

  describe('Simple combination of hadamard and cnot', () => {
    it('results in a phase kick back', () => {
      const x = jsqubits('|01>').hadamard(0).hadamard(1).cnot(1, 0)
        .hadamard(0)
        .hadamard(1);
      expect(x.amplitude('|00>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|01>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|10>').equal(jsqubits.ZERO)).to.be.true;
      expect(x.amplitude('|11>').closeTo(jsqubits.ONE)).to.be.true;
    });
  });
  describe('#applyFunction', () => {
    it('invokes function with states (bit range)', () => {
      const f = sinon.spy(() => 1);
      const x = jsqubits('|1000>').hadamard(2);
      x.applyFunction({from: 1, to: 2}, 0, f);
      expect(f.called).to.be.true;
      expect(f.args).to.deep.include([0]);
      expect(f.args).to.deep.include([2]);
    });

    it('invokes function with states (single bit)', () => {
      const f = sinon.spy(() => 1);
      const x = jsqubits('|1000>').hadamard(2);
      x.applyFunction(2, 0, f);
      expect(f.args).to.deep.include([0]);
      expect(f.args).to.deep.include([1]);
    });

    it('does nothing when the funciton returns zero', () => {
      const f = sinon.spy(() => 0);
      const x = jsqubits('|00>').applyFunction(1, 0, f);
      expect(f.called).to.be.true;
      expect(x.equal(jsqubits('|00>'))).to.be.true;
    });

    it('flips the target bit from zero to one when the function returns one', () => {
      const f = function (x) { return 1; };
      const x = jsqubits('|00>').applyFunction(1, 0, f);
      expect(x.equal(jsqubits('|01>'))).to.be.true;
    });

    it('flips the target bit from one to zero when the function returns one', () => {
      const f = function (x) { return 1; };
      const x = jsqubits('|01>').applyFunction(1, 0, f);
      expect(x.equal(jsqubits('|00>'))).to.be.true;
    });

    it('can flip multiple target bits', () => {
      const f = function (x) { return 0b101; };
      const x = jsqubits('|1011>').applyFunction(3, {from: 0, to: 2}, f);
      expect(x.equal(jsqubits('|1110>'))).to.be.true;
    });

    it('restricts flipping of target bits to those specified', () => {
      const f = function (x) { return 0b1101; };
      const x = jsqubits('|1011>').applyFunction(3, {from: 0, to: 2}, f);
      console.log(583, x)
      expect(x.equal(jsqubits('|1110>'))).to.be.true;
    });
    it('throws exception when target and control bits overlap', () => {
      const badFunctionInvocation = function () {
        jsqubits('0000').applyFunction({from: 0, to: 2}, {from: 2, to: 3}, (x) => { return x; });
      };
      expect(badFunctionInvocation).to.throw('control and target bits must not be the same nor overlap');
    });
  });

  describe('#each', () => {
    it('should invoke a callback with a StateWithAmplitude', () => {
      const callBack = sinon.spy();
      jsqubits('|10>').hadamard(1).each(callBack);
      expect(callBack.called).to.be.true;
      expect(callBack.args.length).to.be.equal(2);
      let stateWithAmplitude0 = callBack.getCall(0).args[0];
      let stateWithAmplitude2 = callBack.getCall(1).args[0];
      const index0 = stateWithAmplitude0.index;
      expect(index0 === '0' || index0 === '2').to.be.true;
      if (index0 === '2') {
        const tmp = stateWithAmplitude0;
        stateWithAmplitude0 = stateWithAmplitude2;
        stateWithAmplitude2 = tmp;
      }
      expect(stateWithAmplitude0.index).to.equal('0');
      expect(stateWithAmplitude2.index).to.equal('2');
      expect(stateWithAmplitude0.amplitude.closeTo(real(Math.sqrt(0.5)))).to.be.true;
      expect(stateWithAmplitude2.amplitude.closeTo(real(-Math.sqrt(0.5)))).to.be.true;
      expect(stateWithAmplitude0.asNumber()).to.equal(0);
      expect(stateWithAmplitude2.asNumber()).to.equal(2);
      expect(stateWithAmplitude0.asBitString()).to.equal('00');
      expect(stateWithAmplitude2.asBitString()).to.equal('10');
    });

    it('should break early when returned false', () => {
      let callCount = 0;
      jsqubits('|10>').hadamard(jsqubits.ALL).each((stateWithAmplitude) => {
        callCount++;
        if (callCount === 1) return false;
      });
      expect(callCount).to.equal(1);
    });
  });

  describe('#measure', () => {
    const bitRange = {from: 1, to: 2};
    let stateToMeasure;
    beforeEach(() => {
      //            0.5 |1000> + 0.5 |1001> + 0.5 |1100> + 0.5 |1101>
      stateToMeasure = jsqubits('|1000>').hadamard(2).hadamard(0);
    });

    it('should return the new states for outcome of 00 (random returns 0)', () => {
      stateToMeasure.random = function () { return 0 };
      const measurement = stateToMeasure.measure(bitRange);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(0);
      expect(newState.amplitude('|1000>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1001>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1100>').equal(jsqubits.ZERO)).to.be.true;
      expect(newState.amplitude('|1101>').equal(jsqubits.ZERO)).to.be.true;
    });

    it('should return the new states for outcome of 00 (random returns 0.49)', () => {
      stateToMeasure.random = function () { return 0.49 };
      const measurement = stateToMeasure.measure(bitRange);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(0);
      expect(newState.amplitude('|1000>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1001>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1100>').equal(jsqubits.ZERO)).to.be.true;
      expect(newState.amplitude('|1101>').equal(jsqubits.ZERO)).to.be.true;
    });

    it('should return the new states for outcome of 10 (random returns 0.51)', () => {
      stateToMeasure.random = function () { return 0.51 };
      const measurement = stateToMeasure.measure(bitRange);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(2);
      expect(newState.amplitude('|1000>').equal(jsqubits.ZERO)).to.be.true;
      expect(newState.amplitude('|1001>').equal(jsqubits.ZERO)).to.be.true;
      expect(newState.amplitude('|1100>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1101>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
    });

    it('should return the new states for outcome of 10 (random returns 1.0)', () => {
      stateToMeasure.random = function () { return 1.0 };
      const measurement = stateToMeasure.measure(bitRange);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(2);
      expect(newState.amplitude('|1000>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1001>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1100>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1101>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
    });

    it('Can measure bit zero', () => {
      stateToMeasure.random = function () { return 1.0 };
      const measurement = stateToMeasure.measure(0);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(1);
      expect(newState.amplitude('|1000>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1001>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1100>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1101>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
    });

    it('Can measure all bits', () => {
      stateToMeasure.random = function () { return 0.49 };
      const measurement = stateToMeasure.measure(jsqubits.ALL);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(0b1001);
      expect(newState.amplitude('|1000>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1001>').closeTo(jsqubits.ONE)).to.be.true;
      expect(newState.amplitude('|1100>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1101>')).to.equal(jsqubits.ZERO);
    });

    it('Can measure selected bits', () => {
      stateToMeasure.random = function () { return 0.51 };
      const measurement = stateToMeasure.measure([0, 3]);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(2);
      expect(newState.amplitude('|1000>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1001>')).to.equal(jsqubits.ZERO);
      expect(newState.amplitude('|1100>').closeTo(real(1 / Math.sqrt(2)))).to.be.true;
      expect(newState.amplitude('|1101>')).to.equal(jsqubits.ZERO);
    });

    it('actually calls Math.random', () => {
      const measurement = stateToMeasure.measure(3);
      const newState = measurement.newState;
      expect(newState.numBits()).to.equal(4);
      expect(measurement.result).to.equal(1);
      expect(newState.amplitude('|1000>').closeTo(real(0.5))).to.be.true;
      expect(newState.amplitude('|1001>').closeTo(real(0.5))).to.be.true;
      expect(newState.amplitude('|1100>').closeTo(real(0.5))).to.be.true;
      expect(newState.amplitude('|1101>').closeTo(real(0.5))).to.be.true;
    });
  });

  describe('Measurement', () => {
    it('should have a asBitString() function', () => {
      expect(jsqubits('|0101>').measure({from: 1, to: 3}).asBitString()).to.equal('010');
    });
  });

  describe('#kron', () => {
    it('should return the tensor product of two states', () => {
      const q1 = jsqubits('|01>').hadamard(0); /* sqrt(1/2)(|00> - |01> */
      const q2 = jsqubits('|100>').hadamard(2); /* sqrt(1/2) |000> - |100> */
      const newState = q1.kron(q2); /* Should be 0.5 (|00000> - |00100> - |01000> + |01100> */
      expect(newState.amplitude('|00000>').closeTo(real(0.5))).to.be.true;
      expect(newState.amplitude('|00100>').closeTo(real(-0.5))).to.be.true;
      expect(newState.amplitude('|01000>').closeTo(real(-0.5))).to.be.true;
      expect(newState.amplitude('|01100>').closeTo(real(0.5))).to.be.true;
    });
  });

  describe('#tensorProduct', () => {
    it('should be an alias for #kron', () => {
      const q1 = jsqubits('|01>').hadamard(0); /* sqrt(1/2)(|00> - |01> */
      const q2 = jsqubits('|100>').hadamard(2); /* sqrt(1/2) |000> - |100> */
      const newState = q1.tensorProduct(q2); /* Should be 0.5 (|00000> - |00100> - |01000> + |01100> */
      expect(newState.amplitude('|00000>').closeTo(real(0.5))).to.be.true;
      expect(newState.amplitude('|00100>').closeTo(real(-0.5))).to.be.true;
      expect(newState.amplitude('|01000>').closeTo(real(-0.5))).to.be.true;
      expect(newState.amplitude('|01100>').closeTo(real(0.5))).to.be.true;
    });
  });

  describe('#multiply', () => {
    it('should modify the global phase', () => {
      const q = jsqubits('|1>').hadamard(0).multiply(complex(3, -4));
      expect(q.amplitude('|0>').closeTo(real(Math.sqrt(0.5)).multiply(complex(3, -4)))).to.be.true;
      expect(q.amplitude('|1>').closeTo(real(-Math.sqrt(0.5)).multiply(complex(3, -4)))).to.be.true;
    });

    it('should accept non-complex numbers', () => {
      const q = jsqubits('|1>').hadamard(0).multiply(2);
      expect(q.amplitude('|0>').closeTo(real(Math.sqrt(2)))).to.be.true;
      expect(q.amplitude('|1>').closeTo(real(-Math.sqrt(2)))).to.be.true;
    });
  });

  describe('#add', () => {
    it('should add two quantum states together', () => {
      //            NOTE: You will need to normalize afterwards to get a sensible answer!
      const q = jsqubits('|01>').hadamard(0).add(jsqubits('|00>')).add(jsqubits('|11>'));
      expect(q.amplitude('|00>').closeTo(complex(1 + Math.sqrt(0.5)))).to.be.true;
      expect(q.amplitude('|01>').closeTo(complex(-Math.sqrt(0.5)))).to.be.true;
      expect(q.amplitude('|11>').closeTo(complex(1))).to.be.true;
    });
  });

  describe('#subtract', () => {
    it('should subtract two quantum states together', () => {
      //            NOTE: You will need to normalize afterwards to get a sensible answer!
      const q = jsqubits('|01>').hadamard(0).add(jsqubits('|00>')).subtract(jsqubits('|01>'));
      expect(q.toString()).to.equal('(1.7071)|00> + (-1.7071)|01>');
    });
  });

  describe('#normalize', () => {
    it('should normalize the amplitudes', () => {
      let q = jsqubits('|0>')
        .multiply(complex(3, 4))
        .add(jsqubits('|1>').multiply(complex(0, 1)));
      q = q.normalize();
      const factor = 1 / Math.sqrt(25 + 1);
      expect(q.amplitude('|1>').closeTo(complex(0, factor))).to.be.true;
      expect(q.amplitude('|0>').closeTo(complex(3, 4).multiply(complex(factor)))).to.be.true;
    });
  });
});
