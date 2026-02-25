import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(playground.clientWidth, playground.clientHeight);
playground.appendChild(renderer.domElement);

const uniforms = {
  u_time: { value: 0 },
  u_resolution: {
    value: new THREE.Vector2(playground.clientWidth, playground.clientHeight),
  },
  u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    float grid(vec2 p, float scale) {
      p *= scale;
      vec2 cell = abs(fract(p - 0.5) - 0.5) / fwidth(p);
      float line = min(cell.x, cell.y);
      return 1.0 - min(line, 1.0);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      centered.x *= u_resolution.x / u_resolution.y;

      float pulse = sin(u_time * 0.7 + length(centered) * 10.0) * 0.5 + 0.5;
      float twist = atan(centered.y, centered.x) + u_time * 0.2 + u_mouse.x * 2.0;
      float rings = sin(length(centered) * 18.0 - u_time * 1.8 + u_mouse.y * 6.0) * 0.5 + 0.5;

      vec2 warped = centered;
      warped += 0.08 * vec2(cos(twist * 4.0), sin(twist * 4.0));

      float g1 = grid(warped + pulse * 0.1, 10.0 + pulse * 18.0);
      float g2 = grid(warped * 1.3 - rings * 0.2, 18.0);
      float glow = smoothstep(0.8, 0.0, length(centered - (u_mouse - 0.5) * 0.55));

      vec3 base = vec3(0.06, 0.02, 0.08);
      vec3 pink = vec3(1.0, 0.46, 0.78);
      vec3 violet = vec3(0.74, 0.44, 1.0);

      vec3 color = base;
      color += pink * g1 * 0.75;
      color += violet * g2 * 0.55;
      color += mix(pink, violet, rings) * glow * 0.8;
      color += 0.15 * vec3(pulse * rings);

      color = pow(color, vec3(0.9));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

const onResize = () => {
  renderer.setSize(playground.clientWidth, playground.clientHeight);
  uniforms.u_resolution.value.set(
    playground.clientWidth,
    playground.clientHeight,
  );
};

const onPointerMove = (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = 1 - (event.clientY - rect.top) / rect.height;
  uniforms.u_mouse.value.set(x, y);
};

playground.addEventListener("resize", onResize);
playground.addEventListener("pointermove", onPointerMove);

let frame = 0;
let raf = 0;
const animate = () => {
  raf = requestAnimationFrame(animate);
  frame += 1;
  uniforms.u_time.value = frame * 0.016;
  renderer.render(scene, camera);
};

if (import.meta.main) {
  animate();
}

playground.cleanup(() => {
  cancelAnimationFrame(raf);
  playground.removeEventListener("resize", onResize);
  playground.removeEventListener("pointermove", onPointerMove);
  mesh.geometry.dispose();
  material.dispose();
  renderer.dispose();
  renderer.domElement.remove();
});
