// One-shot flipbook over the hero's card artwork: the owner's animation frames (top band: bells and
// leaves swinging; bottom band: the procession arriving), stacked into two sprites by
// scripts/optimize-images.mjs. The static frame under it is the last frame, so removing the overlay
// afterwards is invisible. If the sprites haven't loaded by then, nothing plays (static card).
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

export function playFrameAnim() {
  if (played || !bands.length) return;
  played = true;
  const drop = () => bands.forEach((b) => b.box.remove());
  if (!bands.every((b) => b.img.complete && b.img.naturalHeight)) return drop();
  gsap.to(bands.map((b) => b.img), {
    yPercent: (-100 * (frames - 1)) / frames,
    ease: `steps(${frames - 1})`,
    duration: (frames - 1) * FRAME_S,
    onComplete: drop,
  });
}
