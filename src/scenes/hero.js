// Hero / cover page (SPEC §7.3 #1, restyled to the client's page-1 sample).
// In the post phase this becomes the thank-you hero (SPEC §7.16).
import { h, svg } from "../core/dom.js";
import { ownerSvg, photo, picture, art } from "../core/assets.js";
import { mandala } from "../fx/mandala.js";
import { toran, wreath, archFrame, sceneSvg } from "../fx/ornaments.js";
import { mountFrameAnim } from "../fx/frame-anim.js";

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

// Hero = the invitation card that comes out of the envelope (SPEC §7.4/§9, client reference):
// arch frame, invocation, laurel monogram, names (bride first), subtitle, date ticket,
// greeting, watercolor scene at the bottom.
export function mount(ctx) {
  const { content: c, guest } = ctx;
  if (ctx.phase === "post") return postHero(ctx);
  const { bride, groom } = c.couple;
  const hero = c.hero;
  const t = hero.ticket;
  const archImg = art("arch-frame");
  // Owner's full card artwork (arch, border, procession) as a stretchable frame (CSS border-image).
  const frame = art("hero-frame");
  const scene = art("envelope-scene");
  const corner = (n, cls) => { const a = art(`corner-${n}`); return a ? picture(a, "", { cls: `hero-corner ${cls}`, sizes: "40vw" }) : null; };
  const sceneFallback = svg(sceneSvg());
  sceneFallback.setAttribute("preserveAspectRatio", "xMidYMid slice"); // wide crop keeps the palace
  const wreathSvg = svg(wreath(`${bride.initial} | ${groom.initial}`));
  wreathSvg.classList.add("ganesh-line", "is-fallback"); // drawn by the gate intro
  const sec = h("section", { id: "hero", class: `section hero cover${frame ? " hero--framed" : ""}`, "aria-labelledby": "hero-names" },
    frame ? null : h("div", { class: "hero-arch", "aria-hidden": "true" }, archImg ? picture(archImg, "", { eager: true, sizes: "(min-width: 600px) 560px, 100vw" }) : svg(archFrame())),
    frame ? null : [corner(1, "hero-corner--tl"), corner(2, "hero-corner--br")],
    h("p", { class: "hero-invocation", text: c.amantran?.invocation || c.invocation.line }),
    frame ? null : h("div", { class: "hero-wreath", "aria-hidden": "true" }, wreathSvg), // the artwork's arch + bells take its place
    h("h1", { id: "hero-names", class: "couple-names" },
      h("span", { class: "name", text: bride.name }),
      h("span", { class: "joiner", text: hero.joiner }),
      h("span", { class: "name", text: groom.name })),
    hero.subtitle ? h("p", { class: "hero-subtitle" }, `${hero.subtitle.hi} · ${hero.subtitle.en}`) : null,
    t ? h("div", { class: "ticket" },
      h("div", { class: "ticket-left" }, h("span", { class: "ticket-date", text: t.label })),
      h("div", { class: "ticket-perf", "aria-hidden": "true" }),
      h("div", { class: "ticket-right" }, h("span", { class: "ticket-day", text: t.note }), h("span", { class: "ticket-city", text: t.city }))) : null,
    greeting(c, guest),
    frame ? null : h("div", { class: "hero-scene", "aria-hidden": "true" }, scene ? picture(scene, "", { sizes: "(min-width: 600px) 560px, 100vw" }) : sceneFallback),
    h("a", { href: "#welcome", class: "scroll-hint" }, h("span", { text: c.hero.scrollHint }), ctx.icon("chevron-down")));
  if (frame) {
    sec.style.setProperty("--frame", `url("/img/${frame.key}-${frame.w}.webp")`);
    mountFrameAnim(sec);
  }
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
