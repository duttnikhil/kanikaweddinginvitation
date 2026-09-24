import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const wedding = JSON.parse(readFileSync(new URL("./content/wedding.json", import.meta.url), "utf8"));

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

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
    transformIndexHtml(html) {
      return html.replace(/__(LANG|TITLE|OG_DESC|SITE_URL)__/g, (m) => escapeAttr(vars[m]));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (process.env.SITE_URL || env.SITE_URL || wedding.meta.siteUrl).replace(/\/$/, "");
  return {
    plugins: [headFromContent(siteUrl)],
    build: {
      target: "es2020",
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
