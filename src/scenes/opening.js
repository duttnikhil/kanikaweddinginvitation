// Opening gate: temple doors, shankh, Ganesh draws itself, petals, names (SPEC §7.4).
import { ownerSvg } from "../core/assets.js";
import { gsap, dur, ease, stagger, split, lenis, prefersReduced } from "../core/motion.js";
import * as audio from "../core/audio.js";
import * as petals from "../fx/petals.js";
import { gateMarkup } from "../fx/ornaments.js";
import { bind, tr } from "../core/i18n.js";
import { drawTargets } from "../fx/draw.js";

// Removes the pre-rendered gate and shows the page (post phase, errors).
export function dropGate() {
  document.getElementById("gate")?.remove();
  document.documentElement.classList.remove("gate-closed");
  document.body.classList.remove("is-locked");
}

export function mount(ctx) {
  const done = () => ctx.gateDone?.();
  if (ctx.phase === "post") {
    dropGate();
    return done();
  }
  const g = ctx.content.gate;
  // The gate is pre-rendered into index.html (fast first paint); build it only if missing.
  if (!document.getElementById("gate")) {
    document.body.insertAdjacentHTML("afterbegin", gateMarkup({ cta: tr(g.cta), skip: tr(g.skip), hint: audio.hasMusic ? tr(g.hint) : "" },
      { doorLeft: ownerSvg("door-left"), doorRight: ownerSvg("door-right"), toranSvg: ownerSvg("toran") }));
  }
  const gate = document.getElementById("gate");
  const openBtn = gate.querySelector("#gate-open");
  const skipBtn = gate.querySelector("#gate-skip");
  const left = gate.querySelector(".door-left");
  const right = gate.querySelector(".door-right");
  const light = gate.querySelector(".gate-light");
  const center = gate.querySelector(".gate-center");
  const tor = gate.querySelector(".gate-toran");
  // Static text is in the default language: bind it so the guest's language applies.
  bind(openBtn.firstElementChild, g.cta);
  bind(skipBtn, g.skip);
  const hint = gate.querySelector(".gate-hint");
  if (hint) bind(hint, g.hint);
  document.body.classList.add("is-locked");
  openBtn.focus({ preventScroll: true });

  const reduced = prefersReduced();
  const idle = reduced ? null : gsap.timeline()
    .add(gsap.to(openBtn, { scale: 1.04, duration: 0.9, ease: ease.float, repeat: -1, yoyo: true }), 0)
    .add(gsap.fromTo(tor.firstElementChild, { rotation: -1.5 }, { rotation: 1.5, transformOrigin: "50% 0%", duration: 3, ease: ease.float, repeat: -1, yoyo: true }), 0);

  let finished = false;
  let tl = null;
  const reveal = () => document.documentElement.classList.remove("gate-closed");
  function finish() {
    if (finished) return;
    finished = true;
    idle?.kill();
    reveal();
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
    reveal();
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

  // Replay a tap that happened before the app loaded (no sound: not a user gesture any more).
  const root = document.documentElement;
  root.dataset.appReady = "1";
  const early = root.dataset.earlyTap;
  if (early) {
    delete root.dataset.earlyTap;
    document.getElementById(early)?.click();
  }
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
