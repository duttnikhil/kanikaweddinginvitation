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
<path d="M36 56c-24 14-26 58 4 72h40c30-14 28-58 4-72Z" fill="#A3161A" stroke="url(#${g})" stroke-width="2"/>
<path d="M40 56h40v-8H40Z" fill="url(#${g})"/>
<path d="M34 92h52" stroke="#E9D29A" stroke-width="2"/><path d="M40 104h40" stroke="#E9D29A" stroke-width="1.4" stroke-dasharray="3 4"/>
<g fill="#2E6B2F"><path d="M60 46C44 44 30 34 24 22c14 0 28 8 36 24Z"/><path d="M60 46c16-2 30-12 36-24-14 0-28 8-36 24Z"/><path d="M60 46c-10-6-18-18-18-30 10 6 16 16 18 30Z"/><path d="M60 46c10-6 18-18 18-30-10 6-16 16-18 30Z"/></g>
<ellipse cx="60" cy="30" rx="13" ry="15" fill="#8A5A2B"/><path d="M50 22c6-4 14-4 20 0" stroke="#5c3a1a" stroke-width="2" fill="none"/>
<path d="M54 76h12M60 70v12M54 70h0M54 70v6M66 82v-6M66 70h-6M54 82h6" stroke="#F2B705" stroke-width="2" stroke-linecap="round"/></svg>`;
}

// Diya with the flame as its own group (.flame) so it can flicker / light up.
export function diya({ lit = true } = {}) {
  const g = gid("dy");
  return `<svg class="diya${lit ? " is-lit" : ""}" viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g)}
<radialGradient id="${g}f" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#F2B705"/><stop offset="1" stop-color="#E0561B"/></radialGradient></defs>
<g class="flame" style="transform-origin:50px 46px"><path d="M50 8c10 14 14 24 8 34-3 5-13 5-16 0-6-10-2-20 8-34Z" fill="url(#${g}f)"/></g>
<path d="M8 50c8 22 26 32 42 32s34-10 42-32c-18 6-66 6-84 0Z" fill="#A3161A" stroke="url(#${g})" stroke-width="2"/>
<path d="M20 58c18 5 42 5 60 0" stroke="#E9D29A" stroke-width="1.5" fill="none"/></svg>`;
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
<g class="sway-item"><path d="M30 22c-7 10-7 24 0 36 7-12 7-26 0-36Z" fill="#2E6B2F"/><path d="M30 26v28" stroke="#9BC48A" stroke-width="1"/></g>
<circle cx="8" cy="15" r="7" fill="#F2B705"/><circle cx="8" cy="15" r="3.2" fill="#E0861B"/>
<circle cx="52" cy="15" r="7" fill="#E0861B"/><circle cx="52" cy="15" r="3.2" fill="#F2B705"/>
<circle cx="30" cy="19" r="5" fill="#A3161A"/></pattern></defs>
<rect width="600" height="4" fill="#C9A043"/><rect y="2" width="600" height="68" fill="url(#${p})"/></svg>`;
}

// Carved temple door half (fallback for door-left/right.svg). side: "left" | "right"
export function door(side) {
  const g = gid("dr");
  const knobX = side === "left" ? 176 : 24;
  let studs = "";
  for (let y = 60; y <= 560; y += 50) for (const x of [26, 174]) studs += `<circle cx="${x}" cy="${y}" r="4"/>`;
  return `<svg class="door-art" viewBox="0 0 200 620" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs>${goldGradient(g, "v")}
<linearGradient id="${g}w" x1="0" x2="1"><stop offset="0" stop-color="#4a0b0f"/><stop offset=".5" stop-color="#6d1418"/><stop offset="1" stop-color="#4a0b0f"/></linearGradient></defs>
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
<circle cx="${knobX}" cy="312" r="5" fill="#E9D29A"/></svg>`;
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
${garland("garland-groom", 150, 118)}${garland("garland-bride", 208, 122)}</svg>`;
}

export function haldiDrops() {
  const drops = [[14, 18, 9], [82, 12, 6], [90, 70, 8], [8, 78, 5], [56, 90, 7], [40, 8, 4]];
  return drops
    .map(([x, y, r]) => `<svg class="haldi-drop" style="left:${x}%;top:${y}%" viewBox="0 0 20 24" width="${r * 3}" height="${r * 3.6}" aria-hidden="true"><path d="M10 0c6 9 9 14 9 17a9 9 0 0 1-18 0c0-3 3-8 9-17Z" fill="#F2B705"/></svg>`)
    .join("");
}
