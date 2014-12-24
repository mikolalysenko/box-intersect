'use strict';

module.exports = wrapper;

var scratch = [0.1,0.1];
var pivot1  = [0.1,0.1];
var pivot2  = [0.1,0.1];

function wrapper(data, n0) {
  //if (n0 <= 32) {
    insertionSort(0, n0 - 1, data);
  //} else {
  //  quickSort(0, n0 - 1, data);
  //}
}

function insertionSort(left, right, data) {
  var s0 = 2,
      s1 = 1,
      n1 = 2,
      d1 = 1,
      e1 = 1,
      f1 = 1,
      offset = 0;
  var i, j, cptr, ptr = left * s0 + offset, i1, dptr, sptr, a, b;
  for (i = left + 1; i <= right; ++i) {
    j = i;
    ptr += s0;
    cptr = ptr;
    dptr = 0;
    sptr = ptr;
    for (i1 = 0; i1 < n1; ++i1) {
      scratch[dptr++] = data[sptr];
      sptr += d1;
    }
    __g:
      while (j-- > left) {
        dptr = 0;
        sptr = cptr - s0;
        __l:
          for (i1 = 0; i1 < n1; ++i1) {
            a = data[sptr];
            b = scratch[dptr];
            if (a < b) {
              break __g;
            }
            if (a > b) {
              break __l;
            }
            sptr += e1;
            dptr += f1;
          }
        dptr = cptr;
        sptr = cptr - s0;
        for (i1 = 0; i1 < n1; ++i1) {
          data[dptr] = data[sptr];
          dptr += d1;
          sptr += d1;
        }
        cptr -= s0;
      }
    dptr = cptr;
    sptr = 0;
    for (i1 = 0; i1 < n1; ++i1) {
      data[dptr] = scratch[sptr++];
      dptr += d1;
    }
  }
}

function quickSort(left, right, data) {
  var s0 = 2,
      s1 = 1,
      n1 = 2,
      d1 = 1,
      e1 = 1,
      f1 = 1,
      offset = 0;
  var sixth = (right - left + 1) / 6 | 0, index1 = left + sixth, index5 = right - sixth, index3 = left + right >> 1, index2 = index3 - sixth, index4 = index3 + sixth, el1 = index1, el2 = index2, el3 = index3, el4 = index4, el5 = index5, less = left + 1, great = right - 1, pivots_are_equal = true, tmp, tmp0, x, y, z, k, ptr0, ptr1, ptr2, comp_pivot1, comp_pivot2, comp, i1, b_ptr0, b_ptr1, b_ptr2, b_ptr3, b_ptr4, b_ptr5, b_ptr6, b_ptr7, ptr3, ptr4, ptr5, ptr6, ptr7, pivot_ptr, ptr_shift, elementSize = n1;
  b_ptr0 = s0 * el1;
  b_ptr1 = s0 * el2;
  ptr_shift = offset;
  __l1:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el4;
  b_ptr1 = s0 * el5;
  ptr_shift = offset;
  __l2:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el1;
  b_ptr1 = s0 * el3;
  ptr_shift = offset;
  __l3:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el2;
  b_ptr1 = s0 * el3;
  ptr_shift = offset;
  __l4:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el1;
  b_ptr1 = s0 * el4;
  ptr_shift = offset;
  __l5:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el3;
  b_ptr1 = s0 * el4;
  ptr_shift = offset;
  __l6:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el2;
  b_ptr1 = s0 * el5;
  ptr_shift = offset;
  __l7:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el2;
  b_ptr1 = s0 * el3;
  ptr_shift = offset;
  __l8:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el4;
  b_ptr1 = s0 * el5;
  ptr_shift = offset;
  __l9:
    for (i1 = 0; i1 < n1; ++i1) {
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
      ptr_shift += e1;
    }
  b_ptr0 = s0 * el1;
  b_ptr1 = s0 * el2;
  b_ptr2 = s0 * el3;
  b_ptr3 = s0 * el4;
  b_ptr4 = s0 * el5;
  b_ptr5 = s0 * index1;
  b_ptr6 = s0 * index3;
  b_ptr7 = s0 * index5;
  pivot_ptr = 0;
  ptr_shift = offset;
  for (i1 = 0; i1 < n1; ++i1) {
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
    ptr_shift += d1;
  }
  b_ptr0 = s0 * index2;
  b_ptr1 = s0 * left;
  ptr_shift = offset;
  for (i1 = 0; i1 < n1; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    ptr_shift += d1;
  }
  b_ptr0 = s0 * index4;
  b_ptr1 = s0 * right;
  ptr_shift = offset;
  for (i1 = 0; i1 < n1; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    ptr_shift += d1;
  }
  if (pivots_are_equal) {
    for (k = less; k <= great; ++k) {
      ptr0 = offset + k * s0;
      pivot_ptr = 0;
      __l10:
        for (i1 = 0; i1 < n1; ++i1) {
          comp = data[ptr0] - pivot1[pivot_ptr];
          if (comp !== 0) {
            break __l10;
          }
          pivot_ptr += f1;
          ptr0 += e1;
        }
      if (comp === 0) {
        continue;
      }
      if (comp < 0) {
        if (k !== less) {
          b_ptr0 = s0 * k;
          b_ptr1 = s0 * less;
          ptr_shift = offset;
          for (i1 = 0; i1 < n1; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += d1;
          }
        }
        ++less;
      } else {
        while (true) {
          ptr0 = offset + great * s0;
          pivot_ptr = 0;
          __l11:
            for (i1 = 0; i1 < n1; ++i1) {
              comp = data[ptr0] - pivot1[pivot_ptr];
              if (comp !== 0) {
                break __l11;
              }
              pivot_ptr += f1;
              ptr0 += e1;
            }
          if (comp > 0) {
            great--;
          } else if (comp < 0) {
            b_ptr0 = s0 * k;
            b_ptr1 = s0 * less;
            b_ptr2 = s0 * great;
            ptr_shift = offset;
            for (i1 = 0; i1 < n1; ++i1) {
              ptr0 = b_ptr0 + ptr_shift;
              ptr1 = b_ptr1 + ptr_shift;
              ptr2 = b_ptr2 + ptr_shift;
              tmp = data[ptr0];
              data[ptr0] = data[ptr1];
              data[ptr1] = data[ptr2];
              data[ptr2] = tmp;
              ptr_shift += d1;
            }
            ++less;
            --great;
            break;
          } else {
            b_ptr0 = s0 * k;
            b_ptr1 = s0 * great;
            ptr_shift = offset;
            for (i1 = 0; i1 < n1; ++i1) {
              ptr0 = b_ptr0 + ptr_shift;
              ptr1 = b_ptr1 + ptr_shift;
              tmp = data[ptr0];
              data[ptr0] = data[ptr1];
              data[ptr1] = tmp;
              ptr_shift += d1;
            }
            --great;
            break;
          }
        }
      }
    }
  } else {
    for (k = less; k <= great; ++k) {
      ptr0 = offset + k * s0;
      pivot_ptr = 0;
      __l12:
        for (i1 = 0; i1 < n1; ++i1) {
          comp_pivot1 = data[ptr0] - pivot1[pivot_ptr];
          if (comp_pivot1 !== 0) {
            break __l12;
          }
          pivot_ptr += f1;
          ptr0 += e1;
        }
      if (comp_pivot1 < 0) {
        if (k !== less) {
          b_ptr0 = s0 * k;
          b_ptr1 = s0 * less;
          ptr_shift = offset;
          for (i1 = 0; i1 < n1; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += d1;
          }
        }
        ++less;
      } else {
        ptr0 = offset + k * s0;
        pivot_ptr = 0;
        __l13:
          for (i1 = 0; i1 < n1; ++i1) {
            comp_pivot2 = data[ptr0] - pivot2[pivot_ptr];
            if (comp_pivot2 !== 0) {
              break __l13;
            }
            pivot_ptr += f1;
            ptr0 += e1;
          }
        if (comp_pivot2 > 0) {
          while (true) {
            ptr0 = offset + great * s0;
            pivot_ptr = 0;
            __l14:
              for (i1 = 0; i1 < n1; ++i1) {
                comp = data[ptr0] - pivot2[pivot_ptr];
                if (comp !== 0) {
                  break __l14;
                }
                pivot_ptr += f1;
                ptr0 += e1;
              }
            if (comp > 0) {
              if (--great < k) {
                break;
              }
              continue;
            } else {
              ptr0 = offset + great * s0;
              pivot_ptr = 0;
              __l15:
                for (i1 = 0; i1 < n1; ++i1) {
                  comp = data[ptr0] - pivot1[pivot_ptr];
                  if (comp !== 0) {
                    break __l15;
                  }
                  pivot_ptr += f1;
                  ptr0 += e1;
                }
              if (comp < 0) {
                b_ptr0 = s0 * k;
                b_ptr1 = s0 * less;
                b_ptr2 = s0 * great;
                ptr_shift = offset;
                for (i1 = 0; i1 < n1; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  ptr2 = b_ptr2 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = data[ptr2];
                  data[ptr2] = tmp;
                  ptr_shift += d1;
                }
                ++less;
                --great;
              } else {
                b_ptr0 = s0 * k;
                b_ptr1 = s0 * great;
                ptr_shift = offset;
                for (i1 = 0; i1 < n1; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = tmp;
                  ptr_shift += d1;
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
  b_ptr0 = s0 * left;
  b_ptr1 = s0 * (less - 1);
  pivot_ptr = 0;
  ptr_shift = offset;
  for (i1 = 0; i1 < n1; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    data[ptr1] = pivot1[pivot_ptr];
    ++pivot_ptr;
    ptr_shift += d1;
  }
  b_ptr0 = s0 * right;
  b_ptr1 = s0 * (great + 1);
  pivot_ptr = 0;
  ptr_shift = offset;
  for (i1 = 0; i1 < n1; ++i1) {
    ptr0 = b_ptr0 + ptr_shift;
    ptr1 = b_ptr1 + ptr_shift;
    data[ptr0] = data[ptr1];
    data[ptr1] = pivot2[pivot_ptr];
    ++pivot_ptr;
    ptr_shift += d1;
  }
  if (less - 2 - left <= 32) {
    insertionSort(left, less - 2, data);
  } else {
    quickSort(left, less - 2, data);
  }
  if (right - (great + 2) <= 32) {
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
        ptr0 = offset + less * s0;
        pivot_ptr = 0;
        ptr_shift = offset;
        for (i1 = 0; i1 < n1; ++i1) {
          if (data[ptr0] !== pivot1[pivot_ptr]) {
            break __l16;
          }
          ++pivot_ptr;
          ptr0 += d1;
        }
        ++less;
      }
    __l17:
      while (true) {
        ptr0 = offset + great * s0;
        pivot_ptr = 0;
        ptr_shift = offset;
        for (i1 = 0; i1 < n1; ++i1) {
          if (data[ptr0] !== pivot2[pivot_ptr]) {
            break __l17;
          }
          ++pivot_ptr;
          ptr0 += d1;
        }
        --great;
      }
    for (k = less; k <= great; ++k) {
      ptr0 = offset + k * s0;
      pivot_ptr = 0;
      __l18:
        for (i1 = 0; i1 < n1; ++i1) {
          comp_pivot1 = data[ptr0] - pivot1[pivot_ptr];
          if (comp_pivot1 !== 0) {
            break __l18;
          }
          pivot_ptr += f1;
          ptr0 += e1;
        }
      if (comp_pivot1 === 0) {
        if (k !== less) {
          b_ptr0 = s0 * k;
          b_ptr1 = s0 * less;
          ptr_shift = offset;
          for (i1 = 0; i1 < n1; ++i1) {
            ptr0 = b_ptr0 + ptr_shift;
            ptr1 = b_ptr1 + ptr_shift;
            tmp = data[ptr0];
            data[ptr0] = data[ptr1];
            data[ptr1] = tmp;
            ptr_shift += d1;
          }
        }
        ++less;
      } else {
        ptr0 = offset + k * s0;
        pivot_ptr = 0;
        __l19:
          for (i1 = 0; i1 < n1; ++i1) {
            comp_pivot2 = data[ptr0] - pivot2[pivot_ptr];
            if (comp_pivot2 !== 0) {
              break __l19;
            }
            pivot_ptr += f1;
            ptr0 += e1;
          }
        if (comp_pivot2 === 0) {
          while (true) {
            ptr0 = offset + great * s0;
            pivot_ptr = 0;
            __l20:
              for (i1 = 0; i1 < n1; ++i1) {
                comp = data[ptr0] - pivot2[pivot_ptr];
                if (comp !== 0) {
                  break __l20;
                }
                pivot_ptr += f1;
                ptr0 += e1;
              }
            if (comp === 0) {
              if (--great < k) {
                break;
              }
              continue;
            } else {
              ptr0 = offset + great * s0;
              pivot_ptr = 0;
              __l21:
                for (i1 = 0; i1 < n1; ++i1) {
                  comp = data[ptr0] - pivot1[pivot_ptr];
                  if (comp !== 0) {
                    break __l21;
                  }
                  pivot_ptr += f1;
                  ptr0 += e1;
                }
              if (comp < 0) {
                b_ptr0 = s0 * k;
                b_ptr1 = s0 * less;
                b_ptr2 = s0 * great;
                ptr_shift = offset;
                for (i1 = 0; i1 < n1; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  ptr2 = b_ptr2 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = data[ptr2];
                  data[ptr2] = tmp;
                  ptr_shift += d1;
                }
                ++less;
                --great;
              } else {
                b_ptr0 = s0 * k;
                b_ptr1 = s0 * great;
                ptr_shift = offset;
                for (i1 = 0; i1 < n1; ++i1) {
                  ptr0 = b_ptr0 + ptr_shift;
                  ptr1 = b_ptr1 + ptr_shift;
                  tmp = data[ptr0];
                  data[ptr0] = data[ptr1];
                  data[ptr1] = tmp;
                  ptr_shift += d1;
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
  if (great - less <= 32) {
    insertionSort(less, great, data);
  } else {
    quickSort(less, great, data);
  }
}