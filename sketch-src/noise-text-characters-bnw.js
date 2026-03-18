const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

random.setSeed(random.getRandomSeed()); // deterministic randomness

const settings = {
    suffix: `seed${random.getSeed}`,
    dimensions: [ 2048, 2048 ],
    scaleToView: true,
    pixelsPerInch: 300,
    exportPixelRatio: 4,
};

const runtimeParams = { opacity: 0.85, character: '.' };

const sketch = () => {
  const colorCount = random.rangeFloor(1, 6);
  const palette = ['hsl(0, 0%, 94%)'];
    const background = 'black';

  const createGrid = () => {
    const points = [];
    const count = 40;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
      const u = count <= 1 ? 0.5 : x / (count - 1); 
      const v = count <= 1 ? 0.5 : y / (count - 1);
      const radius = Math.abs(random.noise2D(u, v)) * 0.04;
      points.push({
          color: random.pick(palette),
          rotation: random.noise2D(u * v, v),
          //radius: random.value() * 0.1,
          //radius: Math.abs(0.01 + random.gaussian() * 0.01),
          radius,
          //radius: Math.max(0, random.gaussian() * 0.01),
          position: [ u, v ]
      });
    }
  }
  return points;
  };

  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 200;

  return ({ context, width, height }) => {
    context.fillStyle = background;
        context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        color,
        rotation,
        position,
        radius
      } = data;

      const [ u, v ]  = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      const size = random.pick([ 5, 8 ]);

      context.save();
      context.fillStyle = color;
      context.globalAlpha = runtimeParams.opacity ?? 0.85;
      context.font = `${radius * (width * size)}px "Futura"`;
      //context.font = '50px "Futura"';
      context.translate(x, y);
      context.rotate(rotation);
      const chars = (runtimeParams.character || '.').toString().split('').filter(Boolean);
      const char = chars.length > 0 ? random.pick(chars) : '.';
      context.fillText(char, 0, 0);
      context.restore();
    });
  }
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);