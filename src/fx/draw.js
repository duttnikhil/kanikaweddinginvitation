// Stroke-drawing helpers shared by the Ganesh intro and the mehendi card (SPEC §9.5).

const DRAWABLE = "path, line, polyline, polygon, circle, ellipse, rect";

// Filled artwork (e.g. auto-traced) can't be stroke-drawn: reveal it through a mask whose
// thick zig-zag stroke is drawn instead (SPEC §9.5 mask reveal). Returns the mask path.
function maskReveal(svgEl) {
  const [x, y, w, hgt] = (svgEl.getAttribute("viewBox") || "0 0 100 100").split(/[\s,]+/).map(Number);
  const NS = "http://www.w3.org/2000/svg";
  const rows = 6;
  const step = hgt / rows;
  let d = `M${x} ${y + step / 2}`;
  for (let i = 0; i < rows; i++) {
    const yy = y + step / 2 + i * step;
    d += i % 2 ? ` L${x} ${yy}` : ` L${x + w} ${yy}`;
    if (i < rows - 1) d += i % 2 ? ` L${x} ${yy + step}` : ` L${x + w} ${yy + step}`;
  }
  const id = `reveal-${Math.random().toString(36).slice(2, 8)}`;
  const mask = document.createElementNS(NS, "mask");
  mask.setAttribute("id", id);
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "#fff");
  p.setAttribute("stroke-width", String(step * 1.25));
  mask.append(p);
  const group = document.createElementNS(NS, "g");
  group.setAttribute("mask", `url(#${id})`);
  group.append(...[...svgEl.childNodes].filter((n) => n.nodeName !== "defs"));
  svgEl.append(mask, group);
  return [p];
}

function isFilled(svgEl) {
  const shapes = [...svgEl.querySelectorAll(DRAWABLE)];
  const stroked = shapes.filter((s) => {
    const st = s.getAttribute("stroke") || s.closest("[stroke]")?.getAttribute("stroke");
    return st && st !== "none";
  });
  return shapes.length > 0 && stroked.length < shapes.length / 3;
}

// What to animate with DrawSVG: the stroke shapes, or the mask path if the art is filled.
export function drawTargets(svgEl) {
  if (isFilled(svgEl)) return (svgEl.__mask ||= maskReveal(svgEl));
  return [...svgEl.querySelectorAll(DRAWABLE)].filter((el) => !el.closest("mask, defs, clipPath"));
}
