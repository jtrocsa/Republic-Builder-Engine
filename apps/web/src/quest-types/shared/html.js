// Tiny HTML-escaping helper shared by quest-type renderers. Deliberately not
// imported from main.js (its `esc()` is a module-private, not exported) and
// deliberately not importing anything from main.js — quest-types/ is meant to
// be usable standalone, ahead of any decision about how it gets dispatched
// into the running game.
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
