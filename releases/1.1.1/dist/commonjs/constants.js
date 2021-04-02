'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Complex = require('./Complex');

var _Complex2 = _interopRequireDefault(_Complex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  ZERO: _Complex2.default.ZERO,
  ONE: new _Complex2.default(1, 0),
  ALL: 'ALL',
  // Amplitudes with magnitudes smaller than jsqubits.roundToZero this are rounded off to zero.
  roundToZero: 0.0000001
};