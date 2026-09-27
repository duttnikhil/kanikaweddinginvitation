// Page 2 (client's card sample): Ganesh, invitation text, "Wedding of", bride (first) and
// groom with their families and venue, in a framed card with gold filigree corners.
import { h, svg, multiline } from "../core/dom.js";
import { ganeshSymbol, divider } from "../fx/ornaments.js";
import { corner } from "../fx/event-art.js";

function person(p) {
  return [
    p.grandparents ? h("p", { class: "card-family soft", text: p.grandparents }) : null,
    h("p", { class: "card-name script", text: p.fullName }),
    p.parents ? h("p", { class: "card-family soft", text: (l) => `(${p.parents[l]})` }) : null,
  ];
}

export function mount(ctx) {
  const { content: c } = ctx;
  const a = c.amantran;
  if (!a) return;
  const { bride, groom } = c.couple;
  const sec = h("section", { id: "amantran", class: "section card-section", "aria-labelledby": "card-weddingof" },
    h("div", { class: "card" },
      ["tl", "tr", "bl", "br"].map((c) => h("span", { class: `ev-corner-wrap ev-corner--${c}`, "aria-hidden": "true", html: corner })),
      h("p", { class: "card-invocation label", text: a.invocation }),
      h("div", { class: "card-ganesh", "aria-hidden": "true" }, svg(ganeshSymbol())),
      h("p", { class: "card-invite prose" }, multiline(a.invite)),
      h("div", { class: "card-rule" }, svg(divider()), h("p", { id: "card-weddingof", class: "card-weddingof", text: a.weddingOf })),
      person(bride),
      h("p", { class: "card-joiner", text: a.joiner }),
      person(groom),
      svg(divider()),
      a.date ? h("p", { class: "card-date", text: a.date }) : null, // no date on purpose: Save the Date reveals it
      h("p", { class: "card-venue soft", text: a.venue })));
  sec.querySelectorAll(".card > p, .card > .card-rule, .card > .card-ganesh").forEach((el) => el.setAttribute("data-reveal", ""));
  ctx.main.append(sec);
}
