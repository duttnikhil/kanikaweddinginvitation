// Shared bits for section modules.
import { h, svg, append } from "../core/dom.js";
import { tr } from "../core/i18n.js";
import { divider } from "../fx/ornaments.js";

// <section class="section"> with the ornament + h2 heading (SPEC §7.3 headings).
export function section(id, { title, tone } = {}) {
  const sec = h("section", { id, class: `section${tone ? ` section--${tone}` : ""}` });
  if (title) {
    sec.setAttribute("aria-labelledby", `${id}-title`);
    append(sec, 
      h("header", { class: "sec-head" },
        svg(divider()),
        h("h2", { id: `${id}-title`, text: title, "data-reveal": "" })));
  }
  return sec;
}

// Copy button: clipboard API with textarea fallback; label flips to "Copied" briefly.
export function copyButton(ctx, getText, label, cls = "btn btn--ghost btn--sm") {
  const text = h("span", { text: label });
  const btn = h("button", { type: "button", class: cls }, ctx.icon("copy"), text);
  btn.addEventListener("click", async () => {
    const value = typeof getText === "function" ? getText() : getText;
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      const ta = h("textarea", { readonly: true, "aria-hidden": "true", style: "position:fixed;opacity:0" });
      ta.value = value;
      document.body.append(ta);
      ta.select();
      try { ok = document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    if (ok) {
      text.textContent = tr(ctx.content.ui.copied);
      setTimeout(() => (text.textContent = tr(label)), 1800);
    }
  });
  return btn;
}

// wa.me link, digits only
export const waLink = (phone, text = "") =>
  `https://wa.me/${String(phone).replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
