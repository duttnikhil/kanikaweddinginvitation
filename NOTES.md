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
