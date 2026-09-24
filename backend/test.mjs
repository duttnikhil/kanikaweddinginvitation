// Runs Code.gs + Admin.gs in Node against an in-memory fake Sheet. `node backend/test.mjs`
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const tabs = {
  Guests: [["guest_id", "name_en", "name_hi", "salutation_en", "salutation_hi", "side", "phone", "allowed_events", "max_pax", "lang", "invite_sent_at", "first_opened_at", "last_opened_at", "open_count", "notes"],
    ["g1", "Sharma Parivar", "शर्मा परिवार", "Shri & Smt.", "श्री एवं श्रीमती", "ladke", "919812345678", "ALL", 4, "hi", "", "", "", "", ""],
    ["g2", "Mehta Family", "", "", "", "ladki", "919800000000", "reception", 2, "en", "", "", "", "", ""],
    ["", "New Family", "", "", "", "common", "91", "ALL", 2, "en", "", "", "", "", ""]],
  RSVP: [["timestamp", "guest_id", "event_id", "status", "pax", "veg", "jain", "nonveg", "arrival_mode", "arrival_at", "message", "updated_count"]],
  Wishes: [["timestamp", "wish_id", "guest_id", "name", "message", "approved"]],
  Settings: [["key", "value"], ["wishes_require_approval", true], ["rsvp_deadline", "2099-11-30T23:59:00+05:30"], ["rsvp_open", true]],
};
const sheet = (name) => ({
  getDataRange: () => ({ getValues: () => tabs[name].map((r) => [...r]) }),
  getRange: (row, col, nr = 1, nc = 1) => ({
    setValue: (v) => { (tabs[name][row - 1] ||= [])[col - 1] = v; },
    setValues: (vals) => vals.forEach((r, i) => r.forEach((v, j) => { (tabs[name][row - 1 + i] ||= [])[col - 1 + j] = v; })),
  }),
  appendRow: (r) => tabs[name].push(r),
  clearContents: () => { tabs[name] = []; },
});
const props = { ADMIN_PASSWORD: "pw", EXPORT_KEY: "k".repeat(32) };
let cache = {};
const ctx = {
  console,
  SpreadsheetApp: { getActive: () => ({ getSheetByName: (n) => (tabs[n] ? sheet(n) : null), insertSheet: (n) => { tabs[n] = []; return sheet(n); } }), getUi: () => ({ alert() {} }) },
  ContentService: { createTextOutput: (s) => ({ s, setMimeType() { return JSON.parse(this.s); } }), MimeType: { JSON: "json" } },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] || null }) },
  CacheService: { getScriptCache: () => ({ get: (k) => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: (k) => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { formatDate: () => "2026-10-01 10:00:00", sleep() {} },
};
vm.createContext(ctx);
vm.runInContext(readFileSync("backend/Code.gs", "utf8") + readFileSync("backend/Admin.gs", "utf8"), ctx);
const post = (body) => ctx.doPost({ postData: { contents: JSON.stringify(body) }, parameter: {} });
const get = (p) => ctx.doGet({ parameter: p });
const yes = (event_id, pax, veg = pax) => ({ event_id, status: "yes", pax, veg, jain: 0, nonveg: pax - veg });

// RSVP validation
assert.equal(post({ action: "rsvp", g: "nope", responses: [yes("phere", 1)] }).error, "unknown_guest");
assert.equal(post({ action: "rsvp", g: "g2", responses: [yes("phere", 1)] }).error, "event_not_allowed");
assert.equal(post({ action: "rsvp", g: "g1", responses: [yes("phere", 5)] }).error, "bad_pax");
assert.equal(post({ action: "rsvp", g: "g1", responses: [{ ...yes("phere", 3), veg: 1 }] }).error, "bad_pax");
assert.equal(post({ action: "rsvp", g: "g1", responses: [{ ...yes("phere", 2), pax: 1.5 }] }).error, "bad_pax");
// Save, then upsert (no duplicates, updated_count increments)
const r1 = post({ action: "rsvp", g: "g1", responses: [yes("phere", 3), { event_id: "sangeet", status: "no", pax: 0, veg: 0, jain: 0, nonveg: 0 }], arrival: { mode: "train", at: "12 Dec 9am" }, message: "=HYPERLINK(\"x\")" });
assert.deepEqual(r1, { ok: true, data: { saved: 2 } });
post({ action: "rsvp", g: "g1", responses: [yes("phere", 4, 2)], arrival: { mode: "car" }, message: "hi" });
const phereRows = tabs.RSVP.filter((r) => r[1] === "g1" && r[2] === "phere");
assert.equal(phereRows.length, 1);
assert.equal(phereRows[0][11], 1, "updated_count incremented");
assert.equal(phereRows[0][4], 4);
assert.equal(tabs.RSVP.find((r) => r[2] === "sangeet")[10], "'=HYPERLINK(\"x\")", "formula guarded");
const got = get({ action: "rsvp", g: "g1" });
assert.equal(got.data.responses.length, 2);
// Closed
tabs.Settings[3][1] = false;
assert.equal(post({ action: "rsvp", g: "g1", responses: [yes("phere", 1)] }).error, "rsvp_closed");
tabs.Settings[3][1] = true;
tabs.Settings[2][1] = "2020-01-01T00:00:00+05:30";
assert.equal(post({ action: "rsvp", g: "g1", responses: [yes("phere", 1)] }).error, "rsvp_closed");
tabs.Settings[2][1] = "2099-01-01T00:00:00+05:30";

// Wishes: moderated, max 3, too long, cache cleared on approve
assert.deepEqual(post({ action: "wish", g: "g1", name: "Chachi", message: "Bahut badhai" }), { ok: true, data: { pending: true } });
assert.deepEqual(get({ action: "wishes" }).data, []);
post({ action: "wish", g: "g1", name: "@x", message: "two" });
post({ action: "wish", g: "g1", name: "c", message: "three" });
assert.equal(post({ action: "wish", g: "g1", name: "d", message: "four" }).error, "too_many");
assert.equal(post({ action: "wish", g: "g2", name: "d", message: "x".repeat(501) }).error, "too_long");
assert.equal(tabs.Wishes[2][3], "'@x");
const wishId = tabs.Wishes[1][1];
assert.equal(post({ action: "admin.approveWish", password: "pw", wish_id: wishId, approved: true }).ok, true);
assert.equal(get({ action: "wishes" }).data[0].name, "Chachi");

// Open beacon + export + admin
post({ action: "open", g: "g1" });
post({ action: "open", g: "g1" });
assert.equal(tabs.Guests[1][13], 2);
assert.equal(post({ action: "open", g: "zzz" }).ok, true);
assert.equal(get({ action: "export", key: "wrong" }).error, "forbidden");
const exp = get({ action: "export", key: props.EXPORT_KEY }).data.guests;
assert.deepEqual(Object.keys(exp), ["g1", "g2"]);
assert.equal(JSON.stringify(exp).includes("9198"), false, "no phones in export");
assert.deepEqual(exp.g2.e, ["reception"]);
assert.equal(post({ action: "admin.summary", password: "bad" }).error, "forbidden");
const sum = post({ action: "admin.summary", password: "pw", events: ["sangeet", "phere", "reception"] }).data;
assert.deepEqual(sum.events.phere, { invited: 1, yesFamilies: 1, yesPax: 4, maybePax: 0, no: 0, notReplied: 0, veg: 2, jain: 0, nonveg: 2 });
assert.equal(sum.events.reception.notReplied, 2);
assert.equal(sum.overall.replied, 1);
const adm = post({ action: "admin.guests", password: "pw" }).data;
assert.equal(adm.guests[0].phone, "919812345678");
assert.equal(adm.wishes.length, 3);
post({ action: "admin.markSent", password: "pw", g: "g2" });
assert.ok(tabs.Guests[2][10]);
assert.equal(post({ action: "nope" }).error, "bad_action");

// Menu: generate IDs
ctx.menuGenerateIds();
assert.match(tabs.Guests[3][0], /^[A-HJ-NP-Za-km-z2-9]{8}$/);
console.log("backend tests passed");
