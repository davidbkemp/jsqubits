'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function validateArgs(args, minimum) {
  var maximum = 10000;
  var message = 'Must supply at least ' + minimum + ' parameters.';

  for (var _len = arguments.length, remainingArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    remainingArgs[_key - 2] = arguments[_key];
  }

  if (remainingArgs.length > 2) throw new Error('Internal error: too many arguments to validateArgs');
  if (remainingArgs.length === 2) {
    maximum = remainingArgs[0];
    message = remainingArgs[1];
  } else if (remainingArgs.length === 1) {
    message = remainingArgs[0];
  }
  if (args.length < minimum || args.length > maximum) {
    throw message;
  }
}

exports.default = validateArgs;