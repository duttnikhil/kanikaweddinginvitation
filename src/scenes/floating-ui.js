// Floating controls: language (top-left), music (bottom-right). SPEC §7.3.
import { h } from "../core/dom.js";
import { setLang, otherLang } from "../core/i18n.js";

export function mount(ctx) {
  const ui = ctx.content.ui;
  const langBtn = h("button", { type: "button", class: "fab fab--lang", onclick: () => setLang(otherLang()) },
    ctx.icon("languages"), h("span", { text: ui.langToggle }));

  const musicIcon = h("span", { class: "fab-icon" });
  const musicLabel = h("span", { class: "sr-only" });
  const musicBtn = h("button", { type: "button", class: "fab fab--music", hidden: true }, musicIcon, musicLabel);

  const bar = h("div", { class: "floating" }, langBtn, musicBtn);
  document.body.append(bar);
  ctx.floating = { bar, langBtn, musicBtn, musicIcon, musicLabel };
}
