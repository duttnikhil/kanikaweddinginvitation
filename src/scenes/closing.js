// Closing (client's last card page): अK logo on top, names, "With Love & Blessings of the Khare
// Family", hashtag. Fireworks once when it comes into view.
import { h, append } from "../core/dom.js";
import { logoAK } from "../fx/logo.js";
import { section, shareButton } from "./common.js";
import { fireworks } from "../fx/fireworks.js";
import { lowEndHint } from "../core/device.js";

export function mount(ctx) {
  const c = ctx.content.closing;
  if (!c) return;
  const sec = section("closing", { tone: "wine" });
  append(sec,
    h("canvas", { class: "fireworks", "aria-hidden": "true" }),
    h("div", { class: "closing-logo", "aria-hidden": "true", "data-reveal": "", html: logoAK() }),
    c.names ? h("p", { class: "closing-names script", text: c.names, "data-reveal": "" }) : null,
    h("p", { class: "closing-line", text: c.line, "data-reveal": "" }),
    c.darshan ? h("div", { class: "darshan", "data-reveal": "" },
      h("h2", { class: "darshan-title", text: c.darshanTitle }),
      h("p", { class: "prose", text: c.darshan })) : null,
    c.kidsLine ? h("p", { class: "kids-line prose", text: c.kidsLine, "data-reveal": "" }) : null,
    ctx.content.saveDate?.hashtag ? h("p", { class: "sd-hashtag", text: ctx.content.saveDate.hashtag, "data-reveal": "" }) : null,
    h("div", { class: "card-share", "data-reveal": "" }, shareButton(ctx)));
  ctx.main.append(sec);

  // Fireworks once when the section is 60% visible; skipped on reduced motion and low-end.
  let fired = false;
  ctx.motion.scene(({ full }) => {
    if (!full || lowEndHint || fired) return;
    ctx.motion.ScrollTrigger.create({
      trigger: sec, start: "top 40%", once: true,
      onEnter: () => { fired = true; fireworks(sec.querySelector(".fireworks")); },
    });
  });
}
