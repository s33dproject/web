/**
 * Organic Sphere — Abstract 3D mesh with noise displacement and variable palette.
 * s33d 2026
 */

global.THREE = require("three");
const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  animate: true,
  dimensions: [1024, 1024],
  scaleToView: true,
  pixelsPerInch: 300,
  exportPixelRatio: 2,
  context: "webgl2",
  attributes: { antialias: true },
};

const runtimeParams = {
  speed: 0.5,
  displacement: 0.3,
  roughness: 0.6,
};

const sketch = ({ context, width, height }) => {
  const renderer = new THREE.WebGLRenderer({ context });
  renderer.setClearColor("#0a0a0f", 1);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 3.5);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  // Pick palette and convert to THREE colors
  const palette = random.pick(palettes);
  const colors = palette.map((hex) => new THREE.Color(hex));

  // Create icosphere with subdivisions for organic look
  const geometry = new THREE.IcosahedronGeometry(1, 4);
  const positions = geometry.attributes.position;

  // Store original positions for displacement
  const originalPositions = new Float32Array(positions.array);
  const vertexCount = positions.count;

  // Assign a color index per vertex (based on y for gradient)
  const colorIndices = new Float32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    const y = positions.getY(i);
    colorIndices[i] = ((y + 1) / 2) * (colors.length - 1);
  }

  // Create vertex colors
  const colorAttr = new THREE.Float32BufferAttribute(
    new Float32Array(vertexCount * 3),
    3
  );
  geometry.setAttribute("color", colorAttr);
  geometry.attributes.color.needsUpdate = true;

  const updateColors = () => {
    for (let i = 0; i < vertexCount; i++) {
      const t = colorIndices[i];
      const idx = Math.min(Math.floor(t), colors.length - 2);
      const frac = t - idx;
      const c1 = colors[idx];
      const c2 = colors[idx + 1] || colors[0];
      const r = c1.r + (c2.r - c1.r) * frac;
      const g = c1.g + (c2.g - c1.g) * frac;
      const b = c1.b + (c2.b - c1.b) * frac;
      colorAttr.setXYZ(i, r, g, b);
    }
    colorAttr.needsUpdate = true;
  };
  updateColors();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: runtimeParams.roughness ?? 0.6,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Soft light
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(2, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404060, 0.4));

  let time = 0;

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    render({ deltaTime }) {
      const speed = runtimeParams.speed ?? 0.5;
      const disp = runtimeParams.displacement ?? 0.3;

      time += deltaTime * speed;

      // Apply noise displacement to vertices
      for (let i = 0; i < vertexCount; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];
        const z = originalPositions[i * 3 + 2];
        const n = random.noise3D(x * 2, y * 2, z * 2 + time) * disp;
        positions.setX(i, x + n * 0.15);
        positions.setY(i, y + n * 0.15);
        positions.setZ(i, z + n * 0.15);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      material.roughness = runtimeParams.roughness ?? 0.6;

      mesh.rotation.y = time * 0.3;
      mesh.rotation.x = Math.sin(time * 0.2) * 0.2;

      renderer.render(scene, camera);
    },
    unload() {
      renderer.dispose();
    },
  };
};

const managerPromise = canvasSketch(sketch, settings);
require("../2019/s33d-params").setupParamsListener(managerPromise, runtimeParams);
