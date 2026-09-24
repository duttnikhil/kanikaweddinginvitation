// Resolves the current guest (SPEC §4.3). Prod: JSON injected by the edge middleware.
// Dev: ?g= looked up in content/dev-guests.json.
import { warn } from "./content.js";

export const params = new URLSearchParams(location.search);

function normalise(id, raw) {
  if (!raw || typeof raw !== "object" || !raw.n) return null;
  const events = Array.isArray(raw.e) ? raw.e.map(String) : ["ALL"];
  return {
    id: String(id),
    name: { en: String(raw.n.en || ""), hi: String(raw.n.hi || raw.n.en || "") },
    salutation: { en: String(raw.s?.en || ""), hi: String(raw.s?.hi || "") },
    events,
    maxPax: Math.max(1, Math.min(50, parseInt(raw.p, 10) || 1)),
    lang: raw.l === "en" ? "en" : raw.l === "hi" ? "hi" : null,
    allows(eventId) {
      return events.includes("ALL") || events.includes(eventId);
    },
  };
}

export async function resolveGuest() {
  const tag = document.getElementById("guest-data");
  if (tag) {
    try {
      const data = JSON.parse(tag.textContent);
      if (data && data.id) return normalise(data.id, data);
    } catch {
      warn("guest-data JSON invalid");
    }
    return null;
  }
  if (import.meta.env.DEV) {
    const id = params.get("g");
    if (!id) return null;
    const { default: map } = await import("../../content/dev-guests.json");
    if (!Object.prototype.hasOwnProperty.call(map, id) || id.startsWith("_")) {
      warn("unknown dev guest", id);
      return null;
    }
    return normalise(id, map[id]);
  }
  return null;
}

