// One-shot fireworks on a canvas (SPEC §7.11): 5 rockets over 3 s, gold/sindoor/ivory sparks.
const COLORS = ["#C9A043", "#E9D29A", "#F2B705", "#FBF4E6", "#E4473F"];

export function fireworks(canvas) {
  const g = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const rand = (a, b) => a + Math.random() * (b - a);
  const rockets = Array.from({ length: 5 }, (_, i) => ({
    at: i * 0.6, x: rand(W * 0.15, W * 0.85), y: H, ty: rand(H * 0.12, H * 0.4), done: false,
  }));
  const sparks = [];
  let t0 = 0;
  return new Promise((resolve) => {
    const frame = (now) => {
      t0 ||= now;
      const t = (now - t0) / 1000;
      g.clearRect(0, 0, W, H);
      for (const r of rockets) {
        if (r.done || t < r.at) continue;
        const p = Math.min(1, (t - r.at) / 0.8);
        const y = H - (H - r.ty) * (1 - (1 - p) ** 3);
        g.fillStyle = "#E9D29A";
        g.beginPath();
        g.arc(r.x, y, 2, 0, Math.PI * 2);
        g.fill();
        if (p >= 1) {
          r.done = true;
          const color = COLORS[(Math.random() * COLORS.length) | 0];
          for (let i = 0; i < 44; i++) {
            const a = (i / 44) * Math.PI * 2;
            const v = rand(60, 150);
            sparks.push({ x: r.x, y: r.ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, born: t, color });
          }
        }
      }
      let alive = false;
      for (const s of sparks) {
        const age = t - s.born;
        if (age > 1.4) continue;
        alive = true;
        s.vy += 120 / 60;
        s.x += s.vx / 60;
        s.y += s.vy / 60;
        g.globalAlpha = 1 - age / 1.4;
        g.fillStyle = s.color;
        g.fillRect(s.x, s.y, 2.2, 2.2);
      }
      g.globalAlpha = 1;
      if (alive || rockets.some((r) => !r.done)) requestAnimationFrame(frame);
      else {
        g.clearRect(0, 0, W, H);
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
