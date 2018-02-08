import chai from 'chai'
import jsqubits from '../lib'
const jsqubitsmath = jsqubits.QMath
const {expect} = chai

describe('QState.qft (Quantum Fourier Transform)', () => {
  const complex = jsqubits.complex;
  const real = jsqubits.real;

  it('Should be a Hadamard when applied to one bit', () => {
    const initialState = jsqubits('|0>').add(jsqubits('|1>')).normalize();
    const newState = initialState.qft([0]);
    expect(newState.toString()).to.equal('|0>');
  });

  it('Should be a Hadamard when applied to all zeros', () => {
    const initialState = jsqubits('|00>');
    const newState = initialState.qft([0, 1]);
    expect(newState.toString()).to.equal('(0.5)|00> + (0.5)|01> + (0.5)|10> + (0.5)|11>');
  });

  it('Should return state to all zeros when applied twice.', () => {
    const initialState = jsqubits('|0000>');
    const newState = initialState.hadamard(jsqubits.ALL).qft(jsqubits.ALL);
    expect(newState.toString()).to.equal('|0000>');
  });

  it('Should transform |01> correctly', () => {
    const initialState = jsqubits('|01>');
    const newState = initialState.qft(jsqubits.ALL);
    expect(newState.toString()).to.equal('(0.5)|00> + (0.5i)|01> + (-0.5)|10> + (-0.5i)|11>');
  });

  it('Should transform |001> correctly', () => {
    const initialState = jsqubits('|001>');
    const newState = initialState.qft(jsqubits.ALL);
    expect(newState.toString()).to.equal('(0.3536)|000> + (0.25+0.25i)|001> + (0.3536i)|010> + (-0.25+0.25i)|011> + (-0.3536)|100> + (-0.25-0.25i)|101> + (-0.3536i)|110> + (0.25-0.25i)|111>');
  });

  it('Should transform |010> correctly', () => {
    const initialState = jsqubits('|010>');
    const newState = initialState.qft(jsqubits.ALL);
    expect(newState.toString()).to.equal('(0.3536)|000> + (0.3536i)|001> + (-0.3536)|010> + (-0.3536i)|011> + (0.3536)|100> + (0.3536i)|101> + (-0.3536)|110> + (-0.3536i)|111>');
  });

  it('Should find the frequency of a simple periodic state', () => {
    const initialState = jsqubits('|000>').add(jsqubits('|100>')).normalize();
    const newState = initialState.qft([0, 1, 2]);
    expect(newState.toString()).to.equal('(0.5)|000> + (0.5)|010> + (0.5)|100> + (0.5)|110>');
  });

  it('Should find the frequency of a simple periodic state offset by 1', () => {
    const initialState = jsqubits('|001>').add(jsqubits('|101>')).normalize();
    const newState = initialState.qft([0, 1, 2]);
    expect(newState.toString()).to.equal('(0.5)|000> + (0.5i)|010> + (-0.5)|100> + (-0.5i)|110>');
  });

  it('Should find the frequency of a simple periodic function', () => {
    const inputBits = {from: 2, to: 4};
    const outBits = {from: 0, to: 1};
    let gcd = 0;
    //        Do this 10 times since it is random :-)
    for (let i = 0; i < 10; i++) {
      let qstate = jsqubits('|00000>').hadamard(inputBits);
      qstate = qstate.applyFunction(inputBits, outBits, (x) => { return x % 4 });
      const result = qstate.qft(inputBits).measure(inputBits).result;
      gcd = jsqubitsmath.gcd(gcd, result);
    }
    expect(gcd).to.equal(2);
  });
});
