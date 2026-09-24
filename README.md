# Arjit weds Kanika: shaadi ka invite website

Animated Hindu wedding invite (Royal laal–sona theme) jo guests WhatsApp link se phone par
kholte hain. Har parivaar ka apna link (`/?g=<id>`), apna naam, sirf unke functions, RSVP,
shagun, aashirwad, aur family ke liye `/admin/` dashboard. Kharcha ₹0.

| File | Kya hai |
|---|---|
| `MANUAL-STEPS.md` | **Tumhare karne wale kaam** (Google Sheet, Cloudflare, guests bhejna), order mein |
| `backend/SETUP-SHEET.md` | Sheet + Apps Script ka step-by-step |
| `DEPLOY.md` | GitHub + Cloudflare Pages + deploy hook |
| `NOTES.md` | Har phase mein kya bana, kya test hua, kya phone par check karna hai |
| `ASSETS-AND-CONTENT.md` | Ganesh, darwaze, music, photos free mein kahan se |
| `SPEC.md`, `PHASES.md`, `CLAUDE.md` | Technical spec (Claude Code ke liye) |

## Local par chalana

```
npm install                 # pehli baar
npm run dev                 # http://localhost:5173
```
- Test guests: `/?g=devAll001` (sab functions, English), `/?g=devRecp02` (sirf reception),
  `/?g=devHindi3` (Hindi). Bina `g` ke: generic invite.
- Phases dekhne ke liye: `/?phase=live` ya `/?phase=post` (sirf dev / `&preview=1` mein).
- Admin: `http://localhost:5173/admin/`. Jab tak `.env` mein `VITE_API_URL` khali hai, sab
  kuch ek **mock API** se chalta hai (koi bhi password, test data).

**Phone par dekhna:** phone aur laptop same Wi-Fi par ho →
`npm run dev -- --host` → jo "Network" URL dikhe (jaise `http://192.168.1.5:5173/?g=devAll001`)
wo phone ke browser mein kholo.

**Production build jaisa test** (Cloudflare function ke saath, WhatsApp preview bhi):
```
node scripts/sync-guests.mjs --dev    # test guests (ya: npm run sync-guests  -> asli Sheet se)
npm run build
npm run preview:cf                    # http://localhost:8788
curl -s -A "WhatsApp/2.23.20.0 A" "http://localhost:8788/?g=devAll001" | grep og:title
```

## Content badalna

- **Saara text, naam, dates, venue, UPI, contacts:** `content/wedding.json` (Hindi + English
  dono). Code mein kahin aur text nahi hai. Admin page ke labels: `content/admin.json`.
- **Photos:** `assets/photos/` mein daalo (`groom.jpg`, `bride.jpg`, `roka.jpg`, `sagai.jpg`,
  `pw-01.jpg`…, jo naam wedding.json mein hain). `npm run build` khud chhote size banata hai.
- **Artwork / music:** `assets/svg/*.svg` aur `assets/audio/*.mp3` (naam `ASSETS-AND-CONTENT.md` §10
  mein). Jo file nahi hai uski jagah code wala design / silence chalta hai, kuch tootega nahi.
- Naam ya date badle to WhatsApp preview image bhi dobara banao: `npm run og` (pehli baar
  `npx playwright install chromium`), phir `public/og/og-default.jpg` commit karo.
- Phir: `git add -A && git commit -m "content" && git push` → Cloudflare 1–2 min mein live.

## Guests jodna aur invite bhejna

1. Google Sheet ke **Guests** tab mein row (guest_id khali chhodo).
2. Menu **Shubh Vivah ▸ Generate missing guest IDs**.
3. Menu **Shubh Vivah ▸ Publish guest list** → ~2 min baad naye link par naam dikhega.
4. `https://arjit-weds-kanika.pages.dev/admin/` → Guests → **WhatsApp** → bhejo → **Mark sent**.
   Ek baar mein 30–40 se zyada nahi.

## Preview dobara test karna

WhatsApp har URL ka preview yaad rakhta hai. Kuch badla ho to link ke end mein `&v=2`
(phir `&v=3`…) lagao. Preview mein naam na aaye to: guest ka `guest_id` Sheet mein hai?
"Publish guest list" chalaya? Cloudflare ka latest build green hai?

## Commands

```
npm run dev          # dev server (mock guests + mock API)
npm run build        # images → vite build → budget check (fail ho to limit se bada hai)
npm run preview:cf   # production build + Cloudflare function locally (port 8788)
npm run sync-guests  # Sheet se guest list -> functions/_data/guests.js
npm run images       # sirf photos optimize
npm run budget       # sirf size check
npm run og           # WhatsApp preview image dobara banao
npm test             # backend (Code.gs + Admin.gs) ke tests, fake Sheet par
```
