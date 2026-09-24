/**
 * Admin actions (SPEC §5.2, §8) and the Sheet menu (SPEC §5.3). Needs Code.gs in the same project.
 */

function admin_(b, fn) {
  var real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!real || !safeEqual_(String(b.password || ''), real)) {
    Utilities.sleep(1000);
    fail_('forbidden');
  }
  return fn(b);
}

// b.events (optional): event ids from wedding.json so "ALL" guests count for every event.
function adminSummary_(b) {
  var guests = table_(TAB.guests).rows.filter(function (g) { return String(g.guest_id || '').trim(); });
  var rsvp = table_(TAB.rsvp).rows;
  var eventIds = Array.isArray(b.events) && b.events.length ? b.events.map(String) : [];
  rsvp.forEach(function (r) { if (eventIds.indexOf(String(r.event_id)) < 0) eventIds.push(String(r.event_id)); });

  var byGuest = {};
  rsvp.forEach(function (r) {
    var id = String(r.guest_id);
    (byGuest[id] = byGuest[id] || {})[String(r.event_id)] = r;
  });

  var events = {};
  eventIds.forEach(function (ev) {
    var e = { invited: 0, yesFamilies: 0, yesPax: 0, maybePax: 0, no: 0, notReplied: 0, veg: 0, jain: 0, nonveg: 0 };
    guests.forEach(function (g) {
      if (!allows_(g, ev)) return;
      e.invited++;
      var r = (byGuest[String(g.guest_id)] || {})[ev];
      if (!r) { e.notReplied++; return; }
      var st = String(r.status);
      if (st === 'yes') {
        e.yesFamilies++;
        e.yesPax += Number(r.pax) || 0;
        e.veg += Number(r.veg) || 0;
        e.jain += Number(r.jain) || 0;
        e.nonveg += Number(r.nonveg) || 0;
      } else if (st === 'maybe') e.maybePax += Number(r.pax) || 0;
      else if (st === 'no') e.no++;
    });
    events[ev] = e;
  });

  var arrivals = [];
  guests.forEach(function (g) {
    var rows = byGuest[String(g.guest_id)];
    if (!rows) return;
    var any = rows[Object.keys(rows)[0]];
    if (!any.arrival_mode) return;
    var pax = 0;
    Object.keys(rows).forEach(function (k) { if (rows[k].status !== 'no') pax = Math.max(pax, Number(rows[k].pax) || 0); });
    arrivals.push({ guest_id: String(g.guest_id), name: String(g.name_en || g.name_hi), mode: String(any.arrival_mode),
      at: String(any.arrival_at || ''), pax: pax });
  });

  var opened = guests.filter(function (g) { return Number(g.open_count) > 0 || g.first_opened_at; }).length;
  var replied = guests.filter(function (g) { return byGuest[String(g.guest_id)]; }).length;
  var sent = guests.filter(function (g) { return g.invite_sent_at; }).length;
  return ok_({ events: events, overall: { invited: guests.length, sent: sent, opened: opened, replied: replied }, arrivals: arrivals });
}

function adminGuests_() {
  var rsvp = table_(TAB.rsvp).rows;
  var guests = table_(TAB.guests).rows
    .filter(function (g) { return String(g.guest_id || '').trim(); })
    .map(function (g) {
      var id = String(g.guest_id);
      return {
        guest_id: id, name_en: String(g.name_en || ''), name_hi: String(g.name_hi || ''),
        side: String(g.side || ''), phone: String(g.phone || ''), allowed_events: allowedEvents_(g),
        max_pax: Number(g.max_pax) || 1, lang: String(g.lang || 'hi'),
        invite_sent_at: iso_(g.invite_sent_at), first_opened_at: iso_(g.first_opened_at),
        last_opened_at: iso_(g.last_opened_at), open_count: Number(g.open_count) || 0, notes: String(g.notes || ''),
        rsvp: rsvp.filter(function (r) { return String(r.guest_id) === id; }).map(function (r) {
          return { event_id: String(r.event_id), status: String(r.status), pax: Number(r.pax) || 0,
            veg: Number(r.veg) || 0, jain: Number(r.jain) || 0, nonveg: Number(r.nonveg) || 0,
            arrival_mode: String(r.arrival_mode || ''), arrival_at: String(r.arrival_at || ''),
            message: String(r.message || ''), timestamp: iso_(r.timestamp) };
        })
      };
    });
  // All wishes (incl. unapproved) for the moderation tab.
  var wishes = table_(TAB.wishes).rows.map(function (w) {
    return { wish_id: String(w.wish_id), guest_id: String(w.guest_id), name: String(w.name),
      message: String(w.message), approved: truthy_(w.approved), ts: iso_(w.timestamp) };
  }).reverse();
  return ok_({ guests: guests, wishes: wishes });
}

function adminMarkSent_(b) {
  return withLock_(function () {
    var gm = guestsMap_();
    var g = gm.map[String(b.g || '')];
    if (!g) fail_('unknown_guest');
    setCells_(gm.t, g._row, { invite_sent_at: now_() });
    return ok_();
  });
}

function adminApproveWish_(b) {
  return withLock_(function () {
    var t = table_(TAB.wishes);
    var w = t.rows.filter(function (r) { return String(r.wish_id) === String(b.wish_id); })[0];
    if (!w) fail_('unknown_wish');
    setCells_(t, w._row, { approved: b.approved === true });
    CacheService.getScriptCache().remove('wishes');
    return ok_();
  });
}

// ---------- Sheet menu ----------

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Shubh Vivah')
    .addItem('Generate missing guest IDs', 'menuGenerateIds')
    .addItem('Publish guest list', 'menuPublish')
    .addItem('Copy all invite links', 'menuLinks')
    .addToUi();
}

function menuGenerateIds() {
  var n = withLock_(function () {
    var t = table_(TAB.guests);
    var col = t.headers.indexOf('guest_id') + 1;
    var used = {};
    t.rows.forEach(function (r) { if (r.guest_id) used[String(r.guest_id)] = true; });
    var count = 0;
    t.rows.forEach(function (r) {
      if (String(r.guest_id || '').trim() || !(r.name_en || r.name_hi)) return;
      var id;
      do { id = randomId_(8); } while (used[id]);
      used[id] = true;
      t.sh.getRange(r._row, col).setValue(id);
      count++;
    });
    return count;
  });
  SpreadsheetApp.getUi().alert(n + ' new guest ID(s) generated.');
}

function menuPublish() {
  var url = PropertiesService.getScriptProperties().getProperty('DEPLOY_HOOK_URL');
  var ui = SpreadsheetApp.getUi();
  if (!url) return ui.alert('DEPLOY_HOOK_URL is not set in Script Properties (see MANUAL-STEPS §4).');
  var res = UrlFetchApp.fetch(url, { method: 'post', muteHttpExceptions: true });
  ui.alert(res.getResponseCode() < 300
    ? 'Rebuild started. New guest names show in WhatsApp previews in about 2 minutes.'
    : 'Deploy hook failed: HTTP ' + res.getResponseCode());
}

function menuLinks() {
  var site = String(PropertiesService.getScriptProperties().getProperty('SITE_URL') || '').replace(/\/$/, '');
  var ui = SpreadsheetApp.getUi();
  if (!site) return ui.alert('Set SITE_URL in Script Properties (e.g. https://arjit-weds-kanika.pages.dev).');
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(TAB.links) || ss.insertSheet(TAB.links);
  var rows = [['guest_id', 'name_en', 'phone', 'link']];
  table_(TAB.guests).rows.forEach(function (g) {
    if (g.guest_id) rows.push([String(g.guest_id), String(g.name_en || ''), "'" + String(g.phone || ''), site + '/?g=' + g.guest_id]);
  });
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 4).setValues(rows);
  ui.alert((rows.length - 1) + ' links written to the "' + TAB.links + '" tab.');
}
