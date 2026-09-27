// Howler wrapper (SPEC §7.4, §10): nothing loads before the gate tap; missing files are skipped.
import { Howl, Howler } from "howler";
import { audioUrl } from "./assets.js";

const CRACK = audioUrl("seal-crack");
const SHEHNAI = audioUrl("shehnai-loop");
export const hasMusic = !!SHEHNAI;

let crack = null;
let shehnai = null;
let started = false;
let muted = false;
try { muted = sessionStorage.getItem("muted") === "1"; } catch { /* ignore */ }
// Note: no Howler call at load time; the first one creates the AudioContext (slow on phones).
const listeners = new Set();

// Called inside the gate tap (user gesture): creates the sounds so iOS allows playback.
export function unlock() {
  Howler.mute(muted);
  if (CRACK && !crack) crack = new Howl({ src: [CRACK], volume: 0.9 });
  if (SHEHNAI && !shehnai) shehnai = new Howl({ src: [SHEHNAI], html5: true, loop: true, volume: 0 });
}

export function playCrack() {
  crack?.play();
}

export function startShehnai() {
  if (!shehnai) return;
  started = true;
  const id = shehnai.play();
  shehnai.fade(0, 0.35, 3000, id);
}

export const isMuted = () => muted;
export function onMute(fn) {
  listeners.add(fn);
}
export function setMuted(m) {
  muted = m;
  Howler.mute(m);
  try { sessionStorage.setItem("muted", m ? "1" : "0"); } catch { /* ignore */ }
  if (!m && started && shehnai && !shehnai.playing()) shehnai.play();
  listeners.forEach((fn) => fn(m));
}

// Pause when the tab/app is hidden, resume when visible again (unless muted).
document.addEventListener("visibilitychange", () => {
  if (!shehnai || !started) return;
  if (document.hidden) shehnai.pause();
  else if (!muted && !shehnai.playing()) shehnai.play();
});
