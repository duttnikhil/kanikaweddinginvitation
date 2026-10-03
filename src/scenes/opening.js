// Opening gate: envelope on linen, wax seal, hinged flap, card rises and becomes the hero (SPEC §7.4).
import { art } from "../core/assets.js";
import { gsap, dur, ease, lenis, prefersReduced } from "../core/motion.js";
import * as audio from "../core/audio.js";
import * as petals from "../fx/petals.js";
import { gateMarkup } from "../fx/envelope.js";
import { pictureHtml } from "../core/picture-html.js";
import { bind, tr, setLang, otherLang } from "../core/i18n.js";
import { drawTargets } from "../fx/draw.js";
import { playFrameAnim } from "../fx/frame-anim.js";
import { playGaneshLoop } from "../fx/ganesh.js";

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
  const { bride, groom } = ctx.content.couple;
  const names = (l) => `${tr(bride.name, l)} ${tr(ctx.content.hero.joiner, l)} ${tr(groom.name, l)}`;
  // The gate is pre-rendered into index.html (fast first paint); build it only if missing.
  if (!document.getElementById("gate")) {
    const scene = art("envelope-scene");
    const frame = art("hero-frame-start") || art("hero-frame");
    document.body.insertAdjacentHTML("afterbegin", gateMarkup(
      { cta: tr(g.cta), skip: tr(g.skip), tagline: tr(g.tagline), monogramText: `${bride.initial} | ${groom.initial}`, names: names(), to: tr(g.to), lang: tr(ctx.content.ui.langToggle) },
      { sceneHtml: scene ? pictureHtml(scene.key, scene, { eager: true }) : null, frameUrl: frame ? `/img/${frame.key}-${frame.w}.webp` : null }));
  }
  const gate = document.getElementById("gate");
  const $ = (sel) => gate.querySelector(sel);
  const el = {
    gate, seal: $(".seal"), shine: gate.querySelectorAll(".seal-shine"), bg: $(".gate-bg"), top: $(".gate-top"),
    back: $(".env-back"), card: $(".env-card"), cardIn: $(".env-card-in"), pocket: $(".env-pocket"),
    flap: $(".env-flap"), cta: $(".gate-cta"), skip: $("#gate-skip"),
  };
  // Static text is in the default language: bind it so the guest's language applies.
  bind($("#gate-open-label"), g.cta);
  bind(el.cta, g.cta);
  bind(el.skip, g.skip);
  // Language switch on the envelope (like Skip): re-labels everything, never opens the envelope.
  const langBtn = $("#gate-lang");
  if (langBtn) {
    bind(langBtn, ctx.content.ui.langToggle);
    bind(langBtn, (l) => (l === "hi" ? "en" : "hi"), "lang"); // the label is in the other language
  }
  const tag = (i) => (l) => { const t = tr(g.tagline, l); const k = t.lastIndexOf(" "); return k > 0 ? [t.slice(0, k), t.slice(k + 1)][i] : i ? "" : t; };
  bind($(".gate-tag1"), tag(0));
  bind($(".gate-tag2"), tag(1));
  bind($(".env-card-names"), names);
  // Envelope addressed to the guest ("Specially for Shri & Smt. Verma Parivar"); generic link: no line.
  const to = $(".env-to");
  if (to && ctx.guest && g.to) {
    bind($(".env-to-label"), g.to);
    bind($(".env-to-name"), (l) => `${ctx.guest.salutation[l]} ${ctx.guest.name[l]}`.trim());
    to.hidden = false;
  }
  document.body.classList.add("is-locked");

  const reduced = prefersReduced();
  // Idle: the envelope lies still; the seal "breathes", a shine passes every 3 s, CTA pulses.
  const idle = reduced ? null : gsap.timeline();
  if (idle) {
    idle.add(gsap.to(el.seal, { scale: 1.03, duration: 1.5, ease: ease.float, repeat: -1, yoyo: true }), 0)
      .add(gsap.fromTo(el.shine, { x: 0 }, { x: 280, duration: 1.1, ease: "power1.inOut", repeat: -1, repeatDelay: 1.9 }), 0.6)
      .add(gsap.fromTo(el.cta, { opacity: 1 }, { opacity: 0.45, duration: 1.2, ease: ease.float, repeat: -1, yoyo: true }), 0);
  }

  let finished = false;
  let tl = null;
  const reveal = () => document.documentElement.classList.remove("gate-closed");
  function finish() {
    if (finished) return;
    finished = true;
    idle?.kill();
    reveal();
    playFrameAnim(); // no-op if the intro already started it
    playGaneshLoop();
    gate.remove();
    document.body.classList.remove("is-locked");
    lenis?.start();
    done();
  }

  async function open() {
    if (tl || finished) return;
    // Inside the user gesture: unlock audio (iOS) and play the seal crack.
    audio.unlock();
    audio.playCrack();
    navigator.vibrate?.(30);
    if (reduced) {
      reveal();
      audio.startShehnai();
      tl = gsap.timeline({ onComplete: finish })
        .to(el.seal, { opacity: 0, duration: 0.3 })
        .to(gate, { opacity: 0, duration: 0.4 });
      return;
    }
    idle?.pause();
    await document.fonts.ready;
    tl = introTimeline(ctx, el, finish, reveal);
  }

  gate.addEventListener("click", (e) => {
    if (e.target.closest("#gate-lang")) return setLang(otherLang());
    if (e.target.closest("#gate-skip")) {
      if (tl) tl.progress(1); // Skip: jump to the final state
      else finish();
      return;
    }
    open();
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

// SPEC §7.4 (envelope): ≈ 3.65 s from tap to the hero.
function introTimeline(ctx, el, finish, reveal) {
  const hero = document.getElementById("hero");
  const paths = [...hero.querySelectorAll(".hero-wreath .ganesh-line")].flatMap(drawTargets);
  const H = 2.45; // hero entrance starts as the card covers the screen

  // Card → full screen: centre it and scale it up to cover the viewport (measured when it starts).
  let grow = null;
  const measure = () => {
    const r = el.card.getBoundingClientRect();
    grow = {
      dx: innerWidth / 2 - (r.left + r.width / 2),
      dy: innerHeight / 2 - (r.top + r.height / 2),
      s: Math.max(innerWidth / r.width, innerHeight / r.height) * 1.04,
    };
  };

  const tl = gsap.timeline({
    onComplete: finish,
  });
  // Seal presses, then lifts off the flap.
  tl.to(el.seal, { scale: 0.94, duration: 0.12, ease: "power2.out" }, 0)
    .to(el.seal, { y: -16, scale: 1.05, opacity: 0, duration: 0.5, ease: "power2.inOut" }, 0.12)
    .to([el.cta, el.top], { opacity: 0, duration: 0.35 }, 0.1)
    // The flap swings open on its hinge; past 90° it goes behind the card.
    .to(el.flap, { rotationX: 180, duration: 0.9, ease: "power2.inOut" }, 0.45)
    .set(el.flap, { zIndex: 0 }, 0.9)
    // The card slides up out of the pocket.
    .to(el.card, { yPercent: -58, duration: 0.85, ease: "power3.inOut" }, 1.1)
    // Envelope drops away; the card comes forward and fills the screen.
    .set(el.card, { zIndex: 3 }, 1.95) // out of the pocket: now in front of the falling envelope
    .to([el.back, el.pocket, el.flap], { y: () => innerHeight * 0.75, duration: 0.75, ease: "power2.in" }, 1.95)
    .to(el.cardIn, { opacity: 0, duration: 0.3 }, 2.05)
    .call(measure, null, 2.05)
    .to(el.card, { x: () => `+=${grow.dx}`, y: () => `+=${grow.dy}`, scale: () => grow.s, duration: 0.75, ease: "power2.inOut" }, 2.05)
    .to(el.bg, { opacity: 0, duration: 0.45 }, 2.1)
    .call(() => { audio.startShehnai(); petals.start(); }, null, 2.4)
    .call(reveal, null, 2.35)
    // The card is now the hero's paper: fade the gate away over the hero.
    .to(el.gate, { opacity: 0, duration: 0.45, ease: "power1.out" }, 2.45)
    .from(hero.querySelector(".hero-invocation"), { opacity: 0, y: 8, duration: dur.m, ease: ease.enter }, H)
    .call(() => { playFrameAnim(); playGaneshLoop(); }, null, H); // bells swing, Ganesh draws
  if (paths.length) tl.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.0, ease: "power1.inOut", stagger: { amount: 0.4 } }, H);
  tl.from(hero.querySelectorAll(".wreath-fill"), { opacity: 0, duration: 0.6 }, H + 0.5);
  tl.from(hero.querySelector(".hero-invite"), { y: 24, opacity: 0, duration: dur.l, ease: ease.enter }, H + 0.5)
    .from(hero.querySelectorAll(".hero-scene, .scroll-hint"), { opacity: 0, duration: dur.m, stagger: 0.1 }, H + 0.8)
    .call(finish, null, H + 1.2);
  return tl;
}
