// Floating controls: language (top-left), music (top-right), RSVP pill (bottom). SPEC §7.3.
import { h } from "../core/dom.js";
import { setLang, otherLang } from "../core/i18n.js";

export function mount(ctx) {
  const ui = ctx.content.ui;
  const langBtn = h("button", { type: "button", class: "fab fab--lang", onclick: () => setLang(otherLang()) },
    ctx.icon("languages"), h("span", { text: ui.langToggle }));

  const musicIcon = h("span", { class: "fab-icon" });
  const musicLabel = h("span", { class: "sr-only" });
  const musicBtn = h("button", { type: "button", class: "fab fab--music", hidden: true }, musicIcon, musicLabel);

  const rsvpSec = document.getElementById("rsvp");
  const pill = rsvpSec
    ? h("a", { class: "btn rsvp-pill", href: "#rsvp" }, h("span", { text: ui.rsvpPill }))
    : null;

  const bar = h("div", { class: "floating" }, langBtn, musicBtn, pill);
  document.body.append(bar);

  if (pill) {
    // Hide the pill while the cover or the RSVP section is on screen.
    const onScreen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
      pill.classList.toggle("is-hidden", onScreen.size > 0);
    }, { threshold: 0.05 });
    io.observe(rsvpSec);
    const hero = document.getElementById("hero");
    if (hero) io.observe(hero);
    pill.addEventListener("click", (e) => {
      if (!ctx.lenis) return;
      e.preventDefault();
      ctx.lenis.scrollTo(rsvpSec, { offset: -10 });
    });
  }

  ctx.floating = { bar, langBtn, musicBtn, musicIcon, musicLabel, pill };
}
