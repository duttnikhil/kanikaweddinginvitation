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
import { divider, floralSpray } from "../src/fx/ornaments.js";

const w = JSON.parse(readFileSync("content/wedding.json", "utf8"));
const font = (pkg, file) => pathToFileURL(`node_modules/@fontsource/${pkg}/files/${file}`).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const { groom, bride } = w.couple; // bride first (client request)

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Yatra One"; src: url(${font("yatra-one", "yatra-one-devanagari-400-normal.woff2")}); unicode-range: U+0900-097F, U+200C-200D, U+25CC, U+A8E0-A8FF; }
@font-face { font-family: "Yatra One"; src: url(${font("yatra-one", "yatra-one-latin-400-normal.woff2")}); unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: "Great Vibes"; src: url(${font("great-vibes", "great-vibes-latin-400-normal.woff2")}); }
@font-face { font-family: "Cinzel"; src: url(${font("cinzel", "cinzel-latin-500-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(circle at 50% 40%, #fff 0, #EEF3FA 55%, #DCE7F5 100%); color: #26324A; text-align: center; }
.frame { position: absolute; inset: 22px; border: 2px solid #C5A165; box-shadow: inset 0 0 0 8px #F8FAFD, inset 0 0 0 9px #C5A165; }
.m { position: absolute; width: 560px; height: 560px; left: 320px; top: 35px; opacity: .22; }
.fl { position: absolute; width: 260px; }
.fl1 { left: 10px; top: 10px; transform: rotate(-90deg) scaleX(-1); }
.fl2 { right: 10px; bottom: 10px; transform: rotate(90deg) scaleX(-1); }
.c { position: relative; display: grid; gap: 14px; justify-items: center; }
.inv { font: 30px "Yatra One"; color: #8A6630; }
.en { font: 120px/1.05 "Great Vibes"; color: #8A6630; }
.caps { font: 500 26px "Cinzel"; letter-spacing: .3em; color: #26324A; }
.d { font: 500 30px "Cinzel"; letter-spacing: .08em; color: #26324A; }
.dv { width: 360px; }
</style></head><body><div class="frame"></div><div class="m">${mandala(108, { width: 1.2 })}</div>
<div class="fl fl1">${floralSpray("left")}</div><div class="fl fl2">${floralSpray("right")}</div>
<div class="c"><p class="inv">${esc(w.invocation.line.hi)}</p>
<p class="caps">${esc(w.cover?.vertical?.en || "")}</p>
<p class="en">${esc(bride.name.en)} ${esc(w.hero.joiner.en)} ${esc(groom.name.en)}</p>
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
