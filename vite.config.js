import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { gateMarkup } from "./src/fx/envelope.js";
import { pictureHtml } from "./src/core/picture-html.js";

const wedding = JSON.parse(readFileSync(new URL("./content/wedding.json", import.meta.url), "utf8"));

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Static opening gate (envelope) in the default language, with the envelope scene picture if
// assets/img/envelope-scene.* was supplied (npm run images runs before vite build). SVG ids
// get an "s-" prefix so they never clash with ids generated at runtime.
function staticGate() {
  const l = wedding.meta.defaultLang;
  const g = wedding.gate;
  const { bride, groom } = wedding.couple;
  const images = existsSync("content/images.json") ? JSON.parse(readFileSync("content/images.json", "utf8")) : {};
  const scene = images["envelope-scene"];
  const frame = images["hero-frame-start"] || images["hero-frame"]; // card before the procession arrives
  const html = gateMarkup(
    { cta: g.cta[l], skip: g.skip[l], tagline: g.tagline[l], to: g.to?.[l], monogramText: `${bride.initial} | ${groom.initial}`,
      names: `${bride.name[l]} ${wedding.hero.joiner[l]} ${groom.name[l]}` },
    { sceneHtml: scene ? pictureHtml("envelope-scene", scene, { eager: true }) : null,
      frameUrl: frame ? `/img/${images["hero-frame-start"] ? "hero-frame-start" : "hero-frame"}-${frame.w}.webp` : null });
  return html.replace(/\bid="(?!gate)/g, 'id="s-').replace(/url\(#/g, "url(#s-");
}

// Fills the static <head> placeholders (title, OG tags) from wedding.json at build time,
// so no copy is hard-coded in index.html. The edge middleware later personalises them.
function headFromContent(siteUrl) {
  const l = wedding.meta.defaultLang;
  const vars = {
    __LANG__: l,
    __TITLE__: wedding.share.ogTitleGeneric[l],
    __OG_DESC__: wedding.share.ogDescription[l],
    __SITE_URL__: siteUrl,
  };
  return {
    name: "head-from-content",
    transformIndexHtml(html, ctx) {
      html = html.replace(/__(LANG|TITLE|OG_DESC|SITE_URL)__/g, (m) => escapeAttr(vars[m]));
      return ctx.path.startsWith("/admin") ? html : html.replace("<!--GATE-->", staticGate());
    },
  };
}

// Critical CSS: the gate is the only thing visible before the first tap, so its styles (tokens +
// gate.css + the Yatra One @font-face) are inlined and the main stylesheet loads without
// blocking the first paint. boot.js waits for that stylesheet before starting the app.
function criticalCss() {
  const read = (f) => readFileSync(f, "utf8");
  return {
    name: "critical-css",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (ctx.path.startsWith("/admin")) return html;
        const tokens = read("src/styles/tokens.css").replace(/^@import .*$/gm, "");
        const base = "*,*::before,*::after{box-sizing:border-box}*{margin:0}body{background:#FBF4E6;color:#2A1612}body.is-locked{overflow:hidden;touch-action:none}";
        // (During the build this href is still a Vite asset placeholder; Vite resolves it later.)
        const yatra = html.match(/<link rel="preload" href="([^"]+)" as="font"/)?.[1];
        const face = yatra
          ? `@font-face{font-family:"Yatra One";font-style:normal;font-display:swap;font-weight:400;src:url(${yatra}) format("woff2");unicode-range:U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09}`
          : "";
        const css = (face + base + tokens + read("src/styles/gate.css")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");
        return html
          .replace("</head>", `<style>${css}</style>\n</head>`)
          .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, (m, href) =>
            `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'" data-main-css>` +
            `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`);
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (process.env.SITE_URL || env.SITE_URL || wedding.meta.siteUrl).replace(/\/$/, "");
  return {
    plugins: [headFromContent(siteUrl), criticalCss()],
    build: {
      target: "es2020",
      manifest: true, // read by scripts/check-budget.mjs
      cssCodeSplit: false, // one stylesheet = one render-blocking request (admin rules are ~2 KB)
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, "index.html"),
          admin: resolve(import.meta.dirname, "admin/index.html"),
        },
      },
    },
    server: { host: false },
  };
});
