# SETUP-SHEET.md — Google Sheet + Apps Script (≈ 20 min)

## 1. Sheet and tabs

1. sheets.google.com → Blank → name it `Shubh Vivah – RSVP`.
2. Create these 4 tabs (exact names, case matters): **Guests**, **RSVP**, **Wishes**, **Settings**.
   (A 5th tab **Links** is created automatically by the menu.)
3. In each tab click cell **A1** and paste the matching line below. The columns are separated
   by tabs, so each header lands in its own cell.

**Guests** (A1)
```
guest_id	name_en	name_hi	salutation_en	salutation_hi	side	phone	allowed_events	max_pax	lang	invite_sent_at	first_opened_at	last_opened_at	open_count	notes
```

**RSVP** (A1)
```
timestamp	guest_id	event_id	status	pax	veg	jain	nonveg	arrival_mode	arrival_at	message	updated_count
```

**Wishes** (A1)
```
timestamp	wish_id	guest_id	name	message	approved
```

**Settings** (A1, three rows)
```
key	value
wishes_require_approval	TRUE
rsvp_deadline	2026-11-30T23:59:00+05:30
rsvp_open	TRUE
```
`rsvp_deadline` must match `meta.rsvpDeadline` in `content/wedding.json`. The website shows
the JSON date; the API enforces the Sheet value. Format the `value` column as **Plain text**
(Format ▸ Number ▸ Plain text) before pasting so the date isn't reinterpreted.

4. Nice to have:
   - **Guests**: format column `phone` as Plain text (keeps the leading 91).
   - **Wishes**: select column `approved` from row 2 down → Insert ▸ Checkbox.
   - View ▸ Freeze ▸ 1 row on every tab.

### Filling guests
One row per family: `name_en`, `name_hi`, optional salutations, `side` (`ladke` / `ladki` /
`common`), `phone` (91 + 10 digits, no `+`/spaces), `allowed_events` (`ALL` or ids from
wedding.json, e.g. `phoolon-haldi,phere`), `max_pax`, `lang` (`hi` / `en`).
**Leave `guest_id` empty**; menu *Shubh Vivah ▸ Generate missing guest IDs* fills it.
Leave the other columns empty; the website fills them.

Event ids in this wedding.json: `haldi` (Mandap & Haldi), `mehendi`, `phoolon-haldi`, `phere` (Wedding Ceremony), `vidaai`.

## 2. Apps Script code

1. In the Sheet: **Extensions ▸ Apps Script**.
2. Rename the default `Code.gs` content: delete everything, paste `backend/Code.gs`.
3. Click **+ ▸ Script**, name it `Admin`, paste `backend/Admin.gs`.
4. ⚙️ **Project Settings** → tick "Show appsscript.json manifest file in editor" → open
   `appsscript.json` in the editor and replace it with `backend/appsscript.json`.
5. Save (Ctrl/Cmd + S).

## 3. Script Properties

⚙️ **Project Settings ▸ Script Properties ▸ Add script property**:

| Property | Value |
|---|---|
| `ADMIN_PASSWORD` | a strong password; only the family admins get it |
| `EXPORT_KEY` | 32 random characters (password generator); same value goes in `.env` / Cloudflare |
| `DEPLOY_HOOK_URL` | empty for now; Cloudflare deploy hook URL later (MANUAL-STEPS §4) |
| `SITE_URL` | `https://kanikaweddinginvitation.pages.dev` (used by "Copy all invite links") |

## 4. Deploy

1. **Deploy ▸ New deployment** → gear icon → **Web app**.
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
2. **Deploy** → Authorize access → choose your account → "Advanced" → "Go to … (unsafe)" →
   Allow. (It's your own script, so Google calls it unverified.)
3. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`) into `.env`:
   ```
   VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
   APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   EXPORT_KEY=<same 32 characters>
   SITE_URL=http://localhost:5173
   ```
4. Reload the Sheet → a **Shubh Vivah** menu appears (first use asks for permission again).

**Every time Code.gs/Admin.gs changes:** Deploy ▸ **Manage deployments** ▸ ✏️ Edit ▸
Version: **New version** ▸ Deploy. Never "New deployment" (that changes the URL).

## 5. Quick test

- Browser: `<Web app URL>?action=wishes` → `{"ok":true,"data":[]}`.
- `<Web app URL>?action=export&key=<EXPORT_KEY>` → your guests (no phone numbers).
- `npm run sync-guests` (writes `functions/_data/guests.js`), then `npm run dev` and open
  `/?g=<a real guest_id>`: the hero shows that family's name and the RSVP lands in the Sheet.

## API errors you may see

`unknown_guest`, `event_not_allowed`, `bad_pax`, `rsvp_closed`, `too_many`, `too_long`,
`forbidden`, `bad_input` (malformed request), `busy` (lock timeout, retry), `bad_action`,
`missing_tab_<Name>` (a tab is missing or misnamed).
