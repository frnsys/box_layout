export const X = {
  L: 'L',
  C: 'C',
  R: 'R',
}
export const Y = {
  U: 'U',
  C: 'C',
  B: 'B',
}

export const ANCHORS = [
  [X.L, Y.U],
  [X.C, Y.U],
  [X.R, Y.U],
  [X.R, Y.C],
  [X.R, Y.B],
  [X.C, Y.B],
  [X.L, Y.B],
  [X.L, Y.C],
]

// Calculate the position of the specified anchor
// for the provided box.
export function anchor(box, anch) {
  let a = {x: 0, y: 0};
  let [anch_x, anch_y] = anch;
  switch (anch_x) {
    case X.L:
      a.x = box.x;
      break;
    case X.C:
      a.x = box.x + box.w/2;
      break;
    case X.R:
      a.x = box.x + box.w;
      break;
  }
  switch (anch_y) {
    case Y.U:
      a.y = box.y;
      break;
    case Y.C:
      a.y = box.y + box.h/2;
      break;
    case Y.B:
      a.y = box.y + box.h;
      break;
  }
  return a;
}

// Get position for a box of the specified size,
// at the specified anchor position,
// using the specified pivot.
export function boxPos(size, anchorPos, pivot) {
  let [pivot_x, pivot_y] = pivot;
  let pos = {};
  switch (pivot_x) {
    case X.L:
      pos.x = anchorPos.x;
      break;
    case X.C:
      pos.x = anchorPos.x - size.w/2;
      break;
    case X.R:
      pos.x = anchorPos.x - size.w;
      break;
  }
  switch (pivot_y) {
    case Y.U:
      pos.y = anchorPos.y;
      break;
    case Y.C:
      pos.y = anchorPos.y - size.h/2;
      break;
    case Y.B:
      pos.y = anchorPos.y - size.h;
      break;
  }
  return pos;
}

export function pivotsForAnchor(anch) {
  anch = anch.join(''); // For switch-case matching
  switch (anch) {
    case 'LU':
      return [[X.R, Y.U]];
    case 'CU':
      return [[X.L, Y.B], [X.C, Y.B], [X.R, Y.B]];
    case 'RU':
      return [[X.L, Y.U]];
    case 'RC':
      return [[X.L, Y.C]]
    case 'RB':
      return [[X.L, Y.B]]
    case 'CB':
      return [[X.L, Y.U], [X.C, Y.U], [X.R, Y.U]];
    case 'LB':
      return [[X.R, Y.B]]
    case 'LC':
      return [[X.R, Y.C]]
  }
}
