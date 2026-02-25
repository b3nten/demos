const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
playground.appendChild(canvas);

const mouse = { x: 0, y: 0, active: false };
const particles = [];
const count = 650;

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(playground.clientWidth * dpr);
  canvas.height = Math.floor(playground.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const spawn = () => {
  particles.length = 0;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * playground.clientWidth,
      y: Math.random() * playground.clientHeight,
      vx: 0,
      vy: 0,
      hue: 310 + Math.random() * 40,
      life: Math.random() * 0.8 + 0.2,
    });
  }
};

const onPointerMove = (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  mouse.active = true;
};

const onPointerLeave = () => {
  mouse.active = false;
};

playground.addEventListener("resize", resize);
playground.addEventListener("pointermove", onPointerMove);
playground.addEventListener("pointerleave", onPointerLeave);

resize();
spawn();

let raf = 0;
let time = 0;
const loop = () => {
  raf = requestAnimationFrame(loop);
  time += 0.008;

  ctx.fillStyle = "rgba(10, 7, 14, 0.18)";
  ctx.fillRect(0, 0, playground.clientWidth, playground.clientHeight);

  const cx = playground.clientWidth * 0.5;
  const cy = playground.clientHeight * 0.5;

  for (const p of particles) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.hypot(dx, dy) + 0.0001;

    const swirl = 0.07;
    p.vx += (-dy / dist) * swirl;
    p.vy += (dx / dist) * swirl;

    const pull = 0.003;
    p.vx += (-dx / dist) * pull;
    p.vy += (-dy / dist) * pull;

    if (mouse.active) {
      const mx = mouse.x - p.x;
      const my = mouse.y - p.y;
      const md = Math.hypot(mx, my) + 0.01;
      p.vx += (mx / md) * 0.03;
      p.vy += (my / md) * 0.03;
    }

    p.vx *= 0.94;
    p.vy *= 0.94;

    p.x += p.vx;
    p.y += p.vy;

    if (
      p.x < -10 ||
      p.x > playground.clientWidth + 10 ||
      p.y < -10 ||
      p.y > playground.clientHeight + 10
    ) {
      p.x = Math.random() * playground.clientWidth;
      p.y = Math.random() * playground.clientHeight;
      p.vx = 0;
      p.vy = 0;
    }

    const pulse = 0.45 + 0.55 * Math.sin(time * 5 + p.life * 10);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${0.14 + pulse * 0.36})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 + pulse * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
};

if (import.meta.main) {
  loop();
}

playground.cleanup(() => {
  cancelAnimationFrame(raf);
  playground.removeEventListener("resize", resize);
  playground.removeEventListener("pointermove", onPointerMove);
  playground.removeEventListener("pointerleave", onPointerLeave);
  canvas.remove();
});
