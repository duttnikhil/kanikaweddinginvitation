// Seeded 16-fold radial mandala (SPEC §9.5). Stroke-only, gold gradient, drawable with DrawSVG.

let uid = 0;
export const gid = (p = "g") => `${p}${++uid}`;

export function goldGradient(id, dir = "h") {
  const [x2, y2] = dir === "h" ? ["1", "0"] : ["0", "1"];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="#8A6A1F"/><stop offset=".5" stop-color="#E9D29A"/><stop offset="1" stop-color="#B08A2E"/></linearGradient>`;
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = 200; // centre of the 400x400 viewBox
const f = (n) => Math.round(n * 10) / 10;

// A petal pointing up from radius r0 to r1 with half-width w (in the unrotated frame).
function petal(r0, r1, w) {
  const mid = (r0 + r1) / 2;
  return `M${C} ${f(C - r0)} Q${f(C + w)} ${f(C - mid)} ${C} ${f(C - r1)} Q${f(C - w)} ${f(C - mid)} ${C} ${f(C - r0)}Z`;
}

function ring(n, draw, offset = 0) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += `<g transform="rotate(${f((360 / n) * i + offset)} ${C} ${C})">${draw(i)}</g>`;
  }
  return out;
}

// options.stroke: CSS color or "gold" (gradient). options.center: optional inner markup.
export function mandala(seed = 7, { stroke = "gold", width = 1.4, center = "" } = {}) {
  const r = rng(seed);
  const id = gid("mg");
  const s = stroke === "gold" ? `url(#${id})` : stroke;
  const r1 = 34 + r() * 10;
  const r2 = r1 + 36 + r() * 14;
  const r3 = r2 + 34 + r() * 16;
  const r4 = Math.min(r3 + 36 + r() * 10, 188);
  let body = "";
  body += `<path d="M${C} ${f(C - r1 + 12)}a${f(r1 - 12)} ${f(r1 - 12)} 0 1 0 .01 0Z"/>`;
  body += ring(16, () => `<path d="${petal(10, r1, 5 + r() * 3)}"/>`);
  body += `<path d="M${C} ${f(C - r1)}a${f(r1)} ${f(r1)} 0 1 0 .01 0Z"/>`;
  body += ring(16, () => `<path d="${petal(r1 + 2, r2, 11 + r() * 4)}"/>`, 11.25);
  body += ring(16, () => `<path d="${petal(r1 + 10, r2 - 12, 4)}"/>`, 11.25);
  body += ring(32, () => `<circle cx="${C}" cy="${f(C - r2 - 6)}" r="1.8"/>`);
  body += `<path d="M${C} ${f(C - r2 - 12)}a${f(r2 + 12)} ${f(r2 + 12)} 0 1 0 .01 0Z"/>`;
  const scW = (Math.PI * (r3 - 4)) / 16;
  body += ring(16, () =>
    `<path d="M${f(C - scW)} ${f(C - r2 - 14)} Q${C} ${f(C - r3 - 10)} ${f(C + scW)} ${f(C - r2 - 14)}"/>`);
  body += ring(16, () => `<path d="${petal(r3 - 4, r4, 8 + r() * 4)}"/>`, 11.25);
  body += ring(16, () => `<circle cx="${C}" cy="${f(C - r4 - 5)}" r="2.4"/>`, 11.25);
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="mandala">
<defs>${goldGradient(id, "v")}</defs>
<g class="draw" fill="none" stroke="${s}" stroke-width="${width}" stroke-linecap="round">${body}</g>${center}</svg>`;
}
