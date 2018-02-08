import QState from './QState'
import Complex from './Complex'
import * as QMath from './QMath'
import Measurement, {StateWithAmplitude} from './Measurement'
import Constants from './constants'

function Qubits(bitString) {
  return QState.fromBits(bitString);
}

Qubits.complex = function (real, imaginary) {
  return new Complex(real, imaginary);
};

Qubits.real = function (real) {
  return new Complex(real, 0);
};

Qubits.QMath = QMath
Qubits.Complex = Complex
Qubits.QState = QState
Qubits.Measurement = Measurement
Qubits.StateWithAmplitude = StateWithAmplitude

Object.assign(Qubits, Constants)

export default Qubits
