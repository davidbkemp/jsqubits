"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function padState(state, numBits) {
  var paddingLength = numBits - state.length;
  for (var i = 0; i < paddingLength; i++) {
    state = "0" + state;
  }
  return state;
}

var Measurement = function () {
  function Measurement(numBits, result, newState) {
    _classCallCheck(this, Measurement);

    this.numBits = numBits;
    this.result = result;
    this.newState = newState;
  }

  _createClass(Measurement, [{
    key: "toString",
    value: function toString() {
      return "{result: " + this.result + ", newState: " + this.newState + "}";
    }
  }, {
    key: "asBitString",
    value: function asBitString() {
      return padState(this.result.toString(2), this.numBits);
    }
  }]);

  return Measurement;
}();

exports.default = Measurement;

var QStateComponent = exports.QStateComponent = function () {
  function QStateComponent(numBits, index, amplitude) {
    _classCallCheck(this, QStateComponent);

    this.numBits = numBits;
    this.index = index;
    this.amplitude = amplitude;
  }

  _createClass(QStateComponent, [{
    key: "asNumber",
    value: function asNumber() {
      return parseInt(this.index, 10);
    }
  }, {
    key: "asBitString",
    value: function asBitString() {
      return padState(parseInt(this.index, 10).toString(2), this.numBits);
    }
  }]);

  return QStateComponent;
}();