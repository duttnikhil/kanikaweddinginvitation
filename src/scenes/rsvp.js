// RSVP form (SPEC §7.10): one block per allowed event, pax + food steppers that must sum,
// "same for all", shared arrival + message, prefill, optimistic success, error + retry.
import { h, svg, append } from "../core/dom.js";
import { bind, fill, tr } from "../core/i18n.js";
import { fmtDay, fmtDateTime } from "../core/time.js";
import { getRsvp, sendRsvp } from "../core/api.js";
import { diya } from "../fx/ornaments.js";
import { section } from "./common.js";
import { visibleEvents } from "./events.js";

const FOOD = ["veg", "jain", "nonveg"];

function stepper(label, min, max, value, onChange) {
  const out = h("output", { class: "stepper-value num", "aria-live": "polite" }, String(value));
  const st = {
    value,
    set(v) {
      st.value = Math.max(min(), Math.min(max(), v));
      out.textContent = String(st.value);
      dec.disabled = st.value <= min();
      inc.disabled = st.value >= max();
    },
  };
  const dec = h("button", { type: "button", class: "stepper-btn", i18n: { "aria-label": (l) => `${tr(label, l)} −` }, onclick: () => { st.set(st.value - 1); onChange(); } }, "−");
  const inc = h("button", { type: "button", class: "stepper-btn", i18n: { "aria-label": (l) => `${tr(label, l)} +` }, onclick: () => { st.set(st.value + 1); onChange(); } }, "+");
  st.el = h("div", { class: "stepper-row" },
    h("span", { class: "stepper-label", text: label }),
    h("div", { class: "stepper" }, dec, out, inc));
  st.set(value);
  return st;
}

function segmented(name, options, labelFor, onChange) {
  const wrap = h("div", { class: "segmented", role: "radiogroup" });
  const inputs = options.map((opt) => {
    const input = h("input", { type: "radio", name, value: opt, class: "sr-only", onchange: onChange });
    wrap.append(h("label", { class: "seg" }, input, h("span", { text: labelFor(opt) })));
    return input;
  });
  return {
    el: wrap,
    get value() { return inputs.find((i) => i.checked)?.value || ""; },
    set value(v) { inputs.forEach((i) => (i.checked = i.value === v)); },
  };
}

function eventBlock(ctx, ev, maxPax, onChange) {
  const r = ctx.content.rsvp;
  const detail = h("div", { class: "rsvp-detail", hidden: true });
  const mismatch = h("p", { class: "rsvp-mismatch", role: "alert", hidden: true });
  const b = { ev };
  const sync = () => {
    const st = b.status.value;
    detail.hidden = !(st === "yes" || st === "maybe");
    const sum = FOOD.reduce((s, f) => s + b[f].value, 0);
    b.mismatch = st === "yes" && sum !== b.pax.value;
    mismatch.hidden = !b.mismatch;
    mismatch.textContent = fill(r.paxMismatch, { n: String(b.pax.value) });
    onChange();
  };
  // Pax change re-balances food so the total follows (veg absorbs the difference).
  const onPax = () => {
    let extra = FOOD.reduce((s, f) => s + b[f].value, 0) - b.pax.value;
    for (const f of ["veg", "nonveg", "jain"]) {
      const take = Math.min(extra, b[f].value);
      if (take > 0) { b[f].set(b[f].value - take); extra -= take; }
    }
    if (extra < 0) b.veg.set(b.veg.value - extra);
    sync();
  };
  ctx.onLang(() => (mismatch.textContent = fill(r.paxMismatch, { n: String(b.pax.value) })));
  b.status = segmented(`status-${ev.id}`, ["yes", "maybe", "no"], (o) => r.status[o], sync);
  b.pax = stepper(r.pax, () => 1, () => maxPax, 1, onPax);
  for (const f of FOOD) b[f] = stepper(r.food[f], () => 0, () => b.pax.value, f === "veg" ? 1 : 0, sync);
  detail.append(b.pax.el, h("div", { class: "food" }, FOOD.map((f) => b[f].el)), mismatch);
  b.el = h("fieldset", { class: "rsvp-event" },
    h("legend", { class: "rsvp-event-name" }, h("span", { text: ev.name }), h("span", { class: "label", text: (l) => fmtDay(ev.start, l) })),
    b.status.el, detail);
  b.apply = (v) => {
    b.status.value = v.status;
    b.pax.set(v.pax || 1);
    FOOD.forEach((f) => b[f].set(v[f] ?? 0));
    sync();
  };
  b.read = () => {
    const status = b.status.value;
    if (!status) return null;
    if (status === "no") return { event_id: ev.id, status, pax: 0, veg: 0, jain: 0, nonveg: 0 };
    return { event_id: ev.id, status, pax: b.pax.value, veg: b.veg.value, jain: b.jain.value, nonveg: b.nonveg.value };
  };
  return b;
}

export function mount(ctx) {
  if (ctx.phase !== "pre") return;
  const c = ctx.content;
  const r = c.rsvp;
  const deadline = c.meta.rsvpDeadline;
  const sec = section("rsvp", { title: r.title });
  append(sec, h("p", { class: "prose rsvp-sub", text: (l) => fill(r.subtitle, { date: fmtDay(deadline, l) }, l) }));
  ctx.main.append(sec);

  if (!ctx.guest) {
    append(sec, h("p", { class: "rsvp-note prose", text: r.noGuest }),
      h("a", { class: "btn btn--ghost", href: "#contacts", text: c.contacts.title }));
    return;
  }
  if (deadline && Date.now() > Date.parse(deadline)) {
    const p = c.contacts?.people?.[0];
    append(sec, h("p", { class: "rsvp-note prose", text: (l) => fill(r.closed, { date: fmtDay(deadline, l), contact: p ? `${tr(p.name, l)} (+${p.phone})` : "" }, l) }));
    return;
  }

  const blocks = [];
  const submit = h("button", { type: "submit", class: "btn rsvp-submit", disabled: true }, h("span", { text: r.submit }));
  const refresh = () => {
    submit.disabled = !blocks.some((b) => b.status.value) || blocks.some((b) => b.mismatch);
  };
  for (const ev of visibleEvents(ctx.guest)) blocks.push(eventBlock(ctx, ev, ctx.guest.maxPax, refresh));

  const same = blocks.length > 1
    ? h("button", { type: "button", class: "link-btn", text: r.sameForAll, onclick: () => {
      const v = blocks[0].read();
      if (v) blocks.slice(1).forEach((b) => b.apply(v));
    } })
    : null;

  const arrival = segmented("arrival", ["car", "train", "flight", "local"], (o) => r.arrivalModes[o], () => {});
  const arrivalAt = h("input", { type: "datetime-local", id: "rsvp-arrival-at", class: "input" });
  const message = h("textarea", { id: "rsvp-message", class: "input", rows: 3, maxlength: 500 });
  const updated = h("p", { class: "rsvp-updated soft", hidden: true });
  const error = h("div", { class: "rsvp-error", role: "alert", hidden: true },
    h("p", { text: r.error }),
    h("button", { type: "button", class: "btn btn--ghost btn--sm", text: r.retry, onclick: () => send() }));
  const success = h("div", { class: "rsvp-success", hidden: true, tabindex: "-1" },
    svg(diya({ lit: false })), h("p", { class: "script rsvp-success-text", text: r.success }));

  const form = h("form", { class: "rsvp-form", novalidate: true },
    blocks.map((b, i) => (i === 0 ? [b.el, same] : b.el)),
    h("fieldset", { class: "rsvp-shared" },
      h("legend", { class: "rsvp-event-name", text: r.arrival }),
      arrival.el,
      h("label", { class: "field", for: "rsvp-arrival-at" }, h("span", { class: "label", text: r.arrivalAt }), arrivalAt),
      h("label", { class: "field", for: "rsvp-message" }, h("span", { class: "label", text: r.message }), message)),
    error, submit);
  append(sec, updated, success, form);

  const showUpdated = (iso) => {
    if (!iso) return;
    updated.hidden = false;
    bind(updated, (l) => fill(r.updated, { date: fmtDateTime(iso, l) }, l));
  };

  let payload = null;
  async function send() {
    error.hidden = true;
    success.hidden = false;
    success.querySelector(".diya").classList.add("is-lit");
    ctx.celebrate?.(success);
    submit.disabled = true;
    try {
      await sendRsvp(payload);
      showUpdated(new Date().toISOString());
    } catch (e) {
      console.warn("[rsvp]", e.code || e);
      success.hidden = true;
      error.hidden = false;
    } finally {
      refresh();
    }
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    refresh();
    if (submit.disabled) return;
    payload = {
      g: ctx.guest.id,
      responses: blocks.map((b) => b.read()).filter(Boolean),
      arrival: { mode: arrival.value, at: arrivalAt.value },
      message: message.value.trim().slice(0, 500),
    };
    send();
  });

  // Prefill from a previous reply.
  getRsvp(ctx.guest.id).then((data) => {
    if (!data) return;
    for (const resp of data.responses || []) blocks.find((b) => b.ev.id === resp.event_id)?.apply(resp);
    arrival.value = data.arrival?.mode || "";
    arrivalAt.value = data.arrival?.at || "";
    message.value = data.message || "";
    showUpdated(data.updated_at);
    refresh();
  }).catch(() => {});
}
