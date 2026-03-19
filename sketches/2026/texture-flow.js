/**
 * Texture Flow — Fullscreen shader abstracto con noise y colores.
 * canvas-sketch-util/shader + glslify. s33d 2026
 * (Versión procedural sin textura para evitar problemas de carga)
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
  scale: 4.0,
  hueShift: 0.3,
};

const frag = glsl(`
  precision highp float;
  uniform float time;
  uniform float scale;
  uniform float hueShift;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main() {
    vec2 uv = vUv * scale;
    vec3 coord = vec3(uv, time * 0.5);
    float n = noise(coord) * 0.5 + 0.5;
    float n2 = noise(coord * 1.7 + 10.0) * 0.5 + 0.5;
    float n3 = noise(vec3(gl_FragCoord.xy * 0.005, time * 0.2)) * 0.5 + 0.5;
    float h = fract(n + n2 * 0.3 + hueShift + time * 0.05);
    float s = 0.5 + n3 * 0.4;
    float l = 0.4 + n * 0.3;
    vec3 color = hsl2rgb(vec3(h, s, l));
    gl_FragColor = vec4(color, 1.0);
  }
`);

const sketch = ({ gl }) => {
  return createShader({
    gl,
    frag,
    uniforms: {
      time: ({ time }) => time * (runtimeParams.speed != null ? runtimeParams.speed : 0.5),
      scale: () => runtimeParams.scale != null ? runtimeParams.scale : 4.0,
      hueShift: () => runtimeParams.hueShift != null ? runtimeParams.hueShift : 0.3,
    },
  });
};

const managerPromise = canvasSketch(sketch, settings);
require("../2019/s33d-params").setupParamsListener(managerPromise, runtimeParams);
