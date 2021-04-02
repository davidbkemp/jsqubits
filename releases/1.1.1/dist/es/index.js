'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsqubits = undefined;

var _QState = require('./QState');

var _QState2 = _interopRequireDefault(_QState);

var _Complex = require('./Complex');

var _Complex2 = _interopRequireDefault(_Complex);

var _QMath = require('./QMath');

var QMath = _interopRequireWildcard(_QMath);

var _Measurement = require('./Measurement');

var _Measurement2 = _interopRequireDefault(_Measurement);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Qubits(bitString) {
  return _QState2.default.fromBits(bitString);
}

Qubits.complex = function (real, imaginary) {
  return new _Complex2.default(real, imaginary);
};

Qubits.real = function (real) {
  return new _Complex2.default(real, 0);
};

Qubits.QMath = QMath;
Qubits.Complex = _Complex2.default;
Qubits.QState = _QState2.default;
Qubits.Measurement = _Measurement2.default;
Qubits.QStateComponent = _Measurement.QStateComponent;

Object.assign(Qubits, _constants2.default);

exports.default = Qubits;
// Also export as jsqubits to maintain backward compatibility

exports.jsqubits = Qubits;