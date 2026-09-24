// Patrika-style invitation text (SPEC §7.3 #2). Each line is a block for the line-by-line reveal.
import { h, multiline } from "../core/dom.js";
import { tr, fill } from "../core/i18n.js";
import { section } from "./common.js";

export function mount(ctx) {
  const { content: c } = ctx;
  const a = c.amantran;
  const { groom, bride } = c.couple;
  const sec = section("amantran", { title: a.title });

  // Body with names filled in; lines that are a full name get the name style.
  const body = h("div", { class: "amantran-body prose" });
  const render = () => {
    const text = fill(a.body, { groomFull: groom.fullName, brideFull: bride.fullName, brideParents: bride.parents });
    const names = [tr(groom.fullName), tr(bride.fullName)];
    body.replaceChildren(...text.split("\n").map((ln) =>
      ln.trim() === "" ? h("span", { class: "line line--gap", "aria-hidden": "true" })
        : h("span", { class: names.includes(ln.trim()) ? "line line--name" : "line", text: ln })));
  };
  render();
  ctx.onLang(render);

  sec.append(
    h("div", { class: "shlokas" },
      h("p", { class: "shloka" }, multiline(c.invocation.shloka)),
      h("p", { class: "shloka" }, multiline(c.invocation.mangal))),
    body,
    h("div", { class: "elders prose" },
      h("p", { class: "line soft", text: groom.grandparents }),
      h("p", { class: "line soft", text: bride.grandparents })),
    h("p", { class: "hosts prose" }, multiline(a.hosts)),
    a.tithi ? h("p", { class: "tithi label", text: a.tithi }) : null);
  ctx.main.append(sec);

  // Line-by-line fade-up. Each patrika line is already its own block, so no SplitText is
  // needed (and Devanagari stays intact).
  ctx.motion.scene(({ full }) => {
    if (!full) return;
    const { gsap, dur, ease, below } = ctx.motion;
    for (const block of sec.querySelectorAll(".shlokas, .amantran-body, .elders, .hosts, .tithi")) {
      if (!below(block)) continue;
      const lines = block.matches(".tithi") ? [block] : block.querySelectorAll(".line:not(.line--gap), .shloka");
      gsap.from(lines, { y: 20, opacity: 0, duration: dur.m, ease: ease.enter, stagger: 0.12,
        scrollTrigger: { trigger: block, start: "top 85%", once: true } });
    }
  });
}
