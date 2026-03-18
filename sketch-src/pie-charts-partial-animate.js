// A recreation of:
// https://twitter.com/hyper_yolo/status/1116208688522383360

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');
const palettes = require('nice-color-palettes');

const settings = {
  scaleToView: true,
  dimensions: [ 2048, 2048 ],
  pixelsPerInch: 300,
  playbackRate: 'throttle',
  totalFrames: 100,
  exportPixelRatio: 2,
};

const runtimeParams = { margin: 0.2 };

const sketch = ({ width, height }) => {
  const nColors = random.rangeFloor(1, 2);
  const palette = random.shuffle(random.pick(palettes)).slice(0, nColors);
  const background = palette.pop();
  const fillColor = random.shuffle(random.pick(palettes)).shift();

  const count = random.rangeFloor(4, 15);
  const angle = random.rangeFloor(45, 180); // adding angle
  const step = 0.5;

  const createGrid = () => {
    const points = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);

        const corner = random.pick([ 0, 0.5, 1, 1.5, 2, 2.5 ]);
        const arcStart = Math.PI * corner - angle;
        const portion = random.pick([ 0, 0.5, 1, 1.5, 2, 2.5 ]);
        const arcEnd = arcStart + Math.PI * portion + step;

        points.push({
          position: [ u, v ],
          arcStart,
          arcEnd
        });
      }
    }
    return points;
  };

  const points = createGrid();

  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      const {
        position,
        arcStart,
        arcEnd
      } = point;

      const [ u, v ] = position;
      const margin = width * (runtimeParams.margin ?? 0.2);
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);
      const dim = Math.min(width, height) - margin * 2;
      const radius = dim / (count - 1) * 0.35;
      context.beginPath();
      context.arc(x, y, radius, arcStart, arcEnd, true);
      //context.fillStyle = fillColor; // or '#2b2b2b';
      context.fillStyle = random.shuffle(random.pick(palettes)).shift();
      context.lineTo(x, y);
      context.fill();
    })
  };
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
