// Shagun via UPI: deep link, QR, VPA copy (SPEC §7.15). Hidden if disabled or in post phase.
import { h } from "../core/dom.js";
import { enabled } from "../core/content.js";
import { section, copyButton } from "./common.js";

export const upiLink = (s) =>
  `upi://pay?pa=${s.vpa}&pn=${encodeURIComponent(s.payeeName || "")}&cu=INR&tn=${encodeURIComponent(s.note || "")}`;

export async function drawQr(canvas, text, width = 220) {
  const { default: QRCode } = await import("qrcode");
  await QRCode.toCanvas(canvas, text, { width, margin: 2, color: { dark: "#2A1612", light: "#FBF4E6" } });
}

export function mount(ctx) {
  const s = ctx.content.shagun;
  if (!enabled(s) || !s.vpa || ctx.phase === "post") return;
  const sec = section("shagun", { title: s.title });
  const canvas = h("canvas", { class: "upi-qr", width: 220, height: 220, role: "img", "aria-label": s.vpa });
  sec.append(
    h("p", { class: "prose shagun-line", text: s.line, "data-reveal": "" }),
    h("div", { class: "qr-frame" }, canvas),
    h("a", { class: "btn", href: upiLink(s) }, ctx.icon("gift"), h("span", { text: s.payButton })),
    h("div", { class: "vpa" },
      h("code", { class: "vpa-text", text: s.vpa }),
      copyButton(ctx, s.vpa, s.copy)));
  ctx.main.append(sec);

  // QR library is loaded only when the section comes near (keeps initial JS small).
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    drawQr(canvas, upiLink(s)).then(() => canvas.classList.add("is-ready")).catch(() => {});
  }, { rootMargin: "600px 0px" });
  io.observe(sec);
}
