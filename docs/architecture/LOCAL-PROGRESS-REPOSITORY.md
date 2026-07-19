# Local Progress Repository

Status: Phase 4 of the near-term architecture sequence (`docs/architecture/ARCHITECTURE-QUICKREF.md` §6) — complete.

## Why this is the only required persistence repository now

Chronicle has exactly one thing worth persisting today: `progress`, the single flat object read/written by `apps/web/src/engine/chronicle-progress-store.js` under the `localStorage` key `republic-builder.chronicle.unit-01.v2`. There is no auth, no classroom, no remote submission, no asset upload, no world/blueprint data — those are all documented future direction in `PLATFORM-ARCHITECTURE-PROPOSAL.md`, not real today. Building `AuthRepository`/`ClassroomRepository`/`SubmissionRepository`/`WorldRepository`/`AssetRepository` now would be five abstractions with zero real callers. Per `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §11 step 4, the only repository this phase adds is a thin wrapper around the progress store.

## The existing store is retained underneath it, unchanged

`apps/web/src/engine/chronicle-progress-store.js` was **not moved or rewritten**. It still owns:

- The storage key (`republic-builder.chronicle.unit-01.v2`)
- `DEFAULT_PROGRESS`
- The defensive field-by-field merge in `readProgress()` (guards against partial/legacy/corrupted saved shapes)
- The synchronous, unthrottled `localStorage.setItem`/`removeItem` calls

`apps/web/src/repositories/local-progress-repository.js` is a new, small file that imports the store's functions and re-exports thin wrappers around them, plus one additive concern (see Save Versioning below). It contains no game logic, no mutation logic, and no rendering.

## Public functions

| Function                 | Wraps                | Behavior change                                                                                                                         |
| ------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `loadProgress()`         | `readProgress()`     | Adds `schemaVersion` if missing (see below); otherwise identical                                                                        |
| `saveProgress(next)`     | `saveProgress(next)` | Stamps `schemaVersion` onto `next` before persisting; otherwise identical                                                               |
| `resetProgress()`        | `resetProgress()`    | Adds `schemaVersion` to the returned in-memory defaults; otherwise identical                                                            |
| `hasSavedProgress()`     | `hasSavedProgress()` | Pass-through, no change                                                                                                                 |
| `migrateProgress(saved)` | — (new)              | Internal migration seam; exported for testability. Real caller: `loadProgress()`/`saveProgress()`/`resetProgress()` call it internally. |

Only these five functions were added. No speculative methods (no `subscribeToProgress`, no `exportProgress`, no batching/debouncing) were added — none has a real caller today.

## Call sites changed

Verified against the current repository, not the architecture review's original estimate (which only tallied `readProgress`/`saveProgress`, arriving at "~4"). The actual direct references to the progress-store module in `apps/web/src/main.js`, before this phase:

- `readProgress()` — 1 call site (module init)
- `saveProgress(progress)` — 2 direct call sites, plus 1 more inside the local `save()` wrapper that ~60+ other call sites use
- `resetProgress()` — 3 call sites (`resetCaseOneDemo()`, `start-new-game`, the `reset` author-panel action)
- `hasSavedProgress()` — 1 call site (`continue-game` action)

8 direct references total, not ~4. This document supersedes that earlier estimate; the count above is authoritative as of this phase.

Changed: the import statement (now points at `./repositories/local-progress-repository.js` instead of `./engine/chronicle-progress-store.js`) and the one `readProgress()` call site (now `loadProgress()`). The `saveProgress`, `resetProgress`, and `hasSavedProgress` call sites needed **no edits** — the repository re-exports those three names unchanged, so every existing call (including all ~60+ indirect calls through `save()`) now resolves to the repository's wrapper automatically.

## Save compatibility

- Storage key: unchanged.
- Data shape: unchanged, plus one additive field (`schemaVersion`).
- Merge behavior: unchanged — still `chronicle-progress-store.js`'s own field-by-field merge.
- Reset behavior: unchanged — still `localStorage.removeItem(KEY)`.
- A save written before this phase (no `schemaVersion` field) loads correctly: `loadProgress()` returns it with `schemaVersion: 1` added, no other field affected, nothing deleted. Verified in `tests/unit/local-progress-repository.test.js` ("existing save compatibility" block).
- No user save is ever silently deleted by this change — `migrateProgress()` only adds a field, never removes or resets data.

### Save versioning

No explicit save-version field existed before this phase (the `.v2` in the storage key name is the only prior version signal, and it's a key-rename, not a value inside the data). Per the task's guidance ("if adding a version field can be done without breaking existing saves, add the smallest practical one"), a minimal `schemaVersion` field (currently `1`) was added — but at the **repository** layer, not inside `chronicle-progress-store.js`, so the store itself stays untouched. `migrateProgress(saved)` is the entire "migration framework": it stamps `schemaVersion` if absent or stale, and returns the input unchanged otherwise. There is no real schema break to migrate from yet — this is deliberately not a versioning framework, just the smallest seam a future breaking change could hook into.

## Deferred future repositories

Unchanged from `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §8: `AuthRepository`, `ClassroomRepository`, `SubmissionRepository`, `WorldRepository`, `AssetRepository`, any generic repository framework, any dependency-injection container, abstract base repository classes, and remote repository mocks. None has a real caller today.

## Conditions that would justify a remote implementation later

Per the same review, a remote-backed progress repository becomes worth building only when at least one of these becomes true:

- A second real user/device needs to share one save (cross-device sync), not just this one browser's `localStorage`.
- A teacher/classroom view needs to read student progress from outside the student's own browser.
- The AI-grading backend (`api/evaluate.js`) needs to read/write progress server-side rather than being entirely disconnected from gameplay as it is today.

None of these exist yet. Until one does, `local-progress-repository.js` stays a thin synchronous `localStorage` wrapper — swapping in a remote implementation later means changing this one file's internals, not any of its ~8 call sites, since the function signatures (`loadProgress()`, `saveProgress(next)`, `resetProgress()`, `hasSavedProgress()`) don't imply a synchronous local backend.
