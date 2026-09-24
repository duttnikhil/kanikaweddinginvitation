// Family contact people (public by design): phone as text + Copy + WhatsApp + Call (SPEC §7.3 #14)
import { h, append } from "../core/dom.js";
import { section, copyButton, waLink } from "./common.js";

const pretty = (p) => {
  const d = String(p).replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`;
};

export function mount(ctx) {
  const c = ctx.content.contacts;
  if (!c?.people?.length) return;
  const ui = ctx.content.ui;
  const sec = section("contacts", { title: c.title });
  append(sec, h("ul", { class: "contact-list" }, c.people.map((p) =>
    h("li", { class: "contact", "data-reveal": "" },
      h("h3", { text: p.name }),
      h("p", { class: "label", text: p.relation }),
      h("p", { class: "contact-phone num", text: pretty(p.phone) }),
      h("div", { class: "contact-actions" },
        h("a", { class: "btn btn--sm", href: `tel:+${String(p.phone).replace(/\D/g, "")}` }, ctx.icon("phone"), h("span", { text: ui.call })),
        h("a", { class: "btn btn--ghost btn--sm", href: waLink(p.phone), target: "_blank", rel: "noopener" }, ctx.icon("message-circle"), h("span", { text: ui.whatsapp })),
        copyButton(ctx, `+${String(p.phone).replace(/\D/g, "")}`, ui.copy))))));
  ctx.main.append(sec);
}
