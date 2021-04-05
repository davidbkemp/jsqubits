import Complex from './Complex.js';

export default {
  ZERO: new Complex(0, 0),
  ONE: new Complex(1, 0),
  ALL: 'ALL',
  SQRT2: new Complex(Math.SQRT2, 0),
  SQRT1_2: new Complex(Math.SQRT1_2, 0),

  // Amplitudes with magnitudes smaller than jsqubits.roundToZero this are rounded off to zero.
  roundToZero: 0.0000001
};
