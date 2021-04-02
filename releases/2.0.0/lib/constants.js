import Complex from './Complex'

export default {
  ZERO: Complex.ZERO,
  ONE: new Complex(1, 0),
  ALL: 'ALL',
  // Amplitudes with magnitudes smaller than jsqubits.roundToZero this are rounded off to zero.
  roundToZero: 0.0000001
}
