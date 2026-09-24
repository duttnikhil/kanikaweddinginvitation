# CLAUDE.md — Shubh Vivah invite website

You are building a premium, animated Hindu wedding invitation website that guests open from a
WhatsApp link on their phones. Read `SPEC.md` for the full specification and `PHASES.md` for the
build order. Work one phase at a time. Do not start the next phase until the current phase's
"Done when" checklist passes.

## Non-negotiables

1. **Cost is ₹0.** Only free, open-source or free-tier tools. No paid APIs, no paid fonts, no
   trial libraries. Allowed services: Cloudflare Pages (+ Pages Functions), Google Sheets +
   Google Apps Script, GitHub.
2. **Mobile first.** 90%+ of guests open this inside WhatsApp's in-app browser on a mid/low-range
   Android phone. Design at 360×740 first, then scale up. Test widths: 360, 390, 414, 768, 1280.
3. **Content lives in `content/wedding.json`.** Never hard-code names, dates, venues or copy in
   JS/HTML/CSS. Every user-visible string exists in both `hi` and `en`.
4. **Performance budget** (enforced by `scripts/check-budget.mjs`, see SPEC §10):
   initial JS ≤ 150 KB gzip, initial CSS ≤ 40 KB gzip, fonts ≤ 250 KB, total first load ≤ 1.5 MB
   (photos and audio load later). Lighthouse mobile Performance ≥ 90.
5. **Animate only `transform` and `opacity`** (plus SVG stroke via DrawSVG and `clip-path` for the
   haldi wipe). Never animate `width/height/top/left/box-shadow/filter` on scroll.
6. **Content is visible without animation.** If JS fails or `prefers-reduced-motion: reduce` is
   set, every section must render in its final state. The opening gate always has a Skip button.
7. **Privacy.** `noindex` everywhere. Guest IDs are random 8-char strings. **Guests'** phone
   numbers never appear in public HTML, JS bundles or JSON — only in the Sheet and the admin
   page. (The family contact people in `wedding.json → contacts` are intentionally public.)
8. **No copyrighted media.** Do not add film songs, other companies' card artwork, or images
   pulled from the web. Use only files the owner placed in `assets/`.

## Tech stack (exact)

| Purpose | Package / tool | Notes |
|---|---|---|
| Build | `vite` (latest 5.x or 6.x) | Multi-page: `index.html` + `admin/index.html` |
| Animation | `gsap` ≥ 3.13 | All plugins are free since 3.13. Use ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin (only if needed) |
| Smooth scroll | `lenis` | Sync with ScrollTrigger (SPEC §7.1) |
| Audio | `howler` | `html5: true` for the long shehnai loop |
| Fonts | `@fontsource/*` packages | Self-hosted woff2 with unicode-range. No Google Fonts `<link>` |
| Images | `sharp` (dev dependency, build script) | AVIF + WebP + JPEG at 480/960/1600w |
| QR | `qrcode` | UPI QR and site QR |
| Backend | Google Apps Script (`backend/Code.gs`) | Single web-app endpoint, JSON |
| Edge | Cloudflare Pages Functions (`functions/_middleware.js`) | Per-guest OG tags + guest data injection |

Language: plain modern JavaScript (ES modules), no framework, no TypeScript, no CSS framework.
CSS: hand-written with custom properties in `src/styles/`. No Tailwind.

## Code conventions

- One module per section in `src/scenes/`, each exporting `mount(ctx)` that builds DOM from
  `ctx.content` and registers its own animations via `ctx.motion` (SPEC §7).
- All GSAP code goes through `gsap.matchMedia()` so reduced-motion gets the static version.
- All ScrollTriggers are created after fonts load (`document.fonts.ready`) and refreshed after
  images in that section load.
- Use `textContent` / `setAttribute` when inserting any value that came from the Sheet, the URL or
  the guest. Never `innerHTML` with user data.
- Network calls only through `src/core/api.js`.
- Keep each file under ~300 lines; split when larger.
- Comments in English. User-facing copy comes only from `wedding.json`.

## Commands

```
npm run dev            # vite dev server (uses content/dev-guests.json as mock guest data)
npm run build          # optimize images, vite build, check budget
npm run preview:cf     # wrangler pages dev dist  (runs the middleware locally)
npm run sync-guests    # fetch guest map from Apps Script -> functions/_data/guests.js
npm run images         # scripts/optimize-images.mjs only
npm run budget         # scripts/check-budget.mjs only
```

## What NOT to do

- Do not add React, Vue, jQuery, Bootstrap, Tailwind, AOS, ScrollReveal, Three.js.
- Do not load anything from a CDN at runtime; bundle everything.
- Do not embed Google Maps or YouTube iframes; link out instead.
- Do not autoplay audio; start it only from the gate tap.
- Do not store the admin password in the frontend code.
- Do not invent missing content. If `wedding.json` lacks a value, hide that block and log a
  console warning in dev.
- Do not change the API contract in SPEC §5 without updating both `api.js` and `Code.gs`.

## When unsure

Prefer the simpler implementation that meets the spec, ask the owner if a requirement is
ambiguous, and note deviations in `NOTES.md`.
