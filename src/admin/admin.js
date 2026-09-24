// Family admin page (SPEC §8): login, Summary, Guests, Wishes, Tools.
import "../styles/tokens.css";
import "../styles/admin.css";
import wedding from "../../content/wedding.json";
import T from "../../content/admin.json";
import { admin, isMock } from "../core/api.js";
import { h } from "../core/dom.js";
import { renderSummary, renderGuests, renderWishes, renderTools } from "./views.js";

const root = document.getElementById("admin");
const eventIds = wedding.events.map((e) => e.id);
const KEY = "admin-pw";
const store = {
  get: () => { try { return sessionStorage.getItem(KEY); } catch { return null; } },
  set: (v) => { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
};

const state = { password: store.get(), summary: null, guests: [], wishes: [], tab: "summary" };

// Every call re-sends the password; "forbidden" logs out.
async function call(action, extra) {
  try {
    return await admin(action, state.password, extra);
  } catch (err) {
    if (err.code === "forbidden") logout(T.wrongPassword);
    throw err;
  }
}

function logout(message = "") {
  store.set(null);
  state.password = null;
  renderLogin(message);
}

function renderLogin(message = "") {
  const input = h("input", { type: "password", id: "pw", class: "input", autocomplete: "current-password", required: true });
  const err = h("p", { class: "a-error", role: "alert" }, message);
  const btn = h("button", { type: "submit", class: "btn" }, T.login);
  const form = h("form", { class: "a-login" },
    h("h1", {}, T.title),
    isMock ? h("p", { class: "a-note" }, T.mockNote) : null,
    h("label", { class: "field", for: "pw" }, h("span", { class: "label" }, T.password), input),
    btn, err);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value) return input.focus();
    btn.disabled = true;
    btn.textContent = T.loading;
    err.textContent = "";
    state.password = input.value;
    try {
      state.summary = await admin("summary", state.password, { events: eventIds });
      store.set(state.password);
      await load();
    } catch (x) {
      state.password = null;
      err.textContent = x.code === "forbidden" ? T.wrongPassword : T.networkError;
      btn.disabled = false;
      btn.textContent = T.login;
    }
  });
  root.replaceChildren(form);
  input.focus();
}

async function load() {
  renderShell(T.loading);
  try {
    const [summary, data] = await Promise.all([call("summary", { events: eventIds }), call("guests")]);
    state.summary = summary;
    state.guests = data.guests || [];
    state.wishes = data.wishes || [];
    renderShell();
  } catch (err) {
    if (err.code !== "forbidden") renderShell(T.networkError, true);
  }
}

function renderShell(status = "", isError = false) {
  if (!state.password) return;
  const tabs = h("nav", { class: "a-tabs", role: "tablist" },
    Object.entries(T.tabs).map(([id, label]) =>
      h("button", { type: "button", role: "tab", class: "a-tab", "aria-selected": String(state.tab === id),
        onclick: () => { state.tab = id; renderShell(); } }, label)));
  const body = h("section", { class: "a-body", role: "tabpanel" });
  const ctx = { T, wedding, state, call, rerender: () => renderShell() };
  if (status) body.append(h("p", { class: isError ? "a-error" : "a-note", role: "status" }, status,
    isError ? h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: load }, T.refresh) : null));
  else ({ summary: renderSummary, guests: renderGuests, wishes: renderWishes, tools: renderTools })[state.tab](body, ctx);
  root.replaceChildren(
    h("header", { class: "a-head" },
      h("h1", {}, T.title),
      h("div", { class: "a-head-actions" },
        h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: load }, T.refresh),
        h("button", { type: "button", class: "btn btn--sm btn--ghost", onclick: () => logout() }, T.logout))),
    isMock ? h("p", { class: "a-note" }, T.mockNote) : null,
    tabs, body);
}

if (state.password) load();
else renderLogin();
