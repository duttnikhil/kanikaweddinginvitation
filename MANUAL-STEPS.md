# MANUAL-STEPS.md — jo kaam tumhe khud karne honge

Claude Code code likhega, lekin kuch cheezein login maangti hain ya tumhare parivaar se judi
hain. Wo sab yahan hain, kab karna hai woh bhi likha hai. Sab free hai.

---

## §1. Shuru karne se pehle (Phase 1 se pehle, ~30 min)

1. **Node.js 20 ya naya** install karo: nodejs.org → LTS.
2. **Git** install karo: git-scm.com.
3. **Claude Code** install aur login.
4. Accounts bana lo (sab free): **GitHub**, **Cloudflare**, **Google** (Gmail wala chalega).
5. ~~Folder banao aur files daalo~~: ho gaya, sab files project root mein hain aur code ban chuka hai.
   Ek baar `npm install` chala lo.
6. `content/wedding.json` mein asli naam, dates, venue, UPI ID, contacts bhar do (sample data
   hata ke). Muhurat pandit ji se confirm karo.
7. Assets jutana shuru karo (`ASSETS-AND-CONTENT.md`). Phase 4 tak chahiye honge, Phase 1 ke
   liye zaroori nahi.

---

## §2. Google Sheet + Apps Script (Phase 3 ke baad, ~20 min)

1. sheets.google.com → naya blank sheet → naam: `Shubh Vivah – RSVP`.
2. `backend/SETUP-SHEET.md` mein har step detail mein hai. Usme se 4 tabs banao:
   **Guests, RSVP, Wishes, Settings**, aur har tab ki pehli row mein headers paste karo.
3. Sheet mein: **Extensions ▸ Apps Script**.
   - `Code.gs` ka saara code hata ke `backend/Code.gs` paste karo.
   - **+ ▸ Script** se nayi file `Admin` banao, usme `backend/Admin.gs` paste karo.
   - Left mein ⚙️ **Project Settings** → "Show appsscript.json" tick → uski jagah
     `backend/appsscript.json` paste karo.
   - **Project Settings ▸ Script Properties** mein ye 3 add karo:
     | Property | Value |
     |---|---|
     | `ADMIN_PASSWORD` | koi strong password (family admins ko hi batana) |
     | `EXPORT_KEY` | 32 random characters (koi password generator se) |
     | `DEPLOY_HOOK_URL` | abhi khali, §4 mein bharenge |
     | `SITE_URL` | `https://kanika-weds-arjit.pages.dev` ("Copy all invite links" ke liye) |
4. **Deploy ▸ New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → Google permission maangega → apna account → "Advanced" → "Go to … (unsafe)" →
     Allow. (Ye tumhari apni script hai, isliye Google "unverified" bolta hai.)
5. Jo **Web app URL** mile (project folder mein `.env.example` ko copy karke `.env` banao) (`https://script.google.com/macros/s/…/exec`), use project ki `.env`
   file mein daalo:
   ```
   VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
   APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   EXPORT_KEY=<wahi 32 characters>
   SITE_URL=http://localhost:5173
   ```
6. Sheet ko reload karo → upar **Shubh Vivah** menu aayega.
7. Test: `npm run dev` → `http://localhost:5173/?g=<koi asli guest_id>` → RSVP bhejo → Sheet ke
   RSVP tab mein row aani chahiye. (Pehle `npm run sync-guests` chala lo taaki naam dikhe.)

**Yaad rakhna:** jab bhi `Code.gs` badlo, **Deploy ▸ Manage deployments ▸ ✏️ Edit ▸ Version: New
version ▸ Deploy** karna. "New deployment" mat karna, warna URL badal jayega.

---

## §3. GitHub + Cloudflare Pages (Phase 6 mein, ~20 min)

1. GitHub par **private** repo banao `shubh-vivah`. Claude Code se kaho *"push to this repo"* aur
   URL do.
2. dash.cloudflare.com → **Workers & Pages ▸ Create ▸ Pages ▸ Connect to Git** → repo chuno.
3. Build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run sync-guests && npm run build` |
   | Build output directory | `dist` |
   | Environment variable `NODE_VERSION` | `20` |
4. **Environment variables** (Production): `APPS_SCRIPT_URL`, `VITE_API_URL`, `EXPORT_KEY`,
   `SITE_URL` (= `https://<project-name>.pages.dev`).
5. Save and Deploy. 1–2 minute mein site live: `https://<project-name>.pages.dev`.
   Poori detail (env vars, testing): `DEPLOY.md`.
   Project name soch ke rakhna (jaise `kanika-weds-arjit`), yahi link guests ko jayega.

---

## §4. Deploy hook (Phase 6 mein, ~5 min)

Isse Sheet se naye guests daalte hi site apne aap update hogi.
1. Cloudflare Pages project → **Settings ▸ Builds ▸ Deploy hooks ▸ Add deploy hook** →
   naam `sheet`, branch `main` → URL copy.
2. Apps Script → Script Properties → `DEPLOY_HOOK_URL` mein paste.
3. Test: Sheet menu **Shubh Vivah ▸ Publish guest list** → Cloudflare mein naya build dikhna
   chahiye.

---

## §5. Guest list bharna aur invite bhejna

1. **Guests** tab mein har parivaar ki ek row: `name_en`, `name_hi`, `salutation`, `side`,
   `phone` (91 + 10 digit, bina + ya space), `allowed_events` (`ALL` ya
   `phoolon-haldi,phere`), `max_pax`, `lang`.
2. Menu **Shubh Vivah ▸ Generate missing guest IDs** (khud se ID mat likhna).
3. Menu **Shubh Vivah ▸ Publish guest list** → 2 minute ruko.
4. Pehle apne aap ko ek test guest bana ke WhatsApp par link bhejo, preview check karo.
5. `https://<site>/admin/` kholo → password → **Guests** → har row par **WhatsApp** button →
   message bhejo → **Mark sent**.
   Tip: 30–40 se zyada ek saath mat bhejo, WhatsApp spam samajh sakta hai. Din mein 2–3 batch.

---

## §6. Testing checklist (launch se pehle)

- [ ] Apne phone par WhatsApp mein link → preview mein naam + photo dikhe.
- [ ] Preview galat dikhe to link ke end mein `&v=2` lagao (WhatsApp purana preview yaad
      rakhta hai).
- [ ] Ek sasta Android, ek iPhone, aur ghar ke sabse bade member ka phone (bada font) — teeno
      par poora page.
- [ ] Ek test RSVP → Sheet mein aaya? Admin mein count badha?
- [ ] UPI button GPay, PhonePe, Paytm mein khula? Nahi to QR scan chalna chahiye.
- [ ] Maps har venue ka sahi location dikhaye.
- [ ] Test rows Sheet se delete, test guest hatao, **Publish guest list**.

---

## §7. Shaadi ke dauraan aur baad

- **Live stream** ho to `wedding.json` mein `livestream.enabled: true` aur `url` daalo →
  commit + push (Cloudflare auto-deploy).
- Shaadi ke baad photos Google Drive/Photos album mein daal ke link `postWedding.albumUrl` mein
  daalo → push. Site apne aap "Dhanyavaad" mode mein chali jayegi.
- Wishes approve karte raho (admin ▸ Wishes).

---

## Free limits (tension ki baat nahi, bas pata ho)

| Cheez | Limit | Hamare liye |
|---|---|---|
| Cloudflare static site | Unlimited | ✓ |
| Cloudflare function (preview mein naam) | 1 lakh requests/din | ✓ 1,000 guests ke liye bhi bahut |
| Apps Script | Pehli call 1–2 s slow ho sakti hai | Site pe fark nahi padega (optimistic UI) |
| Custom domain (`.in`) | Paid (~₹500–900/saal) | Optional, `.pages.dev` free hai |

Note: Cloudflare function sirf page kholne par chalta hai (assets par nahi), isliye 1 lakh/din
ki limit tak pahunchna mushkil hai.
