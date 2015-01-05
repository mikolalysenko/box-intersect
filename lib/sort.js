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
  var i, 
      j, 
      cptr, 
      ptr = left * 2, 
      i1,
      dptr, 
      sptr, 
      a, 
      b;
  for (i = left + 1; i <= right; ++i) {
    j = i;
    ptr += 2;
    cptr = ptr;
    dptr = 0;
    sptr = ptr;
    for (i1 = 0; i1 < 2; ++i1) {
      scratch[dptr++] = data[sptr];
      sptr += 1;
    }
    __g:
      while (j-- > left) {
        dptr = 0;
        sptr = cptr - 2;
        __l:
          for (i1 = 0; i1 < 2; ++i1) {
            a = data[sptr];
            b = scratch[dptr];
            if (a < b) {
              break __g;
            }
            if (a > b) {
              break __l;
            }
            sptr += 1;
            dptr += 1;
          }
        dptr = cptr;
        sptr = cptr - 2;
        for (i1 = 0; i1 < 2; ++i1) {
          data[dptr] = data[sptr];
          dptr += 1;
          sptr += 1;
        }
        cptr -= 2;
      }
    dptr = cptr;
    sptr = 0;
    for (i1 = 0; i1 < 2; ++i1) {
      data[dptr] = scratch[sptr++];
      dptr += 1;
    }
  }
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
      pivots_are_equal = true, 
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
  b_ptr0 = 2 * el1;
  b_ptr1 = 2 * el2;
  ptr_shift = 0;
  __l1:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el1;
        el1 = el2;
        el2 = tmp0;
        break __l1;
      }
      if (comp < 0) {
        break __l1;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el4;
  b_ptr1 = 2 * el5;
  ptr_shift = 0;
  __l2:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el4;
        el4 = el5;
        el5 = tmp0;
        break __l2;
      }
      if (comp < 0) {
        break __l2;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el1;
  b_ptr1 = 2 * el3;
  ptr_shift = 0;
  __l3:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el1;
        el1 = el3;
        el3 = tmp0;
        break __l3;
      }
      if (comp < 0) {
        break __l3;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el2;
  b_ptr1 = 2 * el3;
  ptr_shift = 0;
  __l4:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el2;
        el2 = el3;
        el3 = tmp0;
        break __l4;
      }
      if (comp < 0) {
        break __l4;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el1;
  b_ptr1 = 2 * el4;
  ptr_shift = 0;
  __l5:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el1;
        el1 = el4;
        el4 = tmp0;
        break __l5;
      }
      if (comp < 0) {
        break __l5;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el3;
  b_ptr1 = 2 * el4;
  ptr_shift = 0;
  __l6:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el3;
        el3 = el4;
        el4 = tmp0;
        break __l6;
      }
      if (comp < 0) {
        break __l6;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el2;
  b_ptr1 = 2 * el5;
  ptr_shift = 0;
  __l7:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el2;
        el2 = el5;
        el5 = tmp0;
        break __l7;
      }
      if (comp < 0) {
        break __l7;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el2;
  b_ptr1 = 2 * el3;
  ptr_shift = 0;
  __l8:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el2;
        el2 = el3;
        el3 = tmp0;
        break __l8;
      }
      if (comp < 0) {
        break __l8;
      }
      ptr_shift += 1;
    }
  b_ptr0 = 2 * el4;
  b_ptr1 = 2 * el5;
  ptr_shift = 0;
  __l9:
    for (i1 = 0; i1 < 2; ++i1) {
      ptr0 = b_ptr0 + ptr_shift;
      ptr1 = b_ptr1 + ptr_shift;
      comp = data[ptr0] - data[ptr1];
      if (comp > 0) {
        tmp0 = el4;
        el4 = el5;
        el5 = tmp0;
        break __l9;
      }
      if (comp < 0) {
        break __l9;
      }
      ptr_shift += 1;
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
    pivots_are_equal = pivots_are_equal && pivot1[pivot_ptr] === pivot2[pivot_ptr];
    x = data[ptr0];
    y = data[ptr2];
    z = data[ptr4];
    data[ptr5] = x;
    data[ptr6] = y;
    data[ptr7] = z;
    ++pivot_ptr;
    ptr_shift += 1;
  }
  b_ptr0 = 2 * index2;
  b_ptr1 = 2 * left;
  ptr_shift = 0;
  for (i1 = 0; i1 < 2; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    ptr_shift += 1;
  }
  b_ptr0 = 2 * index4;
  b_ptr1 = 2 * right;
  ptr_shift = 0;
  for (i1 = 0; i1 < 2; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    ptr_shift += 1;
  }
  if (pivots_are_equal) {
    for (k = less; k <= great; ++k) {
      ptr0 = 0 + k * 2;
      pivot_ptr = 0;
      __l10:
        for (i1 = 0; i1 < 2; ++i1) {
          comp = data[ptr0] - pivot1[pivot_ptr];
          if (comp !== 0) {
            break __l10;
          }
          pivot_ptr += 1;
          ptr0 += 1;
        }
      if (comp === 0) {
        continue;
      }
      if (comp < 0) {
        if (k !== less) {
          b_ptr0 = 2 * k;
          b_ptr1 = 2 * less;
          ptr_shift = 0;
          for (i1 = 0; i1 < 2; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += 1;
          }
        }
        ++less;
      } else {
        while (true) {
          ptr0 = great * 2;
          pivot_ptr = 0;
          __l11:
            for (i1 = 0; i1 < 2; ++i1) {
              comp = data[ptr0] - pivot1[pivot_ptr];
              if (comp !== 0) {
                break __l11;
              }
              pivot_ptr += 1;
              ptr0 += 1;
            }
          if (comp > 0) {
            great--;
          } else if (comp < 0) {
            b_ptr0 = 2 * k;
            b_ptr1 = 2 * less;
            b_ptr2 = 2 * great;
            ptr_shift = 0;
            for (i1 = 0; i1 < 2; ++i1) {
              ptr0 = b_ptr0 + ptr_shift;
              ptr1 = b_ptr1 + ptr_shift;
              ptr2 = b_ptr2 + ptr_shift;
              tmp = data[ptr0];
              data[ptr0] = data[ptr1];
              data[ptr1] = data[ptr2];
              data[ptr2] = tmp;
              ptr_shift += 1;
            }
            ++less;
            --great;
            break;
          } else {
            b_ptr0 = 2 * k;
            b_ptr1 = 2 * great;
            ptr_shift = 0;
            for (i1 = 0; i1 < 2; ++i1) {
              ptr0 = b_ptr0 + ptr_shift;
              ptr1 = b_ptr1 + ptr_shift;
              tmp = data[ptr0];
              data[ptr0] = data[ptr1];
              data[ptr1] = tmp;
              ptr_shift += 1;
            }
            --great;
            break;
          }
        }
      }
    }
  } else {
    for (k = less; k <= great; ++k) {
      ptr0 = k * 2;
      pivot_ptr = 0;
      __l12:
        for (i1 = 0; i1 < 2; ++i1) {
          comp_pivot1 = data[ptr0] - pivot1[pivot_ptr];
          if (comp_pivot1 !== 0) {
            break __l12;
          }
          pivot_ptr += 1;
          ptr0 += 1;
        }
      if (comp_pivot1 < 0) {
        if (k !== less) {
          b_ptr0 = 2 * k;
          b_ptr1 = 2 * less;
          ptr_shift = 0;
          for (i1 = 0; i1 < 2; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += 1;
          }
        }
        ++less;
      } else {
        ptr0 = k * 2;
        pivot_ptr = 0;
        __l13:
          for (i1 = 0; i1 < 2; ++i1) {
            comp_pivot2 = data[ptr0] - pivot2[pivot_ptr];
            if (comp_pivot2 !== 0) {
              break __l13;
            }
            pivot_ptr += 1;
            ptr0 += 1;
          }
        if (comp_pivot2 > 0) {
          while (true) {
            ptr0 = great * 2;
            pivot_ptr = 0;
            __l14:
              for (i1 = 0; i1 < 2; ++i1) {
                comp = data[ptr0] - pivot2[pivot_ptr];
                if (comp !== 0) {
                  break __l14;
                }
                pivot_ptr += 1;
                ptr0 += 1;
              }
            if (comp > 0) {
              if (--great < k) {
                break;
              }
              continue;
            } else {
              ptr0 = great * 2;
              pivot_ptr = 0;
              __l15:
                for (i1 = 0; i1 < 2; ++i1) {
                  comp = data[ptr0] - pivot1[pivot_ptr];
                  if (comp !== 0) {
                    break __l15;
                  }
                  pivot_ptr += 1;
                  ptr0 += 1;
                }
              if (comp < 0) {
                b_ptr0 = 2 * k;
                b_ptr1 = 2 * less;
                b_ptr2 = 2 * great;
                ptr_shift = 0;
                for (i1 = 0; i1 < 2; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  ptr2 = b_ptr2 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = data[ptr2];
                  data[ptr2] = tmp;
                  ptr_shift += 1;
                }
                ++less;
                --great;
              } else {
                b_ptr0 = 2 * k;
                b_ptr1 = 2 * great;
                ptr_shift = 0;
                for (i1 = 0; i1 < 2; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = tmp;
                  ptr_shift += 1;
                }
                --great;
              }
              break;
            }
          }
        }
      }
    }
  }
  b_ptr0 = 2 * left;
  b_ptr1 = 2 * (less - 1);
  pivot_ptr = 0;
  ptr_shift = 0;
  for (i1 = 0; i1 < 2; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    data[ptr1] = pivot1[pivot_ptr];
    ++pivot_ptr;
    ptr_shift += 1;
  }
  b_ptr0 = 2 * right;
  b_ptr1 = 2 * (great + 1);
  pivot_ptr = 0;
  ptr_shift = 0;
  for (i1 = 0; i1 < 2; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    data[ptr1] = pivot2[pivot_ptr];
    ++pivot_ptr;
    ptr_shift += 1;
  }
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
  if (pivots_are_equal) {
    return;
  }
  if (less < index1 && great > index5) {
    __l16:
      while (true) {
        ptr0 = less * 2;
        pivot_ptr = 0;
        ptr_shift = 0;
        for (i1 = 0; i1 < 2; ++i1) {
          if (data[ptr0] !== pivot1[pivot_ptr]) {
            break __l16;
          }
          ++pivot_ptr;
          ptr0 += 1;
        }
        ++less;
      }
    __l17:
      while (true) {
        ptr0 = great * 2;
        pivot_ptr = 0;
        ptr_shift = 0;
        for (i1 = 0; i1 < 2; ++i1) {
          if (data[ptr0] !== pivot2[pivot_ptr]) {
            break __l17;
          }
          ++pivot_ptr;
          ptr0 += 1;
        }
        --great;
      }
    for (k = less; k <= great; ++k) {
      ptr0 = k * 2;
      pivot_ptr = 0;
      __l18:
        for (i1 = 0; i1 < 2; ++i1) {
          comp_pivot1 = data[ptr0] - pivot1[pivot_ptr];
          if (comp_pivot1 !== 0) {
            break __l18;
          }
          pivot_ptr += 1;
          ptr0 += 1;
        }
      if (comp_pivot1 === 0) {
        if (k !== less) {
          b_ptr0 = 2 * k;
          b_ptr1 = 2 * less;
          ptr_shift = 0;
          for (i1 = 0; i1 < 2; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += 1;
          }
        }
        ++less;
      } else {
        ptr0 = k * 2;
        pivot_ptr = 0;
        __l19:
          for (i1 = 0; i1 < 2; ++i1) {
            comp_pivot2 = data[ptr0] - pivot2[pivot_ptr];
            if (comp_pivot2 !== 0) {
              break __l19;
            }
            pivot_ptr += 1;
            ptr0 += 1;
          }
        if (comp_pivot2 === 0) {
          while (true) {
            ptr0 = great * 2;
            pivot_ptr = 0;
            __l20:
              for (i1 = 0; i1 < 2; ++i1) {
                comp = data[ptr0] - pivot2[pivot_ptr];
                if (comp !== 0) {
                  break __l20;
                }
                pivot_ptr += 1;
                ptr0 += 1;
              }
            if (comp === 0) {
              if (--great < k) {
                break;
              }
              continue;
            } else {
              ptr0 = great * 2;
              pivot_ptr = 0;
              __l21:
                for (i1 = 0; i1 < 2; ++i1) {
                  comp = data[ptr0] - pivot1[pivot_ptr];
                  if (comp !== 0) {
                    break __l21;
                  }
                  pivot_ptr += 1;
                  ptr0 += 1;
                }
              if (comp < 0) {
                b_ptr0 = 2 * k;
                b_ptr1 = 2 * less;
                b_ptr2 = 2 * great;
                ptr_shift = 0;
                for (i1 = 0; i1 < 2; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  ptr2 = b_ptr2 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = data[ptr2];
                  data[ptr2] = tmp;
                  ptr_shift += 1;
                }
                ++less;
                --great;
              } else {
                b_ptr0 = 2 * k;
                b_ptr1 = 2 * great;
                ptr_shift = 0;
                for (i1 = 0; i1 < 2; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = tmp;
                  ptr_shift += 1;
                }
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