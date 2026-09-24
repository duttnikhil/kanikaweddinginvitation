// Entry point: the CSS is emitted as render-blocking <link>s so the pre-rendered gate paints
// immediately; the app (main.js) is loaded right after that first paint.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/sections.css";
// gate.css is inlined into index.html as critical CSS (vite.config.js)

// A tap on the static gate before the app has loaded is remembered and replayed by opening.js.
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.("#gate-open, #gate-skip");
  if (btn && !document.documentElement.dataset.appReady) document.documentElement.dataset.earlyTap = btn.id;
}, true);

let started = false;
const start = () => {
  if (started) return;
  started = true;
  // In production the main stylesheet loads asynchronously; render the page only once it's there.
  const css = document.querySelector("link[data-main-css]");
  const ready = !css || css.rel === "stylesheet" || [...document.styleSheets].some((s) => s.ownerNode === css)
    ? Promise.resolve()
    : new Promise((r) => { css.addEventListener("load", r); css.addEventListener("error", r); });
  ready.then(() => import("./main.js"));
};
// Start once the gate has actually painted (first-contentful-paint); fallback for browsers
// without paint timing or for background tabs.
try {
  new PerformanceObserver((list, obs) => {
    if (list.getEntries().some((e) => e.name === "first-contentful-paint")) {
      obs.disconnect();
      setTimeout(start, 0);
    }
  }).observe({ type: "paint", buffered: true });
} catch { /* not supported */ }
setTimeout(start, 700);
