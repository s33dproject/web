const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const { lerp } = require('canvas-sketch-util/math');

random.setSeed(random.getRandomSeed());

const dark = '#1c1c1c';

const settings = {
  seed: random.getSeed(),
  dimensions: [ 2048, 2048 ],
  pixelsPerInch: 300,
  exportPixelRatio: 2,
};

const runtimeParams = { lineWidth: 1, opacity: 0.75 };

const sketch = ({ width, height }) => {
  const palette = random.shuffle(random.pick(palettes).slice(0, 10));
  const lineCount = 10;
  const lineSegments = 400;

  let lines = [];
  const margin = width * 0.15;

  for (let i = 0; i < lineCount; i++) {
    const A = i / (lineCount - 1);

    const line = {
      color: random.pick(palette),
      points: []
    };

    const x = lerp(margin, width - margin, A);
    for (let j = 0; j < lineSegments; j++) {
      const B = j / (lineSegments - 1);
      const y = lerp(margin, height - margin, B);

      const frequency0 = 0.00105 + random.gaussian() * 0.000009;
      const z0 = noise(x * frequency0, y * frequency0, -1);
      const z1 = noise(x * frequency0, y * frequency0, +1);

      const warp = random.gaussian(20, 40);
      const fy = x + z0 * warp;
      const fx = y + z1 * warp;

      line.points.push([ fx, fy ]);
    }

    lines.push(line);
  }

  return ({ context, width, height }) => {
    context.fillStyle = dark;
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.fillRect(0, 0, width, height);
    context.lineWidth = runtimeParams.lineWidth ?? 1;

    lines.forEach(line => {
      context.beginPath();
      line.points.forEach(([ x, y ]) => context.lineTo(x, y));
      context.globalCompositeOperation = 'lighter';
      context.strokeStyle = line.color;
      context.globalAlpha = runtimeParams.opacity ?? 0.75;
      context.stroke();
    });
  };

  function noise (nx, ny, z, freq = 10) {
    // This uses many layers of noise to create a more organic pattern
    nx *= freq;
    ny *= freq;
    let e = (0.95 * (random.noise3D(1 * nx, 1 * ny, z) * 0.5 + 0.5) +
        0.50 * (random.noise3D(2 * nx, 2 * ny, z) * 0.5 + 0.5) +
        0.25 * (random.noise3D(4 * nx, 4 * ny, z) * 0.5 + 0.5) +
        0.15 * (random.noise3D(6 * nx, 4 * ny, z) * 0.5 + 0.5) +
        0.10 * (random.noise3D(8 * nx, 8 * ny, z) * 0.5 + 0.5) +
        0.05 * (random.noise3D(16 * nx, 16 * ny, z) * 0.5 + 0.5) +
        0.01 * (random.noise3D(32 * nx, 32 * ny, z) * 0.5 + 0.5));
    e /= (1.00 + 0.50 + 0.25 + 0.13 + 0.06 + 0.03);
    e = Math.pow(e, 2);
    e = Math.max(e, 0);
    e *= 2;
    return e * 2 - 1;
  }
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
