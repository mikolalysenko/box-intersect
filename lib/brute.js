'use strict'

function full() {
  function bruteForceRedFull(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
      var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
      Q: for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
        var y0 = bb[ax + bp], y1 = bb[ax + bp + d], yi = bi[j]
        if (y1 < x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(xi, yi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForceBlueFull(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
      var y0 = bb[ax + bp], y1 = bb[ax + bp + d], yi = bi[j]
      Q: for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
        var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
        if (y1 < x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(xi, yi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForceFull(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    if (re - rs > be - bs) {
      return bruteForceRedFull(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
    }
    else {
      return bruteForceBlueFull(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
    }
  }
  return bruteForceFull
}

function partial() {
  function bruteForceRedFlip(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
      var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
      Q: for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
        var y0 = bb[ax + bp], yi = bi[j]
        if (y0 <= x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(yi, xi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForceRed(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
      var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
      Q: for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
        var y0 = bb[ax + bp], yi = bi[j]
        if (y0 < x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(xi, yi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForceBlueFlip(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
      var y0 = bb[ax + bp], yi = bi[j]
      Q: for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
        var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
        if (y0 <= x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(yi, xi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForceBlue(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi) {
    var es = 2 * d
    for (var j = bs, bp = es * bs; j < be; ++j, bp += es) {
      var y0 = bb[ax + bp], yi = bi[j]
      Q: for (var i = rs, rp = es * rs; i < re; ++i, rp += es) {
        var x0 = rb[ax + rp], x1 = rb[ax + rp + d], xi = ri[i]
        if (y0 < x0 || x1 < y0) continue
        for (var k = ax + 1; k < d; ++k) {
          var r0 = rb[k + rp], r1 = rb[k + d + rp], b0 = bb[k + bp], b1 = bb[k + d + bp]
          if (r1 < b0 || b1 < r0) continue Q
        }
        var rv = vv(xi, yi)
        if (rv !== void 0) return rv
      }
    }
  }
  function bruteForcePartial(d, ax, vv, fp, rs, re, rb, ri, bs, be, bb, bi) {
    if (re - rs > be - bs) {
      if (fp) {
        return bruteForceRedFlip(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
      }
      else {
        return bruteForceRed(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
      }
    }
    else {
      if (fp) {
        return bruteForceBlueFlip(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
      }
      else {
        return bruteForceBlue(d, ax, vv, rs, re, rb, ri, bs, be, bb, bi)
      }
    }
  }
  return bruteForcePartial
}

function bruteForcePlanner(isFull) {
  return isFull ? full() : partial()

}

exports.partial = bruteForcePlanner(false)
exports.full    = bruteForcePlanner(true)