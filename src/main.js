// Boot sequence (SPEC §7.2). Loaded by boot.js right after the static gate has painted.
import { content, events, warn } from "./core/content.js";
import { resolveGuest, params } from "./core/guest.js";
import { initLang, onLang, onBeforeLang, tr } from "./core/i18n.js";
import { resolvePhase } from "./core/time.js";
import { icon } from "./core/dom.js";
import { sendOpen } from "./core/api.js";
import * as motion from "./core/motion.js";
import * as audio from "./core/audio.js";
import * as petals from "./fx/petals.js";
import * as opening from "./scenes/opening.js";
import * as hero from "./scenes/hero.js";
import * as amantran from "./scenes/amantran.js";
import * as couple from "./scenes/couple.js";
import * as story from "./scenes/story.js";
import * as countdown from "./scenes/countdown.js";
import * as eventsScene from "./scenes/events.js";
import * as pheras from "./scenes/pheras.js";
import * as varmala from "./scenes/varmala.js";
import * as gallery from "./scenes/gallery.js";
import * as rsvp from "./scenes/rsvp.js";
import * as shagun from "./scenes/shagun.js";
import * as wishes from "./scenes/wishes.js";
import * as travel from "./scenes/travel.js";
import * as contacts from "./scenes/contacts.js";
import * as closing from "./scenes/closing.js";
import * as live from "./scenes/live.js";
import * as floatingUi from "./scenes/floating-ui.js";

const SCENES = { hero, amantran, couple, story, countdown, events: eventsScene, pheras, varmala, gallery, rsvp, shagun, wishes, travel, contacts, closing, live, floatingUi };

// Alternate paper / paper-2 on the visible light sections (dark ones keep maroon).
function toneSections(main) {
  let alt = false;
  for (const s of main.querySelectorAll(":scope > .section:not(.hero)")) {
    if (s.classList.contains("section--dark")) { alt = false; continue; }
    s.classList.toggle("section--alt", alt);
    alt = !alt;
  }
}

// Music toggle (top-right): shown only when a shehnai file exists.
function setupMusic(ctx) {
  const f = ctx.floating;
  if (!f || !audio.hasMusic) return;
  const ui = content.ui;
  const render = () => {
    const m = audio.isMuted();
    f.musicIcon.replaceChildren(icon(m ? "volume-x" : "volume-2"));
    f.musicLabel.textContent = tr(m ? ui.musicOff : ui.musicOn);
    f.musicBtn.setAttribute("aria-pressed", String(!m));
  };
  f.musicBtn.hidden = false;
  f.musicBtn.addEventListener("click", () => audio.setMuted(!audio.isMuted()));
  audio.onMute(render);
  onLang(render);
  render();
}

// After the gate: floating UI fades in; petals fall only while the hero is on screen.
function afterGate(ctx) {
  document.documentElement.classList.add("gate-open");
  motion.ScrollTrigger.refresh(); // scrollbar may appear once the body is unlocked
  const hero = document.getElementById("hero");
  if (!hero || ctx.phase === "post") return;
  new IntersectionObserver(([e]) => (e.isIntersecting ? petals.start() : petals.stop()), { threshold: 0.2 }).observe(hero);
}

// Error boundary: one broken scene must not blank the page.
function mountScene(name, scene, ctx) {
  try {
    scene.mount(ctx);
  } catch (err) {
    console.error(`[scene ${name}]`, err);
  }
}

async function boot() {
  const guest = await resolveGuest();
  const lang = initLang(guest);
  const phase = resolvePhase(events, params);
  document.documentElement.dataset.phase = phase;

  let gateOpened;
  const gateDone = new Promise((r) => (gateOpened = r));
  const ctx = {
    content, guest, lang, phase, params, warn, icon, onLang,
    main: document.getElementById("main"),
    phaseForced: params.has("phase"),
    lenis: motion.lenis,
    motion,
    petals,
    gateDone: () => {
      afterGate(ctx);
      gateOpened();
    },
    // RSVP success: petals burst from the diya.
    celebrate: (el) => {
      const r = (el.querySelector(".diya") || el).getBoundingClientRect();
      petals.burst(r.left + r.width / 2, r.top + r.height / 2, 30);
    },
  };

  // Hero first (it's what the doors open onto), then the gate, then every other scene in its
  // own task so no single long task blocks the main thread on slow phones.
  mountScene("hero", hero, ctx);
  try {
    opening.mount(ctx);
  } catch (err) {
    console.error("[scene opening]", err);
    opening.dropGate();
    ctx.gateDone();
  }
  for (const [name, scene] of Object.entries(SCENES)) {
    if (scene === hero) continue;
    await motion.yieldToMain();
    mountScene(name, scene, ctx);
  }
  toneSections(ctx.main);
  setupMusic(ctx);

  // Open ping (skipped for admin previews).
  if (guest && params.get("preview") !== "1") sendOpen(guest.id);

  // Scroll animations: built after fonts load (stable text metrics) and after the gate is gone
  // (nothing below the hero can be seen before that). Rebuilt around a language switch.
  await Promise.all([document.fonts.ready, gateDone]);
  motion.scene(({ full }) => {
    if (full) motion.revealOnScroll(ctx.main.querySelectorAll("[data-reveal]"));
  });
  onBeforeLang(() => motion.revert());
  onLang(() => motion.build());
  await motion.build();
  motion.refreshOnImages(ctx.main);
}

boot();
