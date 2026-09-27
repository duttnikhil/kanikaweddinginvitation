// Flipbook over the hero's card artwork: the owner's animation frames (top band: bells and
// leaves swinging; bottom band: the procession arriving), stacked into two sprites by
// scripts/optimize-images.mjs. The static frame under it is the last frame.
import { h } from "../core/dom.js";
import { art } from "../core/assets.js";
import { gsap, prefersReduced } from "../core/motion.js";

const FRAME_S = 0.14; // ≈ 7 fps, the pace of the original animation

let bands = [];
let frames = 0;
let played = false;

export function mountFrameAnim(hero) {
  const a = art("hero-frame-anim");
  if (!a || prefersReduced()) return;
  frames = a.frames;
  bands = [["top", a.top], ["bottom", a.h - a.bottom]].map(([name, height]) => {
    const img = h("img", { src: `/img/hero-frame-${name}.webp`, alt: "", decoding: "async" });
    const box = h("div", { class: `hero-anim hero-anim--${name}`, "aria-hidden": "true", style: `height: ${((height / a.w) * 100).toFixed(2)}cqw` },
      h("picture", {}, h("source", { type: "image/avif", srcset: `/img/hero-frame-${name}.avif` }), img));
    hero.prepend(box);
    return { box, img };
  });
}

// Plays on a loop while the hero is on screen: frames 1→10, hold, then the overlay fades out
// (invisible: the static card underneath is frame 10), jumps back to frame 1 and fades in again,
// so the procession softly clears and walks in once more. Only transform/opacity animate.
const HOLD_S = 3;
const FADE_S = 0.6;

export function playFrameAnim() {
  if (played || !bands.length) return;
  played = true;
  const imgs = bands.map((b) => b.img);
  const boxes = bands.map((b) => b.box);
  const ready = () => bands.every((b) => b.img.complete && b.img.naturalHeight);
  const tl = gsap.timeline({ repeat: -1, paused: true })
    .to(imgs, { yPercent: (-100 * (frames - 1)) / frames, ease: `steps(${frames - 1})`, duration: (frames - 1) * FRAME_S })
    .to(boxes, { opacity: 0, duration: FADE_S, ease: "power1.inOut" }, `+=${HOLD_S}`)
    .set(imgs, { yPercent: 0 })
    .to(boxes, { opacity: 1, duration: FADE_S, ease: "power1.inOut" });
  // Sprites still loading: start as soon as they arrive (the static card shows meanwhile).
  const start = () => {
    if (!ready()) return;
    const io = new IntersectionObserver(([e]) => tl.paused(!e.isIntersecting));
    io.observe(bands[0].box.parentElement);
  };
  if (ready()) start();
  else bands.forEach((b) => b.img.addEventListener("load", start, { once: true }));
}
