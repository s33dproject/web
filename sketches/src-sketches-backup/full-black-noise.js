const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

const settings = {
  context: 'webgl2',
  animate: true
};

const runtimeParams = { speed: 1 };

// Your glsl code
const frag = glsl(`
  precision highp float;

  uniform float time;
  uniform float speed;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d'); 

  void main () {
    float n = noise(vec3(vUv.xy * 2.25, time * speed));
    gl_FragColor = vec4(vec3(n), 1.0);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      time: ({ time }) => time,
      speed: () => runtimeParams.speed ?? 1
    }
  });
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
