// Travel & stay (SPEC §7.3 #13). Optional block.
import { h, append } from "../core/dom.js";
import { enabled } from "../core/content.js";
import { section } from "./common.js";

export function mount(ctx) {
  const t = ctx.content.travel;
  if (!enabled(t)) return;
  const sec = section("travel", { title: t.title });
  append(sec, 
    h("ul", { class: "travel-list" }, (t.items || []).map((it) =>
      h("li", { class: "travel-item", "data-reveal": "" },
        ctx.icon(it.icon === "plane" ? "plane" : it.icon === "train" ? "train" : "map-pin", "ic travel-ic"),
        h("div", {}, h("h3", { text: it.title }), h("p", { class: "soft", text: it.text }))))),
    t.stay?.length ? h("div", { class: "stay", "data-reveal": "" },
      h("h3", { class: "stay-title", text: t.stayTitle }),
      h("ul", {}, t.stay.map((s) => h("li", { class: "travel-item" },
        ctx.icon("hotel", "ic travel-ic"),
        h("div", {},
          s.url ? h("a", { href: s.url, target: "_blank", rel: "noopener", class: "venue-name", text: s.name }) : h("p", { class: "venue-name", text: s.name }),
          h("p", { class: "soft", text: s.text })))))) : null,
    t.pickup ? h("p", { class: "travel-pickup prose", text: t.pickup, "data-reveal": "" }) : null);
  ctx.main.append(sec);
}
