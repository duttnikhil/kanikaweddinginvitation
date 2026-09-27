// Welcome (client's page-1 text): Om line, Ganesh blessing, welcome, names, tagline.
import { h } from "../core/dom.js";
import { mandala } from "../fx/mandala.js";

export function mount(ctx) {
  const { content: c } = ctx;
  const cv = c.cover;
  const { bride, groom } = c.couple;
  if (!cv) return;
  const sec = h("section", { id: "welcome", class: "section welcome", "aria-labelledby": "welcome-names" },
    h("div", { class: "welcome-mark", "aria-hidden": "true", html: mandala(1108, { width: 1 }) }),
    h("p", { class: "welcome-om", text: c.invocation.line, "data-reveal": "" }),
    h("p", { class: "welcome-bless prose", text: cv.blessing, "data-reveal": "" }),
    h("p", { class: "welcome-title", text: cv.welcome, "data-reveal": "" }),
    h("p", { class: "welcome-to prose", text: cv.toWedding, "data-reveal": "" }),
    h("h2", { id: "welcome-names", class: "welcome-names script", "data-reveal": "" },
      h("span", { text: bride.name }), " ", h("span", { class: "amp", text: c.hero.joiner }), " ", h("span", { text: groom.name })),
    h("p", { class: "welcome-tagline prose", text: cv.tagline, "data-reveal": "" }));
  ctx.main.append(sec);
}
