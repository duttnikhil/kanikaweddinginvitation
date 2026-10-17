// Hero / cover page (SPEC §7.3 #1, restyled to the client's page-1 sample).
// In the post phase this becomes the thank-you hero (SPEC §7.16).
import { h, svg, multiline } from "../core/dom.js";
import { ownerSvg, photo, picture, art } from "../core/assets.js";
import { mandala } from "../fx/mandala.js";
import { ganeshLine, mountGaneshLoop } from "../fx/ganesh.js";
import { toran, divider } from "../fx/ornaments.js";
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

// One family block: name first, then grandparents and parents (each "Label\nNames").
function person(p) {
  return [
    h("p", { class: "card-name script", text: p.fullName }),
    p.grandparents ? multiline(p.grandparents, "card-family soft", "p") : null,
    p.parents ? multiline(p.parents, "card-family soft", "p") : null,
  ];
}

// Hero = the invitation card that comes out of the envelope (SPEC §7.4/§9, client reference):
// arch frame, Ganesh line art, invocation, the families, watercolor scene at the bottom.
// The guest's greeting sits with the Save the Date reveal instead.
// Small Ganesh line icon (as used above the invocation). Each card gets its own instance.
function ganeshIcon() {
  const g = svg(ownerSvg("ganesh-line") || ganeshLine());
  g.classList.add("ganesh-line"); // the gate intro draws every .ganesh-line stroke under #hero
  return h("div", { class: "hero-ganesh", "aria-hidden": "true" }, g);
}

export function mount(ctx) {
  const { content: c, guest } = ctx;
  if (ctx.phase === "post") return postHero(ctx);
  const { bride, groom } = c.couple;
  const hero = c.hero;
  const a = c.amantran;
  // Owner's full card artwork (arch, border, procession) as a stretchable frame (CSS border-image).
  // Both pages use it: it is the one professional, hand-illustrated asset on the site, and the
  // client asked page 2 to match page 1's quality rather than carry a second, plainer design.
  const frame = art("hero-frame");
  const names = (l) => `${bride.name[l]} ${hero.joiner[l]} ${groom.name[l]}`;
  const invocation = c.amantran?.invocation || c.invocation.line;

  const framedCard = (id, labelledby, invite, scrollHref, useFrame = true, bg = null) => {
    const framed = frame && useFrame;
    const sec = h("section", { id, class: `section hero cover${framed ? " hero--framed" : ""}`, "aria-labelledby": labelledby },
      bg,
      ganeshIcon(),
      h("p", { class: "hero-invocation", text: invocation }),
      invite,
      scrollHref ? h("a", { href: scrollHref, class: "scroll-hint" }, h("span", { text: hero.scrollHint }), ctx.icon("chevron-down")) : null);
    if (framed) sec.style.setProperty("--frame", `url("/img/${frame.key}-${frame.w}.webp")`);
    return sec;
  };

  // Page 1 (first view, out of the envelope): invocation + "Shubh Vivah" greeting.
  const sec = framedCard("hero", "hero-names",
    h("div", { class: "hero-invite" },
      svg(divider()),
      h("p", { class: "card-weddingof", text: hero.title }),
      h("p", { class: "card-family soft", text: hero.blessing }),
      h("h1", { id: "hero-names", class: "line--name", text: names }),
      svg(divider())),
    "#hero-card");
  sec.classList.add("hero--intro"); // bigger type, more generous gaps — this card's content is short
  if (frame) mountFrameAnim(sec);
  mountGaneshLoop(sec.querySelector(".hero-ganesh"));
  ctx.main.append(sec);

  // Page 2: the full invitation card, moved here as-is, on its own background — the owner's
  // gold temple-scenery artwork (assets/img/temple-scenery.png) full-bleed, with the
  // twin-elephants motif (assets/img/twin-elephants-clean.avif) heading the card.
  const elephants = art("twin-elephants-clean");
  const templeScenery = art("temple-scenery");
  const sec2 = framedCard("hero-card", "hero-card-names",
    a ? h("div", { class: "hero-invite" },
      h("h2", { id: "hero-card-names", class: "sr-only", text: names }),
      elephants ? picture(elephants, "", { cls: "hero-card-motif", sizes: "(min-width: 600px) 280px, 62vw" }) : null,
      h("div", { class: "card-rule" }, svg(divider()), h("p", { class: "card-weddingof", text: a.weddingOf })),
      person(bride),
      h("p", { class: "card-joiner", text: a.joiner }),
      person(groom),
      svg(divider())) : null,
    null, false,
    templeScenery ? picture(templeScenery, "", { cls: "hero-card-bg", eager: false, sizes: "100vw" }) : null);
  ctx.main.append(sec2);
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
