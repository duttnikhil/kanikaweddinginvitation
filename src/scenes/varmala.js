// Varmala (SPEC §7.9): tap to exchange garlands along arcs, petals burst, "Shubh Mangal".
// Optional markers #neck-groom / #neck-bride in the SVG give exact targets.
import { h, svg } from "../core/dom.js";
import { ownerSvg } from "../core/assets.js";
import { tr } from "../core/i18n.js";
import { varmalaCouple } from "../fx/ornaments.js";
import { gsap, dur, ease, split, prefersReduced } from "../core/motion.js";
import { section } from "./common.js";

// Offset (in SVG units) that moves garland g so its top-centre sits on the neck point.
function offsetTo(art, g, neckId, fallbackX) {
  const b = g.getBBox();
  const neck = art.querySelector(neckId);
  const nx = neck ? Number(neck.getAttribute("cx")) : fallbackX;
  const ny = neck ? Number(neck.getAttribute("cy")) : b.y - b.height * 0.7;
  return { x: nx - (b.x + b.width / 2), y: ny - b.y };
}

export function mount(ctx) {
  const v = ctx.content.varmala;
  if (!v) return;
  const sec = section("varmala", { title: v.title });
  const art = svg(ownerSvg("varmala-couple") || varmalaCouple());
  art.classList.add("varmala-art");
  let played = false;
  const label = h("span", { text: (l) => tr(played ? v.replay : v.cta, l) });
  const btn = h("button", { type: "button", class: "btn varmala-btn" }, label);
  const after = h("p", { class: "varmala-after script", text: v.after, hidden: true });
  const stage = h("div", { class: "varmala-stage", "aria-hidden": "true" }, art);
  sec.append(stage, after, btn);
  ctx.main.append(sec);

  const bride = art.querySelector("#garland-bride");
  const groom = art.querySelector("#garland-groom");
  let tl = null;
  let splitAfter = null;

  function play() {
    if (!bride || !groom) return;
    tl?.progress(1).kill();
    splitAfter?.revert();
    gsap.set([bride, groom], { x: 0, y: 0, scale: 1 });
    after.hidden = false;
    played = true;
    label.textContent = tr(v.replay);
    const toGroom = offsetTo(art, bride, "#neck-groom", groom.getBBox().x);
    const toBride = offsetTo(art, groom, "#neck-bride", bride.getBBox().x + bride.getBBox().width);
    const burstAtCenter = () => {
      const r = art.getBoundingClientRect();
      ctx.petals.burst(r.left + r.width / 2, r.top + r.height * 0.35, 28);
    };
    if (prefersReduced()) {
      gsap.set(bride, toGroom);
      gsap.set(groom, toBride);
      burstAtCenter();
      return;
    }
    splitAfter = split(after, "chars");
    const arc = (to) => ({ path: [{ x: to.x / 2, y: to.y - 50 }, { x: to.x, y: to.y }], curviness: 1.4 });
    tl = gsap.timeline()
      .to(bride, { motionPath: arc(toGroom), duration: 1.1, ease: ease.move }, 0)
      .to(groom, { motionPath: arc(toBride), duration: 1.1, ease: ease.move }, 0.6)
      .to([bride, groom], { scale: 0.92, transformOrigin: "50% 0%", duration: 0.3, ease: "back.out(2)" }, 1.7)
      .call(burstAtCenter, null, 1.7)
      .from(splitAfter.chars.length ? splitAfter.chars : splitAfter.words, { opacity: 0, y: 14, duration: dur.s, ease: ease.enter, stagger: 0.04 }, 1.8);
  }
  btn.addEventListener("click", play);
  stage.addEventListener("click", play);
}
