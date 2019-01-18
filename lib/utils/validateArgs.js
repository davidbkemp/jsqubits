function validateArgs(args, minimum, ...remainingArgs) {
  let maximum = 10000;
  let message = `Must supply at least ${minimum} parameters.`;
  if (remainingArgs.length > 2) throw new Error('Internal error: too many arguments to validateArgs')
  if (remainingArgs.length === 2) {
    [maximum, message] = remainingArgs
  } else if (remainingArgs.length === 1) {
    [message] = remainingArgs;
  }
  if (args.length < minimum || args.length > maximum) {
    throw message;
  }
}

export default validateArgs
