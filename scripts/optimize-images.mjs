// Photos (assets/photos) -> AVIF/WebP/JPEG at 480/960/1600.
// Artwork (assets/img: envelope scene, arch frame, corners; may be transparent) -> AVIF/WebP at 600/1200.
// Output in public/img, manifest in content/images.json. Skips outputs newer than the source.
// Never fails the build when folders are empty.
import sharp from "sharp";
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT = "public/img";
const SETS = [
  { dir: "assets/photos", widths: [480, 960, 1600], formats: ["avif", "webp", "jpg"], fallback: "jpg" },
  { dir: "assets/img", widths: [600, 1200], formats: ["avif", "webp"], fallback: "webp" },
];
const OPTS = { avif: { quality: 50 }, webp: { quality: 76, alphaQuality: 90 }, jpg: { quality: 78, mozjpeg: true } };

await mkdir(OUT, { recursive: true });
const manifest = {};
let count = 0;

for (const set of SETS) {
  const files = existsSync(set.dir) ? (await readdir(set.dir)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)) : [];
  for (const file of files) {
    const key = path.parse(file).name;
    const src = path.join(set.dir, file);
    const meta = await sharp(src).rotate().metadata();
    const turned = (meta.orientation || 1) >= 5;
    const w0 = turned ? meta.height : meta.width;
    const h0 = turned ? meta.width : meta.height;
    const widths = set.widths.filter((w) => w <= w0);
    if (!widths.length) widths.push(w0);
    const srcTime = (await stat(src)).mtimeMs;
    for (const w of widths) {
      for (const ext of set.formats) {
        const out = path.join(OUT, `${key}-${w}.${ext}`);
        if (existsSync(out) && (await stat(out)).mtimeMs > srcTime) continue;
        const pipe = sharp(src).rotate().resize({ width: w });
        await (ext === "jpg" ? pipe.jpeg(OPTS.jpg) : ext === "webp" ? pipe.webp(OPTS.webp) : pipe.avif(OPTS.avif)).toFile(out);
      }
    }
    manifest[key] = { w: widths.at(-1), h: Math.round((h0 / w0) * widths.at(-1)), widths, formats: set.formats, fallback: set.fallback };
    count++;
  }
}

// Animated card (assets/img/hero-frame-frames/*.png, frames of the owner's Canva animation):
// last frame -> static "hero-frame" (hero), first frame -> "hero-frame-start" (card in the envelope),
// and the moving top/bottom bands of every frame stacked into two sprites, played once by hero.js.
// TOP/BOTTOM are the rows that move (measured on the owner's frames); the middle never changes.
const FRAMES = "assets/img/hero-frame-frames";
const TOP = 610;
const BOTTOM = 1060;
const frames = existsSync(FRAMES) ? (await readdir(FRAMES)).filter((f) => /\.png$/i.test(f)).sort() : [];
if (frames.length > 1) {
  const src = (f) => path.join(FRAMES, f);
  const { width: W, height: H } = await sharp(src(frames[0])).metadata();
  const statics = { "hero-frame": frames.at(-1), "hero-frame-start": frames[0] };
  for (const [key, f] of Object.entries(statics)) {
    for (const ext of ["avif", "webp"]) {
      const pipe = sharp(src(f));
      await (ext === "webp" ? pipe.webp(OPTS.webp) : pipe.avif(OPTS.avif)).toFile(path.join(OUT, `${key}-${W}.${ext}`));
    }
    manifest[key] = { w: W, h: H, widths: [W], formats: ["avif", "webp"], fallback: "webp" };
  }
  for (const [name, top, height] of [["top", 0, TOP], ["bottom", BOTTOM, H - BOTTOM]]) {
    const bands = await Promise.all(frames.map((f) => sharp(src(f)).extract({ left: 0, top, width: W, height }).toBuffer()));
    const sheet = await sharp({ create: { width: W, height: height * frames.length, channels: 3, background: "#fff" } })
      .composite(bands.map((input, i) => ({ input, top: i * height, left: 0 })))
      .png()
      .toBuffer();
    await sharp(sheet).avif({ quality: 50 }).toFile(path.join(OUT, `hero-frame-${name}.avif`));
    await sharp(sheet).webp({ quality: 72 }).toFile(path.join(OUT, `hero-frame-${name}.webp`));
  }
  manifest["hero-frame-anim"] = { w: W, h: H, frames: frames.length, top: TOP, bottom: BOTTOM };
  count++;
}

await writeFile("content/images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`images: ${count} file(s) -> ${OUT}`);
