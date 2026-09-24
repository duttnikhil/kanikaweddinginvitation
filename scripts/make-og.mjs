// Renders public/og/og-default.jpg (1200×630, < 300 KB) from wedding.json with the site's own
// fonts and mandala, using Playwright's Chromium. Run locally when names/dates change:
//   npx playwright install chromium   (once)
//   node scripts/make-og.mjs          (CHROME_PATH=/path/to/chrome to use another Chromium)
import { readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { mandala } from "../src/fx/mandala.js";
import { divider } from "../src/fx/ornaments.js";

const w = JSON.parse(readFileSync("content/wedding.json", "utf8"));
const font = (pkg, file) => pathToFileURL(`node_modules/@fontsource/${pkg}/files/${file}`).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const { groom, bride } = w.couple;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Yatra One"; src: url(${font("yatra-one", "yatra-one-devanagari-400-normal.woff2")}); unicode-range: U+0900-097F, U+200C-200D, U+25CC, U+A8E0-A8FF; }
@font-face { font-family: "Yatra One"; src: url(${font("yatra-one", "yatra-one-latin-400-normal.woff2")}); unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: "Great Vibes"; src: url(${font("great-vibes", "great-vibes-latin-400-normal.woff2")}); }
@font-face { font-family: "Cinzel"; src: url(${font("cinzel", "cinzel-latin-500-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(circle at 50% 45%, #7a1418 0, #5A0E12 55%, #3d080b 100%); color: #E9D29A; text-align: center; }
.frame { position: absolute; inset: 22px; border: 2px solid #C9A043; border-radius: 12px; box-shadow: inset 0 0 0 8px #5A0E12, inset 0 0 0 9px #8A6A1F; }
.m { position: absolute; width: 560px; height: 560px; left: 320px; top: 35px; opacity: .28; }
.c { position: relative; display: grid; gap: 14px; justify-items: center; }
.inv { font: 30px "Yatra One"; color: #C9A043; }
.hi { font: 96px/1.15 "Yatra One"; color: #F4E7CC; }
.en { font: 64px/1 "Great Vibes"; color: #E9D29A; }
.d { font: 500 30px "Cinzel"; letter-spacing: .08em; color: #E9D29A; }
.dv { width: 360px; }
</style></head><body><div class="frame"></div><div class="m">${mandala(108, { width: 1.2 })}</div>
<div class="c"><p class="inv">${esc(w.invocation.line.hi)}</p>
<p class="hi">${esc(groom.name.hi)} ${esc(w.hero.joiner.hi)} ${esc(bride.name.hi)}</p>
<p class="en">${esc(groom.name.en)} ${esc(w.hero.joiner.en)} ${esc(bride.name.en)}</p>
<div class="dv">${divider()}</div>
<p class="d">${esc(w.meta.dateRange.en)} · ${esc(w.meta.city.en)}</p></div></body></html>`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// Loaded from a file:// page so the file:// font URLs are allowed.
const tmp = join(tmpdir(), "og-render.html");
writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og/og-default.jpg", type: "jpeg", quality: 82 });
await browser.close();
console.log(`og-default.jpg: ${(statSync("public/og/og-default.jpg").size / 1024).toFixed(0)} KB`);
