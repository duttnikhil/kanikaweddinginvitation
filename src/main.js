// Boot sequence (SPEC §7.2)
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";
import { content, events, warn } from "./core/content.js";
import { resolveGuest, params } from "./core/guest.js";
import { initLang, onLang } from "./core/i18n.js";
import { resolvePhase } from "./core/time.js";
import { icon } from "./core/dom.js";
import { sendOpen } from "./core/api.js";
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

async function boot() {
  const guest = await resolveGuest();
  const lang = initLang(guest);
  const phase = resolvePhase(events, params);
  document.documentElement.dataset.phase = phase;

  const ctx = {
    content, guest, lang, phase, params, warn, icon, onLang,
    main: document.getElementById("main"),
    phaseForced: params.has("phase"),
  };

  // Error boundary: one broken scene must not blank the page.
  for (const [name, scene] of Object.entries(SCENES)) {
    try {
      scene.mount(ctx);
    } catch (err) {
      console.error(`[scene ${name}]`, err);
    }
  }
  toneSections(ctx.main);

  // Open ping (skipped for admin previews).
  if (guest && params.get("preview") !== "1") sendOpen(guest.id);
  return ctx;
}

boot();
