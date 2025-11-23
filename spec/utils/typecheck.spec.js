import * as chai from 'chai';
import typecheck from '../../lib/utils/typecheck.js';

const { expect } = chai;

describe('typecheck', function() {
  describe('isNull', function() {
    it('should return true if null passed', function() {
      expect(typecheck.isNull(null)).to.equal(true);
    });
  });

  describe('isObject', function() {
    it('should return true if object passed', function() {
      expect(typecheck.isObject({})).to.equal(true);
      expect(typecheck.isObject(new Object())).to.equal(true);
    });

    it('should return false if array passed', function() {
      expect(typecheck.isObject([])).to.equal(false);
      expect(typecheck.isObject(new Array())).to.equal(false);
    });

    it('should return false if string passed', function() {
      expect(typecheck.isObject('jsqubit')).to.equal(false);
      expect(typecheck.isObject(new String('jsqubit'))).to.equal(false);
    });

    it('should return false if number passed', function() {
      expect(typecheck.isObject(3)).to.equal(false);
      expect(typecheck.isObject(new Number(3))).to.equal(false);
    });

    it('should return false if boolean passed', function() {
      expect(typecheck.isObject(true)).to.equal(false);
      expect(typecheck.isObject(new Boolean(true))).to.equal(false);
    });

    it('should return false if date passed', function() {
      expect(typecheck.isObject(new Date())).to.equal(false);
    });

    it('should return false if undefined passed', function() {
      expect(typecheck.isObject()).to.equal(false);
      expect(typecheck.isObject(undefined)).to.equal(false);
    });

    it('should return false if regex passed', function() {
      expect(typecheck.isObject(/hello-world/g)).to.equal(false);
      expect(typecheck.isObject(new RegExp(/hello-world/g))).to.equal(false);
    });
  });

  describe('isArray', function() {
    it('should return true if array passed', function() {
      expect(typecheck.isArray([])).to.equal(true);
      expect(typecheck.isArray(new Array())).to.equal(true);
    });
  });

  describe('isString', function() {
    it('should return true if string passed', function() {
      expect(typecheck.isString('jsqubit')).to.equal(true);
      expect(typecheck.isString(new String('jsqubit'))).to.equal(true);
    });
  });

  describe('isNumber', function() {
    it('should return true if number passed', function() {
      expect(typecheck.isNumber(3)).to.equal(true);
      expect(typecheck.isNumber(new Number(3))).to.equal(true);
    });
  });

  describe('isBoolean', function() {
    it('should return true if boolean passed', function() {
      expect(typecheck.isBoolean(true)).to.equal(true);
      expect(typecheck.isBoolean(new Boolean(true))).to.equal(true);
    });
  });

  describe('isDate', function() {
    it('should return true if date passed', function() {
      expect(typecheck.isDate(new Date())).to.equal(true);
    });
  });

  describe('isRegExp', function() {
    it('should return true if regexp passed', function() {
      expect(typecheck.isRegExp(/hello-world/g)).to.equal(true);
      expect(typecheck.isRegExp(new RegExp(/hello-world/g))).to.equal(true);
    });
  });
});
