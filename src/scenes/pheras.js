// Saat phere (SPEC §7.8). Static render = agni kund + numbered vachan list.
// Phase 5 motion switches to the pinned stage (diya circling, one vachan at a time).
import { h, svg } from "../core/dom.js";
import { fill } from "../core/i18n.js";
import { ownerSvg } from "../core/assets.js";
import { agniKund, diya } from "../fx/ornaments.js";
import { section } from "./common.js";
import { gsap } from "../core/motion.js";

// Ellipse ring around the kund; starts at the front (bottom) so the diya begins in view.
export const RING = "M160 232A138 52 0 1 1 160.01 232Z";

function stage() {
  const kund = (ownerSvg("agni-kund") || agniKund()).replace(/<svg\b/, '<svg x="84" y="40" width="152" height="146"');
  const lamp = diya().replace(/<svg\b/, '<svg x="-17" y="-26" width="34" height="31"');
  return svg(`<svg class="phere-stage-svg" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
<path id="phere-ring" d="${RING}" fill="none" stroke="#C9A043" stroke-width="1.2" stroke-dasharray="3 6" opacity=".7"/>
${kund}<g id="phere-diya" transform="translate(160 232)">${lamp}</g></svg>`);
}

export function mount(ctx) {
  const p = ctx.content.phere;
  if (!p?.vachans?.length) return;
  const sec = section("phere", { title: p.title, tone: "dark" });
  const dots = h("div", { class: "phere-dots", "aria-hidden": "true" }, p.vachans.map(() => h("span", { class: "phere-dot" })));
  sec.append(
    h("p", { class: "phere-intro prose", text: p.intro }),
    h("div", { class: "phere-pin" },
      h("div", { class: "phere-stage", "aria-hidden": "true" }, stage()),
      dots,
      h("div", { class: "phere-now", "aria-hidden": "true" },
        h("p", { class: "phere-counter label" }),
        h("div", { class: "phere-vachans" },
          p.vachans.map((v) => h("p", { class: "phere-vachan prose", text: v })))),
      h("ol", { class: "phere-list" },
        p.vachans.map((v, i) => h("li", { class: "prose" },
          h("span", { class: "phere-num label", text: (l) => fill(p.counter, { n: String(i + 1) }, l) }),
          h("span", { text: v })))),
      h("p", { class: "phere-outro script", text: p.outro })));
  ctx.main.append(sec);
  ctx.motion.scene(({ full }) => (full ? staged(ctx, sec, p) : undefined));
}

// Pinned for +=3500px: the diya circles the kund 7 times along #phere-ring while the seven
// vachans appear one by one (SPEC §7.8). Reduced motion keeps the numbered list.
function staged(ctx, sec, p) {
  sec.classList.add("is-staged");
  const pin = sec.querySelector(".phere-pin");
  const vachans = [...sec.querySelectorAll(".phere-vachan")];
  const dots = [...sec.querySelectorAll(".phere-dot")];
  const counter = sec.querySelector(".phere-counter");
  const n = vachans.length;
  const lamp = sec.querySelector("#phere-diya");
  const kund = lamp.previousElementSibling;
  let diyaBehind = false;
  let shown = -1;
  const setStep = (i) => {
    if (i === shown) return;
    shown = i;
    counter.textContent = fill(p.counter, { n: String(Math.min(i + 1, n)) });
    dots.forEach((d, j) => d.classList.toggle("is-on", j <= i));
  };
  setStep(0);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: pin, start: "top top", end: "+=3500", pin: true, scrub: 0.6, anticipatePin: 1 },
    onUpdate: () => {
      setStep(Math.min(n - 1, Math.floor(tl.time())));
      // Back half of the ring (quarter to three-quarters of each loop): diya goes behind the kund.
      const f = tl.time() % 1;
      const behind = tl.time() < n && f > 0.25 && f < 0.75;
      if (behind !== diyaBehind) {
        diyaBehind = behind;
        behind ? kund.before(lamp) : kund.after(lamp);
      }
    },
  });
  // Closed path + end: n loops the ring n times (verified in GSAP's sliceRawPath and in the
  // browser: the diya is back at the start point at every whole-number time).
  tl.to("#phere-diya", {
    motionPath: { path: "#phere-ring", align: "#phere-ring", alignOrigin: [0.5, 0.5], start: 0, end: n },
    duration: n,
  }, 0);
  vachans.forEach((v, i) => {
    tl.fromTo(v, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.25 }, i + 0.05);
    if (i < n - 1) tl.to(v, { opacity: 0, y: -16, duration: 0.25 }, i + 0.8);
  });
  tl.fromTo(sec.querySelector(".phere-outro"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, n - 0.2);
  tl.to({}, { duration: 0.4 }); // hold on the last vachan (all 7 dots lit) before unpinning

  // Flame flicker, only while the section is on screen.
  const flicker = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" } });
  sec.querySelectorAll(".phere-stage .flame").forEach((f, i) => {
    flicker.to(f, { scaleY: 1.12, scaleX: 0.94, duration: gsap.utils.random(0.3, 0.6), ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true }, i * 0.1);
  });
  return () => {
    kund.after(lamp);
    sec.classList.remove("is-staged");
    dots.forEach((d) => d.classList.remove("is-on"));
  };
}
