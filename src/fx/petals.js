// Falling marigold/rose petals on one fixed canvas (SPEC §7.5).
// start() = continuous shower, stop() = stop spawning, burst(x, y, n) = radial burst.
// Deviation: the canvas sits above the content (pointer-events: none) because every section
// has an opaque paper background, so petals "behind content" would be invisible.
import { lowEndHint, measureFps } from "../core/device.js";
import { ownerSvg } from "../core/assets.js";
import { prefersReduced } from "../core/motion.js";

const SPRITE = 48;
const COLORS = [["#F6D5DA", "#E3A5AE"], ["#FFFFFF", "#F2D0D5"], ["#F3EAD6", "#D9BE8A"], ["#E8B4BC", "#C98B96"], ["#FFFFFF", "#E3EAF5"]];
const OWNER = ["petal-marigold-1", "petal-marigold-2", "petal-marigold-3", "petal-rose-1", "petal-rose-2"];

let canvas, g, sprites = [], petals = [], sparks = [];
let target = lowEndHint ? 16 : 36;
let spawning = false, raf = 0, last = 0, dpr = 1, W = 0, H = 0, probed = false;

function makeSprites() {
  sprites = COLORS.map(([a, b], i) => {
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE;
    const x = c.getContext("2d");
    const owner = ownerSvg(OWNER[i]);
    if (owner) {
      const img = new Image();
      img.onload = () => { x.clearRect(0, 0, SPRITE, SPRITE); x.drawImage(img, 0, 0, SPRITE, SPRITE); };
      img.src = `data:image/svg+xml,${encodeURIComponent(owner)}`;
    }
    // Procedural petal: teardrop with a darker base (also the placeholder while an owner SVG loads)
    const grad = x.createLinearGradient(0, 4, 0, SPRITE - 4);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    x.fillStyle = grad;
    x.beginPath();
    x.moveTo(SPRITE / 2, 4);
    x.bezierCurveTo(SPRITE - 6, SPRITE * 0.35, SPRITE - 10, SPRITE - 6, SPRITE / 2, SPRITE - 4);
    x.bezierCurveTo(10, SPRITE - 6, 6, SPRITE * 0.35, SPRITE / 2, 4);
    x.fill();
    x.strokeStyle = "rgba(0,0,0,.12)";
    x.beginPath();
    x.moveTo(SPRITE / 2, 10);
    x.lineTo(SPRITE / 2, SPRITE - 8);
    x.stroke();
    return c;
  });
}

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = innerWidth;
  H = innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const rand = (a, b) => a + Math.random() * (b - a);
function newPetal(top = false) {
  return {
    x: rand(0, W), y: top ? rand(-H * 0.1, -20) : rand(-H, 0),
    vy: rand(30, 70), amp: rand(15, 40), f: rand(0.6, 1.4), ph: rand(0, 6.28),
    rot: rand(0, 360), vr: rand(20, 90) * (Math.random() < 0.5 ? -1 : 1), flip: rand(1, 3),
    s: rand(12, 20), sp: sprites[(Math.random() * sprites.length) | 0], t: 0,
  };
}

function frame(now) {
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  g.clearRect(0, 0, W, H);
  if (spawning && petals.length < target) petals.push(newPetal(true));
  petals = petals.filter((p) => {
    p.t += dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    const x = p.x + Math.sin(p.t * p.f + p.ph) * p.amp;
    g.save();
    g.translate(x, p.y);
    g.rotate((p.rot * Math.PI) / 180);
    g.scale(Math.cos(p.t * p.flip), 1); // 3D flip illusion
    g.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s);
    g.restore();
    return p.y < H + 30;
  });
  sparks = sparks.filter((p) => {
    p.t += dt;
    p.vy += 260 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    const a = Math.max(0, 1 - p.t / 1.6);
    g.globalAlpha = a;
    g.save();
    g.translate(p.x, p.y);
    g.rotate((p.rot * Math.PI) / 180);
    g.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s);
    g.restore();
    g.globalAlpha = 1;
    return a > 0;
  });
  raf = petals.length || sparks.length || spawning ? requestAnimationFrame(frame) : 0;
}

function run() {
  if (!raf && !document.hidden) {
    last = 0;
    raf = requestAnimationFrame(frame);
  }
}

function init() {
  if (canvas) return true;
  if (prefersReduced()) return false;
  canvas = document.createElement("canvas");
  canvas.className = "petals";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  g = canvas.getContext("2d");
  makeSprites();
  resize();
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else run();
  });
  return true;
}

export function start() {
  if (!init()) return;
  spawning = true;
  run();
  if (!probed) {
    probed = true;
    measureFps(2000).then((fps) => { if (fps < 45) target = Math.ceil(target / 2); });
  }
}

export function stop() {
  spawning = false;
}

export function burst(x, y, n = 24) {
  if (!init()) return staticFlower(x, y);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
    const v = rand(160, 320);
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, rot: rand(0, 360), vr: rand(-200, 200),
      s: rand(12, 20), sp: sprites[i % sprites.length], t: 0 });
  }
  run();
}

// Reduced motion: a still flower shown briefly instead of a burst.
function staticFlower(x, y) {
  const el = document.createElement("div");
  el.className = "static-flower";
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.textContent = "✿";
  document.body.append(el);
  setTimeout(() => el.remove(), 1500);
}
