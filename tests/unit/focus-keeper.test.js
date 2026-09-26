// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { captureFocus, restoreFocus, focusKeyOf } from "../../apps/web/src/engine/focus-keeper.js";

// jsdom lays nothing out, so every element reports an empty client-rect list. The module takes its
// "is this drawn" test as an option for exactly this reason; the browser uses the real one.
const drawn = { isRendered: () => true };

let root;
beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById("app");
});

/** The render this module exists for: the whole tree replaced, the old focused node gone. */
function rebuild(html) {
  root.innerHTML = html;
}

const active = () => document.activeElement;

describe("a render keeps the keyboard where it was", () => {
  it("puts focus back on the rebuilt twin of the focused control", () => {
    const board = `
      <button data-activity-action="verdict" data-claim="fertile" data-verdict="supported">Supported</button>
      <button data-activity-action="verdict" data-claim="fertile" data-verdict="contradicted">Contradicted</button>`;
    rebuild(board);
    root.querySelector('[data-verdict="contradicted"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(board);
    expect(active()).toBe(document.body);
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.verdict).toBe("contradicted");
  });

  it("knows a radio by its value as well as the group it shares", () => {
    const choices = [0, 1, 2, 3]
      .map((v) => `<input type="radio" name="q1" data-mcq-quest="q1" value="${v}">`)
      .join("");
    rebuild(choices);
    root.querySelector('[value="2"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(choices);
    restoreFocus(root, snapshot, drawn);
    expect(active().value).toBe("2");
  });

  it("tells identical controls apart by their order", () => {
    const row = "<button>Next</button><button>Next</button><button>Next</button>";
    rebuild(row);
    root.querySelectorAll("button")[1].focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(row);
    restoreFocus(root, snapshot, drawn);
    expect(Array.from(root.querySelectorAll("button")).indexOf(active())).toBe(1);
  });

  it("follows a control whose verb changed as it was pressed", () => {
    // An assembly slot is `place` while empty and `lift` once a fragment is in it.
    rebuild(
      '<button data-activity-action="place" data-board="sheet" data-slot="p1">Empty</button>'
    );
    root.querySelector("button").focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(
      '<button data-activity-action="lift" data-board="sheet" data-slot="p1">Filled</button>'
    );
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.slot).toBe("p1");
  });

  it("moves to the next control when the pressed one is disabled by its own press", () => {
    // A sequencing row that has reached the top: its up button is disabled, and its down button is
    // the next thing in the tab order.
    const row = (upDisabled) => `
      <button data-action="sequence-move" data-sequence-item="horses" data-direction="up" ${upDisabled ? "disabled" : ""}>↑</button>
      <button data-action="sequence-move" data-sequence-item="horses" data-direction="down">↓</button>`;
    rebuild(row(false));
    root.querySelector('[data-direction="up"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(row(true));
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.direction).toBe("down");
  });

  it("falls back to the nearest control before it when nothing after it survives", () => {
    rebuild('<button data-action="a">A</button><button data-action="log" data-q="x">Log</button>');
    root.querySelector('[data-action="log"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild('<button data-action="a">A</button><p>Logged.</p>');
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.action).toBe("a");
  });

  it("goes to what the press made when the pressed control is gone", () => {
    // The Archive Rotation: Next → names the question it closes, so after the press there is no
    // control by its name — only the next question's answers and a Next that names *that* one.
    const item = (quest) => `
      <button data-action="home">✦ Chronicle</button>
      <button data-action="home">← Return to Institute</button>
      ${[0, 1, 2].map((v) => `<input type="radio" data-mcq-quest="${quest}" value="${v}">`).join("")}
      <button data-action="rotation-next" data-rotation-quest-id="${quest}">Next →</button>`;
    rebuild(item("q1"));
    root.querySelector('[data-action="rotation-next"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(
      item("q2").replace('data-rotation-quest-id="q2"', 'data-rotation-quest-id="q2" disabled')
    );
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.mcqQuest).toBe("q2");
    expect(active().value).toBe("0");
  });

  it("walks the trail by occurrence, so two controls with one name are not confused", () => {
    // The chrome's brand and a screen's own back link are both data-action="home".
    const page = (withFinish) => `
      <button data-action="home">✦ Chronicle</button>
      <button data-action="home">← Return to Institute</button>
      ${withFinish ? '<button data-action="finish">Finish</button>' : "<p>Done.</p>"}`;
    rebuild(page(true));
    root.querySelector('[data-action="finish"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(page(false));
    restoreFocus(root, snapshot, drawn);
    expect(active().textContent).toBe("← Return to Institute");
  });

  it("does not land inside a closed <details>, but may land on its summary", () => {
    const tree = (open) => `
      <button data-action="gone">Gone</button>
      <details ${open ? "open" : ""}><summary>Glossary</summary><button data-action="inside">Inside</button></details>`;
    rebuild(tree(true));
    root.querySelector('[data-action="gone"]').focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(tree(false).replace('<button data-action="gone">Gone</button>', ""));
    restoreFocus(root, snapshot, drawn);
    expect(active().tagName).toBe("SUMMARY");
  });

  it("returns null and leaves focus alone when nothing it knew survived", () => {
    rebuild('<button data-action="only">Only</button>');
    root.querySelector("button").focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild("<p>Nothing to press.</p>");
    expect(restoreFocus(root, snapshot, drawn)).toBeNull();
    expect(active()).toBe(document.body);
  });

  it("keeps a text field's caret", () => {
    const form = '<textarea data-evidence-reflection="q1"></textarea>';
    rebuild(form);
    const field = root.querySelector("textarea");
    field.value = "A reason typed by keyboard.";
    field.focus();
    field.setSelectionRange(2, 8);
    const snapshot = captureFocus(root, active(), drawn);
    rebuild(form);
    root.querySelector("textarea").value = "A reason typed by keyboard.";
    restoreFocus(root, snapshot, drawn);
    expect([active().selectionStart, active().selectionEnd]).toEqual([2, 8]);
  });

  it("never scrolls to what it focuses", () => {
    rebuild('<button data-action="x">X</button>');
    root.querySelector("button").focus();
    const snapshot = captureFocus(root, active(), drawn);
    rebuild('<button data-action="x">X</button>');
    const spy = vi.spyOn(window.HTMLElement.prototype, "focus");
    restoreFocus(root, snapshot, drawn);
    expect(spy).toHaveBeenCalledWith({ preventScroll: true });
    spy.mockRestore();
  });
});

describe("a Tab that a re-render caught in flight", () => {
  // Chrome fires a text field's `change` as focus leaves it, with `activeElement` already <body>,
  // so the caller hands over the field the Tab left and which way it was going.
  const form = `
    <select data-evidence-select="last"><option>a</option></select>
    <textarea data-evidence-reflection="q1"></textarea>
    <input type="radio" name="h" data-hipp-option="first" value="0">`;

  it("lands on the control the Tab was headed for", () => {
    rebuild(form);
    const left = root.querySelector("textarea");
    const snapshot = captureFocus(root, left, { ...drawn, step: 1 });
    rebuild(form);
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.hippOption).toBe("first");
  });

  it("and on the one before it for Shift+Tab", () => {
    rebuild(form);
    const left = root.querySelector("textarea");
    const snapshot = captureFocus(root, left, { ...drawn, step: -1 });
    rebuild(form);
    restoreFocus(root, snapshot, drawn);
    expect(active().dataset.evidenceSelect).toBe("last");
  });

  it("does not claim a destination past the last control", () => {
    rebuild(form);
    const last = root.querySelector("input");
    expect(captureFocus(root, last, { ...drawn, step: 1 })).toBeNull();
  });
});

describe("what it will not do", () => {
  it("captures nothing for focus outside the root", () => {
    document.body.insertAdjacentHTML("beforeend", "<button id='outside'>Out</button>");
    const outside = document.getElementById("outside");
    outside.focus();
    expect(captureFocus(root, outside, drawn)).toBeNull();
    expect(captureFocus(root, null, drawn)).toBeNull();
  });

  it("names a control by what it is, so a class or its words changing does not lose it", () => {
    rebuild('<button class="a" data-action="toggle-audio">♫ Music off</button>');
    const before = focusKeyOf(root.querySelector("button"));
    rebuild('<button class="a is-on" data-action="toggle-audio">♫ Music on</button>');
    expect(focusKeyOf(root.querySelector("button"))).toBe(before);
  });
});
