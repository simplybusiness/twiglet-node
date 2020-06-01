// Note, this deep-merges objects only and not arrays
// All other types (arrays, strings, numbers, booleans) will
// overwrite the first object's attribute with the second's.
const merge = (x, y) => {
  if (typeof(x) === 'object' &&
      Array.isArray(x) !== true &&
      typeof(y) === 'object' &&
      Array.isArray(y) !== true) {
    // both are objects, merge y into x
    var result = x

    for (var a in y) {
      if (typeof(x[a]) === 'object' && typeof(y[a]) === 'object') {
        result[a] = merge(x[a], y[a])
      } else {
        result[a] = y[a]
      }
    }

    return result
  } else {
    return y
  }
}

module.exports = merge
