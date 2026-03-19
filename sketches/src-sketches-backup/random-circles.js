const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 2048, 2048 ],
};

const runtimeParams = { lineWidth: 40, margin: 300 };

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 20;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
      const u = x / (count - 1); 
      const v = y / (count - 1);
      points.push([ u, v ])
    }
  }
  return points;
  };

  random.setSeed(1);
  const points = createGrid().filter(() => random.value() > 0.5);

  return ({ context, width, height }) => {
    const margin = runtimeParams.margin ?? 300;
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(([ u, v]) => {
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, width - margin, v);

      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2, false);
      context.strokeStyle = 'black';
      context.lineWidth = runtimeParams.lineWidth ?? 40;
      context.stroke();
    });
  }
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);