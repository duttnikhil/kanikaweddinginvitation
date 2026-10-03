// One-shot fireworks over the closing section (SPEC §7.11).
// Shell model (comet with a spark trail → spherical burst of stars → glitter sparks, with air
// drag, gravity and a burst flash) ported from Caleb Miller's CodePen fireworks, which the owner
// has permission to use (NOTES.md). Only the simulation is kept: no settings UI, no sound, no
// fullscreen, no external libraries or CDN assets, and the palette is the card's gold/blush.
const COLORS = ["#F2D694", "#FBF4E6", "#E9B7C0", "#C9A043", "#9DB7D0"];
const GRAVITY = 0.9; // px/s of downward acceleration
const PI2 = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// Spreads `count` particles evenly over a sphere, ring by ring: the signature burst shape.
function createBurst(count, factory) {
  const R = 0.5 * Math.sqrt(count / Math.PI);
  const C = 2 * R * Math.PI;
  const half = C / 2;
  for (let i = 0; i <= half; i++) {
    const ringSize = Math.cos((i / half) * (Math.PI / 2));
    const perRing = C * ringSize;
    const inc = PI2 / perRing;
    const offset = Math.random() * inc;
    for (let j = 0; j < perRing; j++) {
      factory(inc * j + offset + Math.random() * inc * 0.33, ringSize);
    }
  }
}

export function fireworks(canvas) {
  const g = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const stars = [];   // burst particles, drawn as streaks
  const sparks = [];  // glitter, shorter and lighter
  const flashes = [];
  const shells = [];  // queued launches

  const addStar = (x, y, color, angle, speed, life, offX = 0, offY = 0) =>
    stars.push({ x, y, px: x, py: y, color, life, full: life,
      vx: Math.sin(angle) * speed + offX, vy: Math.cos(angle) * speed + offY,
      heavy: false, glitter: 0, glitterTimer: 0, onDeath: null });

  const addSpark = (x, y, color, angle, speed, life) =>
    sparks.push({ x, y, px: x, py: y, color, life, full: life,
      vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed });

  // A shell: comet to the burst height, then the burst itself.
  function launch(xFrac, heightFrac) {
    const size = rand(1.4, 2.6);
    const spread = 150 + size * 70;
    const color = pick(COLORS);
    const pistil = Math.random() < 0.45 ? pick(COLORS) : null;
    const willow = Math.random() < 0.3;
    const burstY = H * 0.62 - heightFrac * (H * 0.5);
    const x = 40 + xFrac * (W - 80);
    const distance = H - burstY;
    const v = Math.pow(distance * 0.04, 0.64);
    const comet = { x, y: H, px: x, py: H, color: "#FBF4E6", vx: 0, vy: -v,
      life: v * 400, full: v * 400, heavy: true, glitter: 70, glitterTimer: 0,
      onDeath: (s) => burst(s.x, s.y, { spread, color, pistil, willow, size }) };
    stars.push(comet);
  }

  function burst(x, y, { spread, color, pistil, willow, size }) {
    const speed = spread / 96;
    const life = (willow ? 2200 : 900) + size * 200;
    const count = Math.max(24, ((spread / 54) ** 2) * (willow ? 0.5 : 0.9));
    createBurst(count, (angle, mult) => {
      addStar(x, y, color, angle, mult * speed, life + Math.random() * life * 0.2, 0, -spread / 1800);
      const s = stars[stars.length - 1];
      if (willow) { s.glitter = 120; s.glitterColor = "#F2D694"; }
      else if (Math.random() < 0.4) { s.glitter = 320; s.glitterColor = "#FBF4E6"; }
    });
    // Pistil: a smaller, denser burst of a second colour inside the first.
    if (pistil) {
      createBurst(count * 0.4, (angle, mult) =>
        addStar(x, y, pistil, angle, mult * speed * 0.5, life * 0.6));
    }
    flashes.push({ x, y, r: spread / 4 });
  }

  // Launch order: one opener, then pairs, finishing with a wide one.
  [[0.5, 0.9], [0.24, 0.55], [0.78, 0.6], [0.4, 0.75], [0.66, 0.8], [0.5, 1]]
    .forEach(([x, h], i) => shells.push({ at: i * 620 + (i ? rand(-120, 120) : 0), x, h }));

  let t0 = 0;
  let last = 0;
  return new Promise((resolve) => {
    const frame = (now) => {
      if (!t0) { t0 = now; last = now; }
      const dt = Math.min(34, now - last); // clamp after a background tab pause
      last = now;
      const t = now - t0;
      const lag = dt / 16.67;
      const gAcc = (dt / 1000) * GRAVITY;

      while (shells.length && shells[0].at <= t) {
        const s = shells.shift();
        launch(s.x, s.h);
      }

      const starDrag = 1 - (1 - 0.98) * lag;
      const heavyDrag = 1 - (1 - 0.992) * lag;
      const sparkDrag = 1 - (1 - 0.9) * lag;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.life -= dt;
        if (s.life <= 0) {
          s.onDeath?.(s);
          stars.splice(i, 1);
          continue;
        }
        s.px = s.x; s.py = s.y;
        s.x += s.vx * lag; s.y += s.vy * lag;
        const drag = s.heavy ? heavyDrag : starDrag;
        s.vx *= drag; s.vy *= drag;
        s.vy += gAcc;
        if (s.glitter) {
          s.glitterTimer -= dt;
          const burnRate = Math.sqrt(s.life / s.full);
          while (s.glitterTimer < 0) {
            s.glitterTimer += s.glitter * 0.75 + s.glitter * (1 - burnRate) * 4;
            addSpark(s.x, s.y, s.glitterColor || s.color, Math.random() * PI2,
              Math.random() * 0.4 * burnRate, 300 + Math.random() * 500);
          }
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.px = s.x; s.py = s.y;
        s.x += s.vx * lag; s.y += s.vy * lag;
        s.vx *= sparkDrag; s.vy *= sparkDrag;
        s.vy += gAcc;
      }

      // Trails: fade what is already on the canvas instead of clearing it.
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = `rgba(0,0,0,${0.11 * lag})`;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      while (flashes.length) {
        const f = flashes.pop();
        const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        grad.addColorStop(0.02, "rgba(255,255,255,0.9)");
        grad.addColorStop(0.3, "rgba(255,210,130,0.12)");
        grad.addColorStop(1, "rgba(255,190,110,0)");
        g.fillStyle = grad;
        g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      }
      g.lineCap = "round";
      g.lineWidth = 2.6;
      for (const s of stars) {
        g.strokeStyle = s.color;
        g.globalAlpha = Math.min(1, s.life / 400);
        g.beginPath();
        g.moveTo(s.px, s.py);
        g.lineTo(s.x, s.y);
        g.stroke();
      }
      g.lineWidth = 1.2;
      for (const s of sparks) {
        g.strokeStyle = s.color;
        g.globalAlpha = Math.min(1, s.life / 300);
        g.beginPath();
        g.moveTo(s.px, s.py);
        g.lineTo(s.x, s.y);
        g.stroke();
      }
      g.globalAlpha = 1;

      if (shells.length || stars.length || sparks.length) requestAnimationFrame(frame);
      else {
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, W, H);
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
