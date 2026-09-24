// Closing: presence line, darshanabhilashi, monogram (SPEC §7.3 #15). Fireworks in Phase 5.
import { h, svg } from "../core/dom.js";
import { mandala } from "../fx/mandala.js";
import { section } from "./common.js";

export function mount(ctx) {
  const c = ctx.content.closing;
  const { groom, bride } = ctx.content.couple;
  if (!c) return;
  const sec = section("closing", { tone: "dark" });
  sec.append(
    h("canvas", { class: "fireworks", "aria-hidden": "true" }),
    h("p", { class: "closing-line script", text: c.line, "data-reveal": "" }),
    h("div", { class: "monogram", "aria-hidden": "true" },
      svg(mandala(2026, { width: 1 })),
      h("span", { class: "monogram-letters" }, groom.initial, h("span", { class: "amp" }, "·"), bride.initial)),
    c.darshan ? h("div", { class: "darshan", "data-reveal": "" },
      h("h2", { class: "darshan-title", text: c.darshanTitle }),
      h("p", { class: "prose", text: c.darshan })) : null,
    c.kidsLine ? h("p", { class: "kids-line prose", text: c.kidsLine, "data-reveal": "" }) : null);
  ctx.main.append(sec);
}
