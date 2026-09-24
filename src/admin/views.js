// Admin tab views. All values from the Sheet go in via textContent (h() children / text).
import { h } from "../core/dom.js";

const eventName = (wedding, id) => wedding.events.find((e) => e.id === id)?.name.en || id;
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "0%");
const when = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};
const siteUrl = (wedding) => wedding.meta.siteUrl.replace(/\/$/, "");
const inviteLink = (wedding, id) => `${siteUrl(wedding)}/?g=${encodeURIComponent(id)}`;
const table = (head, rows) =>
  h("div", { class: "a-scroll" }, h("table", { class: "a-table" },
    h("thead", {}, h("tr", {}, head.map((c) => h("th", { scope: "col" }, c)))),
    h("tbody", {}, rows)));

export function renderSummary(body, { T, wedding, state }) {
  const s = state.summary;
  if (!s) return;
  const S = T.summary;
  const o = s.overall;
  body.append(
    h("h2", {}, S.overall),
    h("div", { class: "a-stats" },
      [[S.invited, o.invited], [S.sent, `${o.sent} (${pct(o.sent, o.invited)})`], [S.opened, `${o.opened} (${pct(o.opened, o.invited)})`], [S.replied, `${o.replied} (${pct(o.replied, o.invited)})`]]
        .map(([k, v]) => h("div", { class: "a-stat" }, h("span", { class: "a-stat-v" }, String(v)), h("span", { class: "label" }, k)))),
    h("h2", {}, S.perEvent),
    table([S.event, S.invited, S.yesFamilies, S.yesPax, S.maybePax, S.no, S.notReplied, S.food],
      wedding.events.map((ev) => {
        const e = s.events[ev.id] || {};
        return h("tr", {}, h("th", { scope: "row" }, ev.name.en),
          [e.invited, e.yesFamilies, e.yesPax, e.maybePax, e.no, e.notReplied].map((v) => h("td", { class: "num" }, String(v ?? 0))),
          h("td", { class: "num" }, `${e.veg ?? 0} / ${e.jain ?? 0} / ${e.nonveg ?? 0}`));
      })));

  // Arrivals grouped by date, then mode
  const groups = {};
  for (const a of s.arrivals || []) {
    const day = /^\d{4}-\d{2}-\d{2}/.test(a.at) ? new Date(a.at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : S.noDate;
    ((groups[day] ||= {})[a.mode] ||= []).push(a);
  }
  body.append(h("h2", {}, S.arrivals));
  if (!Object.keys(groups).length) body.append(h("p", { class: "a-note" }, S.noArrivals));
  for (const [day, modes] of Object.entries(groups)) {
    body.append(h("h3", {}, day));
    for (const [mode, list] of Object.entries(modes)) {
      body.append(h("p", { class: "a-arrival" }, h("strong", {}, `${mode} (${list.reduce((n, a) => n + (a.pax || 0), 0)})`), ": ",
        list.map((a) => `${a.name}${a.at ? ` ${a.at.slice(11, 16)}` : ""} ×${a.pax}`).join(", ")));
    }
  }
}

const FILTERS = {
  all: () => true,
  notSent: (g) => !g.invite_sent_at,
  notOpened: (g) => !g.open_count,
  notReplied: (g) => !g.rsvp.length,
  ladke: (g) => g.side === "ladke",
  ladki: (g) => g.side === "ladki",
};

function waMessage(wedding, g) {
  const l = g.lang === "en" ? "en" : "hi";
  const name = (l === "hi" ? g.name_hi : g.name_en) || g.name_en || g.name_hi;
  return wedding.share.whatsappTemplate[l].replace("{name}", name).replace("{link}", inviteLink(wedding, g.guest_id));
}

export function renderGuests(body, ctx) {
  const { T, wedding, state } = ctx;
  const G = T.guests;
  state.filter ||= "all";
  state.q ||= "";
  const search = h("input", { type: "search", class: "input", placeholder: G.search, "aria-label": G.search, value: state.q });
  const chips = h("div", { class: "a-chips" }, Object.entries(G.filters).map(([id, label]) =>
    h("button", { type: "button", class: "a-chip", "aria-pressed": String(state.filter === id), onclick: () => { state.filter = id; draw(); } }, label)));
  const count = h("p", { class: "a-note" });
  const holder = h("div");
  body.append(search, chips, count, holder);
  search.addEventListener("input", () => { state.q = search.value; draw(); });

  function row(g) {
    const markBtn = h("button", { type: "button", class: "btn btn--sm btn--ghost", disabled: !!g.invite_sent_at }, g.invite_sent_at ? G.sent : G.markSent);
    markBtn.addEventListener("click", async () => {
      markBtn.disabled = true;
      try {
        await ctx.call("markSent", { g: g.guest_id });
        g.invite_sent_at = new Date().toISOString();
        markBtn.textContent = G.sent;
      } catch {
        markBtn.disabled = false;
      }
    });
    const copyBtn = h("button", { type: "button", class: "btn btn--sm btn--ghost" }, G.copyLink);
    copyBtn.addEventListener("click", async () => {
      const link = inviteLink(wedding, g.guest_id);
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        const ta = h("textarea", { style: "position:fixed;opacity:0" });
        ta.value = link;
        document.body.append(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      copyBtn.textContent = G.copied;
    });
    const rsvp = g.rsvp.map((r) => `${eventName(wedding, r.event_id)}: ${r.status}${r.status !== "no" ? ` ${r.pax}` : ""}`).join(" · ");
    return h("tr", {},
      h("th", { scope: "row" }, h("div", {}, g.name_en), h("div", { class: "a-sub" }, g.name_hi), h("div", { class: "a-sub num" }, g.phone)),
      h("td", {}, h("div", { class: "a-actions" },
        g.phone ? h("a", { class: "btn btn--sm", href: `https://wa.me/${g.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage(wedding, g))}`, target: "_blank", rel: "noopener" }, G.whatsapp) : null,
        copyBtn,
        h("a", { class: "btn btn--sm btn--ghost", href: `/?g=${encodeURIComponent(g.guest_id)}&preview=1`, target: "_blank", rel: "noopener" }, G.preview),
        markBtn)),
      h("td", {}, g.side),
      h("td", {}, g.allowed_events.includes("ALL") ? "ALL" : g.allowed_events.map((id) => eventName(wedding, id)).join(", ")),
      h("td", {}, g.open_count ? `✓ ${when(g.last_opened_at)} (${g.open_count})` : G.never),
      h("td", {}, rsvp || G.never),
      h("td", {}, g.notes));
  }

  function draw() {
    chips.querySelectorAll(".a-chip").forEach((c, i) => c.setAttribute("aria-pressed", String(Object.keys(G.filters)[i] === state.filter)));
    const q = state.q.trim().toLowerCase();
    const list = state.guests.filter(FILTERS[state.filter]).filter((g) =>
      !q || `${g.name_en} ${g.name_hi} ${g.phone} ${g.notes}`.toLowerCase().includes(q));
    count.textContent = G.count.replace("{n}", list.length).replace("{total}", state.guests.length);
    holder.replaceChildren(table([G.name, G.actions, G.side, G.events, G.opened, G.rsvp, G.notes], list.map(row)));
  }
  draw();
}

export function renderWishes(body, { T, state, call }) {
  const W = T.wishes;
  if (!state.wishes.length) return body.append(h("p", { class: "a-note" }, W.empty));
  body.append(h("ul", { class: "a-wishes" }, state.wishes.map((w) => {
    const status = h("span", { class: `a-badge${w.approved ? " is-on" : ""}` }, w.approved ? W.approved : W.pending);
    const btn = h("button", { type: "button", class: "btn btn--sm" + (w.approved ? " btn--ghost" : "") }, w.approved ? W.hide : W.approve);
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await call("approveWish", { wish_id: w.wish_id, approved: !w.approved });
        w.approved = !w.approved;
        status.textContent = w.approved ? W.approved : W.pending;
        status.classList.toggle("is-on", w.approved);
        btn.textContent = w.approved ? W.hide : W.approve;
        btn.classList.toggle("btn--ghost", w.approved);
      } finally {
        btn.disabled = false;
      }
    });
    return h("li", { class: "a-wish" },
      h("p", {}, w.message),
      h("p", { class: "a-sub" }, `${w.name} · ${when(w.ts)}`),
      h("div", { class: "a-actions" }, status, btn));
  })));
}

// Spreadsheet-safe CSV cell (quotes + formula guard).
const cell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function download(name, href) {
  const a = h("a", { href, download: name });
  document.body.append(a);
  a.click();
  a.remove();
}

export function renderTools(body, { T, wedding, state }) {
  const X = T.tools;
  const siteCanvas = h("canvas", { class: "a-qr" });
  const upiCanvas = h("canvas", { class: "a-qr" });
  const s = wedding.shagun;
  const upi = s?.vpa ? `upi://pay?pa=${s.vpa}&pn=${encodeURIComponent(s.payeeName || "")}&cu=INR&tn=${encodeURIComponent(s.note || "")}` : null;
  body.append(
    h("h2", {}, X.siteQr),
    h("p", { class: "a-sub" }, siteUrl(wedding)),
    siteCanvas,
    h("button", { type: "button", class: "btn", onclick: () => download("site-qr.png", siteCanvas.toDataURL("image/png")) }, X.download),
    upi ? [h("h2", {}, X.upiQr), h("p", { class: "a-sub" }, s.vpa), upiCanvas,
      h("button", { type: "button", class: "btn", onclick: () => download("upi-qr.png", upiCanvas.toDataURL("image/png")) }, X.download)] : null,
    h("h2", {}, X.csv),
    h("button", { type: "button", class: "btn", onclick: () => {
      const head = ["guest_id", "name_en", "name_hi", "side", "phone", "event", "status", "pax", "veg", "jain", "nonveg", "arrival_mode", "arrival_at", "message", "updated"];
      const rows = state.guests.flatMap((g) => g.rsvp.map((r) => [g.guest_id, g.name_en, g.name_hi, g.side, g.phone, r.event_id, r.status, r.pax, r.veg, r.jain, r.nonveg, r.arrival_mode, r.arrival_at, r.message, r.timestamp]));
      const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
      download("rsvp.csv", URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })));
    } }, X.downloadCsv));
  import("qrcode").then(({ default: QR }) => {
    QR.toCanvas(siteCanvas, siteUrl(wedding), { width: 512, margin: 2 });
    if (upi) QR.toCanvas(upiCanvas, upi, { width: 512, margin: 2 });
  });
}
