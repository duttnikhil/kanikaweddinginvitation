# DEPLOY.md — GitHub + Cloudflare Pages (free)

## 1. Push the code to a private GitHub repo

1. github.com → New repository → name `shubh-vivah` → **Private** → Create (no README).
2. In this folder:
   ```
   git remote add origin https://github.com/<you>/shubh-vivah.git
   git branch -M main
   git push -u origin main
   ```
   (Or ask Claude Code: "push to this repo" and give the URL.)

Photos: `assets/photos/` is committed so Cloudflare can build the gallery. If the originals are
very large (> 10 MB each), shrink them to ~2500 px wide first (they're only a source for the
480/960/1600 px versions).

## 2. Cloudflare Pages project

dash.cloudflare.com → **Workers & Pages ▸ Create ▸ Pages ▸ Connect to Git** → pick the repo.

| Setting | Value |
|---|---|
| Project name | `kanikaweddinginvitation` (becomes `https://kanikaweddinginvitation.pages.dev`) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run sync-guests && npm run build` |
| Build output directory | `dist` |

**Environment variables** (Settings ▸ Variables and Secrets, Production; mark `EXPORT_KEY` as secret):

| Name | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `APPS_SCRIPT_URL` | Apps Script web app URL (`…/exec`) |
| `VITE_API_URL` | same as `APPS_SCRIPT_URL` |
| `EXPORT_KEY` | same 32 characters as the Script Property |
| `SITE_URL` | `https://kanikaweddinginvitation.pages.dev` (no trailing slash) |

Save and Deploy. The first build takes 1–2 minutes. After changing env vars, trigger a new
deploy (Deployments ▸ ⋯ ▸ Retry deployment) so they take effect.

`SITE_URL` must be the real public URL: the OG image URL (`og:image`) is baked in at build
time, and WhatsApp needs an absolute HTTPS URL. If you pick a different project name, also update
`meta.siteUrl` in `content/wedding.json` and the `SITE_URL` Script Property.

What runs where:
- `functions/_middleware.js` runs only for `/` (see `public/_routes.json`), personalises the
  `<title>`/`og:*` tags and injects the guest's public data. Assets and `/admin/` never hit it,
  so the free 100,000 requests/day are only spent on page opens.
- `functions/_data/guests.js` is generated at build time by `npm run sync-guests` and is not
  served as a static file (it has names only, no phone numbers).

## 3. Deploy hook: "Publish guest list" from the Sheet

1. Cloudflare Pages project → **Settings ▸ Builds ▸ Deploy hooks ▸ Add deploy hook** →
   name `sheet`, branch `main` → copy the URL.
2. Apps Script → Project Settings → Script Properties → `DEPLOY_HOOK_URL` = that URL.
3. Sheet menu **Shubh Vivah ▸ Publish guest list** → a new build appears in Cloudflare
   (Deployments). ~2 minutes later new guests' links show their names in WhatsApp previews.

Flow: Sheet menu → `UrlFetchApp` POST → Cloudflare deploy hook → build runs
`npm run sync-guests` (GET `?action=export&key=…` from Apps Script) → `vite build` → live.

## 4. Testing previews

Locally (no Cloudflare account needed):
```
npm run sync-guests            # or: node scripts/sync-guests.mjs --dev   (mock guests)
npm run build
npm run preview:cf             # wrangler pages dev dist -> http://localhost:8788
curl -s -A "WhatsApp/2.23.20.0 A" "http://localhost:8788/?g=devAll001" | grep -E "<title>|og:title|guest-data"
curl -s -A "WhatsApp/2.23.20.0 A" "http://localhost:8788/" | grep og:title      # generic title
```

Live:
- Send `https://kanikaweddinginvitation.pages.dev/?g=<real id>` to yourself on WhatsApp: title shows
  the family name, plus the image and the date line.
- WhatsApp caches previews per URL. To re-test after a change, add `&v=2` (then `&v=3`, …).
- View source of the live page (`view-source:` on desktop): no guest phone numbers anywhere.

## 5. Updating content later

Edit `content/wedding.json` (or photos/assets) → `git commit` → `git push`. Cloudflare
rebuilds automatically. If names or dates changed, also run `npm run og` and commit
`public/og/og-default.jpg`.
