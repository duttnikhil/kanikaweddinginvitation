// Growing garden under Save the Date: curved stems draw themselves, then buds and blossoms open
// and the whole patch sways. Inspired by the CSS garden the owner shared, rebuilt as one SVG so
// the stems can curve and be stroke-drawn. Only transform/opacity/stroke-dash animate, and it
// runs only while on screen (CLAUDE.md §5, §6).
import { h } from "../core/dom.js";
import { rng } from "./mandala.js";

const W = 390;
const H = 176;
const GROUND = 172;

const STEM = "#8A9A78";
const PETALS = ["#E9CFC4", "#E9B7C0", "#F3DCD2", "#DCA9B6"];

// One blossom: petals around the tip, gold centre.
function bloom(x, y, r, color, tilt, n = 6) {
  const petals = Array.from({ length: n }, (_, i) =>
    `<ellipse cx="0" cy="${-r * 0.95}" rx="${(r * 0.46).toFixed(1)}" ry="${r.toFixed(1)}" transform="rotate(${(i * 360) / n})"/>`).join("");
  return `<g class="g-bloom" style="transform-origin:${x}px ${y}px">
<g transform="translate(${x} ${y}) rotate(${tilt})" fill="${color}" opacity=".95">${petals}</g>
<circle cx="${x}" cy="${y}" r="${(r * 0.42).toFixed(1)}" fill="#D9B45E"/></g>`;
}

// A leaf hanging off the stem at (x, y).
const leaf = (x, y, len, dir) =>
  `<path class="g-leaf" style="transform-origin:${x}px ${y}px" d="M${x} ${y}c${dir * len * 0.5} ${-len * 0.45} ${dir * len} ${-len * 0.2} ${dir * len} ${len * 0.12}c${-dir * len * 0.55} ${len * 0.3} ${-dir * len} ${len * 0.05} ${-dir * len} ${-len * 0.12}Z" fill="${STEM}" opacity=".8"/>`;

function plant(r, x, i) {
  const h0 = 52 + r() * 92;             // stem height
  const bend = (r() - 0.5) * 52;        // how far the tip leans
  const tipX = x + bend;
  const tipY = GROUND - h0;
  const stem = `<path class="g-stem" pathLength="1" d="M${x} ${GROUND}C${x + bend * 0.1} ${GROUND - h0 * 0.45} ${tipX - bend * 0.35} ${GROUND - h0 * 0.7} ${tipX} ${tipY}" fill="none" stroke="${STEM}" stroke-width="2.2" stroke-linecap="round"/>`;
  const leaves = [leaf(x + bend * 0.12, GROUND - h0 * 0.42, 15 + r() * 8, r() < 0.5 ? 1 : -1)];
  if (h0 > 90) leaves.push(leaf(x + bend * 0.3, GROUND - h0 * 0.64, 13 + r() * 6, r() < 0.5 ? -1 : 1));
  // Short stems carry a bud instead of an open flower.
  const color = PETALS[(r() * PETALS.length) | 0];
  const head = h0 < 70
    ? `<g class="g-bloom" style="transform-origin:${tipX}px ${tipY}px"><ellipse cx="${tipX}" cy="${tipY}" rx="4.5" ry="7.5" fill="${color}" transform="rotate(${bend * 0.3} ${tipX} ${tipY})"/></g>`
    : bloom(tipX, tipY, 7 + r() * 4, color, r() * 60, r() < 0.4 ? 5 : 6);
  return `<g class="g-plant" style="--i:${i}">${stem}${leaves.join("")}${head}</g>`;
}

// Thin blades behind the flowers so the patch does not look like three sticks in a row.
const blade = (r, x, i) => {
  const h0 = 26 + r() * 46;
  const bend = (r() - 0.5) * 30;
  return `<path class="g-blade" style="--i:${i}" pathLength="1" d="M${x} ${GROUND}q${bend * 0.4} ${-h0 * 0.6} ${bend} ${-h0}" fill="none" stroke="${STEM}" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>`;
};

function gardenSvg() {
  const r = rng(24); // fixed seed: the same garden every visit
  const blades = Array.from({ length: 14 }, (_, i) => blade(r, 8 + (i * (W - 16)) / 13 + (r() - 0.5) * 12, i)).join("");
  const plants = Array.from({ length: 9 }, (_, i) => plant(r, 18 + (i * (W - 36)) / 8 + (r() - 0.5) * 14, i)).join("");
  return `<svg class="garden-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${blades}${plants}</svg>`;
}

// Returns the garden element; it grows the first time it scrolls into view and rests off screen.
export function garden() {
  const el = h("div", { class: "garden", "aria-hidden": "true", html: gardenSvg() });
  new IntersectionObserver((entries) => {
    for (const e of entries) el.classList.toggle("is-live", e.isIntersecting);
  }, { threshold: 0.1 }).observe(el);
  return el;
}
