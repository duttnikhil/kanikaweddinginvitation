// Owner-supplied files (assets/svg, assets/audio) and generated photo variants.
// Anything missing resolves to null; callers fall back to procedural art (SPEC §9.5).
import { warn } from "./content.js";
import { h } from "./dom.js";

// ponytail: SVGs are inlined into the JS bundle; move to lazy ?url fetches if they push JS over budget
const svgs = import.meta.glob("/assets/svg/*.svg", { query: "?raw", import: "default", eager: true });
const audio = import.meta.glob("/assets/audio/*.mp3", { query: "?url", import: "default", eager: true });
const manifest = import.meta.glob("/content/images.json", { import: "default", eager: true })["/content/images.json"] || {};

export function ownerSvg(name) {
  const s = svgs[`/assets/svg/${name}.svg`];
  if (!s) warn(`assets/svg/${name}.svg missing, using fallback`);
  return s || null;
}

export function audioUrl(name) {
  return audio[`/assets/audio/${name}.mp3`] || null;
}

// Image manifest written by scripts/optimize-images.mjs: { "pw-01": { w, h, widths: [...] } }
export function photo(file) {
  if (!file) return null;
  const key = file.replace(/\.[^.]+$/, "");
  const entry = manifest[key];
  if (!entry) warn(`photo ${file} missing (put it in assets/photos and run npm run images)`);
  return entry ? { key, ...entry } : null;
}

// <picture> with AVIF -> WebP -> JPEG, srcset at the generated widths (SPEC §10)
export function picture(p, alt, { sizes = "(min-width: 600px) 560px, 100vw", eager = false, cls = "" } = {}) {
  const set = (ext) => p.widths.map((w) => `/img/${p.key}-${w}.${ext} ${w}w`).join(", ");
  const img = h("img", {
    src: `/img/${p.key}-${p.widths[Math.min(1, p.widths.length - 1)]}.jpg`,
    srcset: set("jpg"), sizes, width: p.w, height: p.h,
    loading: eager ? "eager" : "lazy", decoding: "async", i18n: { alt },
  });
  return h("picture", { class: cls },
    h("source", { type: "image/avif", srcset: set("avif"), sizes }),
    h("source", { type: "image/webp", srcset: set("webp"), sizes }),
    img);
}
