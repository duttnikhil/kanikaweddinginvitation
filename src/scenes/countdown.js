// Countdown to meta.mainEventId (SPEC §7.3 #5). Hidden in the post phase.
import { h } from "../core/dom.js";
import { mainEvent } from "../core/content.js";
import { countdownParts } from "../core/time.js";
import { section } from "./common.js";

const UNITS = ["days", "hours", "minutes", "seconds"];

export function mount(ctx) {
  if (ctx.phase === "post") return;
  const c = ctx.content.countdown;
  const target = mainEvent().start;
  const sec = section("countdown", { title: c.title });
  const cells = {};
  const grid = h("div", { class: "countdown-grid", role: "timer", "aria-live": "off" },
    UNITS.map((u) => {
      cells[u] = h("span", { class: "cd-digits num" });
      return h("div", { class: "cd-cell" }, cells[u], h("span", { class: "label", text: c.labels[u] }));
    }));
  const today = h("p", { class: "cd-today script", text: c.today });
  sec.append(grid, today);
  ctx.main.append(sec);

  // One span per digit so Phase 5 can roll individual digits.
  const render = () => {
    const parts = countdownParts(target);
    const done = Object.values(parts).every((v) => v === 0);
    const live = ctx.phase === "live" || done;
    grid.hidden = live;
    today.hidden = !live;
    for (const u of UNITS) {
      const str = String(parts[u]).padStart(2, "0");
      const el = cells[u];
      if (el.dataset.value === str) continue;
      const prev = el.dataset.value || "";
      el.dataset.value = str;
      if (!ctx.rollDigits?.(el, prev, str)) el.textContent = str;
    }
  };
  render();
  setInterval(render, 1000);
}
