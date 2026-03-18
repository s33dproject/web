const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");
const palettes = require("nice-color-palettes");

// We can force a random seed or a specific string/number
Random.setSeed(Random.getRandomSeed());

const settings = {
  pixelsPerInch: 300,
  suffix: Random.getSeed(),
  dimensions: "A4",
  units: "in",
};

const runtimeParams = { opacity: 1 };

const sketch = ({ width, height }) => {
  const nColors = Random.rangeFloor(1, 2);
  const palette = Random.shuffle(Random.pick(palettes)).slice(0, nColors);
  const fillColor = Random.shuffle(Random.pick(palettes)).shift();

  const margin = 0;

  const sliceCount = 90000;
  const slices = Array.from(new Array(sliceCount)).map((_, i, list) => {
    const t = list.lenth <= 1 ? 0 : i / (list.length - 1);

    const noiseAngle = t * Math.PI * 2;
    const nx = Math.cos(noiseAngle);
    const ny = Math.sin(noiseAngle);
    const nf = 0.05 + Random.range(0, 0.75);
    const amplitude = 2;
    const noise = Random.noise2D(nx * nf, ny * nf);
    const noise01 = noise * 0.5 + 0.5;

    const tOffset = Random.gaussian(0, 0.01);

    const cx = width / 2;
    const x = cx + noise * amplitude;
    return {
      alpha: Random.range(0.75, 1) * (1 - noise01),
      color: fillColor,
      lineWidth: Random.range(0.005, 0.02) * 0.1,
      length: Random.gaussian() * noise01 * 0.5,
      angle: Random.gaussian(0, 1),
      x,
      y: lerp(margin, height - margin, t + tOffset),
    };
  });

  return ({ context }) => {
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "black";
    // context.fillRect(0, 0, width, height);
    context.fillRect(2, 2, width / 2, height / 1.5);
    context.globalCompositeOperation = "lighter";

    slices.forEach((slice) => {
      context.save();
      context.beginPath();
      context.translate(slice.x, slice.y);
      context.rotate(slice.angle);
      context.lineTo(slice.length / 40, 1.0);
      context.lineTo(-slice.length / 40, 1.2);
      context.lineWidth = slice.lineWidth;
      context.strokeStyle = slice.color;
      context.globalAlpha = (slice.alpha * (runtimeParams.opacity ?? 1));
      context.stroke();
      context.restore();
    });
  };
};

const managerPromise = canvasSketch(sketch, settings);
require("./s33d-params").setupParamsListener(managerPromise, runtimeParams);
