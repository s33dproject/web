/**
 * A WebGL example of a basic rotating cube with text, using ThreeJS.
 * Uses a 2D canvas as texture for the cube faces.
 *
 * @author Matt DesLauriers (@mattdesl)
 */

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

global.THREE = require('three');

const settings = {
  animate: true,
  context: 'webgl2',
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a 2D canvas for the text texture (simpler than nested canvas-sketch)
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 512;
  textCanvas.height = 512;
  const textCtx = textCanvas.getContext('2d');

  const drawText = (text) => {
    textCtx.clearRect(0, 0, 512, 512);
    textCtx.fillStyle = 'black';
    textCtx.fillRect(0, 0, 512, 512);
    textCtx.fillStyle = 'white';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.font = '80px monospace';
    textCtx.fillText(text || '', 256, 256);
  };

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // Black background
  renderer.setClearColor('hsl(0, 0%, 20%)', 1);

  // create a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  // setup your scene
  const scene = new THREE.Scene();

  const map = new THREE.CanvasTexture(textCanvas);
  map.minFilter = THREE.LinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.generateMipmaps = false;

  // A cube with basic material
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      map
    })
  );
  scene.add(mesh);

  // Set some random characters
  const remix = () => {
    const maxChars = 6;
    const chars = Array.from(new Array(maxChars)).map(() => {
      return String.fromCharCode(random.rangeFloor(33, 127));
    }).join('');
    drawText(chars);
  };

  remix();
  const remixInterval = setInterval(remix, 100);

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // And render events here
    render ({ time, deltaTime }) {
      mesh.rotation.y += deltaTime * (5 * Math.PI / 180);
      camera.position.x = Math.sin(time * 0.3) * 4;
      camera.position.z = Math.cos(time * 0.3) * 4;
      camera.position.y = 2;
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      map.needsUpdate = true;
      renderer.render(scene, camera);
    },
    unload () {
      clearInterval(remixInterval);
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
