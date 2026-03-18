const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
  context: 'webgl2',
  animate: true,
  dimensions: [ 512, 512],
  scaleToView: true,
  fps: 24,
};

const runtimeParams = { speed: 1, scale: 10 };

// Your glsl code
const frag = glsl(/* glsl */`
  precision highp float;

  uniform float time;
  uniform float aspect;
  uniform float scale;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () {
    float n = noise(vec3(vUv.xy * scale, time));
    gl_FragColor = vec4(vec3(n), 1.0);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: 'white',
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      time: ({ time }) => time * (runtimeParams.speed ?? 1),
      aspect: ({ width, height }) => width / height,
      scale: () => runtimeParams.scale ?? 10
    }
  });
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
