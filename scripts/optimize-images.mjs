// assets/photos/* -> public/img/<name>-<w>.{avif,webp,jpg} + content/images.json manifest (SPEC §10).
// Skips files whose outputs are newer than the source. Never fails the build if there are no photos.
import sharp from "sharp";
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = "assets/photos";
const OUT = "public/img";
const WIDTHS = [480, 960, 1600];

const files = existsSync(SRC) ? (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
await mkdir(OUT, { recursive: true });
const manifest = {};

for (const file of files) {
  const key = path.parse(file).name;
  const src = path.join(SRC, file);
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  const oriented = (meta.orientation || 1) >= 5;
  const w0 = oriented ? meta.height : meta.width;
  const h0 = oriented ? meta.width : meta.height;
  const widths = WIDTHS.filter((w) => w <= w0);
  if (!widths.length) widths.push(w0);
  const srcTime = (await stat(src)).mtimeMs;
  for (const w of widths) {
    for (const [ext, opts] of [["avif", { quality: 50 }], ["webp", { quality: 72 }], ["jpg", { quality: 78, mozjpeg: true }]]) {
      const out = path.join(OUT, `${key}-${w}.${ext}`);
      if (existsSync(out) && (await stat(out)).mtimeMs > srcTime) continue;
      const pipe = sharp(src).rotate().resize({ width: w });
      await (ext === "jpg" ? pipe.jpeg(opts) : ext === "webp" ? pipe.webp(opts) : pipe.avif(opts)).toFile(out);
    }
  }
  manifest[key] = { w: widths.at(-1), h: Math.round((h0 / w0) * widths.at(-1)), widths };
}

await writeFile("content/images.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`images: ${files.length} photo(s) -> ${OUT}`);
