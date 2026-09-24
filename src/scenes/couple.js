// Couple portrait cards in jharokha arches (SPEC §7.3 #3).
import { h, svg } from "../core/dom.js";
import { photo, picture } from "../core/assets.js";
import { jharokha, archClipDefs } from "../fx/ornaments.js";
import { mandala } from "../fx/mandala.js";
import { section } from "./common.js";

function card(ctx, person, seed) {
  const p = photo(person.photo);
  const frame = h("div", { class: "arch" },
    p ? picture(p, person.name, { sizes: "(min-width: 600px) 240px, 45vw", cls: "arch-photo" })
      : h("div", { class: "arch-monogram", "aria-hidden": "true" },
        svg(mandala(seed, { width: 1.1 })), h("span", { class: "initial", text: person.initial })),
    svg(jharokha()));
  return h("article", { class: "person" },
    frame,
    h("h3", { class: "person-name script", text: person.fullName }),
    h("p", { class: "person-parents soft", text: person.parents }),
    person.about ? h("p", { class: "person-about label", text: person.about }) : null);
}

export function mount(ctx) {
  const { groom, bride } = ctx.content.couple;
  const sec = section("couple", {
    title: (l) => `${groom.name[l]} ${ctx.content.hero.joiner[l]} ${bride.name[l]}`,
  });
  sec.append(h("div", { class: "couple-grid" }, card(ctx, groom, 21), card(ctx, bride, 34)));
  sec.append(svg(archClipDefs()));
  ctx.main.append(sec);
}
