/**
 * Reaction-Diffusion — Patrones vivos (Gray-Scott) con ping-pong FBO.
 * Simulación de dos químicos que reaccionan y se difunden.
 * Debería verse: manchas, rayas o laberintos que evolucionan como células.
 * s33d 2026
 */

const canvasSketch = require("canvas-sketch");
const createRegl = require("regl");
const createQuad = require("primitive-quad");
const glslify = require("glslify");

const settings = {
  animate: true,
  dimensions: [1024, 1024],
  scaleToView: true,
  context: "webgl",
  attributes: { antialias: true },
};

const runtimeParams = {
  speed: 1.0,
  feed: 0.055,
  kill: 0.062,
  diffusionA: 1.0,
  diffusionB: 0.5,
  injectAmount: 0.15,
  seed: 0.5,
};

const sketch = ({ gl, canvasWidth, canvasHeight }) => {
  const regl = createRegl({ gl });
  const quad = createQuad();

  const drawSim = regl({
    frag: glslify(`
      precision highp float;
      uniform sampler2D state;
      uniform float feed;
      uniform float kill;
      uniform float dA;
      uniform float dB;
      uniform float time;
      uniform float injectAmount;
      uniform vec2 resolution;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 px = 1.0 / resolution;
        float a = texture2D(state, uv).r;
        float b = texture2D(state, uv).g;
        float aL = texture2D(state, uv + vec2(-px.x, 0)).r
          + texture2D(state, uv + vec2(px.x, 0)).r
          + texture2D(state, uv + vec2(0, -px.y)).r
          + texture2D(state, uv + vec2(0, px.y)).r;
        float bL = texture2D(state, uv + vec2(-px.x, 0)).g
          + texture2D(state, uv + vec2(px.x, 0)).g
          + texture2D(state, uv + vec2(0, -px.y)).g
          + texture2D(state, uv + vec2(0, px.y)).g;
        float laplacianA = aL * 0.25 - a;
        float laplacianB = bL * 0.25 - b;
        float f = feed;
        float k = kill;
        float abb = a * b * b;
        float dt = 0.8;
        float nA = a + (dA * laplacianA - abb + f * (1.0 - a)) * dt;
        float nB = b + (dB * laplacianB + abb - (k + f) * b) * dt;
        float cx = 0.5 + 0.35 * cos(time * 0.5);
        float cy = 0.5 + 0.35 * sin(time * 0.3);
        float d = length(uv - vec2(cx, cy));
        nB += injectAmount * exp(-d * d * 80.0);
        nA = clamp(nA, 0.0, 1.0);
        nB = clamp(nB, 0.0, 1.0);
        gl_FragColor = vec4(nA, nB, 0.0, 1.0);
      }
    `),
    vert: glslify(`
      precision highp float;
      attribute vec3 position;
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `),
    attributes: { position: regl.buffer(quad.positions) },
    elements: regl.elements(quad.cells),
    uniforms: {
      state: regl.prop("state"),
      feed: regl.prop("feed"),
      kill: regl.prop("kill"),
      dA: regl.prop("dA"),
      dB: regl.prop("dB"),
      time: regl.prop("time"),
      injectAmount: regl.prop("injectAmount"),
      resolution: regl.prop("resolution"),
    },
  });

  const drawDisplay = regl({
    frag: glslify(`
      precision highp float;
      uniform sampler2D state;
      varying vec2 vUv;

      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

      void main() {
        float a = texture2D(state, vUv).r;
        float b = texture2D(state, vUv).g;
        float v = a - b;
        float h = 0.6 + v * 0.2;
        float s = 0.7;
        float l = 0.3 + a * 0.5;
        vec3 color = hsl2rgb(vec3(h, s, l));
        gl_FragColor = vec4(color, 1.0);
      }
    `),
    vert: glslify(`
      precision highp float;
      attribute vec3 position;
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `),
    attributes: { position: regl.buffer(quad.positions) },
    elements: regl.elements(quad.cells),
    uniforms: { state: regl.prop("state") },
  });

  const initState = regl({
    frag: glslify(`
      precision highp float;
      uniform float seed;
      varying vec2 vUv;

      #pragma glslify: noise = require('glsl-noise/simplex/3d');

      void main() {
        vec2 uv = vUv - 0.5;
        float d = length(uv);
        float n = noise(vec3(uv * 20.0, seed * 100.0)) * 0.5 + 0.5;
        float a = 1.0;
        float b = 0.0;
        if (d < 0.25) {
          b = smoothstep(0.2, 0.15, d) * (0.5 + n * 0.5);
        }
        b += 0.01 * n;
        gl_FragColor = vec4(a, b, 0.0, 1.0);
      }
    `),
    vert: glslify(`
      precision highp float;
      attribute vec3 position;
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `),
    attributes: { position: regl.buffer(quad.positions) },
    elements: regl.elements(quad.cells),
    uniforms: { seed: regl.prop("seed") },
  });

  let texA, texB, fboA, fboB;
  let readIdx = 0;
  let initialized = false;

  function ensureFbos(w, h) {
    if (texA && texA.width === w && texA.height === h) return;
    if (texA) {
      texA.destroy();
      texB.destroy();
      fboA.destroy();
      fboB.destroy();
    }
    texA = regl.texture({ width: w, height: h });
    texB = regl.texture({ width: w, height: h });
    fboA = regl.framebuffer({ color: texA, depth: false });
    fboB = regl.framebuffer({ color: texB, depth: false });
    initialized = false;
  }

  return {
    resize({ viewportWidth, viewportHeight }) {
      const w = Math.max(Math.min(viewportWidth, 1024), 256);
      const h = Math.max(Math.min(viewportHeight, 1024), 256);
      ensureFbos(w, h);
    },
    render({ viewportWidth, viewportHeight, time }) {
      regl.poll();
      const w = Math.max(Math.min(viewportWidth, 1024), 256);
      const h = Math.max(Math.min(viewportHeight, 1024), 256);
      ensureFbos(w, h);

      const speed = runtimeParams.speed != null ? runtimeParams.speed : 1.0;
      const t = time * speed;
      const feed = runtimeParams.feed != null ? runtimeParams.feed : 0.055;
      const kill = runtimeParams.kill != null ? runtimeParams.kill : 0.062;
      const dA = runtimeParams.diffusionA != null ? runtimeParams.diffusionA : 1.0;
      const dB = runtimeParams.diffusionB != null ? runtimeParams.diffusionB : 0.5;
      const seed = runtimeParams.seed != null ? runtimeParams.seed : 0.5;

      if (!initialized) {
        regl({ framebuffer: fboA })(() => {
          regl.clear({ color: [1, 0, 0, 1] });
          initState({ seed });
        });
        regl({ framebuffer: fboB })(() => {
          regl.clear({ color: [1, 0, 0, 1] });
          initState({ seed });
        });
        initialized = true;
      }

      const steps = Math.max(1, Math.floor(speed * 3));
      for (let i = 0; i < steps; i++) {
        const readTex = readIdx === 0 ? texA : texB;
        const writeFbo = readIdx === 0 ? fboB : fboA;

        regl({ framebuffer: writeFbo })(() => {
          drawSim({
            state: readTex,
            feed,
            kill,
            dA,
            dB,
            time: t,
            injectAmount: runtimeParams.injectAmount != null ? runtimeParams.injectAmount : 0.15,
            resolution: [w, h],
          });
        });
        readIdx = 1 - readIdx;
      }

      const displayTex = readIdx === 0 ? texB : texA;
      const vw = Math.max(viewportWidth, 1);
      const vh = Math.max(viewportHeight, 1);
      regl({
        framebuffer: null,
        viewport: { x: 0, y: 0, width: vw, height: vh },
      })(() => {
        regl.clear({ color: [0.05, 0.05, 0.08, 1] });
        drawDisplay({ state: displayTex });
      });
    },
    unload() {
      if (texA) texA.destroy();
      if (texB) texB.destroy();
      if (fboA) fboA.destroy();
      if (fboB) fboB.destroy();
      regl.destroy();
    },
  };
};

const managerPromise = canvasSketch(sketch, settings);
require("../2019/s33d-params").setupParamsListener(managerPromise, runtimeParams);
