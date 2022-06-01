import Quadtree from './quadtree.js';
import {overlap, intersects} from './rect.js';
import {X, Y, ANCHORS, anchor, boxPos, pivotsForAnchor} from './box.js';

class Layout {
  constructor(stage) {
    const maxObjects = 3;
    this.stage = stage;
    this.qt = new Quadtree({
      x: 0,
      y: 0,
      w: stage.clientWidth,
      h: stage.clientHeight
    }, maxObjects);
  }

  add(box) {
    this.qt.insert(box);
  }

  hasNoOverlaps(box) {
    const cands = this.qt.retrieve(box);
    if (cands.length == 0) return true;
    const ixs = cands.filter((cand) => intersects(box, cand));
    if (ixs.length == 0) return true;
    return false;
  }

  isOffscreen(box) {
    return (box.x <= -box.w)
      || (box.x >= this.stage.clientWidth)
      || (box.y <= -box.h)
      || (box.y >= this.stage.clientHeight)
  }

  placeBox(host, size) {
    if (this.isOffscreen(host)) {
      return this._placeOffscreen(host, size);
    } else {
      return this._placeOnscreen(host, size);
    }
  }

  _placeOnscreen(host, size) {
    const rankings = [];
    for (let anch of ANCHORS) {
      const anchPos = anchor(host, anch);
      const pivots = pivotsForAnchor(anch);

      for (let pivot of pivots) {
        const box = boxPos(size, anchPos, pivot);
        box.w = size.w;
        box.h = size.h;

        // Dialogue would be offscreen, so skip
        if (box.x < 0 || box.y < 0 || box.x + box.w > stage.clientWidth || box.y + box.h > stage.clientHeight) {
          continue;
        }

        const cands = this.qt.retrieve(box).filter((cand) => {
          return !(cand.x == host.x && cand.y == host.y);
        });

        // No possible overlaps, pick this one
        if (cands.length == 0) return box;

        const ixs = cands.filter((cand) => intersects(box, cand));

        // No actual overlaps, pick this one
        if (ixs.length == 0) return box;

        // Score this one, in case it's still the best option
        rankings.push({
          box, overlapArea: ixs.reduce((acc, other) => acc + overlap(box, other), 0)
        });
      }
    }

    let best = rankings.reduce((acc, cand) => {
      return acc.overlapArea < cand.overlapArea ? acc : cand;
    }, rankings[0]);
    return best.box;
  }

  _placeOffscreen(host, size) {
    let best = {
      x: host.x,
      y: host.y,
      w: size.w,
      h: size.h,
    }

    let offscreenX = false;
    if (best.x < 0) {
      best.x = 0;
      offscreenX = true;
    } else if (best.x >= this.stage.clientWidth) {
      best.x = this.stage.clientWidth - size.w;
      offscreenX = true;
    }

    let offscreenY = false;
    if (best.y < 0) {
      best.y = 0;
      offscreenY = true;
    } else if (best.y >= this.stage.clientHeight) {
      best.y = this.stage.clientHeight - size.h;
      offscreenY = true;
    }

    let tries = [];
    if (offscreenX) {
      tries.push(host.y + host.h/2 - best.h/2);
      tries.push(host.y + host.h - best.h);
    }
    while (!this.hasNoOverlaps(best) && tries.length > 0) {
      let y = tries.pop();
      best.y = y;
    }
    return best;
  }
}

export default Layout;
