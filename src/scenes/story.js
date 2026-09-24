// Story timeline with a vine line (SPEC §7.3 #4). Optional block.
import { h, svg, append } from "../core/dom.js";
import { enabled } from "../core/content.js";
import { photo, picture } from "../core/assets.js";
import { section } from "./common.js";

const VINE = `<svg class="vine" viewBox="0 0 40 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<path class="vine-path" d="M20 0C4 60 36 120 20 180S4 300 20 360 36 480 20 540 4 660 20 720 36 840 20 900 12 970 20 1000" fill="none" stroke="#C9A043" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;

export function mount(ctx) {
  const story = ctx.content.story;
  if (!enabled(story) || !story.items?.length) return;
  const sec = section("story", { title: story.title });
  const list = h("ol", { class: "story-list" },
    story.items.map((it) => {
      const p = photo(it.photo);
      return h("li", { class: "milestone" },
        h("span", { class: "milestone-dot", "aria-hidden": "true" }),
        h("p", { class: "label milestone-date", text: it.date }),
        h("h3", { text: it.title }),
        h("p", { class: "prose", text: it.text }),
        p ? picture(p, it.title, { sizes: "(min-width: 600px) 440px, 80vw", cls: "milestone-photo" }) : null);
    }));
  const wrap = h("div", { class: "story" }, svg(VINE), list);
  append(sec, wrap);
  ctx.main.append(sec);

  // Vine draws with scroll; each dot pops when the line reaches it.
  ctx.motion.scene(({ full }) => {
    if (!full) return;
    const { gsap, dur, ease } = ctx.motion;
    gsap.fromTo(wrap.querySelector(".vine-path"), { drawSVG: "0%" }, {
      drawSVG: "100%", ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 70%", scrub: true },
    });
    for (const m of wrap.querySelectorAll(".milestone")) {
      gsap.timeline({ scrollTrigger: { trigger: m, start: "top 70%", toggleActions: "play none none reverse" } })
        .from(m.querySelector(".milestone-dot"), { scale: 0, duration: 0.5, ease: "back.out(2)" })
        .from([...m.children].filter((c) => !c.matches(".milestone-dot")), { opacity: 0, x: 16, duration: dur.m, ease: ease.enter, stagger: 0.08 }, 0.1);
    }
  });
}
