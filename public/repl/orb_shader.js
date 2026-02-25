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
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2 u_resolution;

    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }

    float map(vec3 p) {
      vec3 q = p;
      q.xy *= mat2(cos(u_time * 0.4), -sin(u_time * 0.4), sin(u_time * 0.4), cos(u_time * 0.4));
      float sphere = sdSphere(q, 0.68 + 0.08 * sin(u_time + q.z * 3.0));
      float ripple = sin(q.x * 8.0 + u_time * 2.0) * sin(q.y * 8.0 - u_time * 1.8) * 0.03;
      return sphere + ripple;
    }

    vec3 getNormal(vec3 p) {
      vec2 e = vec2(0.001, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }

    float trace(vec3 ro, vec3 rd) {
      float t = 0.0;
      for (int i = 0; i < 96; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) return t;
        if (t > 6.0) break;
        t += d * 0.8;
      }
      return -1.0;
    }

    void main() {
      vec2 uv = (vUv * 2.0 - 1.0);
      uv.x *= u_resolution.x / u_resolution.y;

      vec3 ro = vec3(0.0, 0.0, 2.25);
      vec3 rd = normalize(vec3(uv, -1.8));

      float t = trace(ro, rd);
      vec3 color = vec3(0.03, 0.01, 0.05) + 0.04 * vec3(uv.y + 0.5);

      if (t > 0.0) {
        vec3 p = ro + rd * t;
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(-0.4, 0.7, 0.8));
        float diff = max(dot(n, lightDir), 0.0);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
        float rim = smoothstep(0.15, 1.0, fresnel);

        vec3 hot = vec3(1.0, 0.58, 0.78);
        vec3 cool = vec3(0.65, 0.42, 1.0);
        vec3 orb = mix(cool, hot, diff);
        orb += rim * vec3(0.95, 0.76, 1.0) * 0.7;

        color += orb;
        color += 0.1 * vec3(sin((p.x + p.y) * 10.0 + u_time * 3.0));
      }

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

playground.addEventListener("resize", onResize);

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
  mesh.geometry.dispose();
  material.dispose();
  renderer.dispose();
  renderer.domElement.remove();
});
