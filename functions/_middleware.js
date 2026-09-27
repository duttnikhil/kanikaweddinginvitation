// Per-guest WhatsApp preview + guest data injection (SPEC §6).
// Runs only for "/" and "/index.html" (see public/_routes.json), never for assets or /admin.
import guests from "./_data/guests.js";
import wedding from "../content/wedding.json";

const share = wedding.share;
const defaultLang = wedding.meta.defaultLang || "hi";

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)).replace(/\s{2,}/g, " ").trim();
}

// Tagline split like gateMarkup(): all but the last word / the last word (script line).
function tagParts(t) {
  const i = t.lastIndexOf(" ");
  return i > 0 ? [t.slice(0, i), t.slice(i + 1)] : [t, ""];
}

class SetAttr {
  constructor(attr, value) {
    this.attr = attr;
    this.value = value;
  }
  element(el) {
    el.setAttribute(this.attr, this.value);
  }
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const res = await ctx.next();
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html") || url.pathname.startsWith("/admin")) return res;

  const id = url.searchParams.get("g");
  const guest = id && Object.prototype.hasOwnProperty.call(guests, id) ? guests[id] : null;
  const l = guest?.l === "en" ? "en" : guest ? "hi" : defaultLang;
  const title = guest
    ? fill(share.ogTitleKnown[l], { salutation: guest.s?.[l] || "", name: guest.n?.[l] || guest.n?.en || "" })
    : share.ogTitleGeneric[l];
  const desc = share.ogDescription[l];
  // Canonical share URL keeps only ?g= (drops cache-busters like &v=2).
  const ogUrl = `${url.origin}/${guest ? `?g=${encodeURIComponent(id)}` : ""}`;

  let rewriter = new HTMLRewriter()
    .on("html", new SetAttr("lang", l))
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[property="og:title"]', new SetAttr("content", title))
    .on('meta[name="twitter:title"]', new SetAttr("content", title))
    .on('meta[property="og:description"]', new SetAttr("content", desc))
    .on('meta[name="description"]', new SetAttr("content", desc))
    .on('meta[property="og:url"]', new SetAttr("content", ogUrl))
    // The pre-rendered gate is in the default language; switch it to the guest's.
    .on("#gate-open-label, .gate-cta", { element: (el) => el.setInnerContent(wedding.gate.cta[l]) })
    .on("#gate-skip", { element: (el) => el.setInnerContent(wedding.gate.skip[l]) })
    .on(".gate-tag1", { element: (el) => el.setInnerContent(tagParts(wedding.gate.tagline[l])[0]) })
    .on(".gate-tag2", { element: (el) => el.setInnerContent(tagParts(wedding.gate.tagline[l])[1]) });
  if (guest) {
    const json = JSON.stringify({ id, ...guest }).replace(/</g, "\\u003c");
    rewriter = rewriter.on("head", {
      element: (el) => el.append(`<script id="guest-data" type="application/json">${json}</script>`, { html: true }),
    });
  }

  const out = rewriter.transform(res);
  const headers = new Headers(out.headers);
  headers.set("Cache-Control", "no-cache");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(out.body, { status: out.status, headers });
}
