'use strict';

const ctxInfo = {
  1: [18, 2, 17],
  2: [11, 0, 15],
  3: [7, 1, 13],
  4: [6, 0, 13]
};

let canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d');

self.on('message', ({count, duplicated}) => {
  let [size, xPos, yPos] = ctxInfo[count.length];

  ctx.font = size + 'pt Arial';
  ctx.fillStyle = duplicated ? 'red' : 'black';
  ctx.fillText(count, xPos, yPos);

  self.postMessage(canvas.toDataURL());

  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
