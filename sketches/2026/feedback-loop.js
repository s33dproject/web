/**
 * Feedback Loop — Eco visual con ping-pong FBO.
 * Renderiza el frame anterior con decay + nueva contribución.
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
  speed: 0.5,
  decay: 0.92,
  feed: 0.15,
  seed: 0.5,
};

const sketch = ({ gl, canvasWidth, canvasHeight }) => {
  const regl = createRegl({ gl });
  const quad = createQuad();

  const drawFeedback = regl({
    frag: glslify(`
      precision highp float;
      uniform sampler2D prevFrame;
      uniform float decay;
      uniform float feed;
      uniform float time;
      uniform float seed;
      uniform vec2 resolution;
      varying vec2 vUv;

      #pragma glslify: noise = require('glsl-noise/simplex/3d');
      #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

      void main() {
        vec4 prev = texture2D(prevFrame, vUv);
        vec2 uv = (vUv - 0.5) * 2.0;
        float d = length(uv);
        float pulse = sin(time + seed * 6.28) * 0.5 + 0.5;
        float circle = smoothstep(0.3 + pulse * 0.2, 0.2 + pulse * 0.2, d);
        vec3 n = vec3(gl_FragCoord.xy * 0.002, time * 0.2 + seed * 10.0);
        float nv = noise(n) * 0.5 + 0.5;
        vec3 newColor = hsl2rgb(vec3(fract(nv + time * 0.05), 0.7, 0.6));
        vec3 add = newColor * feed * (0.3 + circle * 0.7);
        vec3 result = prev.rgb * decay + add;
        gl_FragColor = vec4(result, 1.0);
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
      prevFrame: regl.prop("prevFrame"),
      decay: regl.prop("decay"),
      feed: regl.prop("feed"),
      time: regl.prop("time"),
      seed: regl.prop("seed"),
      resolution: regl.prop("resolution"),
    },
  });

  const drawCopy = regl({
    frag: glslify(`
      precision highp float;
      uniform sampler2D tex;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(tex, vUv);
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
    uniforms: { tex: regl.prop("tex") },
  });

  let texA, texB, fboA, fboB;
  let readIdx = 0;

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
  }

  return {
    resize({ viewportWidth, viewportHeight }) {
      const w = Math.max(viewportWidth, 1);
      const h = Math.max(viewportHeight, 1);
      ensureFbos(w, h);
    },
    render({ viewportWidth, viewportHeight, time }) {
      regl.poll();
      const w = Math.max(viewportWidth, 1);
      const h = Math.max(viewportHeight, 1);
      ensureFbos(w, h);

      const t = time * (runtimeParams.speed != null ? runtimeParams.speed : 0.5);
      const decay = runtimeParams.decay != null ? runtimeParams.decay : 0.92;
      const feed = runtimeParams.feed != null ? runtimeParams.feed : 0.15;
      const seed = runtimeParams.seed != null ? runtimeParams.seed : 0.5;

      const readTex = readIdx === 0 ? texA : texB;
      const writeFbo = readIdx === 0 ? fboB : fboA;

      regl({ framebuffer: writeFbo })(() => {
        regl.clear({ color: [0, 0, 0, 1] });
        drawFeedback({
          prevFrame: readTex,
          decay,
          feed,
          time: t,
          seed,
          resolution: [w, h],
        });
      });

      readIdx = 1 - readIdx;

      const displayTex = readIdx === 0 ? texB : texA;
      regl({
        framebuffer: null,
        viewport: { x: 0, y: 0, width: w, height: h },
      })(() => {
        regl.clear({ color: [0.02, 0.02, 0.04, 1] });
        drawCopy({ tex: displayTex });
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
