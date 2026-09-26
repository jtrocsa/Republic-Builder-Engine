# 0153 — A press does not lose your place

**Phase 154 · 2026-09-24 · Accepted**

A student playing Chronicle with the keyboard lost their place **on every press, on every screen
that is not the map**.

`render()` replaces `#app` wholesale. The element that had focus went with it, the browser handed
focus to `<body>`, and the student's next Tab began again at the first control in the document —
the chrome's brand button — and scrolled the page to the top to show it. Measured, on a board and on
each quest type:

| Where                                 | The press                   | Focus after | Next Tab                                |
| ------------------------------------- | --------------------------- | ----------- | --------------------------------------- |
| Discrepancy board, Case 1.01          | Enter on a verdict          | `<body>`    | the brand button, scrollY 598 → **0**   |
| Assembly board                        | Enter on a fragment         | `<body>`    | the brand button, scrollY 99 → 0        |
| Practice Check, sequencing            | Enter on ↑                  | `<body>`    | the brand button, scrollY 1,166 → 0     |
| Practice Check, evidence organizing   | ArrowDown on a select       | `<body>`    | the brand button, scrollY 2,065 → 0     |
| Practice Check, HIPP                  | ArrowDown on an option      | `<body>`    | the brand button, scrollY **3,316** → 0 |
| Practice Check, a reflection textarea | Tab out of it               | `<body>`    | the brand button, scrollY 2,562 → 0     |
| Navigation Table                      | Enter on a period tab, case | `<body>`    | the brand button                        |

Three of those are worse than a lost place.

- **An MCQ could not be answered with the arrow keys.** Arrowing through a radio group fires
  `change` on each step, the change handler re-renders, and the group the student was moving through
  is gone before they reach the third choice. Every multiple-choice question in the game — the
  Practice Check, the Archive Rotation, the Archive Review.
- **The sequencing quest's ↑/↓ buttons exist for the keyboard.** `practice-check.spec.js` calls them
  "the keyboard move buttons" and prefers them to drag. Reordering six rows is about a dozen presses,
  and each one started the Tab order again from the chrome.
- **A Tab out of a reflection went nowhere.** Chrome commits a text field's `change` as focus
  leaves it, and — measured — dispatches that `change` with `document.activeElement` **already
  `<body>`**. The render inside it replaced the control the Tab was travelling to, so the Tab landed
  on nothing.

## 1. Why nothing saw it

**No test had ever used the keyboard on a screen where this lives.** Before this phase the e2e
suite made **328** `.click(` calls and pressed Tab and ArrowDown **zero** times; Enter was pressed
on the title screen and the intro dialogue and nowhere else. Playwright's `click()` is a pointer
event, and a pointer press is exactly the case where losing focus is invisible.

And the click handler was blurring every press on purpose. `handleAppClick` has called
`target.blur()` and `document.activeElement.blur()` before any handler runs since `b9053ba` ("music
and UI"), which gives no reason. The reason that holds is the field: there `E` **and Enter** are
the interaction key, and a button left focused by a click would take Enter from
`nearestFieldInteraction()`. That reason is real and is kept — but it was applied to every screen,
including every screen where the keyboard steers nothing.

## 2. The rule

**A render does not move keyboard focus.** It is the focus half of `0124`'s rule that _the screen
you are on does not move under you_, and it has the same shape: a snapshot from the old DOM,
applied to the new one, **only when the view is unchanged**. A new view — Mission Instructions to
the board, the board to the debrief, the Navigation Table to the warp — opens with nothing focused,
which is what a page load does, and which is what it did before.

Two conditions bound it, and each has a counter-test (§6):

- **Keyboard input only.** A capture-phase `keydown` sets `keyboardInput` and a capture-phase
  `pointerdown` clears it; a pointer press is still blurred exactly as before. Without this,
  `.choice:focus-within` would draw its outline under every mouse player's answer.
- **Never where the keyboard steers.** `KEYBOARD_STEERED_SCREENS` is the six screens
  `handleWindowKeydown()` claims keys on — the three intro screens, the Institute, the field and the
  mini-games. Nothing changes there; the field camera is never touched. The landing is never one of
  them, whatever screen the save underneath it is on.

`handleAppClick` now blurs a press unless it came from the keyboard (`event.detail === 0`) on a
non-steered screen. That was not the first version. The first version recorded the pressed control
before the blur and handed it to `render()`, and a sweep of every control on fifteen screens found
three that still stranded the player on `<body>` **with no render at all** — Submit Archive Review,
Test reconstruction, and an assembly slot pressed with nothing selected. Their handlers write a status
line and return. **The blur was the defect, not the render**, and with it gone the pressed control
is simply what has focus when `render()` looks.

### A held key still does one thing

Keeping focus has a consequence the blur used to hide. Chrome clicks a focused button on **every
auto-repeat** of Enter, so once the button keeps its focus a held Enter presses it again and again —
walking a sequencing row to the top, and then, when its ↑ goes disabled and focus falls back to the
next control (§3), pressing _that_. Before this phase the first press blurred the button and a held
key did exactly one thing. It still does: the capture-phase `keydown` listener notes whether the key
is an auto-repeat, and `handleAppClick` ignores a keyboard click made by one on every screen that
keeps focus. Space activates on release, so the capture-phase `keyup` clears the note first and a
held Space still presses once when let go.

## 3. How a control is recognised in a rebuilt tree

`engine/focus-keeper.js`, pure DOM, no game state. By what a control **is**, not where it sits: its
tag and every attribute that names it — `id`, `name`, `type`, `href`, every `data-*`, and a radio's
`value`. That is how every renderer here already addresses its controls, because the click handler
reads the same attributes. A sequencing button is `data-sequence-item`, not an index, so focus
follows the row it moved. Then, in order:

1. **The noun without the verb.** An assembly slot is `place` while empty and `lift` once filled.
2. **What the press made.** The Archive Rotation's **Next →** names the question it closes, so after
   the press nothing by its name survives. Focus goes to the first control that did not exist before
   the press: the next question's first answer.
3. **The trail.** A sequencing row that reaches the top disables its own ↑; focus goes to the
   nearest surviving control after it in the old tab order — its ↓, whose label says "Move … later in
   the sequence" — and then the nearest before.

A control that has ended up outside the window — a row moved past the edge, the field a Tab was
carrying the player to — is brought into view by the least scroll that shows it, which is what the
browser's own Tab does. Nothing else scrolls.

**Three bugs in the first draft, each found by running it rather than by reading it**, and each
recorded because each is the obvious way to write this:

- **The trail ignored occurrence.** The Rotation's own **← Return to Institute** and the chrome's
  brand are both `data-action="home"`, so "the nearest surviving control before Next" resolved to
  the brand. Each trail entry carries its occurrence now.
- **A verb-only control had an empty noun, and so did every other.** A button whose only attribute
  is `data-action="finish"` stripped to `BUTTON[]`, which matched the brand too. A control named by
  nothing but its verb has no noun.
- **A Tab in flight is invisible at the moment it matters.** The capture step asks for
  `document.activeElement` and gets `<body>`; the keydown listener therefore remembers what a Tab
  left and which way, for the one task it takes, and the snapshot names the destination instead.

## 4. The Archive Rotation is not a page turn, and was measured before deciding

**Next →** puts a different question on the same screen, so it looks like a new view and the first
instinct is to add `archiveRotation.position` to the view key — which would also scroll a mouse player
to the top on every Next. Measured first, by mouse, at both sizes: after every Next the "Item N/5"
counter and the prompt are on screen (counter top ≥ 20px), because the rotation's pages are short and
the kept offset clamps. **There is no scroll defect there, so there is no scroll change.** Only the
keyboard half needed anything, and §3's second step is it.

## 5. Not in this phase

- **Where focus goes on a new view.** It goes nowhere, as before: the debrief opens with `<body>`
  focused and the next Tab starts at the chrome. Moving focus to a new screen's heading is the usual
  next step for a screen-reader user, and it is a different change with its own questions — which
  heading on each screen, and what a sighted keyboard player then sees.
- **Teacher surfaces** go through the same `render()` and get the rule. They were not walked by
  keyboard; the teacher specs run in the full suite and are unchanged.
- **Grading as a student arrows.** A radio's `change` fires per step, so an MCQ grades each choice
  the student passes through on the way to the one they want. That is how the quest type has always
  behaved on a pointer too (every click grades), and `skillMastery` is upsert-by-item, so the choice
  they stop on is the one that counts. Recorded, not changed.

## 6. Verification

`tests/e2e/keyboard-focus.spec.js`, sixteen tests. **The sweep** presses every control on six
screens by keyboard — the Practice Check, the Archive Rotation, a discrepancy, assembly and trace
board, and the Navigation Table — and after each press asks that focus is inside `main`, not on
`<body>` or in the chrome, and that the focused control is on screen. Each row states the least
number of presses it expects to make, because a sweep that found nothing to press proves nothing.
**Eight named claims**: the next Tab carries on from the pressed control at the same scroll offset;
an MCQ is answerable with the arrow keys; a sequencing button stays with its row; a Tab out of a
reflection lands on the next control, on screen, and Shift+Tab on the previous one; a press that
only writes a status line keeps its control; the Rotation's Next goes to the next question; a held
key still does one thing, Enter and Space alike; the landing's ♫ toggle keeps its focus. **Two counter-claims**: a mouse press still leaves nothing
focused, and a keyboard press on the field is still blurred.

Watched fail five ways, each against a different wrong build:

| Broken by                                                   | Result                                                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| no snapshot (`focusSnapshot = null`)                        | 12 of 15 fail, each naming the control it pressed and `{"where":"body"}`                      |
| blurring every press again                                  | 11 of 15 fail — every click path; the arrow and Tab cases pass, being `change`s               |
| keeping focus for the mouse too                             | the mouse counter-claim fails: `Expected "body", Received "main"`                             |
| keeping focus on steered screens (`keyboardKeepsFocus` → 1) | the field counter-claim fails: `Expected "body", Received "chrome"`                           |
| no held-key guard                                           | four Enter keydown events walk a row from the bottom to the top: `Expected "3", Received "0"` |

`tests/unit/focus-keeper.test.js`, seventeen cases, holds the module itself under jsdom — identity,
occurrence, verb swap, what the press made, the trail both ways, closed `<details>`, the caret, the
Tab in flight in both directions, and that it never scrolls.
