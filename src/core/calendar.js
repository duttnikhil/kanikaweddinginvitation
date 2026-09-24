// Google Calendar link + .ics download (SPEC §7.13)
import { content } from "./content.js";
import { tr } from "./i18n.js";

const utc = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
// Local IST wall time "20261212T210000"
const ist = (iso) => {
  const d = new Date(Date.parse(iso) + 5.5 * 3600e3);
  return d.toISOString().replace(/[-:]/g, "").slice(0, 15);
};

function describe(ev, l) {
  const { groom, bride } = content.couple;
  return {
    title: `${tr(ev.name, l)} · ${tr(groom.name, l)} ${tr(content.hero.joiner, l)} ${tr(bride.name, l)}`,
    location: ev.venue ? `${tr(ev.venue.name, l)}, ${tr(ev.venue.address, l)}` : "",
    details: [tr(ev.muhurat, l), tr(ev.note, l), content.meta.siteUrl].filter(Boolean).join("\n"),
  };
}

export function googleUrl(ev, l) {
  const d = describe(ev, l);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: d.title,
    dates: `${utc(ev.start)}/${utc(ev.end || ev.start)}`,
    details: d.details,
    location: d.location,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function icsText(ev, l) {
  const d = describe(ev, l);
  const host = new URL(content.meta.siteUrl).host;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//shubh-vivah//invite//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:Asia/Kolkata", "BEGIN:STANDARD", "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530", "TZOFFSETTO:+0530", "TZNAME:IST", "END:STANDARD", "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${ev.id}@${host}`,
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART;TZID=Asia/Kolkata:${ist(ev.start)}`,
    `DTEND;TZID=Asia/Kolkata:${ist(ev.end || ev.start)}`,
    `SUMMARY:${esc(d.title)}`,
    `LOCATION:${esc(d.location)}`,
    `DESCRIPTION:${esc(d.details)}`,
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}

export function downloadIcs(ev, l) {
  const blob = new Blob([icsText(ev, l)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.id}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
