// Event cards for the guest's allowed events, in date order (SPEC §7.3 #6, §7.13, §7.14).
import { h, svg, append } from "../core/dom.js";
import { events } from "../core/content.js";
import { getLang } from "../core/i18n.js";
import { fmtDate, fmtTime } from "../core/time.js";
import { googleUrl, downloadIcs } from "../core/calendar.js";
import { kalash, diya, haldiDrops } from "../fx/ornaments.js";
import { mandala } from "../fx/mandala.js";
import { ownerSvg } from "../core/assets.js";
import { section } from "./common.js";
import { drawTargets } from "../fx/draw.js";

// Venue location: lat/lng when known, else the address text (`query`) for Google Maps search.
const where = (v) => (v.lat != null && v.lng != null ? `${v.lat},${v.lng}` : v.query || "");
const mapsUrl = (v) => v.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where(v))}`;
const dirUrl = (v) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(where(v))}`;
const hasPlace = (v) => !!(v && (v.mapsUrl || where(v)));

// "4:00 PM onwards" / "11:00 AM – 1:00 PM"
function timeText(ev, ui, l) {
  const t = fmtTime(ev.start, l);
  if (ev.showEnd && ev.end) return `${t} – ${fmtTime(ev.end, l)}`;
  if (ev.onwards) return l === "hi" ? `${t} ${ui.onwards.hi}` : `${t} ${ui.onwards.en}`;
  return t;
}

export function visibleEvents(guest) {
  return guest ? events.filter((e) => guest.allows(e.id)) : events;
}

function motifArt(ev) {
  if (ev.motif === "haldi") return svg(`<svg viewBox="0 0 60 60"><circle cx="30" cy="32" r="18" fill="#F2B705"/><circle cx="30" cy="32" r="9" fill="#E0861B"/><path d="M30 4c4 6 6 9 6 11a6 6 0 0 1-12 0c0-2 2-5 6-11Z" fill="#F2B705"/></svg>`);
  if (ev.motif === "mehendi") return svg(mandala(ev.id.length * 13, { stroke: "#7A5A2E", width: 3 }));
  if (ev.motif === "flowers") return svg(`<svg viewBox="0 0 60 60"><g fill="#E8B4BC">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="30" cy="17" rx="7" ry="12" transform="rotate(${a} 30 30)"/>`).join("")}</g><circle cx="30" cy="30" r="6" fill="#F2C94C"/></svg>`);
  return svg(ev.id === "phere" ? diya() : kalash());
}

// Mehendi art (owner hand SVG or stroke mandala) with the groom's initial hidden in the palm (SPEC §7.7)
function mehendiArt(ctx) {
  const owner = ownerSvg("mehendi-hand");
  const el = svg(owner || mandala(77, { stroke: "#7A3E12", width: 1.6 }));
  const vb = (el.getAttribute("viewBox") || "0 0 400 400").split(/[\s,]+/).map(Number);
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", vb[0] + vb[2] / 2);
  t.setAttribute("y", vb[1] + vb[3] / 2);
  t.setAttribute("class", "mehendi-initial");
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "central");
  t.setAttribute("font-size", vb[3] * 0.09);
  t.textContent = ctx.content.couple.groom.initial || "";
  el.append(t);
  return h("div", { class: "mehendi-art" }, el);
}

function calendarMenu(ctx, ev) {
  const ui = ctx.content.ui;
  const menu = h("div", { class: "cal-menu", hidden: true, role: "menu" },
    h("a", { role: "menuitem", class: "cal-item", target: "_blank", rel: "noopener", href: googleUrl(ev, getLang()), text: ui.googleCalendar,
      onclick: (e) => { e.currentTarget.href = googleUrl(ev, getLang()); close(); } }),
    h("button", { role: "menuitem", type: "button", class: "cal-item", text: ui.otherCalendar,
      onclick: () => { downloadIcs(ev, getLang()); close(); } }));
  const btn = h("button", { type: "button", class: "btn btn--ghost btn--sm", "aria-haspopup": "true", "aria-expanded": "false" },
    ctx.icon("calendar-plus"), h("span", { text: ui.addToCalendar }));
  function close() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", outside, true);
  }
  function outside(e) {
    if (!wrap.contains(e.target)) close();
  }
  btn.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) document.addEventListener("click", outside, true);
  });
  const wrap = h("div", { class: "cal-wrap" }, btn, menu);
  return wrap;
}

function card(ctx, ev) {
  const ui = ctx.content.ui;
  const v = ev.venue;
  const dc = ev.dressCode;
  const hasGeo = hasPlace(v);
  return h("article", { class: `event-card event--${ev.motif}`, id: `event-${ev.id}`, "data-motif": ev.motif },
    h("div", { class: "event-arch", "aria-hidden": "true" }, motifArt(ev)),
    h("h3", { class: "event-name", text: ev.name }),
    h("p", { class: "event-when num" },
      h("span", { text: (l) => fmtDate(ev.start, l) }),
      h("span", { class: "event-time", text: (l) => timeText(ev, ui, l) })),
    ev.muhurat ? h("p", { class: "event-muhurat", text: ev.muhurat }) : null,
    v ? h("div", { class: "event-venue" },
      h("p", { class: "venue-name", text: v.name }),
      h("p", { class: "soft", text: v.address })) : null,
    dc ? h("div", { class: "event-dress" },
      h("span", { class: "label", text: ui.dressCode }),
      h("span", { class: "swatches", "aria-hidden": "true" }, (dc.colors || []).map((col) => h("span", { class: "swatch", style: `background:${col}` }))),
      h("span", { text: dc.text })) : null,
    ev.note ? h("p", { class: "event-note prose", text: ev.note }) : null,
    ev.motif === "mehendi" ? mehendiArt(ctx) : null,
    h("div", { class: "event-actions" },
      hasGeo ? h("a", { class: "btn btn--ghost btn--sm", href: mapsUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("map-pin"), h("span", { text: ui.maps })) : null,
      hasGeo ? h("a", { class: "btn btn--ghost btn--sm", href: dirUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("navigation"), h("span", { text: ui.directions })) : null,
      calendarMenu(ctx, ev)),
    ev.motif === "haldi" ? h("div", { class: "haldi-layer", "aria-hidden": "true", html: haldiDrops() }) : null);
}

export function mount(ctx) {
  const list = visibleEvents(ctx.guest);
  if (!list.length) return;
  const sec = section("utsav", { title: ctx.content.eventsTitle });
  append(sec, h("div", { class: "event-list" }, list.map((ev) => card(ctx, ev))), venues(ctx, list));
  ctx.main.append(sec);
  ctx.motion.scene(({ full }) => full && animate(ctx, sec));
}

// All distinct venues of the guest's functions, each with Map + Directions (client asked for
// both the Chhatarpur and the Jhansi location).
function venues(ctx, list) {
  const ui = ctx.content.ui;
  const seen = new Map();
  for (const ev of list) if (hasPlace(ev.venue)) seen.set(mapsUrl(ev.venue), ev.venue);
  if (seen.size < 2 || !ctx.content.venuesTitle) return null;
  return h("div", { class: "venues", "data-reveal": "" },
    h("h3", { class: "venues-title", text: ctx.content.venuesTitle }),
    [...seen.values()].map((v) => h("div", { class: "venue" },
      ctx.icon("map-pin", "ic venue-ic"),
      h("div", { class: "venue-body" },
        h("p", { class: "venue-name", text: v.name }),
        h("p", { class: "soft", text: v.address }),
        h("div", { class: "event-actions" },
          h("a", { class: "btn btn--sm", href: mapsUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("map-pin"), h("span", { text: ui.maps })),
          h("a", { class: "btn btn--ghost btn--sm", href: dirUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("navigation"), h("span", { text: ui.directions })))))));
}

function animate(ctx, sec) {
  const { gsap, dur, ease, below, revealOnScroll } = ctx.motion;
  revealOnScroll(sec.querySelectorAll(".event-card:not(.event--haldi)"), { y: 40, opacity: 0 });

  // Haldi splash (SPEC §7.6): yellow circle wipe, then content, then drops pop.
  const haldi = sec.querySelector(".event--haldi");
  if (haldi && below(haldi, 0.7)) {
    const layer = haldi.querySelector(".haldi-layer");
    const content = [...haldi.children].filter((c) => c !== layer);
    gsap.timeline({ scrollTrigger: { trigger: haldi, start: "top 70%", once: true } })
      .fromTo(layer, { clipPath: "circle(0% at 20% 30%)" }, { clipPath: "circle(150% at 20% 30%)", duration: 0.9, ease: "power2.out", immediateRender: true })
      .from(content, { opacity: 0, y: 10, duration: dur.s, ease: ease.enter, stagger: 0.04, immediateRender: true }, "-=0.35")
      .from(layer.querySelectorAll(".haldi-drop"), { scale: 0, duration: 0.5, ease: "back.out(3)", stagger: 0.06, immediateRender: true }, "-=0.3");
  }

  // Mehendi (SPEC §7.7): strokes draw with scroll, groom's initial appears last.
  const art = sec.querySelector(".mehendi-art svg");
  if (art) {
    const initial = art.querySelector(".mehendi-initial");
    gsap.timeline({ scrollTrigger: { trigger: art, start: "top 80%", end: "center center", scrub: true } })
      .fromTo(drawTargets(art), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, stagger: 0.015, ease: "none" })
      .fromTo(initial, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }
}
