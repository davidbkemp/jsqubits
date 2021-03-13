import chai from 'chai'
import typecheck from '../../lib/utils/typecheck.js';

const { expect } = chai;

describe('typecheck', () => {
  describe('isNull', () => {
    it('should return true if null passed', () => {
      expect(typecheck.isNull(null)).to.equal(true);
    });
  });

  describe('isObject', () => {
    it('should return true if object passed', () => {
      expect(typecheck.isObject({})).to.equal(true);
      /* eslint no-new-object: off */
      expect(typecheck.isObject(new Object())).to.equal(true);
    });
    it('should return false if array passed', () => {
      expect(typecheck.isObject([])).to.equal(false);
      /* eslint no-array-constructor: off */
      expect(typecheck.isObject(new Array())).to.equal(false);
    });
    it('should return false if string passed', () => {
      expect(typecheck.isObject('jsqubit')).to.equal(false);
      /* eslint no-new-wrappers: off */
      expect(typecheck.isObject(new String('jsqubit'))).to.equal(false);
    });
    it('should return false if number passed', () => {
      expect(typecheck.isObject(3)).to.equal(false);
      expect(typecheck.isObject(new Number(3))).to.equal(false);
    })
    it('should return false if boolean passed', () => {
      expect(typecheck.isObject(true)).to.equal(false);
      expect(typecheck.isObject(new Boolean(true))).to.equal(false);
    });
    it('should return false if date passed', () => {
      expect(typecheck.isObject(new Date())).to.equal(false);
    });
    it('should return false if undefined passed', () => {
      expect(typecheck.isObject()).to.equal(false);
      expect(typecheck.isObject(undefined)).to.equal(false);
    });
    it('should return false if regex passed', () => {
      expect(typecheck.isObject(/hello-world/g)).to.equal(false);
      expect(typecheck.isObject(new RegExp(/hello-world/g))).to.equal(false);
    });
  });

  describe('isArray', () => {
    it('should return true if array passed', () => {
      expect(typecheck.isArray([])).to.equal(true);
      /* eslint no-array-constructor: off */
      expect(typecheck.isArray(new Array())).to.equal(true);
    });
  });

  describe('isString', () => {
    it('should return true if string passed', () => {
      expect(typecheck.isString('jsqubit')).to.equal(true);
      /* eslint no-new-wrappers: off */
      expect(typecheck.isString(new String('jsqubit'))).to.equal(true);
    });
  });

  describe('isNumber', () => {
    it('should return true if number passed', () => {
      expect(typecheck.isNumber(3)).to.equal(true);
      expect(typecheck.isNumber(new Number(3))).to.equal(true);
    });
  });

  describe('isBoolean', () => {
    it('should return true if boolean passed', () => {
      expect(typecheck.isBoolean(true)).to.equal(true);
      expect(typecheck.isBoolean(new Boolean(true))).to.equal(true);
    });
  });

  describe('isDate', () => {
    it('should return true if date passed', () => {
      expect(typecheck.isDate(new Date())).to.equal(true);
    });
  });

  describe('isRegExp', () => {
    it('should return true if regexp passed', () => {
      expect(typecheck.isRegExp(/hello-world/g)).to.equal(true);
      expect(typecheck.isRegExp(new RegExp(/hello-world/g))).to.equal(true);
    });
  });
});
