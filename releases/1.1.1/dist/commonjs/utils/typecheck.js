'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TYPES = {
  NULL: '[object Null]',
  OBJECT: '[object Object]',
  ARRAY: '[object Array]',
  STRING: '[object String]',
  NUMBER: '[object Number]',
  BOOLEAN: '[object Boolean]',
  DATE: '[object Date]',
  UNDEFINED: '[object Undefined]',
  REGEXP: '[object RegExp]'
};

var getType = function getType(prop) {
  return Object.prototype.toString.call(prop);
};

var isNull = function isNull(prop) {
  return getType(prop) === TYPES.NULL;
};

var isObject = function isObject(prop) {
  return getType(prop) === TYPES.OBJECT;
};

var isArray = function isArray(prop) {
  return getType(prop) === TYPES.ARRAY;
};

var isString = function isString(prop) {
  return getType(prop) === TYPES.STRING;
};

var isNumber = function isNumber(prop) {
  return getType(prop) === TYPES.NUMBER;
};

var isBoolean = function isBoolean(prop) {
  return getType(prop) === TYPES.BOOLEAN;
};

var isDate = function isDate(prop) {
  return getType(prop) === TYPES.DATE;
};

var isUndefined = function isUndefined(prop) {
  return getType(prop) === TYPES.UNDEFINED;
};

var isRegExp = function isRegExp(prop) {
  return getType(prop) === TYPES.REGEXP;
};

exports.default = {
  isNull: isNull,
  isObject: isObject,
  isArray: isArray,
  isString: isString,
  isNumber: isNumber,
  isBoolean: isBoolean,
  isDate: isDate,
  isUndefined: isUndefined,
  isRegExp: isRegExp
};