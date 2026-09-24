# NOTES.md

Build log, decisions and deviations from SPEC. Newest phase at the bottom.

## Decisions / deviations (whole project)

- **Vite 6** (SPEC allows 5.x/6.x; npm default is now 8, so it is pinned to 6).
- **Fonts over budget on the Hindi page.** SPEC §10 says fonts ≤ 250 KB. The four Devanagari
  files (Yatra One, Tiro Devanagari Hindi, Mukta 400 + 600) alone are ~372 KB, and the owner
  decided that no Devanagari font may be removed. As instructed, Cormorant Garamond 600 italic
  and Cinzel 700 were dropped (italic/bold are synthesized where used). Result:
  English page ≈ 135 KB (ok), Hindi page ≈ 420 KB (over). `check-budget.mjs` reports the Hindi
  line as "OVER (allowed)" instead of failing. Subsetting to the characters in wedding.json was
  tried: it only saved ~70 KB (Devanagari conjunct glyphs must stay) and would break Hindi text
  that guests type, so it was not used. If this matters later: drop Mukta Devanagari 600 (use
  400 for Hindi buttons) to save ~100 KB.
- **Owner assets** are picked up automatically with `import.meta.glob` from `assets/svg/*.svg`
  and `assets/audio/*.mp3`. Nothing missing ever fails the build; each missing file logs one
  dev warning and a procedural fallback is used. Audio is bundled via Vite `?url` (hashed file
  in dist/assets) instead of being copied to `public/audio` (same effect, no copy step).
- **Ganesh fallback** is a seeded stroke mandala (`src/fx/mandala.js`), because a deity figure
  can't be drawn well in code. It draws itself exactly like the line art would.
- **Mehendi fallback** is a stroke mandala in mehendi brown with the groom's initial in the
  centre (instead of a hand outline).
- **Extra lucide icons** beyond SPEC §9.4: chevron-left/right (lightbox), train, plane, hotel
  (travel items, which use `"icon": "train" | "plane"` in wedding.json).
- **Added copy to wedding.json**: `ui.close`, `ui.prev`, `ui.next` (lightbox button labels).
- Couple section title is built from the names + `hero.joiner` ("Arjit weds Kanika").

## Phase 1: Scaffold, design system, static page

Built:
- package.json scripts from CLAUDE.md, Vite multi-page (index + admin), .gitignore, .env.example.
- `src/styles/tokens.css` (colors, font stacks with `:lang(hi)` switch, clamp type scale),
  `base.css` (paper noise via SVG data URI, 560px patrika column with ornate gold side strips
  on ≥1024px, sections, buttons, focus ring), `sections.css`.
- Core: `content.js`, `i18n.js` (bound text nodes, re-render on toggle), `guest.js`
  (prod: `#guest-data`; dev: `?g=` against `content/dev-guests.json`), `dom.js`, `time.js`,
  `calendar.js`, `assets.js`.
- Every section module in `src/scenes/` in SPEC §7.3 order, rendered from wedding.json.
  Optional blocks hidden when absent/disabled. Scenes are mounted inside a try/catch so one
  broken scene can't blank the page.
- Procedural ornaments: mandala, lotus/paisley divider, kalash, diya (separate flame group),
  jharokha arch frame (+ shared clipPath), repeating toran, carved doors, agni kund with
  `#flame-1..3`, varmala couple with `#garland-bride/#garland-groom`, haldi drops.
- `scripts/optimize-images.mjs` and `scripts/check-budget.mjs` (needed by `npm run build`).
- A few Phase 2 parts landed early because they are part of the same modules: event
  Maps/Directions/Add-to-calendar buttons, shagun QR + copy, contacts buttons.

Nothing in wedding.json was left unplaced. Photos (`groom.jpg`, `bride.jpg`, `roka.jpg`,
`sagai.jpg`, `pw-01..03.jpg`) don't exist yet: couple cards show an initial monogram, story
items skip the photo, and the gallery section is hidden until photos are added.

Checked (Playwright, Chromium):
- [x] 360px: complete page top to bottom, no console errors (only the "missing asset" warnings).
- [x] `?g=devAll001` shows "Dear Shri & Smt. Verma Parivar"; `?g=nope` and no `g` show the generic greeting.
- [x] `?g=devRecp02` (reception-only) sees only the Reception card.
- [x] 1280px: centered patrika column with side borders on maroon.
- [x] No horizontal scroll at 360 or 1280 (scrollWidth == innerWidth).
- [x] Hindi (`?g=devHindi3`) renders in Yatra One / Tiro Devanagari; English in Cinzel / Cormorant / Great Vibes.

Check on your phone: text at system font size "Large" (can't be emulated reliably here).

## Phase 2: Core features (no backend, no animation)

Built:
- Floating UI (`scenes/floating-ui.js`): language toggle top-left (localStorage, try/catch;
  falls back to the guest's language, then `meta.defaultLang`), RSVP pill at the bottom that
  hides while the RSVP section is on screen (IntersectionObserver). Music button slot (Phase 4).
- `time.js`: IST formatting via `Intl` (`शनिवार, 12 दिसंबर · रात 9 बजे` / `Saturday, 12 December · 9:00 PM`),
  phase detection pre/live/post, `?phase=` override only in dev or with `?preview=1`.
- Countdown to `meta.mainEventId`, updates every second; live phase shows `countdown.today`.
- Event cards: date/time in hi + en, muhurat, dress-code swatches, Maps + Directions
  (`google.com/maps` links, no iframes), Add-to-calendar menu (Google link + `.ics` with
  `VTIMEZONE Asia/Kolkata`).
- Gallery: `scripts/optimize-images.mjs` (sharp → AVIF/WebP/JPEG at 480/960/1600, manifest in
  `content/images.json`), `<picture>` with lazy loading, `<dialog>` lightbox with swipe,
  arrow keys, Esc and tap-outside to close.
- Shagun: UPI deep link (no amount), QR via `qrcode` (lazy-loaded when the section is near,
  keeps it out of the initial JS), VPA copy with clipboard fallback.
- Contacts: phone as text, Call, WhatsApp (wa.me), Copy.
- `live.js` banner under the hero; post mode = thank-you hero (first gallery photo, album
  button only if `postWedding.albumUrl` is set), RSVP/countdown/shagun hidden, gallery and
  wishes stay.

Checked (Playwright, using temporary generated test photos that were NOT committed):
- [x] Language toggle switches every visible string (remaining Latin text in Hindi mode is
      content itself: "UPI", "RSVP", "JAI", the VPA). Choice survives reload.
- [x] `?phase=live` shows the "Happening now" banner; `?phase=post` shows the thank-you mode.
- [x] Google Calendar URL has correct UTC times (21:00 IST → 15:30Z); `.ics` downloads with
      `DTSTART;TZID=Asia/Kolkata:20261212T210000`.
- [x] Maps/Directions URLs use the venue lat/lng.
- [x] UPI link correct; QR renders.
- [x] Gallery images are `loading="lazy"`; lightbox: swipe → next, ArrowRight → next, Esc closes.

Check on your phone:
- Add to calendar on Android (Google Calendar opens) and iPhone (.ics opens Calendar,
  especially inside WhatsApp's browser).
- UPI button opens a UPI app on Android; QR scans in GPay/PhonePe/Paytm. Some UPI apps
  block web deep links for payments to personal VPAs; the QR scan is the reliable fallback.
- Lightbox swipe with a real finger.

## Phase 3: Backend (Google Sheets + Apps Script) and RSVP

Built:
- `backend/Code.gs` (routing, guest actions, helpers) + `backend/Admin.gs` (admin actions,
  Sheet menu). Split into two files to stay near the ~300-line rule; both are pasted into the
  same Apps Script project. `backend/appsscript.json` (IST, web app as deployer, anonymous
  access; OAuth scopes are left to auto-detection because the menu needs the UI scope).
  Includes LockService on every write, validation (guest, allowed event, integer pax
  0..max_pax, food sum = pax for yes), formula-injection guard, 60 s CacheService for
  wishes (cleared on approve), constant-time password compare + 1 s delay on a wrong
  password, IST timestamps, menu: Generate missing guest IDs / Publish guest list / Copy all
  invite links.
- `backend/SETUP-SHEET.md`: tab names, tab-separated header rows, Script Properties, deploy steps.
- `backend/test.mjs` (`npm test`): runs both .gs files in Node against a fake Sheet and asserts
  the whole contract (validation errors, upsert without duplicates + updated_count, formula
  guard, rsvp_closed by flag and by deadline, wish moderation/limits/cache, open counter,
  export without phone numbers, admin auth/summary/guests/markSent, ID generation).
- `src/core/api.js` per SPEC §5.1: text/plain POST, redirect follow, 12 s timeout, one retry
  after 1.5 s on network errors only, sendBeacon for `open` (fetch keepalive fallback).
- Mock API (`src/core/api-mock.js`) used whenever `VITE_API_URL` is empty (dev and builds):
  800 ms delay, same validation, state in sessionStorage, behaves like a network failure
  when the browser is offline. It's a lazy chunk, so it's never downloaded once the real URL is set.
- RSVP form per SPEC §7.10; wishes form + wall; open ping on load unless `?preview=1`.

API contract additions (both api.js and Code.gs updated):
- `GET rsvp` also returns `updated_at` (for "We received your reply on …").
- `admin.guests` also returns `wishes` (all, incl. unapproved) for the moderation tab.
- `admin.summary` accepts optional `events: [...]` (ids from wedding.json) so "ALL" guests
  are counted as invited to every event.
- Extra error codes: `bad_input` (malformed), `busy` (lock timeout), `unknown_wish`.

Decisions:
- Submit stays disabled until at least one function has an answer and no "yes" block has
  a food mismatch. Unanswered functions are simply not sent.
- Changing pax re-balances the food split (veg absorbs the difference), so the total only
  mismatches when the guest edits the food steppers.
- Wishes form shows only for known guests (the API needs a guest id). The wall is visible to all.
- Wish errors reuse `rsvp.error` copy (no separate string in wedding.json).

Checked (Playwright + mock API, and `npm test` for the real Code.gs logic):
- [x] RSVP saves one row per function; resubmitting updates the same rows, updated_count +1 (npm test).
- [x] pax can't exceed max_pax in the UI (stepper stops at 4); food mismatch shows
      "Total must be 4" and blocks submit; the API rejects both with `bad_pax` (npm test).
- [x] Open ping counted on `/?g=…`, not with `&preview=1`.
- [x] Wish → pending message; approved wishes appear on the wall (npm test covers approval + cache clear).
- [x] `=HYPERLINK(...)` stored as `'=HYPERLINK(...)` (npm test).
- [x] Offline → optimistic success is replaced by the friendly error with Retry; form values
      kept; Retry after coming back online succeeds. Reload prefills the previous answer.

Your part (needs your Google account): MANUAL-STEPS §2 / `backend/SETUP-SHEET.md`, then put the
URL in `.env` and check that an RSVP from the dev site lands in the RSVP tab within a few seconds.

## Phase 4: Opening gate, audio, petals

Built:
- `core/motion.js`: plugin registration (ScrollTrigger, SplitText, DrawSVG, MotionPath), Lenis
  synced with ScrollTrigger and stopped until the gate opens, motion tokens, a single
  `gsap.matchMedia` that all scenes register into (`scene(fn)`, `build()`, `rebuild()`).
  Lenis is not created at all under reduced motion (native scrolling).
- `core/device.js`: hardware hints (≤ 4 cores or ≤ 3 GB) + a 2 s FPS probe.
- `core/audio.js`: Howler; sounds are created inside the gate tap (iOS unlock), shankh one-shot,
  shehnai loop (`html5: true`) fading 0 → 0.35 over 3 s, mute toggle remembered for the session
  (sessionStorage), pause on `visibilitychange` hidden, resume when visible unless muted.
  If an audio file is missing it is simply skipped (music button and "Best with sound on"
  hint are hidden when there is no shehnai file).
- Opening gate per the SPEC §7.4 timeline: doors, gold light, Ganesh draw (or mask reveal if the
  owner SVG is filled), fill layer, petals, greeting chars, couple names, gate removed at
  5.0 s, Lenis starts, floating UI fades in. Skip jumps the timeline to the end (before the tap:
  no sound at all). Scroll locked before opening (`overflow: hidden` + `lenis.stop()`).
  Reduced motion: tap fades the overlay in 0.4 s, no doors, no petals.
- `fx/petals.js`: DPR ≤ 2 canvas, 3 marigold + 2 rose sprites (owner `petal-*.svg` if present,
  procedural otherwise), 36 petals or 16 on low-end hardware, halved again if the first 2 s run
  below 45 fps, `start/stop/burst`, pauses when the tab is hidden. Petals fall while the hero is
  on screen and stop when it scrolls away.

Decisions:
- Petals canvas sits above the content (pointer-events: none) instead of behind it, because
  every section has an opaque paper background.
- Ganesh draw stagger: 0.02 s per path, capped at 1 s total (the fallback mandala has ~130 paths).
- Text splitting: English = words + chars (so lines never break mid-word), Hindi = words
  (splitting Devanagari into characters breaks conjuncts on older Android WebViews).

Checked (Playwright; audio tested with temporary generated tones, not committed):
- [x] Before the tap: page can't scroll (scrollY stays 0), floating UI hidden.
- [x] Tap → doors open, light, Ganesh draws, petals, greeting, names; gate gone at ~5 s, then
      the page scrolls (Lenis).
- [x] Shehnai playing after the doors; mute toggles and is stored for the session.
- [x] Hidden tab → music paused; visible again → resumes.
- [x] Skip before tapping → final hero, no sound created at all.
- [x] Reduced motion → gate just fades, no petals canvas.

Check on your phone (can't be verified here): the whole gate inside WhatsApp's in-app browser
on Android and iPhone, that the shankh actually sounds on iPhone, and the smoothness of the
door animation on a low-end Android.

## Phase 5: Scroll storytelling and rituals

Built:
- Default reveal (`motion.revealOnScroll`) for `[data-reveal]`: visible by default in CSS;
  the from-state is set only inside matchMedia "full", and only for elements still below the
  fold (so rebuilding on a language switch never hides content that was already seen).
- Amantran line-by-line fade-up (stagger 0.12), couple arch clip-path wipe + photo settle +
  name chars, story vine DrawSVG scrubbed with milestone dot pops (`back.out(2)`), countdown
  digit roll (old digit up, new from below, 0.25 s), event cards stagger.
- Haldi splash (§7.6), mehendi scrubbed draw with the groom's initial last (§7.7; mask reveal
  if an owner SVG is filled), saat phere pinned scene (§7.8), varmala tap (§7.9), fireworks
  once on the closing section (§7.11, skipped on low-end and reduced motion), slowly rotating
  closing mandala (paused off screen).
- RSVP success: diya lights up + `petals.burst()` from the diya.
- Wishes: cards float in; with more than 6 wishes a duplicated-list marquee scrolls slowly and
  pauses while touched.
- All ScrollTriggers are created after `document.fonts.ready` and refreshed when images load.
  Language switch: `onBeforeLang` reverts the whole matchMedia (restoring SplitText HTML)
  *before* text changes, then everything is rebuilt.

Saat phere loop (asked to verify): GSAP's `sliceRawPath` handles `end > 1` on closed paths
(`loops = ~~(end - start)`), and in the browser the diya passes left → back → right and is back
on the start point at every whole-number time for all 7 rounds. So `end: 7` is used; no
chain of 7 tweens needed. The diya is moved behind the kund on the back half of the ring.

Decisions:
- Amantran lines are animated per patrika line (each line is already its own block) instead of
  SplitText "lines": same visual, no Devanagari splitting.
- Haldi card is yellow in its static final state (reduced motion / no JS); the animation
  starts it from a closed circle.

Checked (Playwright):
- [x] Saat phere: counter goes 1/7 … 7/7, one vachan at a time, dots fill, outro at the end;
      after unpinning the page scrolls normally (outro moves exactly with scroll, no jump).
- [x] Varmala: exchange plays, petals burst, "Shubh Mangal Saavdhan" appears, button says "Again".
- [x] Haldi splashes yellow once; mehendi drawn and initial visible when centred.
- [x] Switching language while pinned in the phere section: still pinned, counter in Hindi,
      one pin-spacer (no duplicates), no errors.
- [x] After scrolling the whole page nothing is left hidden.
- [x] Reduced motion: no pin (pheras as a numbered list), no Lenis, varmala jumps to the end
      state with a static flower, everything visible.

Check on your phone: smoothness on a 4 GB Android, especially the pinned pheras (scrub).

## Phase 6: Personalised WhatsApp previews and deployment

Built:
- `index.html` head order per SPEC §6 (charset, viewport, title, og/twitter, robots, 2 font
  preloads, rest). Title/description/`og:image` (absolute, from `SITE_URL` at build time, else
  `meta.siteUrl`) are filled from wedding.json by a tiny Vite plugin, so no copy is hard-coded.
- `functions/_middleware.js` (HTMLRewriter): per-guest `<title>`, `og:title`, `twitter:title`,
  `og:description`, `og:url` (canonical `/?g=id`, drops `&v=2`), `<html lang>`, and the
  `#guest-data` JSON (escaped `<`). Unknown/missing `g` → generic title, no guest data, no
  error that confirms or denies an ID. `Cache-Control: no-cache`, `X-Robots-Tag`.
  It imports `content/wedding.json` directly (wrangler bundles JSON), so no generated share file.
- `public/_routes.json` limits the function to `/` and `/index.html` (assets and /admin never
  invoke it → free-tier requests are only spent on page opens).
- `scripts/sync-guests.mjs`: export → `functions/_data/guests.js`, keeping only public fields.
  Missing env → empty map + warning. A failed fetch with env set **fails the build** on purpose
  (Cloudflare then keeps the previous deployment live instead of publishing a site where every
  guest gets the generic preview). `--dev` writes the mock guests for local testing.
- `public/_headers` (noindex, referrer, permissions, nosniff, long cache for hashed assets),
  `public/robots.txt`.
- `scripts/make-og.mjs` (`npm run og`): renders `public/og/og-default.jpg` 1200×630 with the
  site's fonts + mandala via Playwright (64 KB). Committed.
- `DEPLOY.md`: GitHub, Cloudflare build settings, env vars, deploy hook, testing.

Checked (wrangler pages dev on the production build, mock guests via `sync-guests --dev`):
- [x] `curl -A "WhatsApp/2.23.20.0 A" /?g=devAll001` → `Verma Parivar, you are cordially invited`;
      `?g=devHindi3` → `श्री एवं श्रीमती गुप्ता परिवार, आपको सादर आमंत्रण`; unknown / no `g` → generic
      `अर्जित संग कनिका · शुभ विवाह`.
- [x] The page served by wrangler reads the injected guest (Hindi greeting, only that guest's 3 functions).
- [x] `/og/og-default.jpg` served 200 image/jpeg, no redirect, 64 KB.
- [x] No guest phone numbers in `dist/` (the family contacts in wedding.json are public by design).
- [x] `/admin/` never gets guest data injected.

Your part: MANUAL-STEPS §3 (GitHub + Cloudflare) and §4 (deploy hook), then send yourself
`https://arjit-weds-kanika.pages.dev/?g=<real id>` on WhatsApp and check the preview.
