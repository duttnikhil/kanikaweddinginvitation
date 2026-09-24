// RSVP (SPEC §7.10). Phase 1: static heading; the form arrives in Phase 3.
import { h } from "../core/dom.js";
import { fill } from "../core/i18n.js";
import { fmtDay } from "../core/time.js";
import { section } from "./common.js";

export function mount(ctx) {
  if (ctx.phase !== "pre") return;
  const r = ctx.content.rsvp;
  const sec = section("rsvp", { title: r.title });
  sec.append(h("p", { class: "prose", text: (l) => fill(r.subtitle, { date: fmtDay(ctx.content.meta.rsvpDeadline, l) }, l) }));
  ctx.main.append(sec);
}
