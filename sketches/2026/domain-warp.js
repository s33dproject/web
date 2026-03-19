/**
 * Domain Warp — Textura líquida con distorsión de UV por ruido.
 * Domain warping: distorsionar coordenadas antes de muestrear.
 * s33d 2026
 */

const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

const settings = {
  animate: true,
  dimensions: [1024, 1024],
  scaleToView: true,
  context: "webgl",
  attributes: { antialias: true },
};

const runtimeParams = {
  speed: 0.5,
  warpStrength: 0.4,
  scale: 3.0,
  seed: 0.5,
};

const frag = glsl(`
  precision highp float;
  uniform float time;
  uniform float warpStrength;
  uniform float scale;
  uniform float seed;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main() {
    vec2 uv = (vUv - 0.5) * scale + 0.5;
    vec3 t = vec3(uv, time * 0.3 + seed * 100.0);
    float n1 = noise(t);
    float n2 = noise(t + vec3(17.3, 31.7, 0.0));
    uv += vec2(n1, n2) * warpStrength;
    uv = fract(uv);
    vec3 coord = vec3(uv * 2.0, time * 0.2 + seed);
    float v = noise(coord) * 0.5 + 0.5;
    v += noise(coord * 2.3) * 0.3;
    float h = fract(v + seed + time * 0.02);
    vec3 color = hsl2rgb(vec3(h, 0.6, 0.5));
    gl_FragColor = vec4(color, 1.0);
  }
`);

const sketch = ({ gl }) => {
  return createShader({
    gl,
    frag,
    uniforms: {
      time: ({ time }) => time * (runtimeParams.speed != null ? runtimeParams.speed : 0.5),
      warpStrength: () => runtimeParams.warpStrength != null ? runtimeParams.warpStrength : 0.4,
      scale: () => runtimeParams.scale != null ? runtimeParams.scale : 3.0,
      seed: () => runtimeParams.seed != null ? runtimeParams.seed : 0.5,
    },
  });
};

const managerPromise = canvasSketch(sketch, settings);
require("../2019/s33d-params").setupParamsListener(managerPromise, runtimeParams);
