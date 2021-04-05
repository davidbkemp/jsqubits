
function padState(state, numBits) {
  const paddingLength = numBits - state.length;
  for (let i = 0; i < paddingLength; i++) {
    state = `0${state}`;
  }
  return state;
}

export default class Measurement {
  constructor(numBits, result, newState) {
    this.numBits = numBits;
    this.result = result;
    this.newState = newState;
  }

  toString() {
    return `{result: ${this.result}, newState: ${this.newState}}`;
  }

  asBitString() {
    return padState(this.result.toString(2), this.numBits);
  }
}

export class QStateComponent {
  constructor(numBits, index, amplitude) {
    this.numBits = numBits;
    this.index = index;
    this.amplitude = amplitude;
  }

  asNumber() {
    return parseInt(this.index, 10);
  }

  asBitString() {
    return padState(parseInt(this.index, 10).toString(2), this.numBits);
  }
}
