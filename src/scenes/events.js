// Event cards for the guest's allowed events, in date order (SPEC §7.3 #6, §7.13, §7.14).
import { h, append } from "../core/dom.js";
import { events } from "../core/content.js";
import { getLang } from "../core/i18n.js";
import { fmtDate, fmtDateParts, fmtTime } from "../core/time.js";
import { googleUrl, downloadIcs } from "../core/calendar.js";
import { eventIcon, corner } from "../fx/event-art.js";
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

function calendarMenu(ctx, ev) {
  const ui = ctx.content.ui;
  const menu = h("div", { class: "cal-menu", hidden: true, role: "menu" },
    h("a", { role: "menuitem", class: "cal-item", target: "_blank", rel: "noopener", href: googleUrl(ev, getLang()), text: ui.googleCalendar,
      onclick: (e) => { e.currentTarget.href = googleUrl(ev, getLang()); close(); } }),
    h("button", { role: "menuitem", type: "button", class: "cal-item", text: ui.otherCalendar,
      onclick: () => { downloadIcs(ev, getLang()); close(); } }));
  const btn = h("button", { type: "button", class: "ev-link", "aria-haspopup": "true", "aria-expanded": "false" },
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

// Stationery card: double gold hairline, corner flourishes, line-art medallion, date lockup.
function card(ctx, ev, i) {
  const ui = ctx.content.ui;
  const v = ev.venue;
  const dc = ev.dressCode;
  const hasGeo = hasPlace(v);
  const part = (k) => (l) => fmtDateParts(ev.start, l)[k];
  const wash = (dc?.colors || []).map((col, n) => `--wash-${n + 1}:${col}`).join(";") || null;
  return h("article", { class: `event-card event--${ev.motif} event--${ev.id}`, id: `event-${ev.id}`, style: wash },
    ["tl", "tr", "bl", "br"].map((c) => h("span", { class: `ev-corner-wrap ev-corner--${c}`, "aria-hidden": "true", html: corner })),
    h("div", { class: "event-icon", "aria-hidden": "true", html: eventIcon(ev.motif, ev.id) }),
    h("p", { class: "event-index", "aria-hidden": "true", text: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i] || "" }),
    h("h3", { class: "event-name", text: ev.name }),
    h("p", { class: "event-date", i18n: { "aria-label": (l) => fmtDate(ev.start, l) } },
      h("span", { class: "ev-wd", "aria-hidden": "true", text: part("weekday") }),
      h("span", { class: "ev-day num", "aria-hidden": "true", text: part("day") }),
      h("span", { class: "ev-mon", "aria-hidden": "true", text: part("month") })),
    h("p", { class: "event-time", text: (l) => timeText(ev, ui, l) }),
    ev.muhurat ? h("p", { class: "event-muhurat", text: ev.muhurat }) : null,
    v ? h("div", { class: "event-venue" },
      h("p", { class: "venue-name", text: v.name }),
      h("p", { class: "venue-addr", text: v.address })) : null,
    dc ? h("div", { class: "event-dress" },
      h("span", { class: "label", text: ui.dressCode }),
      h("span", { class: "swatches", "aria-hidden": "true" }, (dc.colors || []).map((col) => h("span", { class: "swatch", style: `background:${col}` }))),
      h("span", { text: dc.text })) : null,
    ev.note ? h("p", { class: "event-note prose", text: ev.note }) : null,
    h("div", { class: "ev-links" },
      hasGeo ? h("a", { class: "ev-link", href: mapsUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("map-pin"), h("span", { text: ui.maps })) : null,
      hasGeo ? h("a", { class: "ev-link", href: dirUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("navigation"), h("span", { text: ui.directions })) : null,
      calendarMenu(ctx, ev)));
}

export function mount(ctx) {
  const list = visibleEvents(ctx.guest);
  if (!list.length) return;
  const sec = section("utsav", { title: ctx.content.eventsTitle });
  append(sec, h("div", { class: "event-list" }, list.map((ev, i) => card(ctx, ev, i))), venues(ctx, list));
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
        h("div", { class: "ev-links" },
          h("a", { class: "ev-link", href: mapsUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("map-pin"), h("span", { text: ui.maps })),
          h("a", { class: "ev-link", href: dirUrl(v), target: "_blank", rel: "noopener" }, ctx.icon("navigation"), h("span", { text: ui.directions })))))));
}

// Cards rise in; each medallion draws itself in gold as its card enters.
function animate(ctx, sec) {
  const { gsap, below, revealOnScroll } = ctx.motion;
  revealOnScroll(sec.querySelectorAll(".event-card, .venue"), { y: 36, opacity: 0 });
  sec.querySelectorAll(".event-card").forEach((c) => {
    const icon = c.querySelector(".event-icon svg");
    if (!icon || !below(c, 0.85)) return;
    gsap.fromTo(drawTargets(icon), { drawSVG: "0%" }, {
      drawSVG: "100%", duration: 1.4, ease: "power1.inOut", stagger: 0.04,
      scrollTrigger: { trigger: c, start: "top 80%", once: true },
    });
  });
}
