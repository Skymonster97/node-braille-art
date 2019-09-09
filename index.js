'use strict';

const { createCanvas, loadImage } = require('canvas');

const imageToCanvas = image => {
  const canvas = createCanvas();
  const ctx = canvas.getContext('2d');

  const scaledWidth = Math.floor(image.width / 4);
  const scaledHeight = Math.floor(image.height / 4);
  const paddedWidth = 2 * Math.ceil(scaledWidth / 2);
  const paddedHeight = 4 * Math.ceil(scaledHeight / 4);

  canvas.width = paddedWidth;
  canvas.height = paddedHeight;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return imageData;
};

const imageToBraille = image => {
  let asciiArt = '';

  const imageData = imageToCanvas(image);
  const getIndex = (x, y) => 4 * (x + imageData.width * y);
  const dotMap = [[0, 1, 2, 6], [3, 4, 5, 7]];

  for (let y = 0; y < imageData.height; y += 4) {
    for (let x = 0; x < imageData.width; x += 2) {
      let codePoint = 0x2800;

      for (let h = 0; h < 2; h++) {
        for (let k = 0; k < 4; k++) {
          const index = getIndex(x + h, y + k);
          const r = imageData.data[index + 0];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const intensity = Math.floor(0.2126 * r + 0.7152 * g + 0.0722 * b);

          if (intensity < 128) {
            codePoint |= 1 << dotMap[h][k];
          }
        }
      }
      asciiArt += String.fromCodePoint(codePoint | 0x1);
    }
    asciiArt += '\n';
  }

  return asciiArt;
};

module.exports = {
  generate: url => loadImage(url).then(imageToBraille),
  imageToCanvas,
  imageToBraille
};
