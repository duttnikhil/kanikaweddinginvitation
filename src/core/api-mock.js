// Dev/offline stand-in for the Apps Script API (only loaded when VITE_API_URL is empty).
// Mirrors Code.gs validation closely enough to test the UI. State lives in sessionStorage.
import devGuests from "../../content/dev-guests.json";

const KEY = "mock-api";
const load = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; }
};
const state = load() || { rsvp: {}, wishes: [], opens: {}, sent: {} };
const save = () => {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
};
const ok = (data = {}) => ({ ok: true, data });
const err = (error) => ({ ok: false, error });
const guest = (g) => (g && !g.startsWith("_") && devGuests[g]) || null;
const allows = (gu, ev) => gu.e.includes("ALL") || gu.e.includes(ev);

console.info("[api] VITE_API_URL is empty: using the in-memory mock API");

function handle(method, action, p) {
  const gu = guest(p.g);
  switch (`${method} ${action}`) {
    case "GET wishes":
      return ok(state.wishes.filter((w) => w.approved).slice().reverse().slice(0, 60)
        .map(({ name, message, ts }) => ({ name, message, ts })));
    case "GET rsvp":
      if (!gu) return err("unknown_guest");
      return ok(state.rsvp[p.g] || null);
    case "POST rsvp": {
      if (!gu) return err("unknown_guest");
      for (const r of p.responses || []) {
        if (!allows(gu, r.event_id)) return err("event_not_allowed");
        if (r.status !== "no" && (r.pax < 1 || r.pax > gu.p)) return err("bad_pax");
        if (r.status === "yes" && r.veg + r.jain + r.nonveg !== r.pax) return err("bad_pax");
      }
      state.rsvp[p.g] = { responses: p.responses, arrival: p.arrival, message: p.message, updated_at: new Date().toISOString() };
      save();
      return ok({ saved: p.responses.length });
    }
    case "POST wish": {
      if (!gu) return err("unknown_guest");
      if (state.wishes.filter((w) => w.g === p.g).length >= 3) return err("too_many");
      if ((p.message || "").length > 500 || (p.name || "").length > 60) return err("too_long");
      // Auto-approve in the mock so the wall can be seen working.
      state.wishes.push({ wish_id: Math.random().toString(36).slice(2, 12), g: p.g, name: p.name, message: p.message, ts: new Date().toISOString(), approved: true });
      save();
      return ok({ pending: true });
    }
    case "POST open":
      if (gu) state.opens[p.g] = (state.opens[p.g] || 0) + 1;
      save();
      return ok();
    default:
      if (action.startsWith("admin.")) return adminMock(action, p);
      return err("bad_action");
  }
}

function adminMock(action, p) {
  if (!p.password) return err("forbidden");
  const ids = Object.keys(devGuests).filter((k) => !k.startsWith("_"));
  const guests = ids.map((id, i) => ({
    guest_id: id, name_en: devGuests[id].n.en, name_hi: devGuests[id].n.hi, side: ["ladke", "ladki", "common"][i % 3],
    phone: `9198000000${10 + i}`, allowed_events: devGuests[id].e, max_pax: devGuests[id].p, lang: devGuests[id].l,
    invite_sent_at: state.sent[id] || "", first_opened_at: state.opens[id] ? new Date().toISOString() : "",
    last_opened_at: state.opens[id] ? new Date().toISOString() : "", open_count: state.opens[id] || 0, notes: "",
    rsvp: (state.rsvp[id]?.responses || []).map((r) => ({ ...r, arrival_mode: state.rsvp[id].arrival?.mode || "", arrival_at: state.rsvp[id].arrival?.at || "", message: state.rsvp[id].message || "", timestamp: state.rsvp[id].updated_at })),
  }));
  if (action === "admin.guests") return ok({ guests, wishes: state.wishes.slice().reverse().map((w) => ({ ...w, guest_id: w.g })) });
  if (action === "admin.markSent") { state.sent[p.g] = new Date().toISOString(); save(); return ok(); }
  if (action === "admin.approveWish") {
    const w = state.wishes.find((x) => x.wish_id === p.wish_id);
    if (w) w.approved = p.approved === true;
    save();
    return ok();
  }
  if (action === "admin.summary") {
    const events = {};
    for (const ev of p.events || []) {
      const e = { invited: 0, yesFamilies: 0, yesPax: 0, maybePax: 0, no: 0, notReplied: 0, veg: 0, jain: 0, nonveg: 0 };
      for (const g of guests) {
        if (!(g.allowed_events.includes("ALL") || g.allowed_events.includes(ev))) continue;
        e.invited++;
        const r = g.rsvp.find((x) => x.event_id === ev);
        if (!r) e.notReplied++;
        else if (r.status === "yes") { e.yesFamilies++; e.yesPax += r.pax; e.veg += r.veg; e.jain += r.jain; e.nonveg += r.nonveg; }
        else if (r.status === "maybe") e.maybePax += r.pax;
        else e.no++;
      }
      events[ev] = e;
    }
    const arrivals = guests.filter((g) => g.rsvp[0]?.arrival_mode)
      .map((g) => ({ guest_id: g.guest_id, name: g.name_en, mode: g.rsvp[0].arrival_mode, at: g.rsvp[0].arrival_at, pax: Math.max(...g.rsvp.map((r) => r.pax)) }));
    return ok({ events, overall: { invited: guests.length, sent: guests.filter((g) => g.invite_sent_at).length, opened: guests.filter((g) => g.open_count).length, replied: guests.filter((g) => g.rsvp.length).length }, arrivals });
  }
  return err("bad_action");
}

// Same shape as a fetch: rejects like a network error when offline, 800 ms latency.
export default async function mockCall(method, action, payload) {
  await new Promise((r) => setTimeout(r, 800));
  if (!navigator.onLine) throw new TypeError("offline");
  return JSON.parse(JSON.stringify(handle(method, action, payload)));
}
