const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const SKETCH_PORT = 9966;
const SRC_DIR = path.join(__dirname, "sketch-src");
const ORIGINALS_DIR = path.join(__dirname, "originals", "examples");

// Sketches to exclude (different runtime, headless, or subdirs)
const EXCLUDED = new Set([
  "headless-gl.js", // Node.js headless export
  "server.js",
  "s33d-params.js", // helper module, not a sketch
]);

let sketchesMetadata = {};
let originalsMetadata = {};
try {
  const metaPath = path.join(__dirname, "sketches-metadata.json");
  if (fs.existsSync(metaPath)) {
    sketchesMetadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  }
} catch (_) {}
try {
  const origMetaPath = path.join(__dirname, "originals-metadata.json");
  if (fs.existsSync(origMetaPath)) {
    originalsMetadata = JSON.parse(fs.readFileSync(origMetaPath, "utf8"));
  }
} catch (_) {}

function getSketchMeta(id) {
  const m = sketchesMetadata[id];
  if (!m) return { tech: ["canvas-sketch"], params: undefined };
  if (Array.isArray(m)) return { tech: m, params: undefined };
  return {
    tech: m.tech || ["canvas-sketch"],
    params: m.params,
  };
}

function getSketches() {
  const files = fs.readdirSync(SRC_DIR);
  return files
    .filter((f) => f.endsWith(".js") && !EXCLUDED.has(f))
    .map((f) => {
      const id = f.replace(/\.js$/, "");
      const { tech, params } = getSketchMeta(id);
      return { id, name: f, tech, params };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

// Check for sketches in subdirs (planets, etc.)
function getAllSketches() {
  const sketches = getSketches();
  const planetsDir = path.join(SRC_DIR, "planets");
  if (fs.existsSync(planetsDir)) {
    const { tech, params } = getSketchMeta("planets/index");
    sketches.push({
      id: "planets/index",
      name: "planets/index.js",
      tech,
      params,
      type: "2019-seeds",
    });
  }
  return sketches.map((s) => ({ ...s, type: "2019-seeds" }));
}

const ORIGINALS_EXCLUDED = new Set([
  "headless-gl.js",
  "shader.js",
  "util",
  "primitive-polyline.js", // utility module, not a sketch
  "polyline-util.js", // utility module, not a sketch
]);

const PACKAGE_TO_TECH = {
  "canvas-sketch": "canvas-sketch",
  "canvas-sketch-util/random": "canvas-sketch-util",
  "canvas-sketch-util/math": "canvas-sketch-util",
  "canvas-sketch-util/shader": "canvas-sketch-util",
  "canvas-sketch-util/penplot": "penplot",
  "canvas-sketch-util/color": "canvas-sketch-util",
  "canvas-sketch-util/geometry": "canvas-sketch-util",
  "three": "Three.js",
  "two.js": "Two.js",
  "load-asset": "load-asset",
  "convex-hull": "convex-hull",
  "gl-matrix": "gl-matrix",
  "regl": "regl",
  "glslify": "glslify",
  "glsl-noise": "glsl-noise",
  "glsl-dither": "glsl-dither",
  "glsl-hsl2rgb": "glsl-hsl2rgb",
  "primitive-icosphere": "primitive-icosphere",
  "primitive-quad": "primitive-quad",
  "perspective-camera": "perspective-camera",
  "camera-project": "camera-project",
  "bezier-easing": "bezier-easing",
  "nice-color-palettes": "palettes",
  "p5": "p5",
  "d3": "d3",
  "seed-random": "seed-random",
  "roughjs": "roughjs",
  "hex-rgb": "hex-rgb",
  "density-clustering": "density-clustering",
  "simplify-path": "simplify-path",
  "eases": "eases",
  "lerp": "lerp",
};

function inferTechFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8").slice(0, 4000);
    const techSet = new Set(["canvas-sketch"]);
    const re = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let m;
    while ((m = re.exec(content))) {
      const pkg = m[1];
      const base = pkg.split("/")[0];
      const display = PACKAGE_TO_TECH[pkg] || PACKAGE_TO_TECH[base];
      if (display && !pkg.startsWith(".")) techSet.add(display);
    }
    return [...techSet].sort();
  } catch {
    return ["canvas-sketch"];
  }
}

function getSketchTech(type, name) {
  const isOriginal = type === "original";
  if (isOriginal) {
    const meta = originalsMetadata[name] || {};
    if (meta.tech) return meta.tech;
    const sketchPath = path.join(ORIGINALS_DIR, name + ".js");
    return inferTechFromFile(sketchPath);
  }
  const { tech } = getSketchMeta(name);
  return tech;
}

function isP5Sketch(type, name) {
  const tech = getSketchTech(type, name);
  return Array.isArray(tech) && tech.some((t) => String(t).toLowerCase() === "p5");
}

function getOriginals() {
  if (!fs.existsSync(ORIGINALS_DIR)) return [];
  const list = [];
  function scan(dir, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = path.join(prefix, e.name);
      if (e.isDirectory()) {
        if (ORIGINALS_EXCLUDED.has(e.name)) continue;
        scan(path.join(dir, e.name), rel);
      } else if (e.name.endsWith(".js") && !ORIGINALS_EXCLUDED.has(e.name)) {
        const id = rel.replace(/\.js$/, "");
        const fullPath = path.join(dir, e.name);
        const meta = originalsMetadata[id] || {};
        const tech = meta.tech || inferTechFromFile(fullPath);
        const params = meta.params;
        list.push({
          id,
          name: e.name,
          tech,
          params,
          type: "original",
        });
      }
    }
  }
  scan(ORIGINALS_DIR);
  return list.sort((a, b) => a.id.localeCompare(b.id));
}

let canvasSketchProcess = null;
let currentSketchName = null;

function killCanvasSketch() {
  return new Promise((resolve) => {
    if (!canvasSketchProcess) {
      resolve();
      return;
    }
    const proc = canvasSketchProcess;
    canvasSketchProcess = null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(resolve, 600);
    };
    proc.once("exit", finish);
    proc.kill("SIGTERM");
    setTimeout(finish, 2500);
  });
}

function waitForPort(port, timeout = 15000) {
  const http = require("http");
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (Date.now() - start > timeout) {
        reject(new Error("Timeout waiting for canvas-sketch server"));
        return;
      }
      const req = http.get(`http://localhost:${port}`, () => resolve());
      req.on("error", () => setTimeout(check, 250));
    };
    setTimeout(check, 400);
  });
}

// Rutas HTML primero (evitar que static o catch-all las intercepten)
app.get("/manifest", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "manifest.html"));
});
app.get("/manifest/", (req, res) => {
  res.redirect(301, "/manifest");
});
app.get("/sketches", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "sketches.html"));
});
app.get("/sketches/", (req, res) => {
  res.redirect(301, "/sketches");
});
app.get("/v0id", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "void.html"));
});
app.get("/v0id/", (req, res) => {
  res.redirect(301, "/v0id");
});
app.get("/gallery", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "gallery.html"));
});
app.get("/gallery/", (req, res) => {
  res.redirect(301, "/gallery");
});

app.get(/^\/api\/sketch-src\/(2019-seeds|original)\/(.+)$/, (req, res) => {
  const type = req.params[0];
  const name = req.params[1].replace(/\/$/, "");
  const isOriginal = type === "original";
  const baseDir = isOriginal ? ORIGINALS_DIR : SRC_DIR;
  const sketchPath = path.join(baseDir, name + ".js");
  if (!fs.existsSync(sketchPath)) {
    return res.status(404).send("Sketch not found");
  }
  res.type("application/javascript");
  res.send(fs.readFileSync(sketchPath, "utf8"));
});

app.get(/^\/sketch-p5\/(2019-seeds|original)\/(.+)$/, (req, res) => {
  const type = req.params[0];
  const name = req.params[1].replace(/\/$/, "");
  const isOriginal = type === "original";
  const baseDir = isOriginal ? ORIGINALS_DIR : SRC_DIR;
  const sketchPath = path.join(baseDir, name + ".js");
  if (!fs.existsSync(sketchPath)) {
    return res.status(404).send("Sketch not found");
  }
  const srcUrl = `/api/sketch-src/${type}/${encodeURIComponent(name)}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>p5 sketch</title>
  <style>body{margin:0;overflow:hidden}</style>
</head>
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.0/p5.min.js"></script>
  <script src="${srcUrl}"></script>
</body>
</html>`;
  res.type("text/html");
  res.send(html);
});

app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/sketch",
  createProxyMiddleware({
    target: `http://localhost:${SKETCH_PORT}`,
    pathRewrite: { "^/sketch": "" },
    changeOrigin: true,
    ws: true,
  })
);

app.get("/api/sketch-status", (req, res) => {
  res.json({
    running: !!canvasSketchProcess,
    sketch: currentSketchName,
  });
});

app.get("/api/sketches", (req, res) => {
  try {
    const seeds = getAllSketches();
    const originals = getOriginals();
    res.json({ "2019-seeds": seeds, originals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(/^\/api\/run\/(2019-seeds|original)\/(.+)$/, async (req, res) => {
  const type = req.params[0];
  const name = req.params[1].replace(/\/$/, "");
  const isOriginal = type === "original";
  const baseDir = isOriginal ? ORIGINALS_DIR : SRC_DIR;
  const sketchPath = path.join(baseDir, name + ".js");

  if (!fs.existsSync(sketchPath)) {
    return res.status(404).json({ error: "Sketch not found" });
  }

  const runId = `${type}/${name}`;

  if (isP5Sketch(type, name)) {
    return res.json({
      url: `/run/${type}/${encodeURIComponent(name)}`,
      sketchName: name,
      type,
      tech: ["p5"],
    });
  }

  if (currentSketchName === runId && canvasSketchProcess) {
    return res.json({ url: `/run/${type}/${encodeURIComponent(name)}`, sketchName: name, type });
  }

  await killCanvasSketch();

  const relPath = path.relative(__dirname, sketchPath);
  console.log("Ejecutando sketch:", relPath);
  const args = [relPath, "--port", String(SKETCH_PORT)];

  canvasSketchProcess = spawn("npx", ["canvas-sketch", ...args], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  canvasSketchProcess.stdout.on("data", (d) => process.stdout.write(d.toString()));
  canvasSketchProcess.stderr.on("data", (d) => process.stderr.write(d.toString()));
  canvasSketchProcess.on("error", (err) => {
    console.error("canvas-sketch error:", err);
  });
  canvasSketchProcess.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.log("canvas-sketch exited with code", code);
    }
    canvasSketchProcess = null;
    currentSketchName = null;
  });
  currentSketchName = runId;

  try {
    await waitForPort(SKETCH_PORT);
    res.json({ url: `/run/${type}/${encodeURIComponent(name)}`, sketchName: name, type });
  } catch (err) {
    killCanvasSketch();
    res.status(500).json({ error: err.message });
  }
});

// Legacy: /run/experimental/name -> /run/2019-seeds/name (before :type)
app.get("/run/experimental/:name", (req, res) => {
  res.redirect(302, `/run/2019-seeds/${req.params.name}`);
});
app.get("/run/experimental/:name/*", (req, res) => {
  res.redirect(302, `/run/2019-seeds/${req.params.name}`);
});
app.get("/run/:type/:name", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "run.html"));
});
app.get("/run/:type/:name/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "run.html"));
});
// Legacy: /run/name -> /run/2019-seeds/name
app.get("/run/:name", (req, res) => {
  const name = req.params.name;
  if (name && name !== "2019-seeds" && name !== "original") {
    return res.redirect(302, `/run/2019-seeds/${name}`);
  }
  res.sendFile(path.join(__dirname, "public", "run.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`s33d UI: http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop");
});

process.on("exit", killCanvasSketch);
process.on("SIGINT", () => {
  killCanvasSketch();
  process.exit(0);
});
