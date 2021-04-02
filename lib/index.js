import QState from './QState.js';
import Complex from './Complex.js';
import * as QMath from './QMath.js';
import Measurement, {QStateComponent} from './Measurement.js';
import Constants from './constants.js';

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

Object.assign(Qubits, Constants);

export default Qubits;
// Also export as jsqubits to maintain backward compatibility
export {Qubits as jsqubits};
