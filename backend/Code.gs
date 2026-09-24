/**
 * Shubh Vivah — Apps Script backend (SPEC §5). Paste into the Sheet's Apps Script editor.
 * Guest-facing actions live here; admin actions + the Sheet menu live in Admin.gs (paste both).
 * Script Properties: ADMIN_PASSWORD, EXPORT_KEY, DEPLOY_HOOK_URL, SITE_URL (for "Copy all invite links").
 */

var TAB = { guests: 'Guests', rsvp: 'RSVP', wishes: 'Wishes', settings: 'Settings', links: 'Links' };
var ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
var ARRIVAL_MODES = ['', 'car', 'train', 'flight', 'local'];
var STATUSES = ['yes', 'no', 'maybe'];

// ---------- routing ----------

function doGet(e) {
  var p = (e && e.parameter) || {};
  return route_(p.action, p, 'GET');
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return out_({ ok: false, error: 'bad_json' });
  }
  var action = body.action || (e.parameter && e.parameter.action);
  return route_(action, body, 'POST');
}

var ROUTES = {
  'GET wishes': getWishes_,
  'GET rsvp': getRsvp_,
  'GET export': exportGuests_,
  'POST rsvp': postRsvp_,
  'POST wish': postWish_,
  'POST open': postOpen_,
  'POST admin.summary': function (b) { return admin_(b, adminSummary_); },
  'POST admin.guests': function (b) { return admin_(b, adminGuests_); },
  'POST admin.markSent': function (b) { return admin_(b, adminMarkSent_); },
  'POST admin.approveWish': function (b) { return admin_(b, adminApproveWish_); }
};

function route_(action, payload, method) {
  var fn = ROUTES[method + ' ' + action];
  if (!fn) return out_({ ok: false, error: 'bad_action' });
  try {
    return out_(fn(payload || {}));
  } catch (err) {
    if (err && err.code) return out_({ ok: false, error: err.code });
    console.error(err);
    return out_({ ok: false, error: 'server' });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(code) {
  var e = new Error(code);
  e.code = code;
  throw e;
}

function ok_(data) {
  return { ok: true, data: data === undefined ? {} : data };
}

// ---------- sheet helpers ----------

function sheet_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) fail_('missing_tab_' + name);
  return sh;
}

// Returns { sh, headers, rows: [{...values, _row: sheetRowNumber}] }
function table_(name) {
  var sh = sheet_(name);
  var values = sh.getDataRange().getValues();
  var headers = values.shift().map(function (h) { return String(h).trim(); });
  var rows = values.map(function (r, i) {
    var o = { _row: i + 2 };
    headers.forEach(function (h, j) { if (h) o[h] = r[j]; });
    return o;
  });
  return { sh: sh, headers: headers, rows: rows };
}

function setCells_(t, row, obj) {
  Object.keys(obj).forEach(function (k) {
    var col = t.headers.indexOf(k);
    if (col >= 0) t.sh.getRange(row, col + 1).setValue(obj[k]);
  });
}

function appendRow_(t, obj) {
  t.sh.appendRow(t.headers.map(function (h) { return obj[h] === undefined ? '' : obj[h]; }));
}

function guestsMap_() {
  var t = table_(TAB.guests);
  var map = {};
  t.rows.forEach(function (r) {
    var id = String(r.guest_id || '').trim();
    if (id) map[id] = r;
  });
  return { t: t, map: map };
}

function allowedEvents_(g) {
  var raw = String(g.allowed_events || 'ALL').trim();
  if (!raw || raw.toUpperCase() === 'ALL') return ['ALL'];
  return raw.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(String);
}

function allows_(g, eventId) {
  var ev = allowedEvents_(g);
  return ev[0] === 'ALL' || ev.indexOf(eventId) >= 0;
}

function settings_() {
  var s = {};
  try {
    table_(TAB.settings).rows.forEach(function (r) { if (r.key) s[String(r.key).trim()] = r.value; });
  } catch (e) { /* optional tab */ }
  return s;
}

function truthy_(v) {
  return v === true || String(v).trim().toUpperCase() === 'TRUE';
}

// Sheets turns our timestamp strings into Dates; always hand back ISO in IST.
function iso_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ss'+05:30'");
  var s = String(v || '');
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s) ? s.replace(' ', 'T') + '+05:30' : s;
}

function now_() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

// Trim, cap, and neutralise spreadsheet formulas (= + - @).
function clean_(v, max) {
  var s = String(v == null ? '' : v).replace(/\s+$/g, '').replace(/^\s+/g, '').slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function int_(v) {
  var n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    fail_('busy');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function randomId_(len) {
  var s = '';
  for (var i = 0; i < len; i++) s += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  return s;
}

// ---------- guest-facing actions ----------

function getWishes_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('wishes');
  if (hit) return ok_(JSON.parse(hit));
  var list = table_(TAB.wishes).rows
    .filter(function (r) { return truthy_(r.approved); })
    .map(function (r) { return { name: String(r.name), message: String(r.message), ts: iso_(r.timestamp) }; })
    .reverse()
    .slice(0, 60);
  cache.put('wishes', JSON.stringify(list), 60);
  return ok_(list);
}

function getRsvp_(p) {
  var g = guestsMap_().map[String(p.g || '')];
  if (!g) fail_('unknown_guest');
  var rows = table_(TAB.rsvp).rows.filter(function (r) { return String(r.guest_id) === String(p.g); });
  if (!rows.length) return ok_(null);
  var first = rows[0];
  var latest = rows.map(function (r) { return iso_(r.timestamp); }).sort().pop();
  return ok_({
    responses: rows.map(function (r) {
      return { event_id: String(r.event_id), status: String(r.status), pax: Number(r.pax) || 0,
        veg: Number(r.veg) || 0, jain: Number(r.jain) || 0, nonveg: Number(r.nonveg) || 0 };
    }),
    arrival: { mode: String(first.arrival_mode || ''), at: String(first.arrival_at || '') },
    message: String(first.message || ''),
    updated_at: latest
  });
}

function postRsvp_(b) {
  var gm = guestsMap_();
  var g = gm.map[String(b.g || '')];
  if (!g) fail_('unknown_guest');

  var s = settings_();
  if (s.rsvp_open !== undefined && !truthy_(s.rsvp_open)) fail_('rsvp_closed');
  if (s.rsvp_deadline) {
    var dl = s.rsvp_deadline instanceof Date ? s.rsvp_deadline : new Date(String(s.rsvp_deadline));
    if (!isNaN(dl) && Date.now() > dl.getTime()) fail_('rsvp_closed');
  }

  var responses = Array.isArray(b.responses) ? b.responses : [];
  if (!responses.length || responses.length > 20) fail_('bad_input');
  var maxPax = int_(g.max_pax) || 1;
  var clean = responses.map(function (r) {
    var eventId = String(r.event_id || '').trim().toLowerCase();
    if (!allows_(g, eventId)) fail_('event_not_allowed');
    var status = String(r.status || '');
    if (STATUSES.indexOf(status) < 0) fail_('bad_input');
    var pax = int_(r.pax), veg = int_(r.veg), jain = int_(r.jain), nonveg = int_(r.nonveg);
    if (status === 'no') { pax = 0; veg = 0; jain = 0; nonveg = 0; }
    if ([pax, veg, jain, nonveg].some(isNaN)) fail_('bad_pax');
    if (pax < 0 || pax > maxPax || veg < 0 || jain < 0 || nonveg < 0) fail_('bad_pax');
    if (status !== 'no' && pax < 1) fail_('bad_pax');
    if (status === 'yes' && veg + jain + nonveg !== pax) fail_('bad_pax');
    return { event_id: eventId, status: status, pax: pax, veg: veg, jain: jain, nonveg: nonveg };
  });

  var arrival = b.arrival || {};
  var mode = String(arrival.mode || '').toLowerCase();
  if (ARRIVAL_MODES.indexOf(mode) < 0) fail_('bad_input');
  var shared = {
    arrival_mode: mode,
    arrival_at: clean_(arrival.at, 40),
    message: clean_(b.message, 500)
  };
  var gid = String(g.guest_id);

  return withLock_(function () {
    var t = table_(TAB.rsvp);
    var ts = now_();
    clean.forEach(function (r) {
      var existing = t.rows.filter(function (x) { return String(x.guest_id) === gid && String(x.event_id) === r.event_id; })[0];
      var row = { timestamp: ts, guest_id: gid, event_id: r.event_id, status: r.status, pax: r.pax,
        veg: r.veg, jain: r.jain, nonveg: r.nonveg, arrival_mode: shared.arrival_mode,
        arrival_at: shared.arrival_at, message: shared.message };
      if (existing) {
        row.updated_count = (Number(existing.updated_count) || 0) + 1;
        t.sh.getRange(existing._row, 1, 1, t.headers.length)
          .setValues([t.headers.map(function (h) { return row[h] === undefined ? existing[h] : row[h]; })]);
      } else {
        row.updated_count = 0;
        appendRow_(t, row);
      }
    });
    return ok_({ saved: clean.length });
  });
}

function postWish_(b) {
  var g = guestsMap_().map[String(b.g || '')];
  if (!g) fail_('unknown_guest');
  var name = String(b.name || '').trim();
  var message = String(b.message || '').trim();
  if (!name || !message) fail_('bad_input');
  if (name.length > 60 || message.length > 500) fail_('too_long');
  var needsApproval = settings_().wishes_require_approval;
  var approved = needsApproval === undefined ? false : !truthy_(needsApproval);
  return withLock_(function () {
    var t = table_(TAB.wishes);
    var mine = t.rows.filter(function (r) { return String(r.guest_id) === String(g.guest_id); }).length;
    if (mine >= 3) fail_('too_many');
    appendRow_(t, { timestamp: now_(), wish_id: randomId_(10), guest_id: String(g.guest_id),
      name: clean_(name, 60), message: clean_(message, 500), approved: approved });
    if (approved) CacheService.getScriptCache().remove('wishes');
    return ok_({ pending: !approved });
  });
}

function postOpen_(b) {
  try {
    var gm = guestsMap_();
    var g = gm.map[String(b.g || '')];
    if (!g) return ok_();
    withLock_(function () {
      var ts = now_();
      var cells = { last_opened_at: ts, open_count: (Number(g.open_count) || 0) + 1 };
      if (!g.first_opened_at) cells.first_opened_at = ts;
      setCells_(gm.t, g._row, cells);
    });
  } catch (e) { /* silent by contract */ }
  return ok_();
}

function exportGuests_(p) {
  var key = PropertiesService.getScriptProperties().getProperty('EXPORT_KEY');
  if (!key || !safeEqual_(String(p.key || ''), key)) fail_('forbidden');
  var guests = {};
  table_(TAB.guests).rows.forEach(function (g) {
    var id = String(g.guest_id || '').trim();
    if (!id) return;
    guests[id] = {
      n: { en: String(g.name_en || ''), hi: String(g.name_hi || g.name_en || '') },
      s: { en: String(g.salutation_en || ''), hi: String(g.salutation_hi || '') },
      e: allowedEvents_(g),
      p: int_(g.max_pax) || 1,
      l: String(g.lang || '').trim() === 'en' ? 'en' : 'hi'
    };
  });
  return ok_({ guests: guests });
}

// Constant-time string comparison (length leak only).
function safeEqual_(a, b) {
  var diff = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
