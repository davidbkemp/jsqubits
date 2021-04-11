import QState from './QState.js';
import Complex from './Complex.js';
import * as QMath from './QMath.js';
import Measurement, {QStateComponent} from './Measurement.js';

export function Qubits(bitString) {
  return QState.fromBits(bitString);
}

Qubits.complex = (real, imaginary) => {
  return new Complex(real, imaginary);
};

Qubits.real = (real) => {
  return new Complex(real, 0);
};

Qubits.QMath = QMath;
Qubits.Complex = Complex;
Qubits.QState = QState;
Qubits.Measurement = Measurement;
Qubits.QStateComponent = QStateComponent;
Qubits.ALL = QState.ALL;

Qubits.ZERO = Complex.ZERO;
Qubits.ONE = Complex.ONE;
Qubits.SQRT2 = Complex.SQRT2;
Qubits.SQRT1_2 = Complex.SQRT1_2;

export default Qubits;
// Also export as jsqubits to maintain backward compatibility
export {Qubits as jsqubits};
