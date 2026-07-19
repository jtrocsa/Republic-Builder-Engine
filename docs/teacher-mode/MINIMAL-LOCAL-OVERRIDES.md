# Minimal Local Content Overrides (Author Mode persistence fix)

Status: complete. Per `docs/architecture/ARCHITECTURE-QUICKREF.md` §6 / `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §7 item 7 and §11 step 6 — the last step in the near-term architecture sequence before the explicit stop-and-reassess point.

## What was actually broken

Two Author Mode content-edit fields rendered in `authorPanel()` in `main.js` (previously at `main.js:1134-1136`, before this fix's edits shifted line numbers) with correct-looking current values, but had **no event listener wired to `[data-copy]` at all** — confirmed by grepping `main.js` for `data-copy` and `data-profile`. The sibling `data-profile="name"` field (student name) _does_ have a working `change` listener (`app.addEventListener("change", ...)` → `progress.profile[...]  = field.value; save();`), which is why it was not part of this fix — it already worked and already persists through the existing progress store.

| Field         | `data-copy` value | Backing content           | Default value                                                                                               | Save behavior before this fix            | Render behavior before this fix                                     |
| ------------- | ----------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Unit title    | `unit-title`      | `UNIT_01.title`           | `"The Atlantic World"`                                                                                      | None — no listener matched `[data-copy]` | Always rendered the live `UNIT_01.title` import, never a saved edit |
| Unit question | `unit-question`   | `UNIT_01.centralQuestion` | `"How did contact among Europe, Africa, and the Americas reshape societies on both sides of the Atlantic?"` | None                                     | Always rendered the live `UNIT_01.centralQuestion` import           |

No more than these two fields were affected. `data-profile="name"` was already working and was not touched.

## The store

`apps/web/src/repositories/local-teacher-override-store.js` — a flat field-path-patch blob in `localStorage`, the `TeacherOverride` _shape_ from `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` with none of the surrounding `TeacherWorld`/`PublicationVersion`/`ClassroomPublication`/publish-pipeline machinery.

**Storage key:** `republic-builder.chronicle.teacher-overrides.v1` (follows the existing `republic-builder.chronicle.<subject>.v<n>` convention from `chronicle-progress-store.js`'s `republic-builder.chronicle.unit-01.v2`).

**Shape:**

```json
{
  "unit-01": {
    "title": "A Teacher-Edited Unit Title",
    "centralQuestion": "A teacher-edited guiding question?"
  }
}
```

**Stable-key convention:** the outer key is the content object's own stable `id` field (e.g. `UNIT_01.id === "unit-01"`), never a visible title or label — so an override survives an edit to the very title it's overriding, and doesn't collide if the official title text changes later. The inner key is a field name drawn from a fixed allow-list (`SUPPORTED_FIELD_NAMES = ["title", "centralQuestion"]` in the store file) — add a new name there only once a real Author Mode input actually edits it.

## Public API

| Function                                            | Behavior                                                                                                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getOverride(contentId, fieldName)`                 | Returns the stored override value, or `undefined` if none exists.                                                                                                                                                       |
| `hasOverride(contentId, fieldName)`                 | Boolean convenience wrapper around `getOverride`.                                                                                                                                                                       |
| `resolveField(contentId, fieldName, officialValue)` | The one function render code should call: override if present, else `officialValue`. Never mutates `officialValue`.                                                                                                     |
| `setOverride(contentId, fieldName, value)`          | Writes one field's override. Silently no-ops (returns the store unchanged) if `fieldName` isn't in the allow-list or `value` fails the Zod string schema — this is the write-side half of the malformed-data guarantee. |
| `clearOverride(contentId, fieldName)`               | Removes one field's override. Removes the whole `contentId` entry once its last field is cleared, so the store never accumulates empty `{}` entries.                                                                    |
| `clearAllOverrides(contentId)`                      | Removes every override for one content id at once — backs the panel's single reset button.                                                                                                                              |

## Resolution behavior

`main.js` never reads `UNIT_01.title` / `UNIT_01.centralQuestion` directly for display anymore. Two small wrapper functions do the resolution:

```js
function resolvedUnitTitle(unit) {
  return resolveTeacherOverride(unit.id, "title", unit.title);
}
function resolvedUnitCentralQuestion(unit) {
  return resolveTeacherOverride(unit.id, "centralQuestion", unit.centralQuestion);
}
```

These are called everywhere the unit's title or central question is already shown to a student, so an edit is consistent across every screen rather than half-applied:

- `authorPanel()` — both input/textarea default values (so editing shows the _current_ resolved value, not always the official one)
- `instituteScreen()` — the "Unit 1 · {title}" hub-meta line
- `archiveScreen()` — the atlas `aria-label`, and a new one-line "Guiding question" paragraph in the archive copy section (see below)
- `reviewScreen()` — the `<h1>`
- `completionScreen()` — the `<h1>`

Because `resolveField` is generic over `contentId`, this also correctly no-ops for `UNIT_02` (no override ever exists for `"unit-02"`, so `unit.title` renders unchanged there) without any extra branching in `main.js`.

### Why `centralQuestion` gained one new display line

`UNIT_01.centralQuestion` was editable in Author Mode before this fix but was **not rendered anywhere else in the app** — confirmed by grep. Leaving it that way would mean an edit "saves" but a teacher can never see the result outside the editor itself, which the task's required-behavior list (§5, "show the override in the relevant student/preview display") calls out as broken. The smallest fix was one new line in `archiveScreen()`'s copy section, immediately under the existing "Chronicle Navigation Table" heading:

```html
<p class="archive-central-question"><b>Guiding question:</b> {resolved centralQuestion}</p>
```

This is not a new editable field and not new Teacher Mode surface area — it's the missing read side of a field that was already write-side-editable.

## Reset behavior

The author panel had no reset control for content fields before this fix (only a _progress_ reset button, "Reset Unit 1 demo," which resets gameplay save state and does not touch content overrides — verified these are independent). One button was added, shown only when at least one of the two fields has an active override:

```html
<button class="text-button" data-action="reset-author-overrides">
  Reset content overrides to official text
</button>
```

Clicking it calls `clearAllOverrides(UNIT_01.id)` and re-renders. Both fields snap back to the official `unit-01-campaign.js` values. Each overridden label also shows a small "edited" flag (`.author-override-flag`) so it's visible which fields currently differ from official content, without needing to open dev tools or diff localStorage by hand.

## Validation

Zod validates the store's own persisted shape, layered defensively (per-entry, not all-or-nothing) so one bad entry can't take down unrelated ones:

- **Stored value type:** `FieldValueSchema = z.string().max(4000)` — every kept value must be a string under a sane length.
- **Supported field names:** field names not in `SUPPORTED_FIELD_NAMES` are dropped during both read (`sanitizeStore`) and write (`setOverride`'s allow-list guard), not just ignored at render time.
- **Override object shape:** `sanitizeStore()` requires the top level to be a plain object keyed by content id, and each content id's value to be a plain object keyed by field name — arrays, `null`, primitives, or other malformed shapes at either level are treated as "no data there," not a crash.

This is intentionally not a `packs/`-wide or cross-content Teacher Mode schema — it validates exactly the one small store this task added.

## Limitations (explicitly deferred)

Everything from `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §8 remains deferred, unchanged by this fix:

- **No `TeacherWorld` / `PublicationVersion` / `ClassroomPublication` / draft-vs-published workflow.** Overrides apply live and immediately, in this browser, with no separate publish step.
- **No accounts, authentication, or classroom scoping.** The store is per-browser `localStorage`, exactly like `chronicle-progress-store.js` — one teacher's edits on one machine, not shared or synced.
- **No conflict resolution.** Nothing else writes this key, so there's nothing to conflict with yet.
- **No remote storage, no official-pack update mechanism, no AI generation.**
- **No expansion of which fields are editable.** Only `unit-01`'s `title` and `centralQuestion` are wired, matching exactly what `authorPanel()` already exposed as (non-functional) inputs before this fix. Adding a new editable field means adding its name to `SUPPORTED_FIELD_NAMES`, wiring a `data-copy` input, and adding it to `AUTHOR_COPY_FIELDS` in `main.js` — a deliberate per-field decision, not automatic.
- **The official content source files are never mutated.** `apps/web/src/content/unit-01-campaign.js` is read-only at runtime from this store's perspective; overrides live entirely in `localStorage` under a separate key from both content and progress.

## Naming

Kept "Author Mode" as the UI label (unchanged) — the task's own guidance was to rename only if it's a tiny, obviously justified change, and no such case exists here; "Author Mode" already reads correctly for a single-teacher local editing tool. The store file is named `local-teacher-override-store.js` because that name was already fixed by the architecture proposal and `ARCHITECTURE-QUICKREF.md`'s "exact next phase" entry before this task began — an internal filename choice, not a user-facing rename.

## Manual verification procedure

1. `npm run dev`, open the app, reach the Institute (start a new game or continue).
2. Toggle Author Mode open (chrome header button).
3. Confirm "Unit title" shows `The Atlantic World` and "Unit question" shows the existing central question, with no "edited" flag and no reset button visible.
4. Edit the unit title, tab/click away to blur the field (fires `change`). Confirm the panel re-renders with an "edited" flag next to "Unit title" and the reset button appears.
5. Navigate to the Institute hub screen behind the panel — confirm the "Unit 1 · …" line now shows the edited title.
6. Open the Navigation Table (Archive screen) — confirm the edited title appears in the atlas `aria-label` (inspect via devtools or a screen reader) and that the new "Guiding question" line reflects the _official_ central question (since only the title was edited in this step).
7. Edit the unit question field too, blur it. Confirm the Archive screen's "Guiding question" line now shows the edited text.
8. Refresh the browser (full reload). Reopen Author Mode. Confirm both edited values are still shown, still flagged "edited," and the Archive/Institute screens still show the edited text — this is the persistence check.
9. Click "Reset content overrides to official text." Confirm both fields snap back to the original official strings, the "edited" flags and the reset button disappear, and the Institute/Archive screens revert to official text.
10. Confirm gameplay progress (unlocked cases, evidence, badges) is untouched throughout — this store is entirely separate from `chronicle-progress-store.js`'s save key.
