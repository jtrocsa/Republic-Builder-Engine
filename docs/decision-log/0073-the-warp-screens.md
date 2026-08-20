# 0073 — The warp screens

**Phase 88A**, taken out of order at the user's request, between the reveal (Phase 88) and Unit 7
(Phase 89). Ten painted establishing shots had been sitting unreferenced in
`apps/web/src/assets/` since early August — one per era plus the Institute Archive — and the two
transitions they were painted for were an abstract teal vortex that said nothing about where the
player was going.

This record settles what a warp screen is now, why the loading it does is real rather than
decorative, and the three things that were changed rather than merely restyled.

---

## 1. A destination has a picture

The two transition screens — Chronotravel out (`travel`) and Archive recall back
(`return-warp`) — are now one screen, `warpScreen()` in `main.js`, differing in which painting
they load and which way the anchor rings run. Full-bleed plate under a navy veil, a card naming
where you are going, a bar along the bottom edge.

**Keyed by unit, not by case.** A unit is one place and one era: Unit 1's three cases are all the
1493 Caribbean whether they route to a field map or not, so all three open on the same painting.
Keying by case would have meant eighteen paintings to say six things. `content/chronotravel-plates.js`
holds the table — the image, its alt text, and one line of flavour — and everything else on the
card comes from the case and the unit, so a renamed mission renames its own loading screen and no
string is written twice.

**They are chrome-less.** This is the one screen in the game whose entire job is the picture, and
the title sequence had already established that a full-bleed screen here drops the header rather
than framing it.

**The note is flavour and has to stay flavour.** A plate is the only screen in the game with a
player's undivided attention and no task on it, which is exactly the reason to refuse the
temptation to teach through it. The curriculum rule this sits under is about advantage; a
loading-screen tip that turns into a study aid is a screen students would be right to screenshot.

## 2. The loading is real

The old travel screen was a 2500 ms `setTimeout` in front of a screen that fetched nothing. That
is now two gates, and the player leaves when both are open:

- **The dwell** — `WARP_DWELL_MS`, still 2500 ms. The least time the card needs to be readable,
  and exactly how long the bar takes to fill (`--warp-dwell` is set inline from the same constant,
  so the two cannot disagree).
- **The art** — the plate, plus every tileset image the destination surface will paint with.

The tilesets are the half that earns the wait. They are eagerly globbed _URLs_, not bytes, so
before this a first visit to a map opened on an empty frame while `renderTiledMap()` went and
fetched them. `SURFACE_TILESETS` in `main.js` maps the six outdoor maps and the Main Hall to their
sheet URLs; a case that does not route to a field map warms none, because its mission screen is
HTML.

Three guards, each for a failure that would be worse than the thing it protects:

- `WARP_ASSET_CEILING_MS` (6 s) releases the screen whatever the network is doing. A gate that can
  stick is worse than a map that paints a moment late.
- `tilesetsFor()` swallows a throwing resolver. `createTilesetImageResolver()` throws on a sheet no
  `import.meta.glob` resolves — the mistake `CLAUDE.md` records as having shipped three times —
  and that already costs the map. It must not also strand the player on a loading screen.
- `warpRun`, bumped by every `render()`, replaces the cleared `setTimeout`. A promise chain has
  nothing to clear, so a warp the player skipped could otherwise still route them somewhere two
  seconds later.

**The bar shows the dwell, not the bytes.** Said plainly because it is the honest description: it
is a CSS animation over `--warp-dwell`, and if the art is slower than the dwell it sits full for a
moment while the real gate finishes. A JS-driven bar reading actual load state was written and
thrown away — it made this screen's visual baseline a coin toss, and nothing here loops for the
same reason.

## 3. The three behaviour changes

Everything else is a restyle. These are not:

- **The field recall beacon now plays the recall warp.** It used to cut straight to the Main Hall
  while the archived-record path played a sequence, and `instituteRecallSpawn()`'s own comment has
  called them "both recall paths" since Phase 57. It is also the arrival that most needs the
  pause, since the Main Hall's tilesets are what the warp fetches.
- **The recall can be skipped.** `skip-travel` became `skip-warp` and serves both screens. The
  recall was the one transition in the game a player could not get out of, and it is now the one
  that plays most often.
- **`.chronotravel-screen` is gone rather than kept as a marker.** The legacy-save boot-guard spec
  looked for it to prove a `travel` save was left alone; that assertion is about routing, so it
  looks for `[data-warp="travel"]` now. Keeping a class with no rules attached, purely to satisfy
  a test, is how vestigial selectors start.

## 4. What the art cost, and where the sources went

Ten 1672×941 PNGs at ~2.5 MB each — 25 MB, which is the wrong thing to put on a loading screen by
a factor of twelve. `scripts/assets/build-chronotravel-plates.js` (`npm run assets:build-plates`)
emits WebP at quality 78: **25.3 MB → 1.9 MB**, and only the seven referenced plates reach a
build.

The sources moved to `art-source/plates/`, which is gitignored — out of git for their size, and
out of `apps/web/src/assets/` so nothing can reference the 2.5 MB copy by accident. A clone gets
the committed WebP and not the input, which the script says out loud when it cannot find them.

The filename is the contract: `unit-0N-*` is the key `CHRONOTRAVEL_PLATES` looks the plate up by.

## 5. Units 7-9 are painted and committed unwired

The immigrant port, the postwar suburb and the 1990s campus arrived in the same commission as the
six that ship. Wiring them would mean inventing unit ids that do not exist, so they sit in
`assets/plates/` unreferenced — **Phase 89 adds three lines to the table and nothing else.**

`tests/unit/chronotravel-plates.test.js` holds both ends of that, because both are easy to get
wrong in opposite directions: the table must not name a unit that is not shipped, and the three
files must still be there when their units arrive. Deleting one as "unused" is a real risk and
this is what stops it.

## 6. What this phase does not do

- **It does not touch the upload screen.** `uploadScreen()` is the transmission beat between a
  finished case and the recall, it is not a transition, and it was not in the way.
- **It does not add a plate to the Entrance Hall, the Archive Room or any interior.** Those are
  reached by walking, and a loading screen in front of a door would be an interruption rather than
  a journey.
- **It does not make the dwell configurable or player-settable.** Two skip buttons already cover
  the person who wants it shorter.
- **It does not give the warp a keyboard skip.** The button is the affordance, and adding a global
  key handler for a screen that lasts 2.5 s is more surface than the convenience is worth.
- **It does not change the music.** Both warps are still `"quiet"`, with the existing `chrono` and
  `return-warp` stings on entry.
- **It does not exempt the bar from the reduced-motion umbrella.** Under
  `prefers-reduced-motion: reduce` the bar snaps full and then the screen holds its dwell, which
  reads slightly like a stall. Exempting it is one specific `!important` rule and was deliberately
  not taken: a progress indicator is arguably information rather than decoration, but the
  visual-regression baselines are captured under exactly that media state, so the trade is a real
  flake risk against a cosmetic nit on a screen that lasts 2.5 s and has a skip button.

## 7. Verification

- `tests/unit/chronotravel-plates.test.js` — 7 tests, new. Every shipped unit has a plate, no
  plate names a unit that does not exist, every image resolves to a file that is actually on disk,
  the three queued plates are still there, alt text exists on all of them, and no note is long
  enough to outlast the screen.
- `tests/e2e/warp-screens.spec.js` — 10 tests, new. The right painting per unit, the painting
  actually decoding in the page, a different plate per unit, both warps handing over on the
  natural path, both skip buttons, a non-map mission travelling to its own screen, and the field
  beacon playing the recall.
- `tests/e2e/visual-regression.spec.js` — `travel-transition` written again against the new screen, and a new
  `recall-transition`. Both were reviewed as images before the baselines were written; nothing else moved.
- `tests/e2e/legacy-save-fallback.spec.js` — the boot-guard assertion re-pointed at
  `[data-warp="travel"]`.
- Looked at in a browser at 1366×768 and at 820 px, and under `prefers-reduced-motion`, which is
  where the anchor rings were caught sitting at full strength while they waited out their delay —
  the reduced-motion umbrella collapses durations and not delays.
