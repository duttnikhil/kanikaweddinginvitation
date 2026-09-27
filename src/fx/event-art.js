// Event card art: one gold line icon per function (drawn with DrawSVG on scroll) and the corner
// flourish of the stationery frame. Stroke only, currentColor, so the card's gold applies.

const wrap = (body) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ring = (r, n, dot = 1.1) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="${dot}"/>`;
}).join("");

const petals = (r, n, len, w) => Array.from({ length: n }, (_, i) => {
  const a = (360 / n) * i;
  return `<path d="M32 ${32 - r}c${w} -${len * 0.45} ${w} -${len * 0.8} 0 -${len}c-${w} ${len * 0.2} -${w} ${len * 0.55} 0 ${len}Z" transform="rotate(${a} 32 32)"/>`;
}).join("");

const ICONS = {
  // Haldi: katori of turmeric with a mango leaf
  haldi: `<path d="M12 34h40c0 10-9 17-20 17s-20-7-20-17Z"/><path d="M18 34c3-6 25-6 28 0"/><path d="M26 51l-2 5h16l-2-5"/><path d="M32 26c-5-5-4-13 3-17 2 6 1 13-3 17Z"/><path d="M32 26c0-5 1-10 3-14"/><circle cx="26" cy="31" r=".8"/><circle cx="38" cy="30.5" r=".8"/>`,
  // Mehendi: mandala
  mehendi: `<circle cx="32" cy="32" r="4"/>${petals(5, 8, 12, 4)}<circle cx="32" cy="32" r="19"/>${ring(23, 16)}`,
  // Phoolon ki haldi: five-petal flower with two leaves
  flowers: `<circle cx="32" cy="26" r="3.5"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M32 22c-5-4-5-11 0-14 5 3 5 10 0 14Z" transform="rotate(${a} 32 26)"/>`).join("")}<path d="M32 36v20"/><path d="M32 48c-6 0-11-3-12-8 6 0 10 3 12 8Z"/><path d="M32 45c6 0 10-3 11-7-5 0-9 3-11 7Z"/>`,
  // Wedding: lit diya on a stand
  phere: `<path d="M14 38c4 9 32 9 36 0Z"/><path d="M50 38l4-3"/><path d="M32 35c-6-6-4-13 0-19 4 6 6 13 0 19Z"/><path d="M32 32c-2-2-1-6 0-8 1 2 2 6 0 8Z"/><path d="M26 45l-3 8h18l-3-8"/><path d="M20 56h24"/>`,
  // Vidaai: palki (doli) with canopy and carrying pole
  vidaai: `<path d="M6 30h52"/><path d="M20 30c0-10 5-15 12-15s12 5 12 15"/><circle cx="32" cy="12" r="2"/><rect x="21" y="30" width="22" height="16" rx="1.5"/><path d="M27 30v16M37 30v16"/><path d="M21 46l-2 5M43 46l2 5"/>`,
  // Anything else: kalash with mango leaves and coconut
  kalash: `<path d="M22 30c-6 4-8 10-6 16 3 7 29 7 32 0 2-6 0-12-6-16Z"/><path d="M24 30h16"/><path d="M26 30c-1-3 0-5 6-5s7 2 6 5"/><circle cx="32" cy="18" r="6"/><path d="M26 24c-5-1-8-4-9-8 5 0 8 3 9 8ZM38 24c5-1 8-4 9-8-5 0-8 3-9 8Z"/><path d="M24 52h16"/>`,
};

export function eventIcon(motif, id) {
  const key = ICONS[motif] ? motif : id === "phere" ? "phere" : id === "vidaai" ? "vidaai" : "kalash";
  return wrap(ICONS[key]);
}

// Corner flourish (top-left orientation; CSS mirrors it for the other corners).
export const corner = `<svg class="ev-corner" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><path d="M3 37V12C3 7 7 3 12 3h25"/><path d="M9 30V15c0-3 3-6 6-6h15"/><path d="M15 15c5 0 7 4 5 7s-6 1-5-2"/><circle cx="31" cy="9" r="1"/><circle cx="9" cy="31" r="1"/></svg>`;
