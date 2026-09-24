// Procedural ornaments (SPEC §9.5, ASSETS-AND-CONTENT §5). Trusted static SVG strings.
import { gid, goldGradient } from "./mandala.js";

// Lotus + two paisleys, 320x40
export function divider() {
  const g = gid("dv");
  return `<svg class="divider" viewBox="0 0 320 40" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}</defs>
<g fill="none" stroke="url(#${g})" stroke-width="1.4" stroke-linecap="round">
<path d="M8 20H112M208 20H312"/>
<path d="M112 20c8-10 22-10 26-2 3 6-3 10-8 7" /><path d="M208 20c-8-10-22-10-26-2-3 6 3 10 8 7"/>
<path d="M160 6c7 8 7 18 0 26-7-8-7-18 0-26Z"/>
<path d="M160 32c-3-9-11-15-20-15 2 9 10 15 20 15Z"/><path d="M160 32c3-9 11-15 20-15-2 9-10 15-20 15Z"/>
<path d="M146 34h28"/>
</g><g fill="#C9A043"><circle cx="100" cy="20" r="2"/><circle cx="220" cy="20" r="2"/><circle cx="6" cy="20" r="1.6"/><circle cx="314" cy="20" r="1.6"/></g></svg>`;
}

export function kalash() {
  const g = gid("kl");
  return `<svg class="kalash" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}</defs>
<path d="M36 56c-24 14-26 58 4 72h40c30-14 28-58 4-72Z" fill="#F3EAD6" stroke="url(#${g})" stroke-width="2"/>
<path d="M40 56h40v-8H40Z" fill="url(#${g})"/>
<path d="M34 92h52" stroke="#C5A165" stroke-width="2"/><path d="M40 104h40" stroke="#E3A5AE" stroke-width="1.4" stroke-dasharray="3 4"/>
<g fill="#8FA88F"><path d="M60 46C44 44 30 34 24 22c14 0 28 8 36 24Z"/><path d="M60 46c16-2 30-12 36-24-14 0-28 8-36 24Z"/><path d="M60 46c-10-6-18-18-18-30 10 6 16 16 18 30Z"/><path d="M60 46c10-6 18-18 18-30-10 6-16 16-18 30Z"/></g>
<ellipse cx="60" cy="30" rx="13" ry="15" fill="#8A5A2B"/><path d="M50 22c6-4 14-4 20 0" stroke="#5c3a1a" stroke-width="2" fill="none"/>
<path d="M54 76h12M60 70v12M54 70h0M54 70v6M66 82v-6M66 70h-6M54 82h6" stroke="#C98B96" stroke-width="2" stroke-linecap="round"/></svg>`;
}

// Diya with the flame as its own group (.flame) so it can flicker / light up.
export function diya({ lit = true } = {}) {
  const g = gid("dy");
  return `<svg class="diya${lit ? " is-lit" : ""}" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}
<radialGradient id="${g}f" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#F2B705"/><stop offset="1" stop-color="#E0561B"/></radialGradient></defs>
<g class="flame" style="transform-origin:50px 46px"><path d="M50 8c10 14 14 24 8 34-3 5-13 5-16 0-6-10-2-20 8-34Z" fill="url(#${g}f)"/></g>
<path d="M8 50c8 22 26 32 42 32s34-10 42-32c-18 6-66 6-84 0Z" fill="#E7C6A0" stroke="url(#${g})" stroke-width="2"/>
<path d="M20 58c18 5 42 5 60 0" stroke="#fff" stroke-width="1.5" fill="none"/></svg>`;
}

// Mughal arch (jharokha) outline for photo frames; used as clip-path source too.
export const ARCH_PATH =
  "M0 400V120C0 70 30 40 60 28 80 20 92 10 100 0c8 10 20 20 40 28 30 12 60 42 60 92v280Z";

export function jharokha() {
  const g = gid("jh");
  return `<svg class="jharokha" viewBox="0 0 200 400" overflow="visible" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><defs>${goldGradient(g, "v")}</defs>
<path d="${ARCH_PATH}" fill="none" stroke="url(#${g})" stroke-width="3" vector-effect="non-scaling-stroke"/>
<path d="M10 400V124C10 78 38 50 64 38 82 30 94 20 100 12c6 8 18 18 36 26 26 12 54 40 54 86v276" fill="none" stroke="#C9A043" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/></svg>`;
}

// Shared objectBoundingBox clip for arch photos: add once to the page, use clip-path: url(#arch-clip)
export const archClipDefs = () =>
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="arch-clip" clipPathUnits="objectBoundingBox"><path transform="scale(.005 .0025)" d="${ARCH_PATH}"/></clipPath></svg>`;

// Repeating marigold + mango-leaf toran; width follows its container (SVG pattern).
export function toran() {
  const p = gid("tp");
  return `<svg class="toran" viewBox="0 0 600 70" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
<defs><pattern id="${p}" width="60" height="70" patternUnits="userSpaceOnUse">
<path d="M0 8Q30 30 60 8" fill="none" stroke="#C9A043" stroke-width="1.5"/>
<g class="sway-item"><path d="M30 22c-7 10-7 24 0 36 7-12 7-26 0-36Z" fill="#8FA88F"/><path d="M30 26v28" stroke="#C9D8C4" stroke-width="1"/></g>
<circle cx="8" cy="15" r="7" fill="#fff" stroke="#E3C9CE"/><circle cx="8" cy="15" r="3" fill="#E9D29A"/>
<circle cx="52" cy="15" r="7" fill="#E8B4BC"/><circle cx="52" cy="15" r="3" fill="#fff"/>
<circle cx="30" cy="19" r="4.5" fill="#C98B96"/></pattern></defs>
<rect width="600" height="3" fill="#C5A165"/><rect y="2" width="600" height="68" fill="url(#${p})"/></svg>`;
}

// Carved temple door half (fallback for door-left/right.svg). side: "left" | "right"
export function door(side) {
  const g = gid("dr");
  const knobX = side === "left" ? 176 : 24;
  let studs = "";
  for (let y = 60; y <= 560; y += 50) for (const x of [26, 174]) studs += `<circle cx="${x}" cy="${y}" r="4"/>`;
  return `<svg class="door-art" viewBox="0 0 200 620" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g, "v")}
<linearGradient id="${g}w" x1="0" x2="1"><stop offset="0" stop-color="#E3EAF5"/><stop offset=".5" stop-color="#F8FAFD"/><stop offset="1" stop-color="#E3EAF5"/></linearGradient></defs>
<rect width="200" height="620" fill="url(#${g}w)"/>
<g fill="none" stroke="url(#${g})" stroke-width="2.5">
<rect x="10" y="10" width="180" height="600" rx="4"/>
<path d="M40 280V120c0-40 30-64 60-80 30 16 60 40 60 80v160Z"/>
<path d="M54 270V126c0-30 22-50 46-64 24 14 46 34 46 64v144Z" stroke-width="1.2"/>
<rect x="40" y="310" width="120" height="120" rx="6"/><rect x="40" y="450" width="120" height="130" rx="6"/>
<circle cx="100" cy="370" r="34" stroke-width="1.4"/><circle cx="100" cy="370" r="20" stroke-width="1.2"/>
<path d="M100 336v68M66 370h68M76 346l48 48M124 346l-48 48" stroke-width=".9"/>
<path d="M100 470c14 18 14 36 0 52-14-16-14-34 0-52ZM70 540h60" stroke-width="1.2"/></g>
<g fill="url(#${g})">${studs}</g>
<circle cx="${knobX}" cy="330" r="16" fill="none" stroke="url(#${g})" stroke-width="4"/>
<circle cx="${knobX}" cy="312" r="5" fill="#C5A165"/></svg>`;
}

// Opening gate markup (SPEC §7.4). Rendered into index.html at build time so the first paint
// doesn't wait for JS; opening.js adopts it. Text is trusted copy from wedding.json.
export function gateMarkup({ cta, skip, hint }, { doorLeft, doorRight, toranSvg } = {}) {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<div id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-open">
<div class="door door-left" aria-hidden="true">${doorLeft || door("left")}</div>
<div class="door door-right" aria-hidden="true">${doorRight || door("right")}</div>
<div class="gate-light" aria-hidden="true"></div>
<div class="gate-toran" aria-hidden="true">${toranSvg || toran()}</div>
<div class="gate-center"><button type="button" id="gate-open" class="gate-btn"><span>${esc(cta)}</span></button>${hint ? `<p class="gate-hint">${esc(hint)}</p>` : ""}</div>
<button type="button" id="gate-skip" class="gate-skip">${esc(skip)}</button></div>`;
}

// Fire altar with three flame groups #flame-1..3 (fallback for agni-kund.svg)
export function agniKund() {
  const g = gid("ak");
  const flame = (n, x, h, s) =>
    `<g id="flame-${n}" class="flame" style="transform-origin:${x}px 150px"><path d="M${x} ${150 - h}c${s} ${h * 0.4} ${s * 1.2} ${h * 0.75} 0 ${h}-${s * 1.2}-${h * 0.25}-${s}-${h * 0.6} 0-${h}Z" fill="url(#${g}f)"/></g>`;
  return `<svg class="agni-kund" viewBox="0 0 240 230" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}
<linearGradient id="${g}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E0561B"/><stop offset=".6" stop-color="#F2B705"/><stop offset="1" stop-color="#FFF3B0"/></linearGradient></defs>
${flame(2, 92, 62, 16)}${flame(3, 148, 66, 16)}${flame(1, 120, 96, 22)}
<path d="M40 150h160l-14 22H54Z" fill="#A3161A" stroke="url(#${g})" stroke-width="2"/>
<path d="M54 172h132l-12 22H66Z" fill="#7a1216" stroke="url(#${g})" stroke-width="2"/>
<path d="M66 194h108l-10 22H76Z" fill="#5A0E12" stroke="url(#${g})" stroke-width="2"/>
<path d="M60 161h120M72 183h96M84 205h72" stroke="#E9D29A" stroke-width="1" stroke-dasharray="2 6"/></svg>`;
}

// Stylised bride & groom facing each other with garland groups (fallback for varmala-couple.svg).
export function varmalaCouple() {
  const g = gid("vc");
  const garland = (id, cx, cy) => {
    let beads = "";
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (i / 12);
      const x = cx + Math.cos(a) * 24;
      const y = cy + Math.sin(a) * 30;
      beads += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${i % 3 ? "#F2B705" : "#E0861B"}"/>`;
    }
    return `<g id="${id}" class="garland">${beads}<circle cx="${cx}" cy="${cy + 30}" r="5" fill="#A3161A"/></g>`;
  };
  return `<svg class="varmala-couple" viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}</defs>
<g class="groom" fill="#5A0E12">
<path d="M88 64c0-16 12-26 26-26s26 10 26 26c0 14-10 24-26 24S88 78 88 64Z"/>
<path d="M84 52c4-22 22-30 36-26 12 2 22 10 24 20-10-6-28-8-40-2-8 4-14 6-20 8Z" fill="#A3161A"/>
<path d="M138 40c10 0 14 8 10 16" stroke="url(#${g})" stroke-width="3" fill="none"/>
<path d="M78 300l10-150c2-30 16-46 26-50 12 4 26 18 28 46l12 154Z"/>
<path d="M114 100v200" stroke="url(#${g})" stroke-width="2"/></g>
<g class="bride" fill="#A3161A">
<path d="M220 66c0-16 12-26 26-26s26 10 26 26c0 14-10 24-26 24s-26-10-26-24Z" fill="#5A0E12"/>
<path d="M208 70c0-32 18-44 40-44 26 0 38 20 36 48l14 226H192l6-150c2-40 4-60 10-80Z" opacity=".95"/>
<path d="M208 70c0-32 18-44 40-44 26 0 38 20 36 48" fill="none" stroke="url(#${g})" stroke-width="3"/>
<path d="M196 230c30 8 70 8 100 0" stroke="url(#${g})" stroke-width="2" fill="none"/></g>
<circle id="neck-groom" cx="114" cy="94" r="0"/><circle id="neck-bride" cx="246" cy="96" r="0"/>
${garland("garland-groom", 150, 118)}${garland("garland-bride", 208, 122)}</svg>`;
}

export function haldiDrops() {
  const drops = [[14, 18, 9], [82, 12, 6], [90, 70, 8], [8, 78, 5], [56, 90, 7], [40, 8, 4]];
  return drops
    .map(([x, y, r]) => `<svg class="haldi-drop" style="left:${x}%;top:${y}%" viewBox="0 0 20 24" width="${r * 3}" height="${r * 3.6}" aria-hidden="true"><path d="M10 0c6 9 9 14 9 17a9 9 0 0 1-18 0c0-3 3-8 9-17Z" fill="#F2B705"/></svg>`)
    .join("");
}

// Minimal line Ganesh (crown, ears, trunk, tilak) like the client's card sample.
export function ganeshSymbol() {
  const g = gid("gs");
  return `<svg class="ganesh-symbol" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g, "v")}</defs>
<g fill="none" stroke="url(#${g})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<path d="M38 26h24l-4-8H42Z"/><path d="M44 18l6-10 6 10"/><circle cx="50" cy="6" r="2.4"/>
<path d="M34 34c-14-4-24 6-22 20 2 12 12 18 22 14"/><path d="M66 34c14-4 24 6 22 20-2 12-12 18-22 14"/>
<path d="M34 34c4-6 28-6 32 0"/><path d="M50 40c0 22-2 34-10 44-6 8-2 18 8 16 6-1 8-8 4-12"/></g>
<path d="M50 30c3 4 3 8 0 11-3-3-3-7 0-11Z" fill="#B3474F"/></svg>`;
}

// Soft floral spray (blush roses, buds, sage leaves). side: "left" | "right"
export function floralSpray(side = "left") {
  const flip = side === "right" ? ' transform="translate(200 0) scale(-1 1)"' : "";
  const rose = (x, y, r, c) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}"/><path d="M${-r * 0.5} 0a${r * 0.5} ${r * 0.5} 0 1 1 ${r} 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"/><path d="M${-r * 0.25} ${r * 0.1}a${r * 0.28} ${r * 0.28} 0 1 0 ${r * 0.5} 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/></g>`;
  const leaf = (x, y, rot, c = "#9DB4A2") => `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0c6-10 18-12 26-6-8 8-18 10-26 6Z" fill="${c}" opacity=".85"/>`;
  return `<svg class="floral floral--${side}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g${flip}>
<path d="M8 196C40 150 60 110 112 70S176 18 196 8" fill="none" stroke="#B9C7B8" stroke-width="2"/>
${leaf(40, 150, -40)}${leaf(62, 118, -70, "#B5C8B6")}${leaf(90, 96, -20)}${leaf(128, 64, -60, "#B5C8B6")}${leaf(150, 44, -10)}${leaf(24, 176, 10, "#B5C8B6")}
${rose(70, 108, 16, "#E8B4BC")}${rose(112, 74, 11, "#F2D0D5")}${rose(40, 150, 10, "#F2D0D5")}${rose(152, 40, 8, "#E8B4BC")}
<circle cx="176" cy="22" r="4" fill="#E8B4BC"/><circle cx="90" cy="124" r="3" fill="#C5A165"/><circle cx="132" cy="84" r="2.5" fill="#C5A165"/></g></svg>`;
}

// Arch monogram (client sample): names along the arch, initials with a heart, date, tulip line.
// Strokes have data-draw so the intro can draw them.
export function monogram({ first, second, namesText, date }) {
  const g = gid("mo");
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg class="monogram-arch" viewBox="0 0 220 290" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g, "v")}
<path id="${g}t" d="M44 132C44 72 74 40 110 40S176 72 176 132"/></defs>
<g fill="none" stroke="url(#${g})" stroke-width="1.6" stroke-linecap="round" data-draw>
<path d="M30 280V132C30 60 66 22 110 22S190 60 190 132V280Z"/>
<path d="M36 274V132C36 66 70 28 110 28S184 66 184 132V274Z" stroke-width=".8"/>
<path d="M22 190c-6-24 4-44 18-52M40 138c-4 12-4 24 2 34M22 190c10-2 18-8 20-18"/>
<path d="M28 150c-10-8-10-20-2-26 8 6 8 18 2 26ZM42 138c-4-12 2-22 12-22 2 10-4 20-12 22Z"/>
<path d="M64 238c20 10 72 10 92 0M84 246h52"/></g>
<text font-family="Cinzel, serif" font-size="11" letter-spacing="3" fill="#8A6630"><textPath href="#${g}t" startOffset="50%" text-anchor="middle">${esc(namesText)}</textPath></text>
<text x="92" y="186" text-anchor="middle" font-family="Cinzel, serif" font-size="74" fill="url(#${g})">${esc(first)}</text>
<text x="136" y="214" text-anchor="middle" font-family="Cinzel, serif" font-size="58" fill="url(#${g})">${esc(second)}</text>
<path d="M110 222c-10-8-16-14-16-20a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 6-6 12-16 20Z" fill="none" stroke="#C98B96" stroke-width="1.6" data-draw/>
<text x="110" y="268" text-anchor="middle" font-family="Cinzel, serif" font-size="12" letter-spacing="2" fill="#8A6630">${esc(date)}</text></svg>`;
}
