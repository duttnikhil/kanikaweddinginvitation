// "Happening now" banner under the hero in the live phase (SPEC §7.16).
import { h } from "../core/dom.js";
import { enabled } from "../core/content.js";
import { tr } from "../core/i18n.js";
import { currentOrNext } from "../core/time.js";
import { visibleEvents } from "./events.js";

export function mount(ctx) {
  if (ctx.phase !== "live") return;
  const c = ctx.content;
  const label = h("span", { class: "label live-label" });
  const text = h("span", { class: "live-text" });
  const stream = enabled(c.livestream) && c.livestream.url
    ? h("a", { class: "btn btn--sm", href: c.livestream.url, target: "_blank", rel: "noopener", text: c.livestream.label })
    : null;
  const banner = h("aside", { class: "live-banner", "aria-live": "polite" },
    h("span", { class: "live-dot", "aria-hidden": "true" }), label, text, stream);
  const render = () => {
    const list = visibleEvents(ctx.guest);
    const hit = currentOrNext(list) || (ctx.phaseForced ? { event: list[0], now: true } : null);
    banner.hidden = !hit && !stream;
    if (!hit) return;
    label.textContent = tr(hit.now ? c.live.now : c.live.next);
    text.textContent = [tr(hit.event.name), tr(hit.event.venue?.name)].filter(Boolean).join(" · ");
  };
  render();
  ctx.onLang(render);
  setInterval(render, 60000);
  const hero = ctx.main.querySelector("#hero");
  hero ? hero.after(banner) : ctx.main.prepend(banner);
}
