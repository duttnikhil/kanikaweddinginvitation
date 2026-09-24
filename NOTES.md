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
