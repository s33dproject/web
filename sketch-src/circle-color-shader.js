const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

const settings = {
  context: 'webgl2',
  animate: true,
  dimensions: [ 512, 512 ],
  scaleToView: true,
  pixelsPerInch: 300,
  duration: 4,
  fps: 24
};

const runtimeParams = { speed: 0.1, radius: 0.25 };

// Your glsl code
const frag = glsl(/* glsl */`
  precision highp float;

  uniform float time;
  uniform float aspect;
  uniform float speed;
  uniform float radius;
  varying vec2 vUv;
  /*
  void main () {
    vec3 color = 0.5 + 0.5 * cos(time + vUv.xyx + vec3(0.0, 2.0, 4.0));
    gl_FragColor = vec4(color, 1.0);
  }
  */

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () {
    // vec3 colorA = vec3(0.9, 0.0, 0.1);
    // vec3 colorB = vec3(0.0, 1.0, 0.8);

    vec2 center = vUv - 0.5;
    center.x *= aspect;
    float dist = length(center);

    float alpha = smoothstep(radius, radius - 0.001, dist);

    float n = noise(vec3(center * 0.7, time * speed));

    vec3 color = hsl2rgb(
      0.5 + n * 0.5,
      0.5,
      0.5
    );

    gl_FragColor = vec4(color, alpha);
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
      time: ({ time }) => time,
      aspect: ({ width, height }) => width / height,
      speed: () => (runtimeParams.speed != null ? runtimeParams.speed : 0.1),
      radius: () => (runtimeParams.radius != null ? runtimeParams.radius : 0.25)
    }
  });
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
