// A render must not move keyboard focus.
//
// `render()` replaces `#app` wholesale, and the element that had focus goes with it — the browser
// hands focus to `<body>`, and the next Tab starts again from the first control in the document,
// which is the chrome's brand button, and scrolls the page to the top to show it. So a student
// playing by keyboard lost their place on **every press, on every screen that is not the map**:
// a verdict on a discrepancy board, a fragment on an assembly plate, a sequencing move button (the
// control that exists *for* the keyboard), a period tab on the Navigation Table. On the Practice
// Check the HIPP section sits 3,316px down, and one arrow key on one of its options put the next
// Tab at the top of the page. An MCQ could not be answered by arrow keys at all: each arrow fires
// `change`, the change renders, and the radio group the student was moving through is gone before
// they can reach the third choice.
//
// This is the focus half of Phase 125's rule — _the screen you are on does not move under you_ —
// and it is shaped the same way: a snapshot taken from the old DOM, applied to the new one, only
// when the view is unchanged. A new screen opens at its own top and with nothing focused, which is
// what a page load does.
//
// ## How a control is recognised in the new DOM
//
// By what it *is*, not where it is: its tag and every attribute that names it — `id`, `name`,
// `type`, `href`, every `data-*`, and a radio's or checkbox's `value`. That is how every renderer
// in this codebase already addresses its controls, because the click handler reads the same
// attributes. A sequencing move button is `data-sequence-item`, not an index, so focus follows the
// item it moved. Two further steps cover the controls that change as they are pressed:
//
// 1. **The noun without the verb.** A toggle can swap its `data-action` or `data-activity-action`
//    as it is pressed; the same control with a different verb is still the same control.
// 2. **What the press made.** A control can be replaced by its own press: the Archive Rotation's
//    Next → puts a different question on the same screen, and the button that did it now names the
//    new question. When nothing by the pressed control's name survives, focus goes to the first
//    control that did not exist before the press — the new question's first answer, not the chrome.
// 3. **The trail.** A control can be disabled by its own press, or turn into text — the up button
//    of an item that has reached the top, a log button that becomes a receipt. The snapshot carries
//    the old tab order, and focus goes to the nearest control after it that still exists and can
//    take focus, then the nearest before it. That is where a student's next Tab would have gone.
//    Each entry keeps its occurrence as well as its name, because the Rotation's own "← Return to
//    Institute" and the chrome's brand are the same `data-action="home"`.
//
// Pure DOM, no game state and no APUSH facts — `main.js` decides *when* to keep focus (keyboard
// input only, never on a screen where the keyboard steers a character) and this decides *where*.

const FOCUSABLE = "a[href], button, input, select, textarea, summary, [tabindex]";
const VERBS = new Set(["data-action", "data-activity-action"]);
const TEXT_ENTRY_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
]);

/**
 * @typedef {object} FocusSnapshot
 * @property {string} key         the focused control's identity
 * @property {string | null} noun  the same identity without its verb, if anything is left of it
 * @property {number} occurrence  which of several same-identity controls it was, in document order
 * @property {Array<[string, number]>} trail  every tabbable control, in tab order, as identity
 *                                            and occurrence
 * @property {number} position    the control's index in `trail`, or where it would sit
 * @property {string[]} known     the identity of every control the old tree had, usable or not
 * @property {[number, number] | null} selection  a text field's caret, when it is kept
 */

/** @param {Element} el */
function identityAttrs(el) {
  /** @type {Array<[string, string]>} */
  const attrs = [];
  for (const { name, value } of Array.from(el.attributes)) {
    if (name === "id" || name === "name" || name === "type" || name === "href")
      attrs.push([name, value]);
    else if (name.startsWith("data-")) attrs.push([name, value]);
  }
  const type = (el.getAttribute("type") || "").toLowerCase();
  if (el.tagName === "INPUT" && (type === "radio" || type === "checkbox"))
    attrs.push(["value", el.getAttribute("value") ?? "on"]);
  // A control with nothing on it to name it — a plain `<button>` — is known by its words.
  if (!attrs.length) attrs.push(["text", (el.textContent || "").trim().slice(0, 80)]);
  return attrs.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/** @param {Element} el @returns {string} */
export function focusKeyOf(el) {
  return el.tagName + JSON.stringify(identityAttrs(el));
}

/** @param {Element} el @returns {string | null} */
function nounOf(el) {
  const rest = identityAttrs(el).filter(([name]) => !VERBS.has(name) && name !== "type");
  // A control named by nothing but its verb has no noun: every other such control would share it.
  return rest.length ? el.tagName + JSON.stringify(rest) : null;
}

/** @param {Element} el */
function isTextEntry(el) {
  if (el.tagName === "TEXTAREA") return true;
  return (
    el.tagName === "INPUT" && TEXT_ENTRY_TYPES.has((el.getAttribute("type") || "").toLowerCase())
  );
}

/**
 * Inside a closed `<details>` only its own `<summary>` can take focus; `hidden` and `inert` take
 * everything under them out.
 * @param {Element} el
 */
function isInOpenTree(el) {
  if (el.closest("[hidden], [inert]")) return false;
  for (let d = el.parentElement?.closest("details"); d; d = d.parentElement?.closest("details")) {
    const isOwnSummary = el.tagName === "SUMMARY" && el.parentElement === d;
    if (!d.hasAttribute("open") && !isOwnSummary) return false;
  }
  return true;
}

/**
 * @param {Element} el
 * @param {(el: Element) => boolean} isRendered
 */
function canTakeFocus(el, isRendered) {
  if (el.hasAttribute("disabled")) return false;
  if (el.tagName === "INPUT" && (el.getAttribute("type") || "").toLowerCase() === "hidden")
    return false;
  return isInOpenTree(el) && isRendered(el);
}

/**
 * @param {Element} el
 * @param {(el: Element) => boolean} isRendered
 */
function isTabbable(el, isRendered) {
  const tabindex = el.getAttribute("tabindex");
  if (tabindex !== null && Number(tabindex) < 0) return false;
  return canTakeFocus(el, isRendered);
}

/** @param {Element} el */
const hasBox = (el) => el.getClientRects().length > 0;

/**
 * Every control under `root` by identity, with each one's occurrence among its namesakes.
 * @param {ParentNode} root
 */
function indexControls(root) {
  const all = Array.from(root.querySelectorAll(FOCUSABLE));
  /** @type {Map<string, Element[]>} */
  const byKey = new Map();
  /** @type {Map<Element, [string, number]>} */
  const nameOf = new Map();
  for (const el of all) {
    const key = focusKeyOf(el);
    const list = byKey.get(key);
    if (list) list.push(el);
    else byKey.set(key, [el]);
    nameOf.set(el, [key, (list?.length ?? 1) - 1]);
  }
  return { all, byKey, nameOf };
}

/**
 * Records what has focus inside `root`, in terms that survive `root` being rebuilt.
 *
 * `step` is for a Tab that is still travelling: a text field commits its `change` as focus leaves
 * it, and Chrome dispatches that `change` with `document.activeElement` already `<body>` — so a
 * render inside it sees nothing focused, and the control the Tab was headed for is replaced before
 * the browser can land on it. The caller passes the element the Tab left and the direction, and the
 * snapshot names the destination instead.
 *
 * @param {ParentNode & Node} root
 * @param {Element | null | undefined} active
 * @param {{ step?: number, isRendered?: (el: Element) => boolean }} [options]
 * @returns {FocusSnapshot | null}
 */
export function captureFocus(root, active, { step = 0, isRendered = hasBox } = {}) {
  if (!active || active === root || !root.contains(active)) return null;
  const { all, nameOf } = indexControls(root);
  const order = all.filter((el) => isTabbable(el, isRendered));
  let target = active;
  let position = order.indexOf(active);
  if (position < 0) {
    // Not in the tab order itself (a `tabindex="-1"` heading, say): it sits before the first
    // tabbable control that follows it.
    const next = order.findIndex((el) => active.compareDocumentPosition(el) & 4);
    position = next < 0 ? order.length - 0.5 : next - 0.5;
  }
  if (step) {
    const destination = order[Math.round(position + step * (Number.isInteger(position) ? 1 : 0.5))];
    if (!destination) return null;
    target = destination;
    position = order.indexOf(destination);
  }
  const field = /** @type {HTMLInputElement} */ (target);
  const selection =
    target === active && isTextEntry(target) && typeof field.selectionStart === "number"
      ? /** @type {[number, number]} */ ([
          field.selectionStart,
          field.selectionEnd ?? field.selectionStart,
        ])
      : null;
  const [key, occurrence] = nameOf.get(target) ?? [focusKeyOf(target), 0];
  return {
    key,
    noun: nounOf(target),
    occurrence,
    trail: order.map((el) => /** @type {[string, number]} */ (nameOf.get(el))),
    position,
    known: [...new Set(all.map(focusKeyOf))],
    selection,
  };
}

/**
 * Puts focus back on the control a snapshot names, in a rebuilt `root`. Never scrolls — the page
 * stays where the render left it, and `main.js` owns that.
 *
 * @param {ParentNode} root
 * @param {FocusSnapshot | null} snapshot
 * @param {{ isRendered?: (el: Element) => boolean }} [options]
 * @returns {Element | null} what now has focus, or null if nothing the snapshot knew survived
 */
export function restoreFocus(root, snapshot, { isRendered = hasBox } = {}) {
  if (!snapshot) return null;
  const { all, byKey } = indexControls(root);
  const twins = byKey.get(snapshot.key);
  const twin =
    twins?.[snapshot.occurrence] ??
    twins?.[0] ??
    (snapshot.noun ? all.find((el) => nounOf(el) === snapshot.noun) : undefined);
  if (twin && canTakeFocus(twin, isRendered)) {
    focusWithoutScrolling(twin);
    if (snapshot.selection && isTextEntry(twin)) {
      const field = /** @type {HTMLInputElement} */ (twin);
      try {
        field.setSelectionRange(snapshot.selection[0], snapshot.selection[1]);
      } catch {
        // A number field has no selection API; the caret is a nicety, focus is the point.
      }
    }
    return twin;
  }
  if (!twin) {
    const known = new Set(snapshot.known);
    const made = all.find((el) => !known.has(focusKeyOf(el)) && isTabbable(el, isRendered));
    if (made) return focusWithoutScrolling(made);
  }
  /** @param {number} i */
  const survivor = (i) => {
    const [key, occurrence] = snapshot.trail[i];
    const el = byKey.get(key)?.[occurrence];
    return el && isTabbable(el, isRendered) ? el : null;
  };
  const from = snapshot.position;
  for (let i = Math.floor(from) + 1; i < snapshot.trail.length; i++) {
    const el = survivor(i);
    if (el) return focusWithoutScrolling(el);
  }
  for (let i = Math.ceil(from) - 1; i >= 0; i--) {
    const el = survivor(i);
    if (el) return focusWithoutScrolling(el);
  }
  return null;
}

/** @param {Element} el */
function focusWithoutScrolling(el) {
  /** @type {HTMLElement} */ (el).focus({ preventScroll: true });
  return el;
}
