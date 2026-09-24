// Blessings wall (SPEC §7.3 #12). Phase 1: static heading; form + wall in Phase 3.
import { h } from "../core/dom.js";
import { section } from "./common.js";

export function mount(ctx) {
  const w = ctx.content.wishes;
  if (!w) return;
  const sec = section("aashirwad", { title: w.title });
  sec.append(h("p", { class: "prose soft", text: w.empty }));
  ctx.main.append(sec);
}
