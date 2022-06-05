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

  placeOnscreen(host, size) {
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

  placeOffscreen(hosts, sizes) {
    const sides = {
      left: [],
      right: [],
      top: [],
      bottom: [],
    };

    hosts.forEach((host, i) => {
      if (host.box.x < 0) {
        sides.left.push(i);
      } else if (host.box.x >= stage.clientWidth) {
        sides.right.push(i);
      } else if (host.box.y < 0) {
        sides.top.push(i);
      } else if (host.box.y >= stage.clientHeight) {
        sides.bottom.push(i);
      }
    });

    const positions = Array(hosts.length);
    Object.entries(sides).forEach(([side, indices]) => {
      if (indices.length == 0) return;

      if (side == 'left' || side == 'right') {
        // Sort from top to bottom
        indices.sort((a, b) => hosts[a].box.y - hosts[b].box.y);

        let minHeight = 0;
        for (const i of indices) {
            minHeight += sizes[i].h
        }

        let i = indices.shift();
        let pos = {
          x: side == 'right' ? stage.clientWidth - sizes[i].w : 0,
          y: Math.min(hosts[i].box.y, stage.clientHeight - minHeight)
        };
        let end = pos.y + sizes[i].h;
        positions[i] = pos;
        indices.forEach((i) => {
          let pos = {
            x: side == 'right' ? stage.clientWidth - sizes[i].w : 0,
            y: Math.min(stage.clientHeight - sizes[i].h, Math.max(hosts[i].box.y, end))
          };
          end = pos.y + sizes[i].h;
          positions[i] = pos;
        });

      } else {
        // Sort from left to right
        indices.sort((a, b) => hosts[a].box.x - hosts[b].box.x);

        let minWidth = 0;
        for (const i of indices) {
            minWidth += sizes[i].w
        }

        let i = indices.shift();
        let pos = {
          x: Math.min(hosts[i].box.x, stage.clientWidth - minWidth),
          y: side == 'top' ? 0 : stage.clientHeight - sizes[i].h,
        };
        let end = pos.x + sizes[i].w
        positions[i] = pos;
        indices.forEach((i) => {
          let pos = {
            x: Math.min(stage.clientWidth - sizes[i].w, Math.max(hosts[i].box.x, end)),
            y: side == 'top' ? 0 : stage.clientHeight - sizes[i].h,
          };
          end = pos.x + sizes[i].w
          positions[i] = pos;
        });
      }
    });

    return positions;
  }
}

export default Layout;
