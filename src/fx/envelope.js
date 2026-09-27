// Opening gate markup: a real-looking envelope resting on a linen backdrop (SPEC §7.4).
// Back → front inside .env: inside of the envelope, the card, the pocket (side + bottom flaps),
// the top flap (two faces for the 3D hinge: paper outside, gold-lattice liner inside), the seal.
// Rendered into index.html at build time (vite.config.js); opening.js adopts it.
import { gid } from "./mandala.js";
import { waxSeal, wreath, divider } from "./ornaments.js";
import { corner } from "./event-art.js";

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Gold-foil gradient for the flap edges (bright band like light catching foil).
const foil = (id) => `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#9C7A34"/><stop offset=".35" stop-color="#E9CF8E"/><stop offset=".5" stop-color="#B8923A"/><stop offset=".7" stop-color="#F1DDA4"/><stop offset="1" stop-color="#9C7A34"/></linearGradient>`;

// Pocket: side flaps meet under a bottom flap with a softly rounded tip. viewBox 300×360.
function pocketSvg() {
  const g = gid("pk");
  return `<svg class="env-pocket-svg" viewBox="0 0 300 360" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<linearGradient id="${g}l" x1="0" x2="1"><stop offset="0" stop-color="#F3EDE2"/><stop offset="1" stop-color="#EAE2D3"/></linearGradient>
<linearGradient id="${g}r" x1="1" x2="0"><stop offset="0" stop-color="#F1EBDF"/><stop offset="1" stop-color="#E7DFCF"/></linearGradient>
<linearGradient id="${g}b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F7F2E9"/><stop offset="1" stop-color="#EFE8DB"/></linearGradient>
<filter id="${g}s" x="-10%" y="-20%" width="120%" height="140%"><feDropShadow dx="0" dy="-1.5" stdDeviation="2.5" flood-color="#6B5530" flood-opacity=".16"/></filter>
${foil(`${g}f`)}</defs>
<path d="M0 0 L146 196 Q150 202 154 196 L0 360Z" fill="url(#${g}l)" filter="url(#${g}s)"/>
<path d="M300 0 L154 196 Q150 202 146 196 L300 360Z" fill="url(#${g}r)" filter="url(#${g}s)"/>
<path d="M0 360 L130 206 Q150 184 170 206 L300 360Z" fill="url(#${g}b)" filter="url(#${g}s)"/>
<path d="M0 360 L130 206 Q150 184 170 206 L300 360" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".8" transform="translate(0 1)"/>
<path d="M0 360 L130 206 Q150 184 170 206 L300 360" fill="none" stroke="url(#${g}f)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

// Top flap, outside (paper) and inside (liner) faces. viewBox 300×224, hinge at the top.
// The inside face is drawn mirrored, because the hinge flips it over.
const FLAP = "M0 0 H300 L170 204 Q150 226 130 204Z";
const FLAP_IN = "M0 224 H300 L170 20 Q150 -2 130 20Z";
const LINER_IN = "M14 224 H286 L166 36 Q150 16 134 36Z";

function flapFront() {
  const g = gid("ff");
  return `<svg viewBox="0 0 300 224" preserveAspectRatio="none" overflow="visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<linearGradient id="${g}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2ECE0"/><stop offset="1" stop-color="#F8F4EC"/></linearGradient>
<filter id="${g}s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#5A4626" flood-opacity=".2"/></filter>
${foil(`${g}f`)}</defs>
<path d="${FLAP}" fill="url(#${g}p)" filter="url(#${g}s)"/>
<path d="M0 .5 L130 204 Q150 226 170 204 L300 .5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/>
<path d="M0 0 L130 203 Q150 225 170 203 L300 0" fill="none" stroke="url(#${g}f)" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg>`;
}

function flapBack(sceneHtml) {
  const g = gid("fb");
  const lattice = `<pattern id="${g}j" width="22" height="30" patternUnits="userSpaceOnUse">
<path d="M11 0C19 7 19 23 11 30C3 23 3 7 11 0Z" fill="none" stroke="#B8923A" stroke-width=".7" stroke-opacity=".75"/>
<circle cx="0" cy="15" r="1.3" fill="#B8923A" fill-opacity=".6"/><circle cx="22" cy="15" r="1.3" fill="#B8923A" fill-opacity=".6"/></pattern>`;
  const liner = sceneHtml ? "" : `<path d="${LINER_IN}" fill="#CDD6C4"/><path d="${LINER_IN}" fill="url(#${g}j)"/>`;
  return `<svg viewBox="0 0 300 224" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${lattice}</defs>
<path d="${FLAP_IN}" fill="#EFE8DB"/>${liner}
<path d="${LINER_IN}" fill="none" stroke="#B8923A" stroke-opacity=".5" stroke-width=".8"/></svg>${sceneHtml ? `<div class="env-liner-img">${sceneHtml}</div>` : ""}`;
}

export function gateMarkup({ cta, skip, tagline, monogramText, names, to }, { sceneHtml, frameUrl } = {}) {
  const cut = String(tagline).lastIndexOf(" ");
  const [tag1, tag2] = cut > 0 ? [tagline.slice(0, cut), tagline.slice(cut + 1)] : [tagline, ""];
  return `<div id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-open-label">
<div class="gate-bg" aria-hidden="true">${["tl", "tr", "bl", "br"].map((c) => `<span class="gate-corner gate-corner--${c}">${corner}</span>`).join("")}</div>
<div class="gate-top" aria-hidden="true">${divider()}<p class="gate-tag1">${esc(tag1)}</p><p class="gate-tag2">${esc(tag2)}</p></div>
<div class="env" aria-hidden="true">
<div class="env-back"></div>
${frameUrl
  ? `<div class="env-card env-card--framed" style="--frame: url(&quot;${esc(frameUrl)}&quot;)"><div class="env-card-in"><p class="env-card-names">${esc(names)}</p></div></div>`
  : `<div class="env-card"><div class="env-card-in">${wreath(monogramText, { size: 84 })}<p class="env-card-names">${esc(names)}</p></div></div>`}
<div class="env-pocket">${pocketSvg()}<p class="env-to" hidden><span class="env-to-label">${esc(to || "")}</span><span class="env-to-name"></span></p></div>
<div class="env-flap"><div class="env-flap-face env-flap-front">${flapFront()}</div><div class="env-flap-face env-flap-back">${flapBack(sceneHtml)}</div></div>
</div>
<button type="button" id="gate-open" class="seal"><span id="gate-open-label" class="sr-only">${esc(cta)}</span>${waxSeal(monogramText)}</button>
<p class="gate-cta" aria-hidden="true">${esc(cta)}</p>
<button type="button" id="gate-skip" class="gate-skip">${esc(skip)}</button></div>`;
}
