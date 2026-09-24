// Performance budget (SPEC §10). Fails the build when a limit is exceeded; prints a table.
// Initial assets = what dist/index.html loads directly (entry script, modulepreloads, CSS).
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

const KB = 1024;
const dist = "dist";
const html = readFileSync(`${dist}/index.html`, "utf8");
const refs = (re) => [...html.matchAll(re)].map((m) => m[1]);
const gz = (f) => gzipSync(readFileSync(`${dist}${f}`)).length;
const raw = (f) => statSync(`${dist}${f}`).size;

const js = [...new Set([...refs(/<script[^>]+src="([^"]+)"/g), ...refs(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)])];
const css = refs(/<link rel="stylesheet"[^>]*href="([^"]+)"/g);
const woff2 = readdirSync(`${dist}/assets`).filter((f) => f.endsWith(".woff2"));
const fontSet = (patterns) => woff2.filter((f) => patterns.some((p) => f.startsWith(p))).reduce((s, f) => s + raw(`/assets/${f}`), 0);

// Fonts a guest actually downloads per language (unicode-range picks the subset).
const fontsEn = fontSet(["great-vibes-latin", "yatra-one-latin", "cinzel-latin", "cormorant-garamond-latin", "mukta-latin"]);
const fontsHi = fontSet(["yatra-one-", "tiro-devanagari-hindi-devanagari", "mukta-"]);

const jsGz = js.reduce((s, f) => s + gz(f), 0);
const cssGz = css.reduce((s, f) => s + gz(f), 0);
const htmlRaw = Buffer.byteLength(html);
const og = existsSync("public/og/og-default.jpg") ? statSync("public/og/og-default.jpg").size : null;

// ponytail: Hindi fonts are an owner-approved exception (Devanagari fonts must stay) -> warn, don't fail
const rows = [
  ["Initial JS (gzip)", jsGz, 150 * KB, true],
  ["Initial CSS (gzip)", cssGz, 40 * KB, true],
  ["Fonts, English page", fontsEn, 250 * KB, true],
  ["Fonts, Hindi page", fontsHi, 250 * KB, false],
  ["HTML", htmlRaw, 30 * KB, true],
  ["og-default.jpg", og, 300 * KB, true],
  ["First load, Hindi (JS+CSS+HTML+fonts)", jsGz + cssGz + htmlRaw + fontsHi, 1536 * KB, true],
];

let failed = false;
console.log("\nBudget (SPEC §10)");
for (const [name, size, limit, hard] of rows) {
  const status = size == null ? "MISSING" : size <= limit ? "ok" : hard ? "FAIL" : "OVER (allowed, see NOTES.md)";
  if (status === "FAIL") failed = true;
  const s = size == null ? "-" : `${(size / KB).toFixed(1)} KB`;
  console.log(`  ${name.padEnd(40)} ${s.padStart(10)} / ${(limit / KB).toFixed(0).padStart(5)} KB  ${status}`);
}
if (og == null) console.log("  (public/og/og-default.jpg missing: WhatsApp preview will have no image)");
if (failed) {
  console.error("\nBudget exceeded.");
  process.exit(1);
}
