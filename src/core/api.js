// All Apps Script calls (SPEC §5.1). Empty VITE_API_URL -> in-memory mock (api-mock.js).
const BASE = import.meta.env.VITE_API_URL || "";
export const isMock = !BASE;
const TIMEOUT = 12000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

let mock = null;
const getMock = async () => (mock ||= (await import("./api-mock.js")).default);

async function once(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Network errors/timeouts retry once after 1.5 s; API errors ({ok:false}) never retry.
async function call(method, action, payload = {}) {
  let json;
  const attempt = async () => {
    if (isMock) return (await getMock())(method, action, payload);
    if (method === "GET") return once(`${BASE}?${new URLSearchParams({ action, ...payload })}`, { method: "GET" });
    return once(BASE, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
    });
  };
  try {
    json = await attempt();
  } catch {
    await sleep(1500);
    try {
      json = await attempt();
    } catch {
      throw new ApiError("network");
    }
  }
  if (!json || !json.ok) throw new ApiError(json?.error || "server");
  return json.data;
}

export const getWishes = () => call("GET", "wishes");
export const getRsvp = (g) => call("GET", "rsvp", { g });
export const sendRsvp = (payload) => call("POST", "rsvp", payload);
export const sendWish = (g, name, message) => call("POST", "wish", { g, name, message });
export const admin = (action, password, extra = {}) => call("POST", `admin.${action}`, { password, ...extra });

// Fire-and-forget open ping.
export function sendOpen(g) {
  const body = JSON.stringify({ action: "open", g });
  if (isMock) {
    getMock().then((m) => m("POST", "open", { g })).catch(() => {});
    return;
  }
  try {
    if (navigator.sendBeacon?.(BASE, new Blob([body], { type: "text/plain" }))) return;
  } catch { /* fall through */ }
  fetch(BASE, { method: "POST", body, headers: { "Content-Type": "text/plain;charset=utf-8" }, keepalive: true }).catch(() => {});
}
