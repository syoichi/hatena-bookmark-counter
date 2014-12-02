'use strict';

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    ctxInfo = {
      1: [18, 2, 17],
      2: [11, 0, 15],
      3: [7, 1, 13],
      4: [6, 0, 13]
    };

self.on('message', ({count, duplicated}) => {
  var [size, xPos, yPos] = ctxInfo[count.length];

  ctx.font = size + 'pt Arial';
  ctx.fillStyle = duplicated ? 'red' : 'black';
  ctx.fillText(count, xPos, yPos);

  self.postMessage(canvas.toDataURL());

  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
