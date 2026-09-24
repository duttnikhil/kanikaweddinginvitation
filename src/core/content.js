// Wedding content (imported at build) + small getters. All copy comes from wedding.json.
import wedding from "../../content/wedding.json";

export const content = wedding;
export const DEV = import.meta.env.DEV;

export function warn(...args) {
  if (DEV) console.warn("[shubh-vivah]", ...args);
}

// Optional blocks are hidden when absent or `enabled: false` (SPEC §4.1).
export function enabled(block) {
  return !!block && block.enabled !== false;
}

export const events = [...wedding.events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
export const eventById = (id) => events.find((e) => e.id === id);
export const mainEvent = () => eventById(wedding.meta.mainEventId) || events[0];
