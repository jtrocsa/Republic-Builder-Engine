# Chronicle Vocabulary

The words the game says to a student, and the rules for changing them.

Written in Phase 72 alongside the mission redesign (decision log `0055`). Its job is to stop the
same idea being called three things across five units — a student who learns "cannot tell" at the
chart table and meets "not enough evidence" at the wharf has been taught that the two are
different, which is a lesson nobody meant to teach.

---

## 1. Scope: this binds interface strings, not prose

The table below governs **labels, buttons, headings, option text and instruction steps** — the
strings a student reads as part of the machinery.

It does **not** govern narrative prose. A `claim.why` may say "nothing you gathered establishes the
strength of Tsenacommacah" because that is a sentence a historian would write, and scrubbing every
instance of a word out of authored prose produces stilted copy without teaching anything. The rule
is about the words the _interface_ uses to name a move, not about the whole English language.

---

## 2. The canonical terms

### Evidence handling

| Use                       | Not                             | Where it appears                                                     |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| **Field Notebook**        | notebook, log, evidence satchel | The panel that holds what you have gathered on the mission in flight |
| **Add to Field Notebook** | Log this response, Keep         | The control under an answer worth keeping                            |
| **Codex**                 | Evidence Satchel, archive       | The permanent record of what you have filed                          |
| **File in the Codex**     | Secure in Codex, Submit, Upload | The control that commits a record                                    |
| **Finding**               | —                               | Something the mission surfaced                                       |
| **Evidence Entry**        | —                               | A finding deliberately preserved in the Field Notebook               |
| **Lead**                  | —                               | A clue directing further investigation                               |
| **Conclusion**            | final answer                    | The claim the player files                                           |
| **Filing**                | submission                      | The completed mission record added to the Codex                      |

### The four classifications

Every DISCREPANCY uses these four, with these ids. **The ids are save currency and are never
renamed** — see §4.

| id             | Label                        | Means                                                                                 |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| `supported`    | Supported by the evidence    | What you gathered backs the line                                                      |
| `complicated`  | Complicated by the evidence  | Not wrong, and not the whole of it — your evidence adds something the line leaves out |
| `contradicted` | Contradicted by the evidence | What you gathered cuts against the line                                               |
| `cannot-tell`  | Not enough evidence          | Nothing you gathered settles it either way. A finding, not a failure                  |

`complicated` and `cannot-tell` must be live options wherever the four appear. A verdict set where
the honest answer is always `contradicted` teaches that history is a list of records to debunk.

> **Standing authoring debt.** As of Phase 72 no shipped claim in Units 1–2 takes `complicated` —
> it is offered on both audits and correct on neither, in the same spirit as TRACE's permanent
> `labor-cost` distractor. Case 1.01's `fertile` claim is the obvious candidate (its `why` already
> reads "He is right. What he does not write is that the fertility he is describing is the result
> of somebody's work" — which is the definition of complicated), but changing an authored verdict
> un-settles that claim in every live save, so it was left for a deliberate decision rather than
> taken in a vocabulary pass. Units 3–5 should author `complicated` properly from the start.

### Why a record differs — the five gap kinds

Offered whenever a claim lands on a verdict named by `gapRequiredFor`.

| id                              | Label                                |
| ------------------------------- | ------------------------------------ |
| `error` / `he-was-wrong`        | Mistake                              |
| `design`                        | Deliberate framing                   |
| `incomplete`                    | Incomplete information               |
| `perspective` / `not-one-place` | Different perspective                |
| `undetermined`                  | Not enough evidence to determine why |

Two ids per row where Units 1 and 2 chose different ids for the same idea before this document
existed. Both are kept, for the reason in §4. New content should use the left-hand id.

**Only claim deliberate framing where the evidence establishes it.** "Not enough evidence to
determine why" exists so a student is never forced to guess at an author's intentions.

### What a record supports

| Use                                     | Not                            |
| --------------------------------------- | ------------------------------ |
| Supported by the evidence               | Established, Validated, Proven |
| Not shown by this account / this record | Absent, Not established        |
| Not enough evidence                     | Insufficient, Unknown          |
| Explain the difference                  | Resolve the discrepancy        |
| Reconsider                              | Misread                        |

### Content hierarchy

| Term                 | Means                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Unit**             | An APUSH curricular unit                                     |
| **Map**              | The main historical setting for that unit                    |
| **Arc**              | The connected local story told across missions on a map      |
| **Mission**          | One playable investigation using a core engine               |
| **Variant**          | The configuration of that engine (see §3)                    |
| **Mission Question** | The historical inquiry guiding the mission                   |
| **Anomaly**          | Evidence the historical record may have been interfered with |

### The Codex

Added Phase 75 (decision log `0058`), when the Codex stopped being one case's satchel.

| Term                | Means                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| **Filed record**    | One mission closed with a conclusion its evidence could carry. The Codex's unit |
| **Thread**          | A tag two or more filed records share — what the Cross-references section names |
| **Cross-reference** | Two filed records the archive has noticed are about the same question           |

**A tag must be carried by at least two activities.** A tag is the only mechanism connecting a
mission in one unit to a mission in another, so one used by a single activity is either decoration
or — much more often — a typo of a tag that does connect. Both fail silently. Pinned by
`tests/unit/activity-content.test.js`.

Tags are sentences a student would recognize, not slugs: "Who does the work", "What the record
leaves out". They are matched by exact string, so the phrasing _is_ the id — §4's rule applies to
them, and rewording a shipped tag silently splits its thread in two.

---

## 3. `variant` is a label — no code branches on it

`variant` names the shape of a mission — "Ask the Right Question", "The Missing Page", "Follow the
Shipment" — under one of the four engine families. It feeds the kicker, the Mission Instructions
plate and the Codex entry.

**Nothing in `engine/` may read it.** Behaviour differences come from whichever _other_ optional
fields the content sets. The moment `variant` switches a code path, the registry has a second
dispatch axis and "adding a fifth engine is one more entry in `index.js`" stops being true.

A mission title is a story title. The engine family is secondary information beneath it:

> **The Missing Page**
> Assembly Investigation

---

## 4. Ids are save currency, labels are copy

An id — a verdict id, a gap-kind id, an engine key, a screen id, a question id — is written into
`localStorage` the moment a player touches the control. Renaming one does not rename the saved
value: it orphans it.

Concretely, a saved `state.verdicts = { mines: "contradicted" }` against a content file that has
renamed that verdict to `contradicted-by-evidence` makes `claimStatus().verdictRight` false, and a
mission the student already filed reopens as unfinished.

So:

- **Changing what a control says** — edit the `label`. Free.
- **Adding a new option** — add a new id. Free.
- **Renaming an id** — a data migration, not a rename. Don't do it in a copy pass.

The same rule already governs the four engine keys (`interview` / `assembly` / `discrepancy` /
`trace`), which are simultaneously registry keys, `VALID_SCREENS` entries and content's
`activityRoute` string.

---

## 5. Deliberate exceptions

- **TRACE's "enter"/"entry" language.** TRACE is a wharf account book and its state key is
  `ledger`; a leg is _entered_, not added to a Field Notebook. Renaming it would break the metaphor
  the whole activity is built on. The Field Notebook language governs the INTERVIEW's keep-this
  move, which is the one the vocabulary table is about.
- **CSS class names.** `.interview-notebook`, `.field-interview__log`, `.field-interview__logged`,
  `.activity-misread`, `.activity-gap-kind`. Renaming these is invisible to a player and detonates
  39 visual baselines plus the e2e locators that point at them.
- **State and content keys.** `logged`, `asked`, `requires`, `gapKinds`, `gapRequiredFor`. Same
  reason as §4 — and the same reason `archiveChallenge` / `archiveChallenges` was documented rather
  than renamed.
- **CLAUDE.md's fixed vocabulary** outranks this file where they overlap: Chronicle Institute,
  Institute Archive, Entrance Hall, Chronotravel, Preservation Case, Navigation Table, Recall to
  Archive, Mission Tracker, field interior, and the four engine display names (The Interview, The
  Reconstruction, The Audit, The Trace).

---

## 6. Where the words live

An engine holds no subject facts, and since Phase 72 it holds no subject _sentences_ either.

| String                                | Owner                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| Verdict and gap-kind labels           | content — `content/activities/unit-0N-activities.js`                                |
| The second question's wording         | content — `gapPrompt`                                                               |
| The locked-closer note                | content — `lockedNote` on `COMMON_ACTIVITY_FIELDS`, with a placeless engine default |
| How the activity is played            | content — `howItWorks.steps` (2–4, capped by schema)                                |
| Words a player may not have           | content — `terms`                                                                   |
| Control verbs, table states, headings | engine — generic and subject-free                                                   |
| Screen chrome, tracker, Codex         | host — `main.js`                                                                    |

The rule that produced this split: INTERVIEW's locked-closer note used to read _"Every person on
this **island** is holding one thing worth writing down."_ An engine that knows it is on an island
is an engine with a fact in it. If a sentence cannot be written without naming something historical,
it belongs to whoever authored the history.
