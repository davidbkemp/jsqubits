export function validateArgs(args, minimum) {
  let maximum = 10000;
  let message = `Must supply at least ${minimum} parameters.`;
  if (arguments.length > 4) throw new Error('Internal error: too many arguments to validateArgs')
  if (arguments.length === 4) {
    maximum = arguments[2];
    message = arguments[3];
  } else if (arguments.length === 3) {
    message = arguments[2];
  }
  if (args.length < minimum || args.length > maximum) {
    throw message;
  }
}
