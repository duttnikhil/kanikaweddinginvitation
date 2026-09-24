// Varmala (SPEC §7.9). Static: couple with garlands in hand + button; interaction in Phase 5.
import { h, svg } from "../core/dom.js";
import { ownerSvg } from "../core/assets.js";
import { varmalaCouple } from "../fx/ornaments.js";
import { section } from "./common.js";

export function mount(ctx) {
  const v = ctx.content.varmala;
  if (!v) return;
  const sec = section("varmala", { title: v.title });
  const art = svg(ownerSvg("varmala-couple") || varmalaCouple());
  art.classList.add("varmala-art");
  const label = h("span", { text: v.cta });
  const btn = h("button", { type: "button", class: "btn varmala-btn" }, label);
  const after = h("p", { class: "varmala-after script", text: v.after, hidden: true });
  sec.append(h("div", { class: "varmala-stage" }, art), after, btn);
  ctx.main.append(sec);
  ctx.varmala = { sec, art, btn, label, after };
}
