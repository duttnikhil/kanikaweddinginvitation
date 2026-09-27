// <picture> markup as a string (pure: also used at build time for the static gate).
// entry = content/images.json item: { w, h, widths, formats, fallback }
export function pictureHtml(key, entry, { alt = "", sizes = "100vw", cls = "", eager = false } = {}) {
  const set = (ext) => entry.widths.map((w) => `/img/${key}-${w}.${ext} ${w}w`).join(", ");
  const fb = entry.fallback || "jpg";
  const sources = (entry.formats || ["avif", "webp", "jpg"]).filter((f) => f !== fb)
    .map((f) => `<source type="image/${f}" srcset="${set(f)}" sizes="${sizes}">`).join("");
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<picture class="${cls}">${sources}<img src="/img/${key}-${entry.widths.at(-1)}.${fb}" srcset="${set(fb)}" sizes="${sizes}" width="${entry.w}" height="${entry.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}
