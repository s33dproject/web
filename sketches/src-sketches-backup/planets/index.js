global.THREE = require("three");
const { OrbitControls } = require("three/examples/jsm/controls/OrbitControls.js");

const canvasSketch = require("canvas-sketch");

const runtimeParams = { speed: 1 };

const settings = {
  dimensions: [1080, 2080],
  scaleToView: true,
  pixelsPerInch: 300,
  orientation: "landscape",
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl2"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  const controls = new OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const loader = new THREE.TextureLoader();
  const earth = new loader.load("/assets/images/earth.jpg");
  const mars = new loader.load("/assets/images/mars.jpg");
  const moon = new loader.load("/assets/images/moon.jpg");
  const sun = new loader.load("/assets/images/sun.jpg");

  // Setup a bodies material
  const bodiesGroup = new THREE.Group();
  const earthAndSateGroup = new THREE.Group();

  // Setup a sun material
  const sunMaterial = new THREE.MeshBasicMaterial({
    roughness: 1,
    metalness: 0,
    map: sun
  });

  // Setup a sun mesh with geometry + material
  const sunMesh = new THREE.Mesh(geometry, sunMaterial);
  sunMesh.position.set(0, 0, 0)
  sunMesh.scale.setScalar(2.22)

  // Setup a mars material
  const marsMaterial = new THREE.MeshStandardMaterial({
    //color: "red",
    //wireframe: true,
    roughness: 1,
    metalness: 0,
    map: mars
  });

  // Setup a mars mesh with geometry + material
  const marsMesh = new THREE.Mesh(geometry, marsMaterial);
  marsMesh.scale.setScalar(0.34)
  marsMesh.position.set(0.5, 0, 3.9)
  
  // Setup an earth material
  const earthMaterial = new THREE.MeshStandardMaterial({
    //color: "red",
    //wireframe: true,
    roughness: 1,
    metalness: 0,
    map: earth
  });

  // Setup an earth mesh with geometry + material
  const earthMesh = new THREE.Mesh(geometry, earthMaterial);
  earthMesh.scale.setScalar(0.42)

  // Setup a moon material
  const moonMaterial = new THREE.MeshBasicMaterial({
    roughness: 1,
    metalness: 0,
    map: moon
  });

  // Setup a moon mesh with geometry + material
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  moonMesh.scale.setScalar(0.07)
  moonMesh.position.set(0.7, 0.4, 0)

  // Setup a light
  const light = new THREE.PointLight("white", 2);
  light.position.set(0, 0, 0)
  //bodiesGroup.add(light);
  sunMesh.add(light);

  earthAndSateGroup.add(moonMesh, earthMesh);
  bodiesGroup.add(earthAndSateGroup, marsMesh);
  earthAndSateGroup.position.set(5, 0, 0)
  scene.add(bodiesGroup);
  scene.add(sunMesh);

  scene.add(new THREE.GridHelper(20, 200));
  scene.add(new THREE.PointLightHelper(light, 0.15));

  var axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      const speed = runtimeParams.speed ?? 1;
      earthMesh.rotation.y = time * 0.15 * speed;
      moonMesh.rotation.y = time * 0.075 * speed;
      //bodiesGroup.rotation.y = time * 0.1;

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

const managerPromise = canvasSketch(sketch, settings);
require("../s33d-params").setupParamsListener(managerPromise, runtimeParams);
