// Low-end detection (SPEC §7.5): hardware hints, plus an FPS probe that callers can run.
export const lowEndHint = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;

export function measureFps(ms = 2000) {
  return new Promise((resolve) => {
    let frames = 0;
    const t0 = performance.now();
    const tick = (t) => {
      frames++;
      if (t - t0 < ms) requestAnimationFrame(tick);
      else resolve((frames * 1000) / (t - t0));
    };
    requestAnimationFrame(tick);
  });
}
