const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
playground.appendChild(canvas);

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(playground.clientWidth * dpr);
  canvas.height = Math.floor(playground.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

playground.addEventListener("resize", resize);
resize();

const trails = Array.from({ length: 14 }, (_, i) => ({
  radius: 28 + i * 14,
  speed: 0.35 + i * 0.075,
  phase: Math.random() * Math.PI * 2,
  hue: 300 + i * 4.6,
  amp: 20 + i * 5,
}));

let t = 0;
let raf = 0;
const draw = () => {
  raf = requestAnimationFrame(draw);
  t += 0.012;

  const w = playground.clientWidth;
  const h = playground.clientHeight;
  const cx = w * 0.5;
  const cy = h * 0.5;

  ctx.fillStyle = "rgba(9, 6, 12, 0.14)";
  ctx.fillRect(0, 0, w, h);

  for (const trail of trails) {
    const a = t * trail.speed + trail.phase;
    const x = cx + Math.cos(a) * trail.radius + Math.sin(a * 2.2) * trail.amp;
    const y =
      cy + Math.sin(a * 1.3) * trail.radius + Math.cos(a * 1.7) * trail.amp;

    const glow = 1.6 + (Math.sin(a * 3.0) * 0.5 + 0.5) * 2.6;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${trail.hue}, 95%, 75%, 0.2)`;
    ctx.arc(x, y, glow * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `hsla(${trail.hue}, 100%, 82%, 0.85)`;
    ctx.arc(x, y, glow, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 214, 245, 0.18)";
  ctx.lineWidth = 1;
  ctx.arc(cx, cy, 22 + Math.sin(t * 2.6) * 4, 0, Math.PI * 2);
  ctx.stroke();
};

if (import.meta.main) {
  draw();
}

playground.cleanup(() => {
  cancelAnimationFrame(raf);
  playground.removeEventListener("resize", resize);
  canvas.remove();
});
