// Hero: invocation, Ganesh art, guest greeting, couple names, date (SPEC §7.3 #1).
// In the post phase this becomes the thank-you hero (SPEC §7.16).
import { h, svg } from "../core/dom.js";
import { ownerSvg, photo, picture } from "../core/assets.js";
import { mandala } from "../fx/mandala.js";
import { toran } from "../fx/ornaments.js";

export function ganeshArt() {
  const line = ownerSvg("ganesh-line");
  const wrap = h("div", { class: "ganesh", "aria-hidden": "true" });
  if (line) {
    wrap.append(svg(line));
    wrap.firstElementChild.classList.add("ganesh-line");
    const fillArt = ownerSvg("ganesh-fill");
    if (fillArt) {
      const f = svg(fillArt);
      f.classList.add("ganesh-fill");
      wrap.append(f);
    }
  } else {
    wrap.append(svg(mandala(108)));
    wrap.firstElementChild.classList.add("ganesh-line", "is-fallback");
  }
  return wrap;
}

function greeting(c, guest) {
  if (!guest) return h("p", { class: "greeting", text: c.hero.genericGreeting });
  const line = (l) => {
    const s = guest.salutation[l];
    return `${c.hero.greetingPrefix[l]} ${s ? `${s} ` : ""}${guest.name[l]}`.replace(/\s+/g, " ");
  };
  return h("div", { class: "greeting" },
    h("p", { class: "greeting-name", text: line }),
    h("p", { class: "greeting-sub", text: c.hero.genericGreeting }));
}

export function mount(ctx) {
  const { content: c, guest } = ctx;
  if (ctx.phase === "post") return postHero(ctx);
  const { groom, bride } = c.couple;
  const sec = h("section", { id: "hero", class: "section hero", "aria-labelledby": "hero-names" },
    h("div", { class: "hero-toran", "aria-hidden": "true", html: ownerSvg("toran") || toran() }),
    h("p", { class: "invocation", text: c.invocation.line }),
    ganeshArt(),
    greeting(c, guest),
    h("h1", { id: "hero-names", class: "couple-names script" },
      h("span", { class: "name", text: groom.name }),
      h("span", { class: "joiner", text: c.hero.joiner }),
      h("span", { class: "name", text: bride.name })),
    h("p", { class: "hero-date" },
      h("span", { text: c.meta.dateRange }), h("span", { class: "dot", "aria-hidden": "true" }, "·"), h("span", { text: c.meta.city })),
    h("a", { href: "#amantran", class: "scroll-hint" },
      h("span", { text: c.hero.scrollHint }), ctx.icon("chevron-down")));
  ctx.main.append(sec);
  return sec;
}

function postHero(ctx) {
  const { content: c } = ctx;
  const pw = c.postWedding || {};
  const first = c.gallery?.photos?.map((p) => ({ p: photo(p.file), alt: p.alt })).find((x) => x.p);
  const sec = h("section", { id: "hero", class: "section hero hero--post" },
    h("div", { class: "hero-toran", "aria-hidden": "true", html: ownerSvg("toran") || toran() }),
    h("p", { class: "invocation", text: c.invocation.line }),
    first ? picture(first.p, first.alt, { eager: true, cls: "post-photo" }) : ganeshArt(),
    h("h1", { class: "script", text: pw.title }),
    h("p", { class: "prose", text: pw.text }),
    pw.albumUrl ? h("a", { class: "btn", href: pw.albumUrl, target: "_blank", rel: "noopener" }, ctx.icon("image"), h("span", { text: pw.albumButton })) : null);
  ctx.main.append(sec);
  return sec;
}
