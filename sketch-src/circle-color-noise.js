const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

const runtimeParams = { speed: 1 };

// Setup our sketch
const settings = {
  context: 'webgl2',
  animate: true
};

// Your glsl code
const frag = glsl(/* glsl */`
  precision highp float;

  uniform float time;
  uniform float aspect;
  uniform float speed;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d'); 

  void main () {
    vec3 colorA = vec3(0.75, 0.25, 0.0);
    vec3 colorB = vec3(0.75, 0.0, 1.0);
 
    vec2 center = vUv - 0.5;
    center.x *= aspect;
    float dist = length(center);

    float alpha = smoothstep(0.2555, 0.25, dist);
    vec3 color = mix(colorA, colorB, vUv.x + vUv.x * sin(time * speed));
    gl_FragColor = vec4(color, alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: false,
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      time: ({ time }) => time,
      aspect: ({ width, height }) => width / height,
      speed: () => (runtimeParams.speed != null ? runtimeParams.speed : 1)
    }
  });
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);