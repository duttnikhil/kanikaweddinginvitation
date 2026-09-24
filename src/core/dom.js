// Tiny DOM helpers. Text always goes through textContent (via i18n.bind for {hi,en}).
import { bind, tr, onLang } from "./i18n.js";
import mapPin from "lucide-static/icons/map-pin.svg?raw";
import navigation from "lucide-static/icons/navigation.svg?raw";
import calendarPlus from "lucide-static/icons/calendar-plus.svg?raw";
import copy from "lucide-static/icons/copy.svg?raw";
import phone from "lucide-static/icons/phone.svg?raw";
import messageCircle from "lucide-static/icons/message-circle.svg?raw";
import volume2 from "lucide-static/icons/volume-2.svg?raw";
import volumeX from "lucide-static/icons/volume-x.svg?raw";
import languages from "lucide-static/icons/languages.svg?raw";
import check from "lucide-static/icons/check.svg?raw";
import x from "lucide-static/icons/x.svg?raw";
import chevronDown from "lucide-static/icons/chevron-down.svg?raw";
import chevronLeft from "lucide-static/icons/chevron-left.svg?raw";
import chevronRight from "lucide-static/icons/chevron-right.svg?raw";
import image from "lucide-static/icons/image.svg?raw";
import gift from "lucide-static/icons/gift.svg?raw";
import train from "lucide-static/icons/train.svg?raw";
import plane from "lucide-static/icons/plane.svg?raw";
import hotel from "lucide-static/icons/hotel.svg?raw";

const ICONS = {
  "map-pin": mapPin, navigation, "calendar-plus": calendarPlus, copy, phone,
  "message-circle": messageCircle, "volume-2": volume2, "volume-x": volumeX, languages,
  check, x, "chevron-down": chevronDown, "chevron-left": chevronLeft,
  "chevron-right": chevronRight, image, gift, train, plane, hotel,
};

// h("p", { class: "x", text: {hi,en} }, child, ...)
//  text: string -> textContent; {hi,en} or fn -> bound for language toggle
//  i18n: { attrName: {hi,en} } -> bound attributes (aria-label, placeholder...)
//  html: TRUSTED static markup only (our own SVG strings). Never user data.
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") typeof v === "string" ? (el.textContent = v) : bind(el, v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "i18n") for (const [a, val] of Object.entries(v)) bind(el, val, a);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, ...children);
  return el;
}

// Like Element.append, but skips null/false (native append would insert the text "null").
export function append(el, ...children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// Parse a trusted SVG string into an element.
export function svg(markup) {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  const el = t.content.querySelector("svg");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("focusable", "false");
  return el;
}

export function icon(name, cls = "ic") {
  const el = svg(ICONS[name] || ICONS.x);
  el.setAttribute("class", cls);
  el.removeAttribute("width");
  el.removeAttribute("height");
  return el;
}

// Multi-line copy ("\n") as one block per line; re-rendered on language toggle.
// value: {hi,en} or (lang) => string
export function multiline(value, cls = "line", tag = "span") {
  const wrap = h("span", { class: "lines" });
  const render = () =>
    wrap.replaceChildren(...tr(value).split("\n").map((ln) => h(tag, { class: cls, text: ln })));
  render();
  onLang(render);
  return wrap;
}
