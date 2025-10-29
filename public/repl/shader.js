import * as THREE from "three";

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(playground.clientWidth, playground.clientHeight);
playground.appendChild(renderer.domElement);

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader - cool animated gradient
const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  void main() {
    vec2 st = vUv;

    // Create animated waves
    float wave1 = sin(st.x * 10.0 + u_time) * 0.5 + 0.5;
    float wave2 = cos(st.y * 10.0 + u_time * 0.7) * 0.5 + 0.5;
    float wave3 = sin((st.x + st.y) * 8.0 - u_time * 1.3) * 0.5 + 0.5;

    // Combine waves for color
    vec3 color1 = vec3(0.2, 0.5, 1.0); // Blue
    vec3 color2 = vec3(1.0, 0.3, 0.6); // Pink
    vec3 color3 = vec3(0.3, 1.0, 0.7); // Cyan

    vec3 finalColor = mix(color1, color2, wave1);
    finalColor = mix(finalColor, color3, wave2 * wave3);

    // Add some contrast
    finalColor = pow(finalColor, vec3(1.2));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Create shader material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    u_time: { value: 0.0 },
    u_resolution: {
      value: new THREE.Vector2(playground.clientWidth, playground.clientHeight),
    },
  },
});

// Create fullscreen quad
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Handle window resize
playground.addEventListener("resize", () => {
  renderer.setSize(playground.clientWidth, playground.clientHeight);
  material.uniforms.u_resolution.value.set(
    playground.clientWidth,
    playground.clientHeight,
  );
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  material.uniforms.u_time.value += 0.01;
  renderer.render(scene, camera);
}

if (import.meta.main) {
  animate();
}
