const stage = document.querySelector('#stage');

export function drawPoint(pt) {
  const radius = 6;
  const div = document.createElement('div');
  div.style.top = `${pt.y-radius/2}px`;
  div.style.left = `${pt.x-radius/2}px`;
  div.style.width = `${radius}px`;
  div.style.height = `${radius}px`;
  div.style.borderRadius = `100px`;
  div.style.position = 'absolute';
  div.style.background = '#ff0000';
  stage.appendChild(div);
  return div;
}

export function drawBox(box, text, styles) {
  const div = document.createElement('div');
  div.style.top = `${box.y}px`;
  div.style.left = `${box.x}px`;
  div.style.width = `${box.w}px`;
  div.style.height = `${box.h}px`;
  div.style.position = 'absolute';
  Object.keys(styles).forEach((k) => {
    div.style[k] = styles[k];
  });
  div.innerText = text;
  stage.appendChild(div);
  return div;
}
