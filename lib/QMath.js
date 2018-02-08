/**
 * Return x^y mod m
 */
export function powerMod(x, y, m) {
  if (y === 0) return 1;
  if (y === 1) return x;
  const halfY = Math.floor(y / 2);
  const powerHalfY = powerMod(x, halfY, m);
  let result = (powerHalfY * powerHalfY) % m;
  if (y % 2 === 1) result = (x * result) % m;
  return result;
}

function approximatelyInteger(x) {
  return Math.abs(x - Math.round(x)) < 0.0000001;
}

/**
 * Return x such that n = x^y for some prime number x, or otherwise return 0.
 */
export function powerFactor(n) {
  const log2n = Math.log(n) / Math.log(2);
  // Try values of root_y(n) starting at log2n and working your way down to 2.
  let y = Math.floor(log2n);
  if (log2n === y) {
    return 2;
  }
  y--;
  for (; y > 1; y--) {
    const x = Math.pow(n, 1 / y);
    if (approximatelyInteger(x)) {
      return Math.round(x);
    }
  }
  return 0;
}

/**
 * Greatest common divisor
 */
export function gcd(a, b) {
  while (b !== 0) {
    const c = a % b;
    a = b;
    b = c;
  }
  return a;
}

/**
 * Least common multiple
 */
export function lcm(a, b) {
  return a * b / gcd(a, b);
}

function roundTowardsZero(value) {
  return value >= 0 ? Math.floor(value) : Math.ceil(value);
}

/**
 * Find the continued fraction representation of a number.
 * @param the value to be converted to a continued faction.
 * @param the precision with which to compute (eg. 0.01 will compute values until the fraction is at least as precise as 0.01).
 * @return An object {quotients: quotients, numerator: numerator, denominator: denominator} where quotients is
 * an array of the quotients making up the continued fraction whose value is within the specified precision of the targetValue,
 * and where numerator and denominator are the integer values to which the continued fraction evaluates.
 */
export function continuedFraction(targetValue, precision) {
  let firstValue,
    remainder;
  if (Math.abs(targetValue) >= 1) {
    firstValue = roundTowardsZero(targetValue);
    remainder = targetValue - firstValue;
  } else {
    firstValue = 0;
    remainder = targetValue;
  }
  let twoAgo = {numerator: 1, denominator: 0};
  let oneAgo = {numerator: firstValue, denominator: 1};
  const quotients = [firstValue];

  while (Math.abs(targetValue - (oneAgo.numerator / oneAgo.denominator)) > precision) {
    const reciprocal = 1 / remainder;
    const quotient = roundTowardsZero(reciprocal);
    remainder = reciprocal - quotient;
    quotients.push(quotient);
    const current = {numerator: quotient * oneAgo.numerator + twoAgo.numerator, denominator: quotient * oneAgo.denominator + twoAgo.denominator};
    twoAgo = oneAgo;
    oneAgo = current;
  }

  let numerator = oneAgo.numerator;
  let denominator = oneAgo.denominator;
  if (oneAgo.denominator < 0) {
    numerator *= -1;
    denominator *= -1;
  }
  return {quotients, numerator, denominator};
}

//--------------

function cloneArray(a) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i];
  }
  return result;
}

/**
 * Find the null space in modulus 2 arithmetic of a matrix of binary values
 * @param a matrix of binary values represented using an array of numbers
 * whose bit values are the entries of a matrix rowIndex.
 * @param width the width of the matrix.
 */
export const findNullSpaceMod2 = (function () {
  /**
   * Try to make row pivotRowIndex / column colIndex a pivot
   * swapping rows if necessary.
   */
  function attemptToMakePivot(a, colIndex, pivotRowIndex) {
    const colBitMask = 1 << colIndex;
    if (colBitMask & a[pivotRowIndex]) return;
    for (let rowIndex = pivotRowIndex + 1; rowIndex < a.length; rowIndex++) {
      if (colBitMask & a[rowIndex]) {
        const tmp = a[pivotRowIndex];
        a[pivotRowIndex] = a[rowIndex];
        a[rowIndex] = tmp;
        return;
      }
    }
  }

  /**
   * Reduce 'a' to reduced row echelon form,
   * and keep track of which columns are pivot columns in pivotColumnIndexes.
   */
  function makeReducedRowEchelonForm(a, width, pivotColumnIndexes) {
    let pivotRowIndex = 0;
    for (let pivotColIndex = width - 1; pivotColIndex >= 0; pivotColIndex--) {
      attemptToMakePivot(a, pivotColIndex, pivotRowIndex);
      const colBitMask = 1 << pivotColIndex;
      if (colBitMask & a[pivotRowIndex]) {
        pivotColumnIndexes[pivotRowIndex] = pivotColIndex;
        zeroOutAboveAndBelow(a, pivotColIndex, pivotRowIndex);
        pivotRowIndex++;
      }
    }
  }

  /**
   * Zero out the values above and below the pivot (using mod 2 arithmetic).
   */
  function zeroOutAboveAndBelow(a, pivotColIndex, pivotRowIndex) {
    const pivotRow = a[pivotRowIndex];
    const colBitMask = 1 << pivotColIndex;
    for (let rowIndex = 0; rowIndex < a.length; rowIndex++) {
      if (rowIndex !== pivotRowIndex && (colBitMask & a[rowIndex])) {
        a[rowIndex] = a[rowIndex] ^ pivotRow;
      }
    }
  }

  /**
   * Add to results, special solutions corresponding to the specified non-pivot column colIndex.
   */
  function specialSolutionForColumn(a, pivotColumnIndexes, colIndex, pivotNumber) {
    const columnMask = 1 << colIndex;
    let specialSolution = columnMask;
    for (let rowIndex = 0; rowIndex < pivotNumber; rowIndex++) {
      if (a[rowIndex] & columnMask) {
        specialSolution += 1 << pivotColumnIndexes[rowIndex];
      }
    }
    return specialSolution;
  }

  /**
   * Find the special solutions to the mod-2 equation Ax=0 for matrix a.
   */
  function specialSolutions(a, width, pivotColumnIndexes) {
    const results = [];
    let pivotNumber = 0;
    let nextPivotColumnIndex = pivotColumnIndexes[pivotNumber];
    for (let colIndex = width - 1; colIndex >= 0; colIndex--) {
      if (colIndex === nextPivotColumnIndex) {
        pivotNumber++;
        nextPivotColumnIndex = pivotColumnIndexes[pivotNumber];
      } else {
        results.push(specialSolutionForColumn(a, pivotColumnIndexes, colIndex, pivotNumber));
      }
    }
    return results;
  }

  return function (a, width) {
    a = cloneArray(a);
    const pivotColumnIndexes = [];
    makeReducedRowEchelonForm(a, width, pivotColumnIndexes);
    return specialSolutions(a, width, pivotColumnIndexes);
  };
}());

export default {
  powerMod,
  powerFactor,
  gcd,
  lcm,
  continuedFraction,
  findNullSpaceMod2
}
