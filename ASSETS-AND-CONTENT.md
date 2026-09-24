# Assets aur content: free mein kahan se aur kaise laayen

Is file mein har asset ka free source, uska license, aur use premium dikhane ka tareeka hai.
Premium look paid assets se nahi aata, **consistency** se aata hai: ek style, ek color palette,
sab vector. Neeche ke rules follow karoge to free assets bhi ₹2,000 wale platforms se better
dikhenge.

---

## 1. Premium dikhne ke 8 rules (sabse zaroori part)

1. **Ek hi style.** Saare motifs (Ganesh, darwaze, toran, kalash, diya) ek hi artist, ek hi
   collection, ya ek hi AI "style block" se banao. Cartoon Ganesh ke saath realistic darwaza
   = sasta look.
2. **Sab kuch theme ke rangon mein recolor karo.** Har SVG ko Inkscape mein sirf in rangon mein
   badlo: gold `#C9A043`, sindoor `#A3161A`, maroon `#5A0E12`, ivory `#FBF4E6`. Alag-alag rang
   wale clipart sabse bada "free template" signal hai.
3. **Vector (SVG), PNG nahi.** PNG clipart ke kinaare pe safed border aur blur aata hai. SVG har
   phone par sharp dikhta hai aur animate bhi hota hai.
4. **Gold = gradient, flat peela nahi.** Gold ko SVG `linearGradient` se banao
   (`#8A6A1F → #E9D29A → #B08A2E`). Claude Code ye code mein kar dega, koi image nahi chahiye.
5. **Kam ornaments, zyada khali jagah.** Har section mein ek motif. Poora page bharna cheap
   lagta hai.
6. **Photos ek hi color grade mein.** Saari couple photos par ek hi preset (Snapseed / Lightroom
   Mobile free) lagao, taaki gallery ek set lage.
7. **Texture code se.** Kaagaz ka texture SVG noise se banega (SPEC §9.1). Image file nahi.
8. **Kabhi nahi:** glitter GIF, watermark wali stock image, film ka gaana, kisi aur ke card ka
   design, 3 se zyada fonts.

---

## 2. Har asset ka source (quick table)

| Asset | Best free route | Backup route | License |
|---|---|---|---|
| Ganesh line art | AI se banao → SVG mein convert (§3) | Freepik free vector, credit ke saath (§4.3) | AI output tumhara; Freepik free = credit zaroori |
| Mandir ke darwaze | AI (§3) | Freepik free vector | Same |
| Toran, kalash, diya, lotus divider, petals | **Claude Code se code mein banwao** (§5) | AI / Freepik | Tumhara |
| Mandala / rangoli / border patterns | **Claude Code procedural generation** (§5) | Met Museum Open Access patterns (§4.2) | Tumhara / CC0 |
| Agni kund, varmala couple, mehendi haath | AI (§3) | Freepik free vector | AI / credit |
| Antique Rajasthani motifs (extra premium) | Met Museum / Rawpixel public domain (§4.2) | Wikimedia Commons | CC0 / Public domain |
| Shehnai background music | Pixabay Music (§6) | Freesound (CC0 filter) | Pixabay: attribution nahi chahiye |
| Shankh sound | Pixabay sound effects "conch" (§6) | Freesound | Same |
| Small animations (diya flicker, fireworks) | Code mein (GSAP/canvas) | LottieFiles free (§4.4) | Lottie Simple License |
| Couple photos | Apni photos | – | Tumhari |
| Background photos (marigold, haveli) | Unsplash / Pexels (§7) | – | Free, credit optional |
| OG image (WhatsApp preview) | Canva free / Figma free (§8) | Claude Code `make-og.mjs` | Tumhara |
| Fonts | `@fontsource` (SPEC §9.2) | – | SIL OFL (free) |
| Icons | Lucide (SPEC §9.4) | – | ISC/MIT |

---

## 3. AI se premium illustrations banana (free)

**Tools:** Google Gemini (gemini.google.com) ya ChatGPT free tier. Dono free account par images
banate hain. Personal wedding invite ke liye use theek hai. Agar baad mein ise business ki tarah
bechna hai, to us waqt tool ki terms ek baar padh lena.

### 3.1 Style block (har prompt ke end mein copy-paste karo, isse sab ek set lagega)

**Line art ke liye (Ganesh, mehendi — jinhe "draw hote hue" dikhana hai):**
```
Style: intricate Rajasthani miniature-inspired line art, single continuous-weight dark line
on a pure white background, no shading, no fills, no gradients, no text, no border,
symmetrical, clean and elegant, high contrast, centered, lots of empty space around it.
```

**Filled illustrations ke liye (darwaze, agni kund, varmala couple):**
```
Style: flat vector illustration inspired by Rajasthani miniature painting, limited palette
of deep maroon #5A0E12, sindoor red #A3161A, antique gold #C9A043 and ivory #FBF4E6 only,
no gradients, no shadows, no text, clean edges, plain white background, centered.
```

### 3.2 Prompts (har asset ke liye)

| File | Prompt (upar ka style block end mein jodo) |
|---|---|
| `ganesh-line.svg` | `A graceful seated Lord Ganesha holding a modak and lotus, ornate crown, elegant and devotional, front view.` |
| `door-left.svg` / `door-right.svg` | `A pair of closed carved wooden temple doors, front view, arched top, brass studs and a brass knocker ring on each door, floral carvings, the two doors meet exactly in the centre.` (Ek image banao, Inkscape mein beech se kaat ke 2 files) |
| `toran.svg` | `A horizontal wedding toran: string of marigold flowers and mango leaves hanging in scallops, very wide banner format, front view.` |
| `agni-kund.svg` | `A square Vedic havan kund (fire altar) with three separate stylised flames rising from it, front view.` |
| `varmala-couple.svg` | `An Indian bride in lehenga and groom in sherwani and safa, side profile, facing each other, each holding a marigold garland in both hands, full body, elegant silhouettes.` |
| `mehendi-hand.svg` | `An open palm with intricate bridal mehendi pattern: paisleys, peacock, lotus and a small blank circle in the centre of the palm.` (line-art style block) |
| `kalash.svg` | `A decorated kalash with mango leaves and a coconut on top, swastika mark on the pot.` |

**Tips:**
- Ek prompt se 4–6 variations banao, sabse clean chuno.
- Chehre, ungliyan dhyan se check karo (AI yahan galti karta hai). Galat ho to dobara banao.
- Resolution sabse bada lo (download "original").

### 3.3 PNG → SVG (free tools)

1. **SVGcode** (svgco.de): free, open-source, browser mein chalta hai, upload nahi karta.
   Filled illustrations ke liye best. Colors "posterize" 4–6 rakho.
2. **Inkscape** (inkscape.org, free desktop app):
   - `Path ▸ Trace Bitmap ▸ Single scan`. Line art ke liye **"Centerline tracing (autotrace)"**
     chuno; isse lines strokes bante hain, jo DrawSVG se "khud draw" hote hain.
   - Trace ke baad: `Path ▸ Simplify` (Ctrl+L) 1–2 baar, extra dots delete karo.
   - Colors: Fill & Stroke panel se theme ke hex codes daalo.
   - `File ▸ Save As ▸ Optimized SVG`.
3. **SVGO:** `npx svgo assets/svg/*.svg`. Claude Code ye build mein khud chala dega.

**Agar line art fill ban gaya aur stroke nahi bana:** tension nahi. Claude Code se kaho
*"Ganesh SVG filled hai, mask-reveal technique use karo"*: ek moti stroke wali mask path
drawing ki tarah chalegi aur neeche ka fill dheere dheere dikhega. Dikhne mein same effect.

---

## 4. Ready-made free sources

### 4.1 Kya check karna hai har download se pehle
- License page padho: **commercial/personal use allowed?** **Attribution chahiye?**
- Credits ek jagah likhte jao: `CREDITS.md` (Claude Code footer mein chhota "Credits" link
  bana dega).

### 4.2 Public domain (CC0) — koi credit nahi, real antique art
Asli puraane Rajasthani/Mughal motifs sabse "premium" lagte hain, kyunki ye asli kalakaron ka
kaam hai.
- **Rawpixel public domain collection** (rawpixel.com/public-domain): "Indian", "paisley",
  "mughal border", "lotus" search karo. Sirf **CC0 / Public Domain** tag wale lo (kuch items
  premium hote hain).
- **The Met Museum Open Access** (metmuseum.org/art/collection, filter "Open Access"): Indian
  textiles, borders, miniature paintings. Open Access items CC0 hain.
- **Wikimedia Commons** (commons.wikimedia.org): Raja Ravi Varma ke Ganesh/Lakshmi prints
  (public domain, bahut purane). Har file ke page par license dekho.

Use: pattern ya border ko Inkscape mein trace karke gold mein recolor karo, ya photo ko 8–10%
opacity par background texture ki tarah use karo.

### 4.3 Freepik (ab "Magnific" naam se) — sabse bada Indian wedding vector collection
- Free vectors: Ganesh, mandir darwaze, toran, mandala, kalash, sab milta hai.
- **Free users ko credit dena zaroori hai:** "Designed by Magnific" + magnific.com ka link,
  asset ke paas ya footer mein.
- Sirf "Free" wale lo, crown (Premium) wale nahi.
- AI-generated tag wale items avoid karo (quality mixed hoti hai).
- Style rule yaad rakho: ek hi artist ke 3–4 assets lo, sab mix mat karo.

### 4.4 LottieFiles — ready animations
- lottiefiles.com par free animations **Lottie Simple License** mein hain: commercial use
  allowed, credit optional.
- Kaam ke search: "diya", "fireworks", "confetti", "flower", "heart".
- Dhyan: Lottie chalane ke liye extra library (~40–60 KB) lagti hai. Isliye sirf ek-do jagah,
  lazy-load karke. Zyaadatar effects hum GSAP/canvas se banayenge, jo already bundle mein hai.

### 4.5 SVGRepo (svgrepo.com)
Chhote icons/ornaments ke liye theek. **Har icon ka license alag** hai (MIT, CC0, CC-BY), page
par dekh ke lo.

---

## 5. Claude Code se khud banwao (100% tumhara, premium, free)

Bahut saare ornaments geometric hote hain. Unhe code se banwana sabse clean aur consistent hai.
Claude Code ko ye prompts do (Phase 1 mein):

- **Procedural mandala:** *"`src/fx/mandala.js` banao jo radial symmetry (16-fold) se petals,
  dots aur arcs ka SVG mandala generate kare, sirf gold gradient strokes. Seed se har baar same
  design. Isse hero ke peeche aur closing section mein halka ghoomta hua use karo."*
- **Divider:** *"Lotus + do paisley wala symmetrical divider SVG banao, 320×40, gold gradient."*
- **Kalash, diya, petals:** *"Simple, elegant flat SVGs banao theme colors mein: kalash (mango
  leaves + coconut), diya (flame alag group mein taaki flicker ho), 3 marigold petals, 2 rose
  petals."*
- **Arch frames:** *"Photo cards ke liye Mughal arch (jharokha) frame SVG banao, gold outline."*
- **Toran fallback:** *"Marigold circles aur mango leaf shapes se ek repeating toran pattern
  banao jo width ke hisaab se repeat ho."*

Ganesh aur insaan wali figures (varmala couple) code se achhe nahi bante; unke liye §3 ya §4.

---

## 6. Audio

| Sound | Kahan se | Kya search karo |
|---|---|---|
| Background shehnai | **Pixabay Music** (pixabay.com/music) | "shehnai", "indian wedding", "sitar calm", "indian classical" |
| Shankh | **Pixabay Sound Effects** (pixabay.com/sound-effects) | "conch", "conch shell" |
| Shankh (backup) | **Freesound** (freesound.org), license filter **"Creative Commons 0"** | "conch", "sankh" |
| Ghanti (optional) | Pixabay | "temple bell" |

- **Pixabay Content License:** free use, modify kar sakte ho, credit zaroori nahi.
- **Freesound:** har sound ka license alag. CC0 wale bina credit; CC-BY wale ke liye credit do.
- **Mat lena:** film/album ke gaane, YouTube par "copyright free" likha hua random upload (aksar
  sach nahi hota).

**Audio taiyaar karna (Audacity, free):**
1. Shehnai track mein se 60–90 second ka hissa chuno jahan shuru aur ant ka sur milta ho.
2. `Effect ▸ Fade In/Out` bahut chhota (0.2 s) taaki loop par "click" na aaye.
3. `Tracks ▸ Mix ▸ Mix Stereo Down to Mono`.
4. Export MP3, 96 kbps → `assets/audio/shehnai-loop.mp3` (≤ 1.2 MB).
5. Shankh: 2–3 second trim, fade out, MP3 128 kbps → `assets/audio/shankh.mp3` (≤ 80 KB).

---

## 7. Photos

- **Couple ki photos:** pre-wedding shoot ya achhi phone photos. Portrait (4:5) 2 photos
  (groom, bride) + gallery ke liye 6–12.
- **Edit (free):** Snapseed ya Lightroom Mobile, ek hi preset sab par. Warm tone suits the theme.
- **Background hatana (free):** Claude Code se kaho *"rembg (open-source) se groom.jpg aur
  bride.jpg ka background hata do"*, ye locally chalta hai, koi website upload nahi.
- **Stock (agar chahiye):** Unsplash (unsplash.com) aur Pexels (pexels.com), dono free,
  credit zaroori nahi. Search: "marigold", "diya", "rajasthan palace", "haveli door",
  "indian wedding decor".
- **Compress:** Squoosh (squoosh.app) ya Claude Code ka `optimize-images.mjs` (sharp).
- Original photos `assets/photos/` mein daalo, script baaki sizes khud banayegi.

---

## 8. OG image (WhatsApp preview wali photo)

Ye sabse pehli cheez hai jo guest dekhta hai, isliye isko sabse achha banao.
- Size **1200 × 630**, JPEG, **300 KB se kam** (warna WhatsApp chupchaap image nahi dikhata).
- Design: maroon background, beech mein Ganesh (gold), neeche couple ke naam (Great Vibes /
  Yatra One), date. Important cheezein beech ke 80% hisse mein rakho (WhatsApp kinaare kaat
  sakta hai).
- Tools: **Canva free** (sirf free elements, crown wale nahi) ya **Figma free**. Ya Claude Code
  se kaho *"`scripts/make-og.mjs` banao jo hamare SVG + fonts se sharp use karke og-default.jpg
  generate kare"*, isse design site se 100% match karega.
- Squoosh mein JPEG quality 80 par compress karo.

---

## 9. Content (text) kahan se

| Content | Source |
|---|---|
| Nimantran patra ki bhasha | `content/wedding.json` mein Hindi + English likhi hui hai. Apne parivaar ke card jaisa badal lo |
| Shlok (Vakratunda, Mangalam Bhagwan Vishnu) | Paaramparik, public domain. JSON mein hai |
| Saat vachan | Saral bhasha mein JSON mein likhe hain. Pandit ji se apne sampraday ke hisaab se confirm kar lo |
| Muhurat, lagna, tithi | **Parivaar ke pandit ji.** Tithi aur Vikram Samvat cross-check: drikpanchang.com |
| Naamon ki Hindi spelling | Parivaar se confirm karo (Gboard Hindi typing / Google Input Tools) |
| Venue address + location | Google Maps par venue kholo → pin → "Share" → link `mapsUrl` mein, ya lat/lng copy |
| Hotel, station, airport info | Google Maps distance |
| English translation | Claude se karwa lo, parivaar se ek baar padhwa lo |
| Dress code rang | Parivaar decide kare; hex code ke liye htmlcolorcodes.com |

---

## 10. Final checklist (assets folder)

```
assets/
├─ svg/
│  ├─ ganesh-line.svg      ☐  (stroke ya fill, dono chalega)
│  ├─ ganesh-fill.svg      ☐  (optional)
│  ├─ door-left.svg        ☐
│  ├─ door-right.svg       ☐
│  ├─ toran.svg            ☐  (ya Claude Code fallback)
│  ├─ agni-kund.svg        ☐
│  ├─ varmala-couple.svg   ☐
│  ├─ mehendi-hand.svg     ☐
│  └─ (kalash, diya, divider, petals: Claude Code banayega)
├─ photos/
│  ├─ groom.jpg  bride.jpg ☐
│  └─ pw-01.jpg … pw-12.jpg ☐
└─ audio/
   ├─ shehnai-loop.mp3     ☐
   └─ shankh.mp3           ☐
public/og/og-default.jpg   ☐
CREDITS.md                 ☐  (jo bhi CC-BY / Freepik asset use kiya)
```

Koi asset missing ho to bhi build rukega nahi. Claude Code simple fallback dikhayega, aur tum
baad mein asli file daal ke rebuild kar sakte ho.
