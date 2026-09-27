// Scratch card: gold foil on a canvas over `target`; scratching erases it, ~35% cleared reveals.
// The target stays in the DOM underneath (screen readers and no-JS always get the text).
// Reduced motion: no foil, the target is shown as is. Keyboard: Enter/Space on the foil reveals.
import { tr, onLang } from "../core/i18n.js";
import { gsap, prefersReduced } from "../core/motion.js";
import * as petals from "./petals.js";

const REVEAL_AT = 0.35;
const BRUSH = 34;

export function scratchCard(target, hint) {
  const wrap = document.createElement("div");
  wrap.className = "scratch";
  wrap.append(target);
  if (prefersReduced() || !hint) return wrap;

  const canvas = document.createElement("canvas");
  canvas.className = "scratch-foil";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "button");
  wrap.append(canvas);
  const g = canvas.getContext("2d", { willReadFrequently: true });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let started = false;
  let done = false;

  function paint() {
    if (started || done) return;
    const w = wrap.clientWidth;
    const hgt = wrap.clientHeight;
    if (!w || !hgt) return;
    canvas.width = w * dpr;
    canvas.height = hgt * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = "source-over";
    const foil = g.createLinearGradient(0, 0, w, hgt);
    [["#E8D6A8", 0], ["#C9A45A", 0.3], ["#F1DFAE", 0.5], ["#B8923A", 0.72], ["#E3CB8E", 1]]
      .forEach(([c, o]) => foil.addColorStop(o, c));
    g.fillStyle = foil;
    g.fillRect(0, 0, w, hgt);
    // Fine metallic grain.
    for (let i = 0; i < (w * hgt) / 40; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgb(255 255 255 / 0.22)" : "rgb(90 66 20 / 0.12)";
      g.fillRect(Math.random() * w, Math.random() * hgt, 1, 1);
    }
    // Inner hairline + hint.
    g.strokeStyle = "rgb(110 82 18 / 0.45)";
    g.strokeRect(8.5, 8.5, w - 17, hgt - 17);
    const text = tr(hint);
    canvas.setAttribute("aria-label", text);
    g.fillStyle = "#5C4515";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = document.documentElement.lang === "hi" ? '400 18px "Yatra One", serif' : '500 14px Cinzel, serif';
    if ("letterSpacing" in g) g.letterSpacing = document.documentElement.lang === "hi" ? "0px" : "3px";
    g.fillText(document.documentElement.lang === "hi" ? text : text.toUpperCase(), w / 2, hgt / 2);
  }

  function reveal() {
    if (done) return;
    done = true;
    const r = canvas.getBoundingClientRect();
    petals.burst(r.left + r.width / 2, r.top + r.height / 2, 28);
    navigator.vibrate?.(20);
    gsap.to(canvas, { opacity: 0, scale: 1.04, duration: 0.6, ease: "power2.out", onComplete: () => canvas.remove() });
  }

  // Share of erased pixels, sampled on a sparse grid.
  function cleared() {
    const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 23) { n++; if (data[i] === 0) clear++; }
    return n ? clear / n : 0;
  }

  const pt = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let last = null;
  let moves = 0;
  function stroke(to) {
    g.globalCompositeOperation = "destination-out";
    g.strokeStyle = "#000"; // opaque, so one pass erases fully (paint() leaves a translucent hairline style)
    g.lineCap = g.lineJoin = "round";
    g.lineWidth = BRUSH;
    g.beginPath();
    g.moveTo(...(last || to));
    g.lineTo(...to);
    g.stroke();
    last = to;
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (done) return;
    started = true;
    canvas.setPointerCapture(e.pointerId);
    last = null;
    stroke(pt(e));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!last || done) return;
    stroke(pt(e));
    if (++moves % 8 === 0 && cleared() > REVEAL_AT) reveal();
  });
  const up = () => { if (last && !done && cleared() > REVEAL_AT) reveal(); last = null; };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
  });

  new ResizeObserver(paint).observe(wrap);
  document.fonts.ready.then(paint);
  onLang(paint);
  return wrap;
}
