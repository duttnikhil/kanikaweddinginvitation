// IST date helpers, phase detection, countdown math (SPEC §7.16).
import { DEV } from "./content.js";

const TZ = "Asia/Kolkata";
const HOUR = 3600e3;
const loc = (l) => (l === "hi" ? "hi-IN" : "en-IN");
const fmt = (l, opts) => new Intl.DateTimeFormat(loc(l), { timeZone: TZ, ...opts });

// "शनिवार, 12 दिसंबर" / "Saturday, 12 December"
export const fmtDate = (iso, l) => fmt(l, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
// "30 नवंबर 2026" / "30 November 2026"
export const fmtDay = (iso, l) => fmt(l, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

// "रात 9 बजे" / "9:00 PM"
export function fmtTime(iso, l) {
  const d = new Date(iso);
  if (l === "hi") {
    const s = fmt(l, { hour: "numeric", minute: "2-digit", hour12: true, dayPeriod: "short" }).format(d);
    return `${s.replace(/:00\b/, "")} बजे`;
  }
  return fmt(l, { hour: "numeric", minute: "2-digit", hour12: true }).format(d).toUpperCase();
}

export const fmtDateTime = (iso, l) => fmt(l, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

// pre | live | post. live = 2h before first start .. 2h after last end.
export function phaseAt(events, t = Date.now()) {
  const start = Math.min(...events.map((e) => Date.parse(e.start))) - 2 * HOUR;
  const end = Math.max(...events.map((e) => Date.parse(e.end || e.start))) + 2 * HOUR;
  return t < start ? "pre" : t <= end ? "live" : "post";
}

// ?phase= override only in dev or with ?preview=1
export function resolvePhase(events, params) {
  const o = params.get("phase");
  if ((DEV || params.get("preview") === "1") && ["pre", "live", "post"].includes(o)) return o;
  return phaseAt(events);
}

export function countdownParts(targetIso, t = Date.now()) {
  let s = Math.max(0, Math.floor((Date.parse(targetIso) - t) / 1000));
  const days = Math.floor(s / 86400);
  s -= days * 86400;
  const hours = Math.floor(s / 3600);
  s -= hours * 3600;
  const minutes = Math.floor(s / 60);
  return { days, hours, minutes, seconds: s - minutes * 60 };
}

// Event running now, else the next one starting today (IST)
export function currentOrNext(events, t = Date.now()) {
  const running = events.find((e) => Date.parse(e.start) <= t && t <= Date.parse(e.end || e.start));
  if (running) return { event: running, now: true };
  const today = fmt("en", { dateStyle: "short" }).format(new Date(t));
  const next = events.find((e) => Date.parse(e.start) > t && fmt("en", { dateStyle: "short" }).format(new Date(e.start)) === today);
  return next ? { event: next, now: false } : null;
}
