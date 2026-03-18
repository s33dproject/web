const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const { lerp } = require('canvas-sketch-util/math');

random.setSeed(random.getRandomSeed());

const transp = 'transparent';
const dark = '#1c1c1c';
const light= '#eeeeee';

const settings = {
  dimensions: [ 2048, 2048 ],
  scaleToView: true,
  pixelsPerInch: 300,
  exportPixelRatio: 2,
};

const runtimeParams = { lineWidth: 1, opacity: 0.15 };

const sketch = ({ width, height }) => {
  const colorCount = random.rangeFloor(1, 6);
  const palette = random.shuffle(random.pick(palettes))
    .slice(0, colorCount);
    const colorA = random.pick(palette);
    const colorB = random.pick(palette);
    //LGBT+ colors
    const red = '#fc0300';
    const orange = '#ff3d00';
    const yellow = '#ffab00';
    const green = '#00c853';
    const blue = '#3366ff';
    const purple = '#651fff';

  const lineCount = 300;
  const lineSegments = 600;
  const foreground = 'white';

  let lines = [];
  const margin = width * 0.10;

  for (let i = 0; i < lineCount; i++) {
    const A = i / (lineCount - 1);
    const line = [];

    const x = lerp(margin, width - margin, A);
    for (let j = 0; j < lineSegments; j++) {
      const B = j / (lineSegments - 1);
      const y = lerp(margin, height - margin, B);

      const frequency0 = 0.00105 + random.gaussian() * 0.000009;
      const z0 = noise(x * frequency0, y * frequency0, -1);
      const z1 = noise(x * frequency0, y * frequency0, +1);

      const warp = random.gaussian(20, 60);
      const fx = x + z0 * warp;
      const fy = y + z1 * warp;

      const point = [ fx, fy ];
      line.push(point);
    }

    lines.push(line);
  }

  return ({ context, width, height }) => {
    context.fillStyle = transp;
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.fillRect(0, 0, width, height);
    context.lineWidth = runtimeParams.lineWidth ?? 1;

    lines.forEach(line => {
      context.beginPath();
      line.forEach(([ x, y ]) => context.lineTo(x, y));
      context.globalCompositeOperation = 'lighter';
      context.strokeStyle = foreground;
      context.globalAlpha = runtimeParams.opacity ?? 0.15;
      context.stroke();
    });
  };

  function noise (nx, ny, z, freq = 0.75) {
    // This uses many layers of noise to create a more organic pattern
    nx *= freq;
    ny *= freq;
    let e = (
        0.95 * (random.noise3D(1 * nx, 1 * ny, z) * 0.5 + 0.5) + // Try keeping only lines 79 and 85
        0.25 * (random.noise3D(4 * nx, 4 * ny, z) * 0.5 + 0.5) +
        0.15 * (random.noise3D(6 * nx, 4 * ny, z) * 0.5 + 0.5) +
        0.10 * (random.noise3D(8 * nx, 8 * ny, z) * 0.5 + 0.5) +
        0.05 * (random.noise3D(16 * nx, 16 * ny, z) * 0.5 + 0.5) +
        0.01 * (random.noise3D(32 * nx, 32 * ny, z) * 0.5 + 0.5)
      );
    e /= (1.00 + 0.50 + 0.25 + 0.13 + 0.06 + 0.03);
    e = Math.pow(e, 2);
    e = Math.max(e, 0);
    e *= 2;
    return e * 2 - 1;
  }
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
