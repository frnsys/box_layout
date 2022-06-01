function corners(rect) {
  return {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.w,
    bottom: rect.y + rect.h,
  }
}

export function intersects(rectA, rectB) {
  rectA = corners(rectA);
  rectB = corners(rectB);
  let aLeftOfB = rectA.right <= rectB.left;
  let aRightOfB = rectA.left >= rectB.right;
  let aAboveB = rectA.top >= rectB.bottom;
  let aBelowB = rectA.bottom <= rectB.top;

  return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
}

export function overlap(rectA, rectB) {
  rectA = corners(rectA);
  rectB = corners(rectB);
  let x_overlap = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
  let y_overlap = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
  return x_overlap * y_overlap;
}