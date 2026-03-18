import { useRef, useEffect, useState } from "react";

const SEGMENT_DURATION = 15000;
const PIECE_COUNT = 4;
const TOTAL_DURATION = SEGMENT_DURATION * PIECE_COUNT;
const SCRIBBLE_FPS = 25;
const OVERDRAW_FPS = 30;

const PIECE_NAMES = [
  "Black Noise",
  "Animated Regl Fullscreen Shader",
  "Animated Two Overdraw",
  "Animated Scribble Curves",
];

const VS = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FSNOISE = `
  precision highp float;
  uniform float time;
  varying vec2 vUv;
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  void main() {
    float n = snoise(vec3(vUv.xy * 2.25, time));
    n = n * 0.5 + 0.5;
    gl_FragColor = vec4(vec3(n), 1.0);
  }
`;

const FSTOPOMAP = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  varying vec2 vUv;
  uniform float time;
  uniform float aspect;
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  float noise05(float freq, vec3 c) { return snoise(c * freq) * 0.5 + 0.5; }
  float terrain(vec3 c) {
    float e = 1.0*noise05(1.0,c)+0.5*noise05(2.0,c)+0.25*noise05(4.0,c)+0.13*noise05(8.0,c)+0.06*noise05(16.0,c)+0.03*noise05(32.0,c);
    e /= 1.97; e = pow(e, 4.0); return clamp(e, 0.0, 1.0);
  }
  vec3 hsl2rgb(float h, float s, float l) {
    vec3 c = vec3(1.0) - abs(2.0 * l - 1.0) * s;
    vec2 p = vec2(6.0 * h, 2.0);
    vec3 rgb = clamp(abs(mod(p.xxx + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + (c - 0.5) * (1.0 - abs(rgb * 2.0 - 1.0));
  }
  void main() {
    vec2 uv = vUv;
    if (aspect > 1.0) uv /= vec2(1.0, aspect); else uv *= vec2(aspect, 1.0);
    vec2 scroll = vec2(time * 0.01, 0.0);
    float morph = time * 0.01;
    float bandCount = 30.0;
    float y = terrain(vec3(scroll + uv * 0.9, morph));
    float ty = floor(y * bandCount) / bandCount;
    float L = clamp(ty / 0.25, 0.0, 1.0);
    float center = fract(y * bandCount);
    float lineWidth = fwidth(y * bandCount) * 2.0;
    float line = smoothstep(center - 0.0025, center + 0.0025, lineWidth);
    float sat = mix(0.0, 0.75, pow(L, 1.5));
    float hue = sin(time * 0.5) * 0.5 + 0.5;
    vec3 col = hsl2rgb(hue, sat, 0.5);
    gl_FragColor = vec4(col, line);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function noise4D(x: number, y: number, z: number, w: number): number {
  const hash = (a: number, b: number, c: number) => {
    const n = Math.sin(a * 12.9898 + b * 78.233 + c * 45.164) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };
  const n1 = hash(x, y, z);
  const n2 = hash(x + 50, y + 50, z + 50 + w * 10);
  return n1 * (1 - w * 0.5) + n2 * (w * 0.5);
}

export default function LandingBgDynamic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overdrawRef = useRef<HTMLCanvasElement>(null);
  const scribbleRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pausedRef = useRef(false);
  const cycleStartRef = useRef(performance.now());
  const pausedElapsedRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasOverdraw = overdrawRef.current;
    const canvasScribble = scribbleRef.current;
    if (!canvas || !canvasOverdraw || !canvasScribble) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return;
    gl.getExtension("OES_standard_derivatives");

    const progNoise = gl.createProgram()!;
    gl.attachShader(progNoise, compileShader(gl, gl.VERTEX_SHADER, VS)!);
    gl.attachShader(progNoise, compileShader(gl, gl.FRAGMENT_SHADER, FSNOISE)!);
    gl.linkProgram(progNoise);

    const progTopomap = gl.createProgram()!;
    gl.attachShader(progTopomap, compileShader(gl, gl.VERTEX_SHADER, VS)!);
    gl.attachShader(progTopomap, compileShader(gl, gl.FRAGMENT_SHADER, FSTOPOMAP)!);
    gl.linkProgram(progTopomap);

    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(progNoise, "position");
    const timeLocNoise = gl.getUniformLocation(progNoise, "time");
    const timeLocTopo = gl.getUniformLocation(progTopomap, "time");
    const aspectLoc = gl.getUniformLocation(progTopomap, "aspect");

    let overdrawSeed = 0;

    function resize() {
      const container = containerRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container ? container.getBoundingClientRect().width : window.innerWidth;
      const h = container ? container.getBoundingClientRect().height : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvasOverdraw.width = w * dpr;
      canvasOverdraw.height = h * dpr;
      canvasOverdraw.style.width = w + "px";
      canvasOverdraw.style.height = h + "px";
      canvasScribble.width = w * dpr;
      canvasScribble.height = h * dpr;
      canvasScribble.style.width = w + "px";
      canvasScribble.style.height = h + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function renderNoise(t: number) {
      gl.useProgram(progNoise);
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLocNoise, t * 0.0007);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function renderTopomap(t: number) {
      gl.useProgram(progTopomap);
      gl.enableVertexAttribArray(gl.getAttribLocation(progTopomap, "position"));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(gl.getAttribLocation(progTopomap, "position"), 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLocTopo, t * 0.001);
      gl.uniform1f(aspectLoc!, canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function renderOverdraw(t: number) {
      const ctx = canvasOverdraw.getContext("2d")!;
      const w = canvasOverdraw.width;
      const h = canvasOverdraw.height;
      const size = Math.min(w, h);
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;
      const frame = Math.floor(t / 33);
      overdrawSeed = frame * 7;
      const starX = ox + seededRandom(overdrawSeed++) * size;
      const starY = oy + seededRandom(overdrawSeed++) * size;
      const starSides = Math.floor(seededRandom(overdrawSeed++) * 5) + 4;
      const starStroke = seededRandom(overdrawSeed++) > 0.5;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(starX, starY);
      ctx.rotate(seededRandom(overdrawSeed++) * Math.PI * 2);

      const r1 = size / 10;
      const r2 = size / 5;
      ctx.beginPath();
      for (let i = 0; i < starSides * 2; i++) {
        const r = i % 2 === 0 ? r1 : r2;
        const a = (i / (starSides * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const lw = 8 * (window.devicePixelRatio || 1);
      if (starStroke) {
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = "#000";
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.fill();
      } else {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = lw;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    function renderScribble(t: number) {
      const ctx = canvasScribble.getContext("2d")!;
      const w = canvasScribble.width;
      const h = canvasScribble.height;
      const size = Math.min(w, h);
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;
      const scale = size / 2;
      const playhead = ((t * 0.001) % 20) / 20;

      const torus = (a: number, c: number, u: number, v: number) => [
        (c + a * Math.cos(v)) * Math.cos(u),
        (c + a * Math.cos(v)) * Math.sin(u),
        a * Math.sin(v),
      ];

      const amplitude = 0.7;
      const freq = 2;
      const resolution = 800;
      const torusRadius = 0.25;
      const torusInnerRadius = 1.5;
      const rotation = playhead * Math.PI * 2 * 5;
      const sliceSize = 0.15;
      const tailingDuration = 1.2;

      const points: [number, number][] = [];
      for (let i = 0; i < resolution; i++) {
        const tVal = i / resolution;
        const angle = Math.PI * 2 * tVal;
        const [x, y, z] = torus(torusRadius, torusInnerRadius, angle, rotation);
        const nx = x * freq;
        const ny = y * freq;
        const nz = z * freq;
        points.push([
          amplitude * (noise4D(nx, ny, nz, -1) * 2 - 1),
          amplitude * (noise4D(nx, ny, nz, 1) * 2 - 1),
        ]);
      }

      const drawLength = Math.floor(resolution * sliceSize);
      const draw = playhead * resolution * tailingDuration - drawLength / 2;
      const start = Math.max(0, Math.floor(draw - drawLength / 2));
      const end = Math.min(resolution, Math.floor(draw + drawLength / 2));
      const line = points.slice(start, end);

      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(ox + size / 2, oy + size / 2);
      ctx.scale(scale, scale);

      const hue = (playhead * 360 + 180) % 360;
      ctx.strokeStyle = `hsl(${hue}, 75%, 50%)`;
      ctx.lineWidth = 6 / scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (line.length > 0) {
        ctx.moveTo(line[0][0], line[0][1]);
        for (let i = 1; i < line.length; i++) {
          ctx.lineTo(line[i][0], line[i][1]);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    let rafId: number;
    let frozenTime = 0;
    let idx = 0;

    function loop(now: number) {
      if (!pausedRef.current) frozenTime = now;

      let elapsed = pausedRef.current
        ? pausedElapsedRef.current
        : now - cycleStartRef.current;
      if (elapsed >= TOTAL_DURATION) {
        cycleStartRef.current = performance.now();
        elapsed = 0;
      }

      const pct = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
      setProgress(pct);

      if (pct < 25) idx = 0;
      else if (pct < 50) idx = 1;
      else if (pct < 75) idx = 2;
      else idx = 3;
      setCurrentIndex(idx);

      canvas.style.display = idx <= 1 ? "block" : "none";
      canvas.style.opacity = idx <= 1 ? "1" : "0";
      canvasOverdraw.style.display = idx === 2 ? "block" : "none";
      canvasOverdraw.style.opacity = idx === 2 ? "1" : "0";
      canvasScribble.style.display = idx === 3 ? "block" : "none";
      canvasScribble.style.opacity = idx === 3 ? "1" : "0";

      let renderTime = pausedRef.current ? frozenTime : now;
      if (idx === 2) {
        const interval = 1000 / OVERDRAW_FPS;
        renderTime = Math.floor(renderTime / interval) * interval;
      } else if (idx === 3) {
        const interval = 1000 / SCRIBBLE_FPS;
        renderTime = Math.floor(renderTime / interval) * interval;
      }
      if (idx === 0) renderNoise(renderTime);
      else if (idx === 1) renderTopomap(renderTime);
      else if (idx === 2) renderOverdraw(renderTime);
      else renderScribble(renderTime);

      rafId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    const container = containerRef.current;
    const ro = container ? new ResizeObserver(resize) : null;
    if (ro && container) ro.observe(container);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (ro && container) ro.unobserve(container);
    };
  }, []);

  const handlePause = () => {
    pausedElapsedRef.current = performance.now() - cycleStartRef.current;
    pausedRef.current = true;
    setPaused(true);
  };

  const handlePlay = () => {
    cycleStartRef.current = performance.now() - pausedElapsedRef.current;
    pausedRef.current = false;
    setPaused(false);
  };

  return (
    <>
      <div ref={containerRef} className="landing-bg-container">
        <canvas ref={canvasRef} id="landing-bg" className="landing-bg" aria-hidden="true" />
        <canvas
          ref={overdrawRef}
          className="landing-bg landing-bg-layer"
          aria-hidden="true"
          style={{ display: "none" }}
        />
        <canvas
          ref={scribbleRef}
          className="landing-bg landing-bg-layer"
          aria-hidden="true"
          style={{ display: "none" }}
        />
      </div>
      <div className="landing-bg-ui">
        <div className="landing-bg-controls-pieces">
          <div className="landing-bg-controls">
            <button
              type="button"
              className={`landing-bg-btn landing-bg-play ${paused ? "" : "hidden"}`}
              aria-label="Play"
              title="Play"
              onClick={handlePlay}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <button
              type="button"
              className={`landing-bg-btn landing-bg-pause ${paused ? "hidden" : ""}`}
              aria-label="Pause"
              title="Pause"
              onClick={handlePause}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </button>
          </div>
          <div className="landing-bg-pieces">
          {PIECE_NAMES.map((name, i) => (
            <span
              key={name}
              className={`landing-bg-piece ${i === currentIndex ? "active" : ""}`}
              data-index={i}
            >
              {name}
            </span>
          ))}
          </div>
        </div>
        <div className="landing-bg-progress-wrap">
          <div className="landing-bg-progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}
