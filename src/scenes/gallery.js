// Gallery: 2/3-column masonry + lightbox with swipe and keyboard (SPEC §7.3 #9). Optional block.
import { h } from "../core/dom.js";
import { enabled } from "../core/content.js";
import { tr } from "../core/i18n.js";
import { photo, picture } from "../core/assets.js";
import { section } from "./common.js";

export function mount(ctx) {
  const g = ctx.content.gallery;
  if (!enabled(g)) return;
  const items = (g.photos || []).map((it) => ({ ...it, p: photo(it.file) })).filter((it) => it.p);
  if (!items.length) {
    ctx.warn("gallery: no optimized photos found, section hidden");
    return;
  }
  const ui = ctx.content.ui;
  const sec = section("gallery", { title: g.title });
  const grid = h("div", { class: "gallery-grid" },
    items.map((it, i) =>
      h("button", { type: "button", class: "gallery-item", i18n: { "aria-label": it.alt }, onclick: () => open(i) },
        picture(it.p, it.alt, { sizes: "(min-width: 768px) 180px, 50vw" }))));
  sec.append(grid);
  ctx.main.append(sec);
  ctx.motion.scene(({ full }) => {
    if (full) ctx.motion.revealOnScroll(grid.children, { y: 30, opacity: 0 }, { each: 0.06 });
  });

  // Lightbox
  const img = h("img", { class: "lb-img", alt: "", decoding: "async", draggable: "false" });
  const caption = h("p", { class: "lb-caption" });
  const count = h("p", { class: "lb-count num" });
  const dlg = h("dialog", { class: "lightbox" },
    img, caption, count,
    h("button", { type: "button", class: "lb-btn lb-close", i18n: { "aria-label": ui.close }, onclick: () => dlg.close() }, ctx.icon("x")),
    h("button", { type: "button", class: "lb-btn lb-prev", i18n: { "aria-label": ui.prev }, onclick: () => show(idx - 1) }, ctx.icon("chevron-left")),
    h("button", { type: "button", class: "lb-btn lb-next", i18n: { "aria-label": ui.next }, onclick: () => show(idx + 1) }, ctx.icon("chevron-right")));
  document.body.append(dlg);
  let idx = 0;

  function show(i) {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    const w = it.p.widths[it.p.widths.length - 1];
    img.src = `/img/${it.p.key}-${w}.jpg`;
    img.srcset = it.p.widths.map((x) => `/img/${it.p.key}-${x}.webp ${x}w`).join(", ");
    img.sizes = "100vw";
    img.width = it.p.w;
    img.height = it.p.h;
    img.alt = tr(it.alt);
    caption.textContent = tr(it.alt);
    count.textContent = `${idx + 1} / ${items.length}`;
  }
  function open(i) {
    show(i);
    dlg.showModal();
    ctx.lenis?.stop();
  }
  dlg.addEventListener("close", () => ctx.lenis?.start());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  // Swipe
  let x0 = null;
  dlg.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  dlg.addEventListener("pointerup", (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
}
