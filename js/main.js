import Layout from './layout.js';
import { drawBox, drawPoint } from './draw.js';
import {ANCHORS, anchor} from './box.js';

const stage = document.querySelector('#stage');
const layout = new Layout(stage);

// https://stackoverflow.com/a/19303725
const seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

class Entity {
  constructor(id, box) {
    this.id = id;
    this.box = box;
  }

  render() {
    drawBox(this.box, this.id, {
      background: layout.isOffscreen(this.box) ? '#6B6B6B55' : '#F7DCC7',
      border: '1px solid #aaa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      fontFamily: 'monospace',
    });

    ANCHORS.forEach((anch) => {
      let pt = anchor(this.box, anch);
      drawPoint(pt);
    });
  }

  placeDialogueBox(size) {
    let best = layout.placeBox(this.box, size);
    if (best) {
      drawBox(best, this.id, {
        background: '#222222dd',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontFamily: 'monospace',
      });
      layout.add(best);
    } else {
      throw Error("Should have been a best box");
    }
  }
}

const boxes = [
  // Offscreen/near edge
  {x: 10, y: 20, w: 120, h: 80},
  {x: 700, y: 20, w: 120, h: 80},
  {x: 320, y: -20, w: 120, h: 80},

  // Group
  {x: 340, y: 280, w: 60, h: 60},
  {x: 320, y: 320, w: 120, h: 80},
  {x: 280, y: 280, w: 60, h: 60},

  // Fully offscreen
  {x: -200, y: 320, w: 120, h: 80},
  {x: 900, y: 280, w: 60, h: 60},
  {x: 200, y: -60, w: 60, h: 60},
  {x: 200, y: 610, w: 60, h: 60},

  // Fully oscreen overlap
  {x: 900, y: 290, w: 60, h: 60},

  // Fully offscreen corner
  {x: 900, y: 610, w: 60, h: 60},

  // Tight edge grouping
  {x: 600, y: 460, w: 60, h: 60},
  {x: 660, y: 460, w: 60, h: 60},
  {x: 540, y: 460, w: 60, h: 60},

  // Impossible
  {x: 0, y: 500, w: 30, h: 30},
  {x: 30, y: 500, w: 30, h: 30},
  {x: 60, y: 500, w: 30, h: 30},
];


const entities = boxes.map((box, i) => {
  const entity = new Entity(i, box);
  entity.render();
  layout.add(box);
  return entity;
});

// Place offscreen first, as they have more restrictive requirements
entities.filter((entity) => layout.isOffscreen(entity.box)).forEach((entity) => {
  entity.placeDialogueBox({w: 140, h: 30});
});
entities.filter((entity) => !layout.isOffscreen(entity.box)).forEach((entity) => {
  entity.placeDialogueBox({w: 140, h: 30});
});
