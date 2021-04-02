import QState from './QState'
import Complex from './Complex'
import * as QMath from './QMath'
import Measurement, {QStateComponent} from './Measurement'
import Constants from './constants'

function Qubits(bitString) {
  return QState.fromBits(bitString);
}

Qubits.complex = (real, imaginary) => {
  return new Complex(real, imaginary);
};

Qubits.real = (real) => {
  return new Complex(real, 0);
};

Qubits.QMath = QMath
Qubits.Complex = Complex
Qubits.QState = QState
Qubits.Measurement = Measurement
Qubits.QStateComponent = QStateComponent

Object.assign(Qubits, Constants)

export default Qubits
// Also export as jsqubits to maintain backward compatibility
export {Qubits as jsqubits}
