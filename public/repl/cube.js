import * as THREE from "three";

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  playground.clientWidth / playground.clientHeight,
  0.1,
  1000,
);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(playground.clientWidth, playground.clientHeight);
playground.appendChild(renderer.domElement);

// Create cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({
  color: 0x00ff88,
  shininess: 100,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle window resize
playground.addEventListener("resize", () => {
  camera.aspect = playground.clientWidth / playground.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(playground.clientWidth, playground.clientHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

if (import.meta.main) {
  animate();
}
