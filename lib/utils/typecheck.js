const TYPES = {
  NULL: '[object Null]',
  OBJECT: '[object Object]',
  ARRAY: '[object Array]',
  STRING: '[object String]',
  NUMBER: '[object Number]',
  BOOLEAN: '[object Boolean]',
  DATE: '[object Date]',
  UNDEFINED: '[object Undefined]',
  REGEXP: '[object RegExp]',
};

const getType = (prop) => {
  return Object.prototype.toString.call(prop);
};

const isNull = (prop) => {
  return getType(prop) === TYPES.NULL;
};

const isObject = (prop) => {
  return getType(prop) === TYPES.OBJECT;
};

const isArray = (prop) => {
  return getType(prop) === TYPES.ARRAY;
};

const isString = (prop) => {
  return getType(prop) === TYPES.STRING;
};

const isNumber = (prop) => {
  return getType(prop) === TYPES.NUMBER;
};

const isBoolean = (prop) => {
  return getType(prop) === TYPES.BOOLEAN;
};

const isDate = (prop) => {
  return getType(prop) === TYPES.DATE;
};

const isUndefined = (prop) => {
  return getType(prop) === TYPES.UNDEFINED;
};

const isRegExp = (prop) => {
  return getType(prop) === TYPES.REGEXP;
};

export default {
  isNull,
  isObject,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isUndefined,
  isRegExp,
};
