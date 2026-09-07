# 0124 — A new screen opens at its top

**Phase 125.** One defect, on the closing screen of every mission in the game. Found by doing what
a player does — working down a board to the button at the bottom of it — rather than by seeding the
next screen and measuring it from the top, which is what every existing guard does.

---

## 1. What a person watching sees

You have interviewed everyone on the island. The closer is at the foot of the board, four screens
down, and you scroll to it and pick the conclusion you believe.

The Mission Debrief opens **at its bottom**. The mission's name, the plate of the person who handed
the work over, **What you filed** with the sentence explaining why that conclusion holds, and
**What you kept** are all above the top of the window.

**There is nothing on the screen to press.** Both of the debrief's controls are above it — the
onward button at **−291px** and **← Back to the field** at **−606** — so the screen a student lands
on at the end of their first mission is the tail of a dramatic-liberties disclosure list, cut
mid-sentence at the top, with no heading, no chrome bar and no way out that they can see. Getting
anywhere means guessing to scroll up on a page they have no reason to believe has anything above
them.

The record then opens the same way, 43px down, with the chrome bar and **← Back to field** above the
window.

---

## 2. Why, exactly

`render()` replaces `#app` wholesale. The browser keeps the document's scroll offset across that,
clamped to what the new page can hold. Nothing in the app has ever reset it.

Measured at 1280×720, on Case 1.01:

| step                                | measurement                                    |
| ----------------------------------- | ---------------------------------------------- |
| the worked interview board          | **3,320px** — 4.6 screens                      |
| the closer's four options           | doc y 3,000 / 3,059 / 3,118 / 3,177            |
| where the player stands to press it | scrollY **2,600**                              |
| the Mission Debrief                 | **1,462px**, so its greatest scroll is **742** |
| where the player arrives            | **742 — its exact bottom**                     |
| controls in the window there        | **none** — button at −291, back link at −606   |
| then the record                     | 868px, arrive at 148; back link at **−43**     |

The clamp is the whole mechanism: `min(the offset you had, the new page's height − the window)`. It
means the damage is invisible from every direction the suite looks from, because the number is
always plausible.

**This is not one mission.** The closer sits at the foot of every board, on all four engines —
measured on unstarted boards, before any of them have grown: INTERVIEW 1,012px into 1,531,
ASSEMBLY 1,621 into 2,091, TRACE 1,377 into 1,893, DISCREPANCY 1,853 into 2,322 and 2,228 into
2,698. A board grows as it is worked — Case 1.01's goes from 1,531 to 3,320 — so every one of the
twenty-four missions ends on a click made far below the fold.

---

## 3. The fix, and why it is keyed to the view

Four lines at the mount, plus the marker they read:

```js
app.innerHTML = html;
const view = [
  progress.currentScreen,
  progress.currentHubRoom,
  progress.currentFieldRoom,
  progress.activeActivitySourceId,
  activityView,
].join("|");
if (view !== renderedView) {
  renderedView = view;
  if (typeof window !== "undefined") window.scrollTo(0, 0);
}
```

**The rule has two halves and they pull against each other.** A screen you have just arrived on
should open at its top. A screen you are already on must not move under you — every press on a
board rebuilds `#app`, and a student ordering a sequencing row four screens down being thrown back
to the heading between rows would be a worse bug than the one being fixed. So the reset is keyed to
_what is on screen_, never to a call of `render()`.

**The screen id alone is not that key**, and this is the part worth remembering: Mission
Instructions, the board and the debrief are three views behind one id, and the board→debrief step is
the worst case in the game. `activityScreen()` now writes which of the three it is returning into
`activityView`, and the key is read after the switch because the switch is what decides it.

The two surface ids are in the key for completeness rather than for a measured defect — the field
and hub pages have under 50px of slack — and cost nothing.

The teacher-side content editor at `main.js:9238` already does the opposite on purpose: it saves
`scrollY`, calls `render()` and puts it back, so an authoring form does not jump while it is being
filled in. That path never changes screen, so it never reaches the reset, and it restores after
`render()` returns either way.

---

## 4. The guard

`tests/e2e/arrival-scroll.spec.js` — three tests, and all three are load-bearing.

Two walk the defect: file the conclusion at the foot of the board and assert the debrief opens at
zero, with the mission's name, the way back and the filed conclusion actually in the viewport; then
open the record from the foot of the debrief and assert the same. The third is the counter-assertion
— order a sequencing row 1,234px down the practice check and assert the page does not move.

**Both were watched fail, against different wrong versions of the fix:**

- With only the reset disabled, the two arrival tests report **742** and **121** against an expected
  0, and the counter-assertion stays green.
- With the reset made unconditional — `window.scrollTo(0, 0)` on every `render()`, the obvious
  version — the counter-assertion reports **0 where it wanted 1,234**, and the two arrival tests
  pass.

Neither half of the rule is decoration, and neither test would have been written from the other's
evidence.

Each arrival test also asserts its own premise before it asserts anything else: the board is over
3,000px and reaching the closer took over 1,500px of scrolling. **A player who never had to scroll
cannot show this defect**, and without those lines both tests would pass on any build — including
one where the board had collapsed to nothing.

---

## 5. What this says about the suite

`source-reader-questions` — a committed visual baseline, recorded 2026-08-02 in `a2d4e5a` — **was a
photograph of this defect.** It is the source reader captured mid-page: the map's caption cut off at
the top, the second question's first line cut through, and no heading, no chrome bar and no back
link anywhere in the frame. It has been the definition of correct for that screen ever since, and
the suite compared every run against it and agreed.

The baseline beside it does not have the problem, and the reason is written in the file: Phase 58
hit the same arrival, decided the baseline was about the masthead rather than the route to it, and
added `await page.evaluate(() => window.scrollTo(0, 0))` with a comment calling the behaviour
"pre-existing". **A workaround and a rationale, one screen away from a baseline that had frozen the
same defect as correct.** That line is now deleted rather than kept as a no-op — a workaround left
standing reads as a defect still standing.

The general shape, which is `0123` §5's one document down: **every geometric guard in this suite
measures from the top of the page.** `fold-and-controls.spec.js` calls `window.scrollTo(0, 0)`
before every rect it reads, and says why — a rect read against a scrolled viewport is a rect that
lies. That is correct for asking _is this control above the fold_. It also means nothing in the
suite has ever asked _where does the player actually arrive_, because every test puts them at the
top first.

---

## 6. What was not done

- **No scroll restoration on the way back.** Returning from a record to the board you left puts you
  at the board's top, not where you were standing on it. That is a feature, not this defect's other
  half, and it wants a decision about which screens deserve it rather than a blanket mechanism.
- **`scroll-behavior` is untouched.** The reset is instant. A smooth scroll on a screen change would
  animate a page the player has not seen yet.
- **The two `scrollIntoView()` calls at `main.js:9774` and `:10262` are left alone.** Both move
  within a screen the player is already on, which is a different question, and the camera invariant
  they sit near is about the field's transform rather than the document.
- **The player still has no idle sheet, and bodies still overlap.** Both are recorded, both have
  screenshots with the owner, and both are the owner's call rather than a bug fix — one is a
  PixelLab spend, the other a change to how close a player may stand to everybody in the game.
