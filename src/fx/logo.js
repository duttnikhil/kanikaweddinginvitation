// अK monogram (client's logo brief): Devanagari अ + K in teal, with Krishna's mor pankh and
// bansuri above, a lotus by the K and the Prem Sarovar ripples below. Drawn here, not imported:
// the reference image is an annotated mock-up, not artwork we may ship.
import { gid } from "./mandala.js";

const PETALS =
  '<path d="M0-16c5 5 5 11 0 16-5-5-5-11 0-16Z"/>' +
  '<path d="M-13-9c7 1 11 6 10 13-7-1-11-6-10-13Z"/><path d="M13-9c-7 1-11 6-10 13 7-1 11-6 10-13Z"/>' +
  '<path d="M-17 1c7-3 13 0 15 7-7 3-13 0-15-7Z"/><path d="M17 1c-7-3-13 0-15 7 7 3 13 0 15-7Z"/>';

const lotus = (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="0" cy="9" rx="20" ry="4" fill="#8FA88F" opacity=".55"/>
<g fill="#E6879B">${PETALS}</g><circle cy="2" r="3" fill="#F5D98B"/></g>`;

// text-anchor="middle" keeps the glyphs centred even if a fallback font is used.
export function logoAK({ title = "" } = {}) {
  const g = gid("ak");
  return `<svg class="logo-ak" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img">
<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#17806A"/><stop offset="1" stop-color="#0C5A4A"/></linearGradient></defs>
${title ? `<title>${title}</title>` : ""}
<g class="ak-flute" transform="rotate(-7 150 46)">
<rect x="92" y="40" width="126" height="9" rx="4.5" fill="#D9B45E"/>
<rect x="92" y="40" width="126" height="3" rx="1.5" fill="#F0DCA8" opacity=".7"/>
<g fill="#6B4B18"><circle cx="116" cy="45" r="1.8"/><circle cx="134" cy="45" r="1.8"/><circle cx="152" cy="45" r="1.8"/><circle cx="170" cy="45" r="1.8"/><circle cx="188" cy="45" r="1.8"/></g>
<path d="M96 49v12" stroke="#D9B45E" stroke-width="1.4" stroke-linecap="round"/><circle cx="96" cy="63" r="2.6" fill="#E6879B"/></g>
<g class="ak-feather" transform="rotate(14 118 30)">
<path d="M118 62C112 44 112 26 120 10" fill="none" stroke="#1C7A62" stroke-width="2" stroke-linecap="round"/>
<g fill="none" stroke="#2E9A7C" stroke-width="1.2" stroke-linecap="round" opacity=".85">
<path d="M117 50c-7-2-11-7-12-14"/><path d="M118 44c6-3 9-8 9-15"/><path d="M116 56c-7-1-12-5-14-11"/><path d="M119 38c6-4 8-9 7-16"/></g>
<ellipse cx="121" cy="14" rx="9" ry="12" fill="#1C7A62"/><ellipse cx="121" cy="14" rx="6" ry="8" fill="#2F7FA8"/>
<ellipse cx="121" cy="14" rx="3" ry="4.5" fill="#1D3F6B"/></g>
<g fill="url(#${g})" text-anchor="middle">
<text x="74" y="140" font-family="Yatra One, serif" font-size="128">अ</text>
<text x="170" y="140" font-family="Cinzel, serif" font-weight="500" font-size="118">K</text></g>
<g class="ak-sarovar" fill="none" stroke="#9DB7D0" stroke-width="1.6" stroke-linecap="round">
<path d="M40 154c34 7 126 7 160 0"/><path d="M58 164c26 5 98 5 124 0" opacity=".8"/><path d="M86 172h68" opacity=".6"/></g>
${lotus(62, 152, 0.62)}${lotus(176, 150, 0.9)}
</svg>`;
}
