# The Chronicle Spine Review — ledger

A bounded, ordered walk of the **student** experience, intro through unit completion, in parts small
enough to finish. Started 2026-08-03.

Every review this repo had before this was either a static architecture audit (several now stale) or
an informal playtest recorded after the fact inside an ADR. Nothing walked the game as a player, in
order, from the intro. That is what this is.

**This is the only file to read for program state.** A finding's text lives in exactly one place —
its part file. This ledger holds status and counts, never finding text. An ADR holds a decision and
its rationale, never a findings list. `ARCHITECTURE-QUICKREF.md` holds one line and a link.

---

## Status

| №                                                    | Part                                        | Status      | Closed     | Open                                             |
| ---------------------------------------------------- | ------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| [0](./part-00-unblock.md)                            | Unblock and instrument                      | **closed**  | 2026-08-03 | 1 S2 _(P0-3, awaiting an owner decision)_ · 1 S3 |
| [1](./part-01-04-the-intro.md)                       | Cold boot and landing                       | **closed**  | 2026-08-22 | —                                                |
| [2](./part-01-04-the-intro.md)                       | The Director and identity                   | **closed**  | 2026-08-22 | —                                                |
| [3](./part-01-04-the-intro.md)                       | The Entrance Hall                           | **closed**  | 2026-08-22 | —                                                |
| [4](./part-01-04-the-intro.md)                       | Main Hall and the tutorial tour             | **closed**  | 2026-08-22 | —                                                |
| [5](./part-05-archive-and-navigation-table.md)       | Archive Room and the Navigation Table       | **closed**  | 2026-08-22 | —                                                |
| [6A](./part-06-the-field-runtime.md)                 | The field runtime — the world               | **closed**  | 2026-08-22 | —                                                |
| [6B](./part-06-the-field-runtime.md)                 | The field runtime — the mission surface     | **closed**  | 2026-08-23 | —                                                |
| [7](./part-07-mission-instructions-and-the-board.md) | Mission Instructions and the activity board | **closed**  | 2026-08-23 | —                                                |
| [8](./part-08-the-field-notebook-and-the-debrief.md) | The Field Notebook and the debrief          | **closed**  | 2026-08-23 | —                                                |
| 9                                                    | The record and the checks                   | not started |            | 2 S3 inbound from 6B _(P6B-8, P6B-9)_            |
| 11                                                   | The Institute Archive                       | not started |            | 2 S3 from Part 5 · 1 S3 from 8 _(P8-5)_          |
| 12                                                   | Unit close and the next unit                | not started |            |                                                  |
| 10                                                   | The ten non-field missions                  | not started |            |                                                  |

A part's fix commit is the one that flips its status row, so `git log` on its part file is the
history — no sha column to go stale.

Walk order is the row order above: `0 → 1…9 → 11 → 12 → 10`. Parts 1–9 are strictly ordered because
each part's play script starts from the previous part's exit state — that is what keeps a script to
twelve steps. 10–12 branch off the spine and are reorderable.

**Pull-forward candidate.** Part 10's four pre-solved sequencing quests are a correctness bug with a
known fix that needs no review to discover. If students reach Units 3–4 before the program does, fix
it as its own commit out of band rather than waiting.

---

## Protocol — five steps per part

1. **Static audit.** Read the part's functions, content, specs, and the S3s routed here by earlier
   parts. Produce a numbered findings list **before anything is played** — the owner should never
   have to notice what a machine can notice. A part therefore still produces fixes in a week nobody
   plays, so the program degrades to slower rather than stopping.
2. **Play script.** Modelled on `docs/tour-plan.md` §Verification. **Hard cap twelve numbered
   steps**, each one action + one expected observation + a blank line for a note. Opens by naming
   the warp that puts the player in the right state.
3. **Owner pass**, ~15 minutes. Annotated script **or a screen recording with spoken commentary** —
   timestamps get turned into findings. The owner never categorises and never writes a bug report.
4. **Triage and fix.** Both lists merged into one table. Everything S1 and S2 fixed in **one commit**.
   Every S3 routed.
5. **Verify, bank, record.** The `CLAUDE.md` ladder scoped to what changed, **at least one new e2e
   case named for the finding it came from**, and this ledger's row updated **in the same commit**.
   If the ledger row is not in the diff, the part is not closed.

### Taxonomy

Severity decides scheduling. Category decides who fixes it and how it is checked. They are
deliberately orthogonal, which is what keeps both short enough to apply consistently.

**S1 · stops play** — fix before the part closes; may pre-empt the walk order.
**S2 · degrades play** — fix in this part's commit.
**S3 · noted** — deferred, **and must name a destination.**

| Category        | Means                                                              | Checked by                        |
| --------------- | ------------------------------------------------------------------ | --------------------------------- |
| `broken`        | Wrong data, dead control, crash, state not persisted               | targeted vitest + e2e             |
| `unclear`       | Works, but the player cannot tell what to do or what just happened | the owner pass only               |
| `hollow`        | The surface exists with no content behind it                       | `validate:content`, content queue |
| `inconsistent`  | One concept, two names or two behaviours across screens            | vocabulary/canon tests            |
| `wrong-history` | Accuracy, citation, or CED-alignment problem                       | `validate:content`                |
| `rough`         | Visual, audio, copy, tone polish                                   | visual-regression, by eye         |

**An S3 with no named destination is not allowed** — a part number, the content queue, or an ADR.
That single rule is what stops a findings file becoming a landfill.

**Caps**, all deliberate: ~12 findings per part (surplus auto-defers to a named later part), ~150-line
part file, 12-step script, ~120 lines for this ledger.

---

## Warps

`?warp=<name>` in dev only (`DEV_WARPS` in `main.js`, guarded by `import.meta.env.DEV` and verified
absent from the production bundle). Adding one is a line in that table.

`intro` · `hall` · `hub` · `table` · `field` · `mission` · `railhead` · `port` · `reveal`

This list was six for three phases after `DEV_WARPS` grew to nine. `intro` also had no test coverage
at all until Parts 1–4 — the one warp no spec named, and the one every play script here opens on.
`tests/e2e/intro-sequence.spec.js` covers it now.

---

## Out of scope — deliberately, not by oversight

- **Teacher surfaces** (join, login, dashboard, grading, Manage Content). Owner's call, 2026-08-03.
  Carries a standing risk worth restating: Supabase migrations `0006`–`0012` are written but
  unapplied to the live project, and `0011` already 400s on write for signed-in classrooms.
- **New content.** The program authors none. It routes gaps to `MISSION-ACTIVITY-CATALOG.md` §6; it
  does not become that queue. QUICKREF §6's standing priority (CED Periods 6–9) is not displaced.
- **New systems.** No cutscene engine, no `questionBudget`, no gamepad, no per-row depth sorting.
- **Restructuring.** The program fixes behaviour, never shape. `handleFieldClick` gets bug fixes, not
  decomposition. A restructuring proposal leaves the program as an ADR and its own phase.
- **Meridian art gaps.** Off-spine; they block only the unbuilt `meridian-interior`.
