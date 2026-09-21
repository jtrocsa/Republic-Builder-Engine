# 0151 — The loop that plays when there is no file

**Phase 152 · 2026-09-20 · Accepted**

The game could not play an audio file at all. `audio-engine.js` was oscillator and noise-buffer
synthesis only, there was no `assets/audio/` directory, and there were no audio assets anywhere in
the repository. Six synthesised loops covered thirty-two screens, and **`musicScene` held two values
across eight field maps** — `island` once and `settlement` seven times.

So a 1622 Virginia settlement hymn played on a 1767 Philadelphia street, an 1830s canal town, 1864
Richmond, an 1873 Kansas railhead, a 1907 immigrant port and a 1957 Pennsylvania suburb. All ten
field interiors declared it too.

CLAUDE.md names **"location-specific music"** as a product pillar. It was a stub.

This phase builds the player and commissions nothing. `docs/design/AUDIO-PROMPT-BOOK.md` — 1,084
lines of paste-ready prompts written in an earlier phase — is unchanged in substance; what it lacked
was anywhere for its output to go.

---

## 1. The design constraint that makes it one phase

**The engine ships and is fully verifiable with `apps/web/src/assets/audio/` empty**, and each
commissioned track is then a drop-in that needs no code change.

That is not a convenience. It is what lets the phase be reviewed at all: there is nothing to listen
to, so every claim has to be something a test can state. And it forces the fallback to be the
_normal_ path rather than an error path, which is the shape that survives a 404 in production.

## 2. The bug that renaming would have shipped, and the table that prevents it

`scheduleLoop` did `sequences[scene] || sequences.quiet`. `quiet` is **a single 261.63 Hz note every
six seconds**.

So changing `unit-02`'s `musicScene` from `"settlement"` to `"riverbend"`, with no `riverbend.ogg`
on disk, would have taken Riverbend from the seven-note hymn to near-silence — and the same for
Units 3 through 8. **Seven of the eight maps would have got quieter and worse**, on a change whose
entire premise is that nothing regresses for a player with no files.

Nothing in the repository would have caught it. **No visual baseline photographs sound.**

Hence `TRACKS`, which is two columns rather than one:

```js
riverbend: { file: "riverbend", loop: "settlement" },
```

`file` is what to look for; `loop` is what to play until it is there. `MUSIC_SEQUENCES` is
untouched, including `settlement`, which now has no `musicScene` pointing at it and is reached only
through that second column. `scheduleLoop` changed by one expression, and `?? scene` keeps a direct
sequence name working for the existing test.

`quiet` carries `file: null` — _never look for a file_, as data rather than as an absence.

**`sceneForMusic()` in main.js is not edited at all.** The routing policy was already right; only
the data it reads changed. That is the engine/content boundary holding.

## 3. What the engine grew

- **A loader.** A non-eager-safe `import.meta.glob("../assets/audio/*.ogg", { eager: true, query: "?url" })`
  puts only hashed path strings in the entry chunk (~40 bytes each); the bytes are separate assets
  fetched on demand. `vite.config.js` needed no change — `assetsInlineLimit: 0` was already set by
  `0135` and `.ogg` is already in Vite's default `assetsInclude`. With no files the glob returns
  `{}` and does not error.
- **Four outcomes, three of them `null`**, and **none of them ever retried**. A scene the player
  walks in and out of thirty times must not issue thirty failing requests.
- **A bus graph**, where there was one gain node at `0.045`:

  ```
  masterGain ─ musicVolumeGain ─ musicDuckGain ─┬─ musicOscGain (0.45)
             └ sfxVolumeGain ──────────────────┴─ musicFileGain
  ```

  `MUSIC_LEVEL × OSC_CAL = 0.10 × 0.45 = 0.045`. At default volumes a synthesised note's total gain
  to the destination is **bit-for-bit what it was before**, which is an identity a test asserts
  rather than a claim anyone has to take.

- **`musicDuckGain` is a separate node from `musicVolumeGain` on purpose.** One param with two
  writers is CLAUDE.md's "one variable answering two questions": drag the slider mid-duck and one
  write wins silently, so the music either never comes back up or comes back to the wrong level. Two
  nodes, one writer each.
- **Ducking is only the five long cues.** `secure` and `flat` fire on nearly every press inside an
  activity, and a bus that pumps on every click is worse than no ducking.
- **Fades, and `audioScene` redefined as the _target_ scene, not the sounding one.** That
  redefinition is what lets `updateMusicForScreen`'s early-out survive a crossfade — and that
  early-out is load-bearing, because `render()` calls it at its tail on every interaction.
- **Resume offsets.** A map with eight NPCs swaps to `dialogue` and back sixteen times; without
  this, a track would play its first six seconds over and over and nothing else.

## 4. A cue the book names and this phase refuses to wire

`flat` is not mapped to `sfx-incorrect`. The row's _description_ is right — "must not sound like
punishment" — and its **name is wrong for this game**: there is no `✗` here, a deflection is not a
wrong answer, and `flat` fires on 104 of the 156 authored interview answers that carry nothing **by
design**. The book should rename that row. Flagged rather than silently bound to a file called
"incorrect".

`sting-badge`, `sting-era-secured`, `sting-mission-complete` and `sting-anomaly` get no entry
either: they have no call site in `main.js`, and adding four sounds at four new moments is content
design.

## 5. The volume control, and the screen it broke on the way

It is **not in `chrome()`**. The header renders on ~54 of the 61 committed win32 baselines, so a
slider there reprints every one — ~700 KB PNGs that do not delta-compress, and a blind
`--update-snapshots` across 54 files in the same commit as an audio change nobody can review pixel
by pixel.

It went on the landing screen's **Student panel** first. That was wrong, and the way it announced
itself is the part worth recording.

**The only symptom was 604 differing pixels on `mini-games-select`** — an unrelated visual baseline,
two screens away, whose "expected" and "actual" images are indistinguishable by eye. The differing
pixels were sub-pixel glyph rasterisation inside one card. It reproduced 3/3 with the change and
0/3 without it, and the pixel count varied between attempts (452, 604), which is what finally said
_instability_ rather than _layout_.

Bisected to `main.js`, then to the panel itself, then measured directly at 1280×720:

| landing branch          | before  | after   |
| ----------------------- | ------- | ------- |
| Student/Teacher chooser | 720     | 720     |
| **Student panel**       | **720** | **868** |

**The Student panel's content was already exactly one viewport tall.** It had no room to lend, and
two sliders took it 148px over — on a screen that is nothing but controls, which is the last place
Phase 121's rule should break.

The chooser is pinned to 720 by `min-height` with its content far under, so the room is real there.
It is also **one click away mid-game rather than two**: `open-main-menu` sets `landingMode = "root"`,
so the chrome **Menu** button always lands on the chooser. And because `progress.currentScreen`
never changes while the menu is up, `sceneForMusic()` keeps returning the field's key — a player
hears the track they are adjusting.

Wired in **`handleAppInput`, not `handleAppChange`**: that handler already patches the DOM without
calling `render()`, which is what a range input needs, since `render()` replaces `#app` wholesale
and would destroy a slider mid-drag.

Persisted to a **new** key, `republic-builder.audio.volume`, owned by the engine as
`…audio.enabled` already is. **Not `progress.settings`** — `progress` syncs to Supabase and follows
a student to another device (`0147`), and a shared Chromebook's speaker level is a property of the
machine. Widening `…audio.enabled` into a JSON blob was rejected outright: it is read as
`=== "true"` and every existing browser would lose its setting.

## 6. Music still defaults to off, and that is deliberate

`audioEnabled` is `localStorage.getItem(…) === "true"`, so a fresh player gets `false`. The plan for
this phase proposed flipping it, on the argument that commissioned tracks behind a toggle most
students never press are wasted.

**Not done, and the reason is the state this phase ships in.** There are no files. Defaulting on
today turns the _beeps_ on for every student, which is not the thing worth defaulting on. It is one
line, and it belongs to the phase that lands the first batch of real tracks — at which point the
e2e spec also needs a file-scoped autoplay flag, where today a real click on ♫ is a real gesture and
needs none.

## 7. Verification

`npm run check` clean — **2,479 unit tests across 87 files** (2,433 across 85 before), ESLint 0
errors and **4** warnings (baseline 5 — two `prefer-const` in the rewritten file were fixed and one
introduced), cspell 0, Prettier clean, `validate:content` not run, by design — no content file changed.
`npm run build` clean.

**All 61 visual baselines unchanged**, which is the evidence the volume control went where §5 says.

Every guard was watched fail, and the failures name the defect rather than a symptom:

| Guard                                 | Broken by                                   | Said                                                        |
| ------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| the zero-file mapping                 | deleting `riverbend`'s `loop`               | `expected [ 261.63 ] to deeply equal [ 262, 330, 392, … ]`  |
| `musicScene` is a `TRACKS` key        | reverting unit-06 to `settlement`           | `…is in no TRACKS entry… the map goes near-silent`          |
| eight maps, eight scenes              | pointing unit-07 at `railhead`              | `the eight maps share scenes: … railhead, railhead, …`      |
| interiors inherit their outdoor scene | the same                                    | named both railhead rooms                                   |
| the 0.045 identity                    | `MUSIC_LEVEL` 0.1 → 0.2                     | `expected 0.09 to be close to 0.045`                        |
| the duck writes the duck node         | pointing it at `musicVolumeGain`            | `expected [ { kind: 'linear' }, … ] to have a length of +0` |
| the loader's memo                     | removing the cache hit                      | 6 of 7 loader cases                                         |
| the bounded cache                     | `MUSIC_BUFFER_CACHE` 2 → 99                 | `expected [ … ] to have a length of 4 but got 3`            |
| **the landing does not scroll**       | putting the panel back on the Student panel | `the Student panel overflows by 148px`                      |

The e2e spec proves the **file** branch with nothing committed: a 0.2 s WAV built in the page and
handed to the loader as a `data:` URL, then the same key pointed at a 404 to prove the fall back.
It works because the loader decodes bytes and never looks at an extension — the same property that
makes a real `.ogg` a drop-in.

**One background run reported `exit code 0` on a suite that had three failures.** The output file
was empty and the run had been killed. A green exit code from a run whose output you have not read
is not a result.

## 8. Not in this phase

Generating or committing any audio file · §5's nine non-place tracks and the `sceneForMusic()`
branches they need (with no files every new key falls to `quiet`, so nothing would be audible and
nothing proved) · §8's footsteps, doors and the eight ambience beds — a footstep needs a call site
**inside the movement loop**, the one place CLAUDE.md forbids audio from reaching, and an ambience
bed is a second simultaneous source with its own memory and performance question · the four stings
with no call site · §4's eight indoor tracks, which the book says not to make · `furnacebend` as a
live `TRACKS` key, which waits for `FIELD_MAPS["unit-09"]` · a one-click volume control in the
header.
