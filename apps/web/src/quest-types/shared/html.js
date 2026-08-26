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

// Read-only rendering — the one thing the six renderers all have to say the
// same way, so they say it through here rather than each inventing an
// attribute. A read-only quest is a *record of an answer*, not a form: it
// shows exactly what the player did and refuses every control that could
// change it.
//
// `data-quest-readonly` is on the quest root deliberately. It is what the
// host's mutators check (`event.target.closest('[data-quest-readonly=true]')`
// — see main.js), so the guard is derived from the render rather than kept in
// step with it by hand. Disabling a control in markup is not a lock on its
// own: a drop target has no disabled state at all, and a disabled input is
// one devtools attribute away from being live again.
export function readOnlyAttr(readOnly) {
  return readOnly ? ` data-quest-readonly="true"` : "";
}

export function readOnlyClass(readOnly) {
  return readOnly ? " quest--read-only" : "";
}

/** For radios, selects and buttons — controls with nothing worth reading. */
export function disabledIf(readOnly) {
  return readOnly ? " disabled" : "";
}

// For textareas, which hold the student's own writing. `readonly` keeps the
// text selectable and scrollable where `disabled` would grey it out and make
// a DBQ dossier unreadable — the whole reason this mode exists is to show
// that writing back.
export function readonlyIf(readOnly) {
  return readOnly ? " readonly" : "";
}

/** Drag sources: `draggable="false"` is what actually stops a dragstart. */
export function draggableIf(readOnly) {
  return readOnly ? `draggable="false"` : `draggable="true"`;
}
