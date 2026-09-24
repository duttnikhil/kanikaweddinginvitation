// Saat phere (SPEC §7.8). Static render = agni kund + numbered vachan list.
// Phase 5 motion switches to the pinned stage (diya circling, one vachan at a time).
import { h, svg } from "../core/dom.js";
import { fill } from "../core/i18n.js";
import { ownerSvg } from "../core/assets.js";
import { agniKund, diya } from "../fx/ornaments.js";
import { section } from "./common.js";

// Ellipse ring around the kund; starts at the front (bottom) so the diya begins in view.
export const RING = "M160 232A138 52 0 1 1 160.01 232Z";

function stage() {
  const kund = (ownerSvg("agni-kund") || agniKund()).replace(/<svg\b/, '<svg x="84" y="40" width="152" height="146"');
  const lamp = diya().replace(/<svg\b/, '<svg x="-17" y="-26" width="34" height="31"');
  return svg(`<svg class="phere-stage-svg" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
<path id="phere-ring" d="${RING}" fill="none" stroke="#C9A043" stroke-width="1.2" stroke-dasharray="3 6" opacity=".7"/>
${kund}<g id="phere-diya" transform="translate(160 232)">${lamp}</g></svg>`);
}

export function mount(ctx) {
  const p = ctx.content.phere;
  if (!p?.vachans?.length) return;
  const sec = section("phere", { title: p.title, tone: "dark" });
  const dots = h("div", { class: "phere-dots", "aria-hidden": "true" }, p.vachans.map(() => h("span", { class: "phere-dot" })));
  sec.append(
    h("p", { class: "phere-intro prose", text: p.intro }),
    h("div", { class: "phere-pin" },
      h("div", { class: "phere-stage", "aria-hidden": "true" }, stage()),
      dots,
      h("div", { class: "phere-now", "aria-hidden": "true" },
        h("p", { class: "phere-counter label" }),
        h("div", { class: "phere-vachans" },
          p.vachans.map((v) => h("p", { class: "phere-vachan prose", text: v })))),
      h("ol", { class: "phere-list" },
        p.vachans.map((v, i) => h("li", { class: "prose" },
          h("span", { class: "phere-num label", text: (l) => fill(p.counter, { n: String(i + 1) }, l) }),
          h("span", { text: v })))),
      h("p", { class: "phere-outro script", text: p.outro })));
  ctx.main.append(sec);
}
