import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {expect} from 'chai';
import Q from '../lib/index.js';

describe('Browser distribution', function() {
  for (const filename of ['jsqubits.js', 'jsqubits.min.js']) {
    describe(filename, function() {
      let jsqubits;
      let source;
      let context;

      before(function() {
        source = readFileSync(new URL(`../dist/${filename}`, import.meta.url), 'utf8');
        context = {};
        runInNewContext(source, context, {filename});
        jsqubits = context.jsqubits;
      });

      it('exposes the callable API without module loaders or extra globals', function() {
        expect(jsqubits).to.be.a('function');
        expect(Object.keys(context)).to.deep.equal(['jsqubits']);
        expect(Object.keys(jsqubits)).to.have.members(Object.keys(Q));
        expect(Object.keys(jsqubits.QMath)).to.have.members(Object.keys(Q.QMath));
        for (const name of ['Complex', 'QState', 'Measurement', 'QStateComponent']) {
          expect(jsqubits[name]).to.be.a('function');
        }
        expect(jsqubits.ALL).to.equal(Q.ALL);
        for (const name of ['ZERO', 'ONE', 'SQRT2', 'SQRT1_2']) {
          expect(jsqubits[name].real).to.equal(Q[name].real);
          expect(jsqubits[name].imaginary).to.equal(Q[name].imaginary);
        }
      });

      it('performs quantum operations like the module API', function() {
        const state = jsqubits('|00>').hadamard(0).cnot(0, 1);
        expect(state).to.be.instanceOf(jsqubits.QState);
        expect(state.toString()).to.equal(Q('|00>').hadamard(0).cnot(0, 1).toString());
        expect(jsqubits('|0>').hadamard(0).T(0).toString())
          .to.equal(Q('|0>').hadamard(0).T(0).toString());
        const measurement = jsqubits('|01>').measure(jsqubits.ALL);
        expect(measurement).to.be.instanceOf(jsqubits.Measurement);
        expect(measurement.result).to.equal(1);
      });

      it('provides complex and math helpers', function() {
        expect(jsqubits.complex(2, 3).multiply(jsqubits.real(2)).toString()).to.equal('4+6i');
        expect(jsqubits.QMath.powerMod(234, 756, 15)).to.equal(6);
      });

      it('retains the license notice', function() {
        const license = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8').trim();
        expect(source).to.include(license);
      });
    });
  }
});
