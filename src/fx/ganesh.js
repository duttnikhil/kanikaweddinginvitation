// Ganesh line art for the hero (SPEC §9.5): stroke-only so DrawSVG can draw it on gate open.
// Drawn here by hand — no traced or downloaded artwork. If the owner supplies
// assets/svg/ganesh-line.svg it wins (core/assets ownerSvg).
import { gid, goldGradient } from "./mandala.js";
import { gsap, prefersReduced } from "../core/motion.js";
import { drawTargets } from "./draw.js";

export function ganeshLine() {
  const g = gid("gn");
  return `<svg class="ganesh-line" viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g, "v")}</defs>
<g fill="none" stroke="url(#${g})" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
<path d="M100 20c-4 4-4 9 0 13 4-4 4-9 0-13Z"/><path d="M100 33v7"/>
<path d="M76 58c-1-13 9-24 24-18 15-6 25 5 24 18"/><path d="M72 58h56"/>
<path d="M78 60c-10 11-13 26-8 40 5 15 16 24 30 24s25-9 30-24c5-14 2-29-8-40"/>
<path d="M78 64c-16-8-33-4-38 10-5 15 4 33 19 40 9 4 17 2 21-4"/>
<path d="M122 64c16-8 33-4 38 10 5 15-4 33-19 40-9 4-17 2-21-4"/>
<path d="M72 78c-10 1-16 9-14 18 2 8 8 14 15 16"/>
<path d="M128 78c10 1 16 9 14 18-2 8-8 14-15 16"/>
<path d="M100 66v16"/><path d="M93 71l-3 9"/><path d="M107 71l3 9"/>
<path d="M84 92c4-4 11-4 14 1"/><path d="M116 92c-4-4-11-4-14 1"/>
<path d="M100 96c1 15-1 28-8 37-7 9-18 11-23 4-4-6 0-13 7-12"/>
<path d="M97 112c-3 2-6 3-9 4"/><path d="M93 126c-3 2-6 4-9 5"/>
<path d="M88 118c-4 5-6 10-6 15"/><path d="M114 118c3 4 4 8 4 11"/>
<path d="M66 152c9-12 21-18 34-18s25 6 34 18"/>
<path d="M78 154c7 9 37 9 44 0"/>
<path d="M60 170c14 7 66 7 80 0"/>
</g></svg>`;
}

// The outline redraws itself every few seconds while the hero is on screen (owner's request).
// `.is-drawing` hides the fills while the strokes are being drawn (see sections.css).
let loop = null;

export function mountGaneshLoop(box) {
  if (prefersReduced() || !box) return;
  const svgEl = box.querySelector("svg");
  const paths = svgEl ? drawTargets(svgEl) : [];
  if (!paths.length) return;
  loop = gsap.timeline({ repeat: -1, repeatDelay: 3.5, paused: true })
    .call(() => box.classList.add("is-drawing"))
    .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power1.inOut", stagger: { amount: 0.8 } })
    .call(() => box.classList.remove("is-drawing")); // CSS fades the fills in
  new IntersectionObserver(([e]) => loop.paused(!e.isIntersecting)).observe(box);
}

// Called when the gate finishes, so the first draw happens with the card on screen.
export function playGaneshLoop() {
  loop?.play(0);
}
