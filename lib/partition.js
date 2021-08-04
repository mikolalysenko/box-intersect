'use strict'

module.exports = genPartition

var P2F = {
  'lo===p0': lo_equal_p0,
  'lo<p0': lo_lessThan_p0,
  'lo<=p0': lo_lessOrEqual_p0,
  'hi<=p0': hi_lessOrEqual_p0,
  'lo<p0&&p0<=hi': lo_lessThan_p0_and_p0_lessOrEqual_hi,
  'lo<=p0&&p0<=hi': lo_lassOrEqual_p0_and_p0_lessOrEqual_hi,
  '!(lo>=p0)&&!(p1>=hi)': lo_lessThan_p0_and_p1_lessThan_hi
}

function genPartition(predicate) {
  return P2F[predicate]
}

// lo===p0
function lo_equal_p0(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var lo = e[k + n];
    if (lo === p0) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      } var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}

// lo<p0
function lo_lessThan_p0(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var lo = e[k + n];
    if (lo < p0) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      } var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}

// lo<=p0
function lo_lessOrEqual_p0(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var hi = e[k + o];
    if (hi <= p0) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      }
      var u = f[p]; f[p] = f[m], f[m++] = u
    }
  } return m
}

// hi<=p0
function hi_lessOrEqual_p0(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var hi = e[k + o];
    if (hi <= p0) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      }
      var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}

// lo<=p0&&p0<=hi
function lo_lassOrEqual_p0_and_p0_lessOrEqual_hi(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var lo = e[k + n], hi = e[k + o];
    if (lo <= p0 && p0 <= hi) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      }
      var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}

// lo<p0&&p0<=hi
function lo_lessThan_p0_and_p0_lessOrEqual_hi(a, b, c, d, e, f, p0) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var lo = e[k + n], hi = e[k + o];
    if (lo < p0 && p0 <= hi) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      }
      var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}

// !(lo>=p0)&&!(p1>=hi)
function lo_lessThan_p0_and_p1_lessThan_hi(a, b, c, d, e, f, p0, p1) {
  for (var j = 2 * a, k = j * c, l = k, m = c, n = b, o = a + b, p = c; d > p; ++p, k += j) {
    var lo = e[k + n], hi = e[k + o];
    if (!(lo >= p0) && !(p1 >= hi)) if (m === p) m += 1, l += j; else {
      for (var s = 0; j > s; ++s) {
        var t = e[k + s]; e[k + s] = e[l], e[l++] = t
      }
      var u = f[p]; f[p] = f[m], f[m++] = u
    }
  }
  return m
}
