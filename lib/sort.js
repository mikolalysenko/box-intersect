'use strict';

//This code is extracted from ndarray-sort
//It is inlined here as a temporary workaround

module.exports = wrapper;

var scratch = [0.1,0.1];
var pivot1  = [0.1,0.1];
var pivot2  = [0.1,0.1];

var INSERT_SORT_CUTOFF = 32

function wrapper(data, n0) {
  if (n0 <= 4*INSERT_SORT_CUTOFF) {
    insertionSort(0, n0 - 1, data);
  } else {
    quickSort(0, n0 - 1, data);
  }
}

function insertionSort(left, right, data) {
  var ptr = 2*(left+1)
  for(var i=left+1; i<=right; ++i) {
    var a = data[ptr++]
    var b = data[ptr++]
    var j = i
    var jptr = ptr-2
    while(j-- > left) {
      var x = data[jptr-2]
      var y = data[jptr-1]
      if(x < a) {
        break
      } else if(x === a && y < b) {
        break
      }
      data[jptr]   = x
      data[jptr+1] = y
      jptr -= 2
    }
    data[jptr]   = a
    data[jptr+1] = b
  }
}

function swap(i, j, data) {
  i *= 2
  j *= 2
  var x = data[i]
  var y = data[i+1]
  data[i] = data[j]
  data[i+1] = data[j+1]
  data[j] = x
  data[j+1] = y
}

function move(i, j, data) {
  i *= 2
  j *= 2
  data[i] = data[j]
  data[i+1] = data[j+1]
}

function rotate(i, j, k, data) {
  i *= 2
  j *= 2
  k *= 2
  var x = data[i]
  var y = data[i+1]
  data[i] = data[j]
  data[i+1] = data[j+1]
  data[j] = data[k]
  data[j+1] = data[k+1]
  data[k] = x
  data[k+1] = y
}

function shufflePivot(i, j, px, py, data) {
  i *= 2
  j *= 2
  data[i] = data[j]
  data[j] = px
  data[i+1] = data[j+1]
  data[j+1] = py
}


function compare(i, j, data) {
  i *= 2
  j *= 2
  var x = data[i]
  var y = data[j]
  if(x < y) {
    return -1
  } else if(x === y) {
    var a = data[i+1]
    var b = data[j+1]
    if(a < b) {
      return -1
    } else if(a > b) {
      return 1
    }
    return 0
  }
  return 1
}

function comparePivot(i, y, b, data) {
  i *= 2
  var x = data[i]
  if(x < y) {
    return -1
  } else if(x === y) {
    var a = data[i+1]
    if(a < b) {
      return -1
    } else if(a > b) {
      return 1
    }
    return 0
  }
  return 1
}

function quickSort(left, right, data) {
  var sixth = (right - left + 1) / 6 | 0, 
      index1 = left + sixth, 
      index5 = right - sixth, 
      index3 = left + right >> 1, 
      index2 = index3 - sixth, 
      index4 = index3 + sixth, 
      el1 = index1, 
      el2 = index2, 
      el3 = index3, 
      el4 = index4, 
      el5 = index5, 
      less = left + 1, 
      great = right - 1, 
      tmp, 
      tmp0, 
      x, 
      y, 
      z, 
      k, 
      ptr0, 
      ptr1, 
      ptr2, 
      comp_pivot1, 
      comp_pivot2, 
      comp, 
      i1, 
      b_ptr0, 
      b_ptr1, 
      b_ptr2, 
      b_ptr3, 
      b_ptr4, 
      b_ptr5, 
      b_ptr6, 
      b_ptr7, 
      ptr3, 
      ptr4, 
      ptr5, 
      ptr6, 
      ptr7, 
      pivot_ptr, 
      ptr_shift, 
      elementSize = 2;
  if(compare(el1, el2, data) > 0) {
    tmp0 = el1
    el1 = el2
    el2 = tmp0
  }
  if(compare(el4, el5, data) > 0) {
    tmp0 = el4
    el4 = el5
    el5 = tmp0
  }
  if(compare(el1, el3, data) > 0) {
    tmp0 = el1
    el1 = el3
    el3 = tmp0
  }
  if(compare(el2, el3, data) > 0) {
    tmp0 = el2
    el2 = el3
    el3 = tmp0
  }
  if(compare(el1, el4, data) > 0) {
    tmp0 = el1
    el1 = el4
    el4 = tmp0
  }
  if(compare(el3, el4, data) > 0) {
    tmp0 = el3
    el3 = el4
    el4 = tmp0
  }
  if(compare(el2, el5, data) > 0) {
    tmp0 = el2
    el2 = el5
    el5 = tmp0
  }
  if(compare(el2, el3, data) > 0) {
    tmp0 = el2
    el2 = el3
    el3 = tmp0
  }
  if(compare(el4, el5, data) > 0) {
    tmp0 = el4
    el4 = el5
    el5 = tmp0
  }
  b_ptr0 = 2 * el1;
  b_ptr1 = 2 * el2;
  b_ptr2 = 2 * el3;
  b_ptr3 = 2 * el4;
  b_ptr4 = 2 * el5;
  b_ptr5 = 2 * index1;
  b_ptr6 = 2 * index3;
  b_ptr7 = 2 * index5;
  pivot_ptr = 0;
  ptr_shift = 0;
  for (i1 = 0; i1 < 2; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    ptr2 = b_ptr2 + ptr_shift;
    ptr3 = b_ptr3 + ptr_shift;
    ptr4 = b_ptr4 + ptr_shift;
    ptr5 = b_ptr5 + ptr_shift;
    ptr6 = b_ptr6 + ptr_shift;
    ptr7 = b_ptr7 + ptr_shift;
    pivot1[pivot_ptr] = data[ptr1];
    pivot2[pivot_ptr] = data[ptr3];
    x = data[ptr0];
    y = data[ptr2];
    z = data[ptr4];
    data[ptr5] = x;
    data[ptr6] = y;
    data[ptr7] = z;
    ++pivot_ptr;
    ptr_shift += 1;
  }

  move(index2, left, data)
  move(index4, right, data)

  for (k = less; k <= great; ++k) {
    comp_pivot1 = comparePivot(k, pivot1[0], pivot1[1], data)
    if (comp_pivot1 < 0) {
      if (k !== less) {
        swap(k, less, data)
      }
      ++less;
    } else {
      comp_pivot2 = comparePivot(k, pivot2[0], pivot2[1], data)
      if (comp_pivot2 > 0) {
        while (true) {
          comp = comparePivot(great, pivot2[0], pivot2[1], data)
          if (comp > 0) {
            if (--great < k) {
              break;
            }
            continue;
          } else {
            comp = comparePivot(great, pivot1[0], pivot1[1], data)
            if (comp < 0) {
              rotate(k, less, great, data)
              ++less;
              --great;
            } else {
              swap(k, great, data)
              --great;
            }
            break;
          }
        }
      }
    }
  }
  shufflePivot(left, less-1, pivot1[0], pivot1[1], data)
  shufflePivot(right, great+1, pivot2[0], pivot2[1], data)
  if (less - 2 - left <= INSERT_SORT_CUTOFF) {
    insertionSort(left, less - 2, data);
  } else {
    quickSort(left, less - 2, data);
  }
  if (right - (great + 2) <= INSERT_SORT_CUTOFF) {
    insertionSort(great + 2, right, data);
  } else {
    quickSort(great + 2, right, data);
  }
  if (less < index1 && great > index5) {
    for (k = less; k <= great; ++k) {
      comp_pivot1 = comparePivot(k, pivot1[0], pivot1[1], data)
      if (comp_pivot1 === 0) {
        if (k !== less) {
          swap(k, less, data)
        }
        ++less;
      } else {
        comp_pivot2 = comparePivot(k, pivot2[0], pivot2[1], data)
        if (comp_pivot2 === 0) {
          while (true) {
            comp = comparePivot(great, pivot2[0], pivot2[1], data)
            if (comp === 0) {
              if (--great < k) {
                break;
              }
              continue;
            } else {
              comp = comparePivot(great, pivot1[0], pivot1[1], data)
              if (comp < 0) {
                rotate(k, less, great, data)
                ++less;
                --great;
              } else {
                swap(k, great, data)
                --great;
              }
              break;
            }
          }
        }
      }
    }
  }
  if (great - less <= INSERT_SORT_CUTOFF) {
    insertionSort(less, great, data);
  } else {
    quickSort(less, great, data);
  }
}