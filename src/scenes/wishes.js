// Blessings: form (known guests only; the API needs the guest id) + wall of approved wishes.
import { h, append } from "../core/dom.js";
import { tr } from "../core/i18n.js";
import { getWishes, sendWish } from "../core/api.js";
import { section } from "./common.js";

export function mount(ctx) {
  const w = ctx.content.wishes;
  if (!w) return;
  const sec = section("aashirwad", { title: w.title });
  const wall = h("ul", { class: "wish-wall", "aria-live": "polite" });
  const empty = h("p", { class: "prose soft wish-empty", text: w.empty });
  const track = h("div", { class: "wish-track" }, wall);
  ctx.main.append(sec);

  if (ctx.guest) {
    const name = h("input", { id: "wish-name", class: "input", maxlength: 60, autocomplete: "name", required: true, i18n: { placeholder: w.namePlaceholder } });
    const message = h("textarea", { id: "wish-message", class: "input", rows: 3, maxlength: 500, required: true, i18n: { placeholder: w.messagePlaceholder } });
    const status = h("p", { class: "wish-status", role: "status" });
    const btn = h("button", { type: "submit", class: "btn" }, h("span", { text: w.submit }));
    const form = h("form", { class: "wish-form", novalidate: true },
      h("label", { class: "field", for: "wish-name" }, h("span", { class: "label", text: w.namePlaceholder }), name),
      h("label", { class: "field", for: "wish-message" }, h("span", { class: "label", text: w.messagePlaceholder }), message),
      btn, status);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!name.value.trim()) return name.focus();
      if (!message.value.trim()) return message.focus();
      btn.disabled = true;
      status.textContent = "";
      try {
        await sendWish(ctx.guest.id, name.value.trim(), message.value.trim());
        status.textContent = tr(w.pending);
        message.value = "";
        load();
      } catch (err) {
        console.warn("[wish]", err.code || err);
        status.textContent = tr(ctx.content.rsvp.error);
      } finally {
        btn.disabled = false;
      }
    });
    append(sec, form);
  }
  append(sec, empty, track);

  function load() {
    getWishes().then((list) => {
      empty.hidden = list.length > 0;
      wall.replaceChildren(...list.map((x) =>
        h("li", { class: "wish-card" },
          h("p", { class: "wish-msg prose", text: x.message }),
          h("p", { class: "wish-name label", text: x.name }))));
      sec.classList.toggle("has-marquee", list.length > 6);
      animateWall();
    }).catch(() => {});
  }
  // Cards float in; more than 6 -> slow horizontal marquee that pauses while touched.
  let marquee = null;
  function animateWall() {
    marquee?.kill();
    wall.querySelectorAll("[data-clone]").forEach((n) => n.remove());
    const { gsap, prefersReduced } = ctx.motion;
    if (prefersReduced()) return;
    gsap.from(wall.children, { opacity: 0, y: 20, duration: 0.6, stagger: 0.06, ease: "power3.out" });
    if (!sec.classList.contains("has-marquee")) return;
    [...wall.children].forEach((c) => {
      const clone = c.cloneNode(true);
      clone.dataset.clone = "";
      clone.setAttribute("aria-hidden", "true");
      wall.append(clone);
    });
    sec.classList.add("is-marquee");
    marquee = gsap.to(wall, { xPercent: -50, duration: wall.children.length * 3, ease: "none", repeat: -1 });
  }
  let resume = 0;
  track.addEventListener("pointerdown", () => { clearTimeout(resume); marquee?.pause(); });
  track.addEventListener("pointerup", () => { resume = setTimeout(() => marquee?.play(), 1500); });

  // Load when the section gets close (saves an Apps Script call for guests who never scroll).
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
  }, { rootMargin: "800px 0px" });
  io.observe(sec);
}
