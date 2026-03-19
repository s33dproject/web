const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');
const eases = require('eases');
const BezierEasing = require('bezier-easing');

global.THREE = require('three');

const settings = {
  dimensions: [2048, 2048],
  scaleToView: true,
  fps: 24,
  duration: 4,
  animate: true,
  context: 'webgl2',
  attributes: { antialias: true }
};

const runtimeParams = { speed: 1, zoom: 1 };

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('hsl(0, 0%, 95%)', 1.0);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup your scene
  const scene = new THREE.Scene();

  const palette = random.pick(palettes);

  const box = new THREE.BoxGeometry(1, 1, 1);

  for (let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(
      box,
      new THREE.MeshStandardMaterial({ // change to Basic/Standard Material for shadows
        color: random.pick(palette),
      })
    );
    mesh.position.set(
      random.range(-1, 1), // x
      random.range(-1, 1), // z
      random.range(-1, 1) // y
    );
    mesh.scale.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );
    mesh.scale.multiplyScalar(0.5)
    scene.add(mesh);
  }

  scene.add(new THREE.AmbientLight('hsl(0, 0%, 20%'))
  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(2, 2, 4)
  scene.add(light);

  const easeFn = BezierEasing(0.67, 0.03, 0.29, 0.99);

  let aspect = 1;

  /*
    // Specify an ambient/unlit colour
    scene.add(new THREE.AmbientLight('#59314f'));
  
    // Add some light
    const light = new THREE.PointLight('#45caf7', 1, 15.5);
    light.position.set(2, 2, -4).multiplyScalar(1.5);
    scene.add(light);
  */
  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);

      aspect = viewportWidth / viewportHeight;
      const zoom = runtimeParams.zoom ?? 1;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead }) {
      const zoom = runtimeParams.zoom ?? 1;
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;
      camera.position.set(zoom, zoom, zoom);
      camera.updateProjectionMatrix();

      const speed = runtimeParams.speed ?? 1;
      const t = Math.sin(playhead * Math.PI * 2 * speed);
      scene.rotation.z = easeFn(t);
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

const managerPromise = canvasSketch(sketch, settings);
require('./s33d-params').setupParamsListener(managerPromise, runtimeParams);
