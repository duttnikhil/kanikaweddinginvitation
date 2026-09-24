// Opening gate: temple doors, shankh, Ganesh draws itself, petals, names (SPEC §7.4).
import { h } from "../core/dom.js";
import { ownerSvg } from "../core/assets.js";
import { gsap, dur, ease, stagger, split, lenis, prefersReduced } from "../core/motion.js";
import * as audio from "../core/audio.js";
import * as petals from "../fx/petals.js";
import { door, toran } from "../fx/ornaments.js";
import { drawTargets } from "../fx/draw.js";

export function mount(ctx) {
  const done = () => ctx.gateDone?.();
  if (ctx.phase === "post") return done();
  const g = ctx.content.gate;
  const hasSound = audio.hasMusic;
  const openBtn = h("button", { type: "button", id: "gate-open", class: "gate-btn" }, h("span", { text: g.cta }));
  const skipBtn = h("button", { type: "button", id: "gate-skip", class: "gate-skip", text: g.skip });
  const left = h("div", { class: "door door-left", "aria-hidden": "true", html: ownerSvg("door-left") || door("left") });
  const right = h("div", { class: "door door-right", "aria-hidden": "true", html: ownerSvg("door-right") || door("right") });
  const light = h("div", { class: "gate-light", "aria-hidden": "true" });
  const center = h("div", { class: "gate-center" }, openBtn, hasSound ? h("p", { class: "gate-hint", text: g.hint }) : null);
  const tor = h("div", { class: "gate-toran", "aria-hidden": "true", html: ownerSvg("toran") || toran() });
  const gate = h("div", { id: "gate", role: "dialog", "aria-modal": "true", "aria-labelledby": "gate-open" },
    left, right, light, tor, center, skipBtn);
  document.body.append(gate);
  document.body.classList.add("is-locked");
  openBtn.focus({ preventScroll: true });

  const reduced = prefersReduced();
  const idle = reduced ? null : gsap.timeline()
    .add(gsap.to(openBtn, { scale: 1.04, duration: 0.9, ease: ease.float, repeat: -1, yoyo: true }), 0)
    .add(gsap.fromTo(tor.firstElementChild, { rotation: -1.5 }, { rotation: 1.5, transformOrigin: "50% 0%", duration: 3, ease: ease.float, repeat: -1, yoyo: true }), 0);

  let finished = false;
  let tl = null;
  function finish() {
    if (finished) return;
    finished = true;
    idle?.kill();
    gate.remove();
    document.body.classList.remove("is-locked");
    lenis?.start();
    done();
  }

  openBtn.addEventListener("click", async () => {
    if (tl || finished) return;
    // Inside the user gesture: unlock audio (iOS) and play the shankh.
    audio.unlock();
    audio.playShankh();
    navigator.vibrate?.(40);
    if (reduced) {
      audio.startShehnai();
      tl = gsap.to(gate, { opacity: 0, duration: 0.4, onComplete: finish });
      return;
    }
    await document.fonts.ready;
    tl = introTimeline(ctx, { center, skipBtn, left, right, light, idle, finish });
  });

  // Skip: jump to the final state, no sound.
  skipBtn.addEventListener("click", () => {
    if (tl) tl.progress(1);
    else finish();
  });
}

function introTimeline(ctx, { center, skipBtn, left, right, light, idle, finish }) {
  const hero = document.getElementById("hero");
  const line = hero.querySelector(".ganesh-line");
  const paths = line ? drawTargets(line) : [];
  const fillLayer = hero.querySelector(".ganesh-fill");
  const greet = hero.querySelector(".greeting-name") || hero.querySelector(".greeting");
  const names = [...hero.querySelectorAll(".couple-names .name")];
  const greetSplit = greet ? split(greet, "chars") : null;
  const nameSplits = names.map((n) => split(n, "chars"));
  const tl = gsap.timeline({
    onComplete: () => {
      finish();
      // Restore plain text so the language toggle can re-render these nodes.
      greetSplit?.revert();
      nameSplits.forEach((s) => s.revert());
    },
  });
  tl.to(center, { opacity: 0, duration: dur.xs, onStart: () => idle?.pause() }, 0)
    .to(skipBtn, { opacity: 0.6, duration: dur.xs }, 0)
    .fromTo(light, { scaleX: 1, opacity: 0 }, { scaleX: 60, opacity: 1, duration: 0.9, ease: ease.move }, 0.25)
    .to(left, { rotateY: -105, duration: dur.xl, ease: ease.door }, 0.3)
    .to(right, { rotateY: 105, duration: dur.xl, ease: ease.door }, 0.3)
    .to(light, { opacity: 0, duration: 0.6 }, 1.5)
    .call(() => audio.startShehnai(), null, 1.2);
  if (paths.length) {
    tl.fromTo(paths, { drawSVG: "0%" }, {
      drawSVG: "100%", duration: 1.4, ease: "power1.inOut",
      stagger: { amount: Math.min(0.02 * paths.length, 1) }, // 0.02 each, capped at 1 s total
    }, 1.4);
  }
  if (fillLayer) tl.fromTo(fillLayer, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.6);
  tl.call(() => petals.start(), null, 2.8);
  const gSplit = greetSplit ? (greetSplit.chars.length ? greetSplit.chars : greetSplit.words) : [];
  if (gSplit.length) tl.from(gSplit, { opacity: 0, y: 12, duration: dur.s, ease: ease.enter, stagger: stagger.chars }, 3.4);
  const sub = hero.querySelector(".greeting-sub");
  if (sub) tl.from(sub, { opacity: 0, y: 8, duration: dur.m, ease: ease.enter }, 3.9);
  nameSplits.forEach((s, i) => {
    const parts = s.chars.length ? s.chars : s.words;
    tl.from(parts, { opacity: 0, rotation: -8, y: 10, transformOrigin: "0% 100%", duration: dur.m, ease: ease.enter, stagger: 0.05 }, 4.4 + i * 0.25);
  });
  tl.from(hero.querySelectorAll(".couple-names .joiner, .hero-date, .scroll-hint"), { opacity: 0, duration: dur.m, stagger: 0.1 }, 4.6);
  // The page is usable at 5.0 s even though the name flourish finishes a little later.
  tl.call(finish, null, 5.0);
  return tl;
}
