# PHASES.md — build order with ready-to-paste prompts

How to use (for the owner):
- Put `CLAUDE.md`, `SPEC.md`, `PHASES.md`, `ASSETS-AND-CONTENT.md` and `content/wedding.json`
  in an empty folder `shubh-vivah/`, open Claude Code there.
- Paste **one phase prompt at a time**. After Claude Code finishes, check the "Done when" list
  yourself (mostly on your phone), then commit: `git add -A && git commit -m "Phase N"`.
- Start each phase in a fresh Claude Code conversation (`/clear`); the prompt tells it which
  files to read, so no context is lost.
- To test on your phone during dev: `npm run dev -- --host`, then open the "Network" URL on a
  phone connected to the same Wi-Fi.
- If something looks wrong, describe it precisely ("on 360px width the event card title
  overlaps the date") rather than "fix design".

Approximate time: 14 part-time days (see the plan). Phases 1–3 give a fully working (plain)
invite; 4–5 make it premium; 6–8 make it personal, manageable and launch-ready.

---

## Phase 1 — Scaffold, design system, static page

**Prompt:**
```
Read CLAUDE.md, SPEC.md (§3, §4.1, §7.3, §9) and ASSETS-AND-CONTENT.md §5.

Phase 1 tasks:
1. Initialise the project exactly as in SPEC §3: package.json with the scripts from CLAUDE.md,
   Vite multi-page config (index.html + admin/index.html), .gitignore (node_modules, dist,
   .env, functions/_data/guests.js), .env.example, git init.
2. Install: vite, gsap, lenis, howler, qrcode, the @fontsource packages from SPEC §9.2, lucide
   icons (individual SVG imports), and sharp + svgo + wrangler as dev dependencies.
3. Build src/styles/tokens.css and base.css from SPEC §9 (colors, type scale with clamp, the
   560px patrika column with ornate side borders on desktop, section spacing, buttons, focus
   ring, paper noise texture as an SVG data URI).
4. Create content/dev-guests.json with 3 mock guests as described in SPEC §4.3.
5. Implement src/core/content.js, i18n.js (static render only, toggle comes in Phase 2),
   guest.js (dev: reads ?g= against dev-guests.json; prod: reads #guest-data JSON).
6. Implement every section module in src/scenes/ as STATIC markup (no animation yet), in the
   order of SPEC §7.3, rendering from wedding.json. Hide optional blocks when disabled/absent.
7. Build the procedural ornaments from SPEC §9.5 / ASSETS-AND-CONTENT §5: mandala.js,
   divider, kalash, diya, petals, jharokha arch frame, toran fallback. Use them wherever an
   owner asset in assets/svg is missing, with a console warning in dev.
8. Write NOTES.md listing anything in wedding.json you could not place.

Do not add animations, backend calls or the gate yet.
```

**Done when:**
- [ ] `npm run dev` opens a complete, readable invite on a 360px phone screen, top to bottom.
- [ ] `?g=<mock id>` shows the guest's name in the hero; an invalid/missing `g` shows the generic greeting.
- [ ] Reception-only mock guest sees only the reception card.
- [ ] Desktop shows the centered "patrika" column with side borders.
- [ ] No horizontal scroll at any width; text readable at system font size "Large".
- [ ] Hindi text uses Yatra One / Tiro Devanagari; English uses Cinzel / Cormorant / Great Vibes.

---

## Phase 2 — Core features (no backend, no animation)

**Prompt:**
```
Read CLAUDE.md and SPEC.md §7.2, §7.12–§7.16, §7.3 rows 5, 6, 9, 11, 13, 14.

Phase 2 tasks:
1. i18n toggle (floating top-left) with localStorage (try/catch) and guest default language.
2. time.js: IST helpers, phase detection (pre/live/post) with the ?phase= override rules.
3. Countdown to meta.mainEventId (static digits updating every second; digit animation comes
   in Phase 5). Live phase shows countdown.today text.
4. Event cards: date/time formatting in hi and en (e.g. "शनिवार, 12 दिसम्बर · रात 9 बजे"),
   muhurat line, dress-code swatches, Maps and Directions links, Add-to-calendar menu with
   Google link and .ics download (calendar.js).
5. Gallery: run scripts/optimize-images.mjs (sharp → AVIF/WebP/JPEG at 480/960/1600 into
   public/img with a manifest JSON), <picture> markup, lazy loading, lightbox with swipe and
   keyboard support.
6. Shagun: UPI deep link button, QR via qrcode, VPA copy button with clipboard fallback.
7. Contacts: phone shown as text, Copy button, WhatsApp link (wa.me).
8. live.js banner and post-wedding mode per SPEC §7.16.
9. Floating RSVP pill that hides when the RSVP section is on screen (IntersectionObserver).
```

**Done when:**
- [ ] Language toggle switches every visible string; choice survives reload.
- [ ] `?phase=live` shows the "happening now" banner; `?phase=post` shows the thank-you mode.
- [ ] Add to calendar works on Android (Google Calendar opens) and iPhone (.ics opens Calendar).
- [ ] Maps and Directions open the right venue.
- [ ] UPI button opens a UPI app on Android; QR scans correctly in GPay/PhonePe.
- [ ] Gallery images load lazily; lightbox swipes on phone.

---

## Phase 3 — Backend (Google Sheets + Apps Script) and RSVP

**Prompt:**
```
Read CLAUDE.md and SPEC.md §4.2, §5 (all), §7.10, §11.

Phase 3 tasks:
1. Write backend/Code.gs and backend/appsscript.json implementing the full API in SPEC §5,
   including LockService, validation, formula-injection guard, CacheService for wishes,
   constant-time admin password check, the onOpen custom menu (Generate missing guest IDs,
   Publish guest list, Copy all invite links), and IST timestamps.
2. Write backend/SETUP-SHEET.md: exact tab names and header rows to paste into the Sheet
   (copy-pasteable, tab-separated), and the Script Properties to set.
3. Implement src/core/api.js exactly per SPEC §5.1 (text/plain POST, redirect follow,
   12s timeout, one retry, sendBeacon for open).
4. Implement the RSVP form per SPEC §7.10 (per-event blocks, pax + food steppers that must sum,
   "same for all", arrival, prefill from GET rsvp, optimistic success, error + retry,
   no-guest and closed states).
5. Implement the wishes form + wall (GET wishes, POST wish, pending message).
6. Send the open beacon on load unless ?preview=1.
7. Add a dev-only mock mode in api.js (VITE_API_URL empty → in-memory fake responses with
   800ms delay) so the UI can be tested before the Sheet exists.
```

**Owner steps after this phase:** follow `MANUAL-STEPS.md` §2 (create the Sheet, paste Code.gs,
set Script Properties, deploy, put the URL in `.env`).

**Done when:**
- [ ] With the real Apps Script URL in `.env`, an RSVP from the dev site appears in the RSVP tab
      within a few seconds, one row per event.
- [ ] Submitting again updates the same rows (no duplicates) and increments `updated_count`.
- [ ] pax above `max_pax` or food total mismatch is blocked in the UI and rejected by the API.
- [ ] Opening `/?g=<id>` updates first/last opened and open_count; `&preview=1` does not.
- [ ] A wish appears in the Wishes tab; after ticking `approved` it shows on the wall (within 60 s).
- [ ] Typing `=HYPERLINK(...)` in the message is stored as plain text.
- [ ] Airplane mode → friendly error with Retry; form values are kept.

---

## Phase 4 — Opening gate, audio, petals

**Prompt:**
```
Read CLAUDE.md and SPEC.md §7.1, §7.2, §7.4, §7.5, §10 (audio rules).

Phase 4 tasks:
1. core/motion.js exactly as SPEC §7.1 (plugin registration, Lenis + ScrollTrigger sync,
   matchMedia, motion tokens exported as constants).
2. core/device.js low-end detection (hardware hints + 2-second FPS probe).
3. core/audio.js with Howler: unlock on the gate tap, shankh one-shot, shehnai loop with fade,
   mute toggle (floating top-right), pause on visibilitychange, resume when visible if not muted.
4. The opening gate exactly per SPEC §7.4 timeline table, including Skip, scroll lock until
   opened, the reduced-motion version, and 100dvh handling.
   Use assets/svg/door-*.svg and ganesh-line.svg if present, else the procedural fallbacks.
   If the Ganesh SVG is filled rather than stroked, implement the mask-reveal technique from
   SPEC §9.5.
5. fx/petals.js per SPEC §7.5 with start/stop/burst, low-end scaling and visibility pause.
6. Floating UI fade-in after the gate.
```

**Done when:**
- [ ] On a real phone inside WhatsApp's browser: tap → shankh → doors open smoothly → Ganesh
      draws → petals → guest name → couple names, in about 5 seconds.
- [ ] Shehnai starts softly after the doors; mute button works and is remembered for the session.
- [ ] Skip jumps straight to the final hero with no sound.
- [ ] With "Remove animations" (Android accessibility) / "Reduce motion" (iOS) on, the gate
      simply fades and nothing moves.
- [ ] Page can't be scrolled before opening; scrolls smoothly after.
- [ ] Switching to another app pauses music; coming back resumes.

---

## Phase 5 — Scroll storytelling and rituals

**Prompt:**
```
Read CLAUDE.md and SPEC.md §7.1 (tokens), §7.3 (animation column), §7.6–§7.9, §7.11.

Phase 5 tasks:
1. Default [data-reveal] system from SPEC §7.1 (visible by default; from-state only inside
   matchMedia full).
2. Per-section animations from the SPEC §7.3 table: amantran line reveal, couple arch
   clip-path reveal + name chars, story vine DrawSVG scrubbed with milestone pops, countdown
   digit roll, event card stagger.
3. Haldi splash (§7.6), Mehendi reveal (§7.7, mask-reveal if the SVG is filled), Saat phere
   pinned scene (§7.8, verify the MotionPath end>1 looping behaviour against GSAP docs and
   fall back to chained tweens if needed), Varmala tap interaction (§7.9), fireworks on the
   closing section (§7.11).
4. RSVP success: diya lights up + petals.burst().
5. Create all ScrollTriggers after document.fonts.ready; refresh after section images load;
   kill and rebuild cleanly on language toggle.
6. Reduced-motion versions for every scene as specified.
```

**Done when:**
- [ ] Scrolling the whole page on a 4 GB RAM Android phone feels smooth (no visible stutter).
- [ ] Saat phere: diya makes 7 rounds as you scroll, each vachan appears in turn, then the
      page continues normally (no jump after unpinning).
- [ ] Varmala tap plays the exchange + petals; "Again" replays.
- [ ] Haldi card splashes yellow once; mehendi draws as you scroll.
- [ ] Switching language mid-page doesn't break any animation or pinned section.
- [ ] Reduced-motion mode shows everything in final state, pheras as a list.

---

## Phase 6 — Personalised WhatsApp previews and deployment

**Prompt:**
```
Read CLAUDE.md and SPEC.md §2, §4.3, §6, §11, §12.

Phase 6 tasks:
1. index.html <head> order exactly per SPEC §6 (OG tags first), og:image absolute URL from
   SITE_URL at build time.
2. functions/_middleware.js per SPEC §6 using HTMLRewriter, importing functions/_data/guests.js
   and the share strings from wedding.json. Escape JSON for the injected script tag.
3. scripts/sync-guests.mjs: GET APPS_SCRIPT_URL?action=export&key=EXPORT_KEY → write
   functions/_data/guests.js (shape in SPEC §4.3). If env vars are missing, write an empty map
   and warn (so builds never fail).
4. public/_headers and public/robots.txt per SPEC §11.
5. `npm run preview:cf` (wrangler pages dev dist) must run the middleware locally; document how
   to test personalised OG tags with curl -A "WhatsApp/2.23.20.0 A".
6. Write DEPLOY.md: Cloudflare Pages build settings, env vars, deploy hook creation, and how the
   Sheet menu "Publish guest list" triggers a rebuild.
```

**Owner steps:** `MANUAL-STEPS.md` §3 (GitHub + Cloudflare) and §4 (deploy hook).

**Done when:**
- [ ] Site is live at `https://<name>.pages.dev`.
- [ ] Sending `https://<name>.pages.dev/?g=<real id>` to yourself on WhatsApp shows the family
      name in the preview title, the OG image and the date line.
- [ ] Link without `g` shows the generic title.
- [ ] Adding a new guest in the Sheet → menu "Publish guest list" → ~2 minutes later their link
      shows their name.
- [ ] View-source of the live page contains no phone numbers.

---

## Phase 7 — Admin dashboard

**Prompt:**
```
Read CLAUDE.md and SPEC.md §5.2 (admin actions), §8, §11.

Phase 7 tasks:
1. admin/index.html + src/admin/admin.js + admin.css per SPEC §8: login, Summary, Guests
   (search, filters, WhatsApp / Copy link / Preview / Mark sent per row), Wishes moderation,
   Tools (site QR PNG download, UPI QR, RSVP CSV export).
2. WhatsApp message built from share.whatsappTemplate in the guest's language with {name}
   and {link}; wa.me URL with the guest's phone.
3. Mobile-friendly: the family will use this on phones. Tables scroll inside their own
   container; row actions are large buttons.
4. Loading and error states for every call; wrong password message.
```

**Done when:**
- [ ] Wrong password is rejected; right password shows live counts matching the Sheet.
- [ ] Per-function totals and veg/jain/non-veg split are correct against a manual count.
- [ ] Tapping WhatsApp on a guest opens WhatsApp with their number and the personalised
      message + link.
- [ ] "Not replied" filter lists exactly the guests with no RSVP rows.
- [ ] Approving a wish shows it on the public wall.
- [ ] Site QR PNG downloads and scans to the site.

---

## Phase 8 — Performance, QA, launch

**Prompt:**
```
Read CLAUDE.md and SPEC.md §10, §11.

Phase 8 tasks:
1. scripts/check-budget.mjs: gzip-size every initial asset in dist and fail the build over the
   SPEC §10 limits; print a table.
2. Run Lighthouse (mobile) against `npm run preview:cf`; fix everything until Performance ≥ 90,
   Accessibility ≥ 95, Best Practices ≥ 95. Record results in NOTES.md.
3. Audit: every <img> has width/height/alt; decorative SVGs aria-hidden; all form labels; tap
   targets ≥ 44px; no innerHTML with external data; will-change only during animation.
4. Test matrix in NOTES.md (SPEC §10 compatibility checklist) with pass/fail per item.
5. Add a tiny error boundary: if any scene throws, log it and continue mounting the rest.
6. Final README.md for the owner: how to change content, add guests, publish, re-test previews.
```

**Done when:**
- [ ] `npm run build` passes the budget check.
- [ ] Lighthouse mobile ≥ 90 performance.
- [ ] Tested on: 1 cheap Android, 1 recent Android, 1 iPhone, all inside WhatsApp; plus the
      eldest family member's phone with large text.
- [ ] 5 close family members get the link first (soft launch); their feedback fixed.
- [ ] Then send to everyone from the admin page.
