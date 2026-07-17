# Director-led Institute tour (post-character-creation)

## Context

Today, right after the player confirms their Chronicler identity, the transition into the Institute Archive hub is silent: `intro-registration`'s "Enter Institute" button jumps straight to `progress.currentScreen = "institute"` with no dialogue, no fanfare, and the player is dropped into a fully free-roam hub with no orientation. The user wants this moment to actually deliver on the game's "Director recruits you, then shows you around" narrative frame: the Director says something like "Welcome, follow me," there's a scene transition into the Institute, and then a short guided tour narrates what the Navigation Table, Archive Room, and Preservation Case are before the player is turned loose to move freely.

The codebase already has an unused `progress.tutorial` field sitting in `DEFAULT_PROGRESS` (`{ step: "not-started", completed: false, skipped: false }`), explicitly scaffolded in an earlier commit "ahead of a future guided-tutorial pass" — this is that pass. It also already has a full typewriter/click-through dialogue engine built for the Director's pre-character-creation briefing screens, which this feature reuses wholesale rather than building a second dialogue system.

**Decisions already made with the user:**
- No new art assets. The "hallway" is built by cropping/zooming the *existing* `chronicle-institute-hub.png` background via CSS to frame the door already visible at the bottom of that art — not a new scene image.
- The in-hub tour is **click-through captions with movement locked**, not "walk to each target." Simpler, matches the user's own description ("once the player clicks through those, then the player is free to move around").

## Flow being built

```
identityScreen (confirm-identity)
  → intro-registration ("Enter Institute" button)
  → intro-hallway (NEW) — Director: "Welcome, <name>. Follow me."
       Director + player sprites walk up a cropped/zoomed slice of the hub art toward its door.
       Screen fades to black on arrival.
  → institute (Main Hall), player spawned at the existing entry point,
       movement LOCKED, progress.tutorial.step walks through:
       "tour-intro" (no highlight — Director narrates the room, names Amani/Julian, mentions quests)
       → "tour-table" (Navigation Table pulses, caption)
       → "tour-archiveDoor" (Archive Room pulses, caption)
       → "tour-trophy" (Preservation Case pulses, caption)
       → "complete" — movement unlocks, tour never shows again.
```

Returning players / any save with prior keys are retroactively treated as `tutorial.step: "complete"` by the *existing* merge logic in `readProgress()` (chronicle-progress-store.js:78-85) — that logic is not touched, so this never re-triggers for existing saves.

## Implementation

### 1. New screen: `intro-hallway`

- Add `"intro-hallway"` to `VALID_SCREENS` (main.js:1266-1294) and a `render()` case alongside the other intro screens.
- `introRegistrationScreen()`'s (main.js:1697-1700) "Enter Institute" button: change `data-next="institute"` → `data-next="intro-hallway"`.
- In `handleOnboardingClick()`'s `"intro-advance"` case (main.js:3224-3234), add a branch for `next === "intro-hallway"` that sets `progress.tutorial.step = "hallway"` instead of the current `next === "institute"` branch (which today calls `safeInstituteSpawn` directly — that call moves to the end of the hallway walk instead, see below).

### 2. Hallway scene — reuse the director-scene dialogue engine, bespoke walk animation

- Extend `directorSceneMarkup()` (main.js:1524-1526) with an optional `stageHtml` override param so `introHallwayScreen()` can swap in a custom stage (the cropped hallway viewport + two sprites) while keeping the existing bottom dialogue bar (`#directorLineText`, `data-action="director-dialogue-click"`, Continue indicator) completely untouched. `introWelcomeScreen`/`introBriefingScreen`/`introProtocolScreen` don't pass this param, so they're unaffected.
- New `introHallwayScreen()` function (near the other `intro*Screen()` functions, ~main.js:1548): renders a `.hallway-viewport` div containing a cropped/zoomed `background-image: url(${instituteHubBackground})` layer (reuse the existing import already used at main.js:1972 — no new asset) framed on the door visible at the bottom-center of that art, plus two absolutely-positioned sprite divs (player, Director) starting near the bottom.
- New content in `chronicle-opening.defaults.js`: a `scenes.hallway.body` entry, `[{ text: "Welcome, {{chroniclerName}}. Follow me." }]`. Add a matching branch in `currentIntroLines()` (main.js:1553-1567) that substitutes `{{chroniclerName}}` with `progress.profile.name || "Chronicler"` — the only token-substitution in the file, scoped to this one branch, since no other content line interpolates player state today.
- New `runHallwayWalk(now)` — a bespoke `requestAnimationFrame` loop (following the same direct-DOM-patch convention `updateInstituteNpcs`/`runHubMovementLoop` already use) that moves the two sprite divs' `top`/position from bottom toward the door over ~2s, alternating the player's existing `up.idle`/`up.step` frames from `fieldSpriteAssets` for a walk cycle. The Director has no up-facing sprite (only front-idle + side/side-step) — use the static front-idle sprite for this walk, same as `hubNpcSpriteUrl()` already does for the Director's vertical hub patrol movement, so this isn't a new asset gap.
- New `.scene-fade` overlay (new primitive — confirmed nothing like it exists yet): a fixed, full-screen `opacity`-transitioned black div. On walk completion, add `.is-active`, hold briefly, then call `safeInstituteSpawn(7, 9, "up")` (the same spawn point the old direct jump used), set `progress.currentScreen = "institute"`, `progress.tutorial.step = "tour-intro"`, save, render. The Main Hall's next render should include the fade div at full opacity for one frame and then transition it back to 0, so the cut reads as a fade-in rather than a hard cut.
- Respect `prefersReducedMotion()` (already used elsewhere, main.js:1620-1622): skip/shorten the walk animation and fade transition when set.
- New module-level `let`s for this scene's runtime state (`hallwayWalkFrame`, `hallwayWalkStartedAt`, `hallwayFadeTimer`, `hallwayWalkDone`), declared alongside `briefingStep`/`introLineIndex`/`introTypewriterTimer` (main.js:1308-1316), and cleared in `render()`'s existing cleanup block (main.js ~2863-2865) alongside the existing `clearTimeout(introTypewriterTimer)` line, so navigating away mid-walk (refresh, reset) can't leave an orphaned timer running.

### 3. In-hub tour overlay

- New constant `TUTORIAL_TOUR_STEPS = ["intro", "table", "archiveDoor", "trophy"]` near `HUB_TARGETS` (main.js:1004). `"intro"` has no highlighted target — it's the Director's general orientation beat (names the Institute, names Amani/Julian by name reusing `HUB_TARGETS.amani`/`.julian`'s existing name strings, mentions quests/investigations) before the three highlighted beats begin.
- New content in `chronicle-opening.defaults.js`: a `tour` object keyed by step id (`intro`, `table`, `archiveDoor`, `trophy`), each `{ name, role, body, cta }`, following the existing flat-string content shape used elsewhere in the file.
- New helpers near `activeHubTargets()` (main.js:1103-1105): `isTutorialTourActive()`, `currentTourStepId()`, `isTourHighlighted(id)`.
- **Movement lock**, three call sites (confirmed no existing lock mechanism anywhere in the codebase):
  1. The `institute`-screen keydown handler (main.js ~4100-4114): early-return before both the E-interact and movement-key branches when `isTutorialTourActive()`.
  2. `runHubMovementLoop()` (main.js:1862-1904): fold `isTutorialTourActive()` into its existing `progress.currentScreen !== "institute"` early-return check.
  3. `interactWithHubTarget(id)` (main.js:1905-1950): early-return at the top when `isTutorialTourActive()` — needed because clicks route here independently of the keydown gate via `handleHubClick`'s `"hub-interact"` action.
- **Highlight rendering** — reuse the existing `.hub-table.is-near`/`.hub-trophy.is-near` gold pulse CSS (global.css ~3691-3696, ~3911-3917), don't invent new glow CSS. Two spots need the *same* combined condition (`real proximity OR isTourHighlighted(id)`), not just one, because `updateHubProximityUi()` runs after every render and will otherwise strip a highlight that only the initial markup applied:
  1. `instituteMainRoomScreen()`'s inline `is-near` ternaries for `trophy`/`table`/`archiveDoor` (main.js:1972).
  2. `updateHubProximityUi()`'s class-toggle condition (main.js:1814-1826).
  Factor a shared `isHubTargetNear(id)` helper used at both sites to avoid drift.
- **Caption panel**: reuse the existing `.hub-dialogue` panel structure/styling (the same one `hubDialogueId` already renders, main.js:1972) rather than inventing new UI — a `tourCalloutMarkup()` function rendered whenever `isTutorialTourActive()`, with a "Next"/"Got it" button (`data-action="tutorial-tour-next"`) instead of a close button.
- **Advance handler**: `"tutorial-tour-next"` action (in `handleHubClick()`, main.js ~3293 onward) steps `progress.tutorial.step` through `TUTORIAL_TOUR_STEPS`; on the last step, sets `progress.tutorial = { step: "complete", completed: true, skipped: false }`.
- **Director patrol pause**: `updateInstituteNpcs()` (main.js:1177-1240) already freezes an NPC's patrol when `hubDialogueId === id` (main.js:1187) — extend that same guard so the Director also freezes for the whole tour (`isTutorialTourActive()`), so he isn't visibly wandering off while narrating. Amani/Julian keep patrolling normally.
- Because the caption/highlight markup is a pure function of the persisted `progress.tutorial.step`, a mid-tour page refresh resumes at the correct step automatically — no extra reload handling needed.

### Files touched
- `apps/web/src/main.js` — all logic/markup changes above.
- `apps/web/src/content/chronicle-opening.defaults.js` — `scenes.hallway` + `tour` content.
- `apps/web/src/styles/global.css` — `.hallway-viewport`/`.hallway-crop`/`.hallway-sprite`/`.scene-fade` (new), reusing existing `.hub-dialogue`/`.is-near`/pulse-glow rules everywhere else.
- No changes needed to `chronicle-progress-store.js` — `progress.tutorial` already exists and its retroactive-completion merge logic is left as-is.

### Explicitly not building
- No general-purpose cutscene/scripted-movement engine — the hallway walk is bespoke, one-off animation code.
- No dimming/scrim/spotlight masking system — reuses the existing pulse-glow treatment.
- No "skip tutorial" control (the `skipped` field stays unused) — not requested; flagged as a trivial future add if wanted.
- No touching of Author Mode, quest grading, field/case gameplay, or any screen not named above.

## Verification (browser, `npm run dev` — per this repo's testing bar, not just build/lint)

1. Start New Game → click through Welcome/Briefing/Protocol → set appearance/name → confirm identity → on Registration click "Enter Institute": confirm you land on the new hallway scene, not directly in the Main Hall.
2. Confirm the hallway line reads "Welcome, `<the name you typed>`. Follow me."
3. Confirm both sprites visibly walk toward the door over ~2s with a real walk cycle (alternating frames on the player), and tune the CSS crop (`background-position`/`background-size` on `.hallway-crop`) live until it reads as a recognizable hallway/door — this can't be nailed from static analysis, must be eyeballed.
4. Confirm a full fade to black, then a cut into the Main Hall at the expected spawn point, with no flash of unstyled content.
5. Confirm the "intro" tour beat appears immediately (no highlight yet) naming the Institute, Amani, Julian, and quests.
6. Confirm the Navigation Table pulses and shows a caption; try WASD/E/clicking the table directly — confirm all are inert (movement locked, not just visually blocked).
7. Click "Next" through Archive Room and Preservation Case beats — confirm the highlight moves each time and the Director isn't patrolling away mid-narration.
8. After the final "Got it," confirm movement unlocks immediately and `progress.tutorial.step === "complete"` (check via devtools `localStorage`).
9. Hard-refresh mid-tour (e.g. on the archiveDoor step) — confirm it resumes on the correct step rather than resetting.
10. With an existing/returning save (or after "Reset Unit 1 demo," which doesn't go through the identity flow), confirm the hallway/tour never appears and the player lands directly in the Main Hall as before.
11. Toggle OS "reduce motion" and repeat steps 1-4 — confirm the walk/fade skip or shorten cleanly rather than looking broken.
12. Regression sweep: confirm normal (non-tutorial) hub interaction — Director/Amani/Julian dialogue, Navigation Table, Archive Room entry, Preservation Case — all still work post-tutorial exactly as before.
