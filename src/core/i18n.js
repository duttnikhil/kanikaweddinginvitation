// Language handling (SPEC §7.12). Text nodes are bound once and re-rendered on toggle.
import { content } from "./content.js";

let lang = content.meta.defaultLang || "hi";
const bound = []; // [el, value, attr|null]
const listeners = new Set();

export const getLang = () => lang;
export const otherLang = () => (lang === "hi" ? "en" : "hi");

// value: string | {hi,en} | (lang) => string
export function tr(value, l = lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "function") return value(l);
  return value[l] ?? value.en ?? value.hi ?? "";
}

// Replace {key} placeholders. Values may be {hi,en} objects too.
export function fill(template, vars, l = lang) {
  return tr(template, l).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? tr(vars[k], l) : m));
}

export function bind(el, value, attr = null) {
  if (!attr) el.setAttribute("data-i18n", "");
  bound.push([el, value, attr]);
  apply(el, value, attr);
  return el;
}

function apply(el, value, attr) {
  const text = tr(value);
  if (attr) el.setAttribute(attr, text);
  else el.textContent = text;
}

export function onLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLang(l, { persist = true } = {}) {
  if (l !== "hi" && l !== "en") return;
  lang = l;
  document.documentElement.lang = l;
  // ponytail: bound list never shrinks; fine for a one-page invite (a few hundred nodes)
  for (const [el, value, attr] of bound) apply(el, value, attr);
  if (persist) {
    try { localStorage.setItem("lang", l); } catch { /* storage blocked */ }
  }
  listeners.forEach((fn) => fn(l));
}

// localStorage.lang -> guest default -> wedding default (SPEC §7.2)
export function initLang(guest) {
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch { /* storage blocked */ }
  const l = saved || guest?.lang || content.meta.defaultLang || "hi";
  lang = l === "en" ? "en" : "hi";
  document.documentElement.lang = lang;
  return lang;
}
