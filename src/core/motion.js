// GSAP + plugins + Lenis (SPEC §7.1). Scenes register animation builders with scene();
// they all live inside one gsap.matchMedia so a language switch can rebuild them cleanly.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
export { gsap, ScrollTrigger, SplitText };

export const dur = { xs: 0.25, s: 0.45, m: 0.8, l: 1.2, xl: 1.6 };
export const ease = { enter: "power3.out", move: "power2.inOut", door: "expo.inOut", float: "sine.inOut" };
export const stagger = { chars: 0.035, items: 0.08 };
export const CONDITIONS = { full: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" };
export const prefersReduced = () => matchMedia(CONDITIONS.reduced).matches;

// Smooth scroll only for full motion; reduced motion keeps native scrolling.
export const lenis = prefersReduced() ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // started after the gate opens
}

// Split text for reveals. Devanagari is split by words: splitting conjuncts/matras into
// separate spans breaks shaping on older Android WebViews.
export function split(el, type = "chars") {
  const hi = el.closest("[lang]")?.lang === "hi" || document.documentElement.lang === "hi";
  // Chars are wrapped in words too so a line never breaks inside a word.
  const t = type === "chars" ? (hi ? "words" : "words,chars") : type;
  return SplitText.create(el, { type: t, aria: "auto", ...(t === "lines" ? { linesClass: "split-line" } : {}) });
}

const builders = [];
let mm = null;

export function scene(fn) {
  builders.push(fn);
}

export function build() {
  mm = gsap.matchMedia();
  mm.add(CONDITIONS, (c) => {
    for (const fn of builders) {
      try {
        fn(c.conditions);
      } catch (err) {
        console.error("[motion]", err);
      }
    }
  });
  ScrollTrigger.refresh();
}

export function rebuild() {
  mm?.revert();
  build();
}

// Refresh trigger positions once images in a container load (layout shifts).
export function refreshOnImages(root) {
  for (const img of root.querySelectorAll("img")) {
    if (!img.complete) img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
}
