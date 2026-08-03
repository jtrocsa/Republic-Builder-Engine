// What all four activity engines have in common.
//
// An activity engine is a playable interaction that takes its whole subject
// from content. `engine/` is the folder whose rule is "no subject-specific
// facts," and that rule is the entire point here: the four engines in this
// folder are the mechanics with the history stripped off, so a different
// subject supplies content matching the Zod contract and gets a playable
// activity with no code change. If an engine cannot be written without naming
// a historical thing, it is not an engine.
//
// The registry in ./index.js is deliberately the same small shape as
// quest-types/index.js — an object literal and a throwing lookup, not a
// plugin-discovery system. Adding a fifth engine is one more entry.
import { z } from "zod";

// Deliberate twin of quest-types/shared/html.js's escapeHtml.
//
// Not imported from there, and not deduplicated: that file's own header says
// quest-types/ is meant to stand alone, and this folder has the stronger
// version of the same requirement — engine/activities/ has to be liftable into
// another subject's pack without dragging APUSH quest types behind it. Eight
// lines of pure string work is the right price for that boundary. (Same
// reasoning as isCaribbeanLand's duplication between main.js and
// scripts/generate-caribbean-tmj.js.)
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * How this activity is played, in the player's own terms.
 *
 * An engine's mechanic is legible to whoever wrote it and to nobody else. The
 * first playtest of all four established that: a player worked out by trial that
 * an INTERVIEW lets you put any question to anyone — which is the entire design —
 * and reported it as a discovery. Content that states the rule up front costs one
 * short list and buys the whole activity.
 *
 * Rendered by the host in the copy column rather than by the engine, because it
 * sits beside the intro and the briefing, which the engine also has no view of.
 */
export const HowItWorksSchema = z.object({
  steps: z
    .array(z.string().min(1))
    .min(2, "howItWorks needs at least two steps, or it is a sentence and belongs in the intro")
    // Capped, and the cap is the interesting half. The first six authored activities ran to five and
    // six steps apiece and the owner stopped reading them — a wall of instructions is the same
    // failure as no instructions, arrived at from the other side. Three steps and a note is the
    // shipped shape: what you do, what to expect back, and what the mission is asking for.
    .max(4, "howItWorks is capped at four steps — condense, or move the detail into the note"),
  note: z.string().min(1).optional(),
});

/**
 * Who handed this record to the player, and the line they handed it over with.
 *
 * Shared rather than INTERVIEW's alone (where it started) because the Mission Instructions screen
 * opens on the giver's own profile — their portrait, their name, their words — and a mission with
 * no giver opens on a plate with nobody on it. `speaker` is an opaque id the host resolves against
 * whatever cast it has; this folder never learns what an NPC is.
 */
export const BriefingSchema = z.object({
  speaker: z.string().min(1, "briefing.speaker is required"),
  line: z.string().min(1, "briefing.line is required"),
});

/**
 * Words the activity uses that a player may not have.
 *
 * Deliberately a flat list the host prints, not a text-scanning glossary: an
 * engine that went looking for its own terms inside authored prose would have to
 * know something about language, and this folder's rule is that it knows nothing
 * about the subject at all.
 */
export const TermsSchema = z
  .array(
    z.object({
      term: z.string().min(1, "a glossary entry needs a term"),
      definition: z.string().min(1, "a glossary entry needs a definition"),
    })
  )
  .min(1);

/**
 * The Field Notebook: how much of what you found you are allowed to carry.
 *
 * Declaring this turns the notebook from a review panel into a decision. Without it every finding
 * is kept, which is what all six pre-Phase-72 activities do and what they keep doing.
 *
 * `capacity` deliberately caps what you **keep**, not what you **gather**. Both shipped interviews
 * ask for every useful answer on the map (`requires.useful === speakers.length`), and that is the
 * right shape for gathering — walking past a witness should not be a strategy. The judgement worth
 * teaching happens afterwards: of everything you now hold, which few pieces will you stand behind?
 * That is the Field Notebook / Codex distinction as a mechanic rather than a slogan.
 *
 * Declared above COMMON_ACTIVITY_FIELDS rather than beside its own functions further down: a `const`
 * is not hoisted, and reading one from the object literal below is a temporal-dead-zone
 * `ReferenceError` that takes every engine down at import. Same trap as a field interior read from
 * inside the `FIELD_MAPS` literal.
 */
export const NotebookSchema = z.object({
  capacity: z.number().int().min(1, "a notebook with no room is not a notebook"),
  // The standing instruction above the list — what this mission wants kept, in its own words.
  prompt: z.string().min(1).optional(),
  // What the panel says before anything has been found.
  emptyNote: z.string().min(1).optional(),
});

/**
 * What the mission says once it is over.
 *
 * `established` and `remains` are the two halves of an honest finding and both are required: a
 * debrief that only says what was proved teaches that investigation ends in certainty. `remains` is
 * where a mission admits what its record cannot reach.
 *
 * `speaker` is an opaque id, resolved by the host the same way `briefing.speaker` is, and defaults
 * to whoever handed the record over — the person who gave you the job is the person who hears how
 * it went.
 */
export const DebriefSchema = z.object({
  speaker: z.string().min(1).optional(),
  line: z.string().min(1, "debrief.line is required — somebody has to say it"),
  established: z
    .string()
    .min(1, "debrief.established is required — what the evidence now supports"),
  remains: z.string().min(1, "debrief.remains is required — what it still cannot settle"),
});

/**
 * Which parts of what the player just played are real, in four named categories.
 *
 * This is the historical-fiction policy as a data structure. Chronicle takes real liberties — it
 * invents composite characters, writes probable conversations, and runs the whole thing inside a
 * time-travel frame — and the defence of doing that is being explicit about which is which at the
 * end, rather than blurring the three together and hoping.
 *
 * `documented` and `fiction` are what every Chronicle mission has by construction: real history, and
 * a Chronicler standing in it. `reconstructed` is the composite people and probable scenes.
 * `debated` is where historians genuinely disagree — a category that exists so a mission can say
 * "this is contested" instead of quietly picking a side.
 */
export const HistoricalRecordSchema = z.object({
  documented: z.array(z.string().min(1)).min(1, "every mission rests on something documented"),
  reconstructed: z.array(z.string().min(1)).optional(),
  fiction: z.array(z.string().min(1)).min(1, "the Chronicle frame is fiction and should say so"),
  debated: z.array(z.string().min(1)).optional(),
});

/**
 * The fields every engine carries regardless of its mechanic, spread into each
 * engine's own `z.object({...})` before its `.superRefine()`.
 *
 * A plain object of field schemas rather than a base `z.object()` to extend:
 * every engine schema ends in `.superRefine()`, which returns a ZodEffects with
 * no `.extend()` on it, so composition has to happen before the object is built.
 */
export const COMMON_ACTIVITY_FIELDS = {
  id: z.string().min(1, "activity.id is required"),
  title: z.string().min(1, "activity.title is required"),
  intro: z.string().min(1, "activity.intro is required"),
  // Moved here verbatim from interview.js, `.nullable().default(null)` and all, so the two
  // interviews that already author one validate exactly as they did. Absent, null and present are
  // all accepted; the host reads it defensively either way, because runSchema() discards the parsed
  // output and content reaches the game as the raw imported object.
  briefing: BriefingSchema.nullable().default(null),
  // The shape of this mission inside its engine family — "Ask the Right Question", "The Missing
  // Page", "Follow the Shipment". A LABEL, and nothing in engine/ may branch on it: the registry's
  // whole value is that adding an engine is one more entry in index.js, and a second dispatch axis
  // ends that. Behaviour differences come from whichever other optional fields the content sets.
  // Pinned by tests/unit/activity-content.test.js. See docs/design/CHRONICLE-VOCABULARY.md §3.
  variant: z.string().min(1).optional(),
  // The historical question this mission exists to answer, in one sentence a student could repeat.
  // "Make the task obvious, make the answer require judgment" — this is the obvious half, and it is
  // printed both on the way in and on the way out.
  missionQuestion: z.string().min(1).optional(),
  // What kind of thinking the mission is asking for, said to the student.
  //
  // Deliberately not `closer.skillCategory`, which is an opaque taxonomy key for the grade book and
  // is never shown. Same subject, two audiences: one is a tag, this is a sentence.
  thinkingMove: z.string().min(1).optional(),
  // What the mission could not settle. Printed in the debrief, and the reason a player leaves with
  // a question rather than a tick.
  openQuestions: z.array(z.string().min(1)).optional(),
  debrief: DebriefSchema.optional(),
  historicalRecord: HistoricalRecordSchema.optional(),
  howItWorks: HowItWorksSchema.optional(),
  terms: TermsSchema.optional(),
  notebook: NotebookSchema.optional(),
  // What the closer says while it is still locked — "you are not finished, and here is what
  // finished looks like."
  //
  // This is content because the four engines were each carrying their own sentence, and one of
  // them had a fact in it: INTERVIEW's read "Every person on this *island* is holding one thing
  // worth writing down," which is an engine that knows it is on an island. `engine/`'s whole rule
  // is that it knows nothing about the subject, so the sentence belongs to whoever authored the
  // island. Each engine keeps its own literal as the fallback, so an activity that declares
  // nothing renders exactly as it did before.
  lockedNote: z.string().min(1).optional(),
};

/**
 * Every activity ends the same way: the player files a judgement about what the
 * record they just handled can actually support. This is the one graded moment
 * — the interaction before it teaches, this scores.
 *
 * Every option carries `why`, not just the right one, so filing the wrong
 * record is informative rather than a buzzer. That is the same discipline as
 * ASSEMBLY's `misread`.
 */
export const ClosingChoiceSchema = z
  .object({
    prompt: z.string().min(1, "closer.prompt is required"),
    // Optional, opaque taxonomy tag, exactly as mcq-quest.js declares it —
    // a plain string rather than an enum, so a non-history subject can use its
    // own taxonomy. Feeds the skill-mastery record through outcome().
    skillCategory: z.string().min(1).optional(),
    options: z
      .array(
        z.object({
          id: z.string().min(1, "closer option id is required"),
          text: z.string().min(1, "closer option text is required"),
          correct: z.boolean(),
          why: z.string().min(1, "every closer option needs a `why`, including the wrong ones"),
          // Finding ids this conclusion needs in the Field Notebook before it is
          // *supported*, as opposed to merely chosen.
          //
          // This is the difference between grading a click and grading an argument. A player can
          // land the defensible conclusion by elimination while carrying nothing that establishes
          // it; without this the activity calls that a win, which teaches that the conclusion is
          // the answer and the evidence was scenery. Absent or empty means the option needs no
          // particular evidence, which is every option shipped so far.
          requiresEvidence: z.array(z.string().min(1)).optional(),
          // What to say when this conclusion is filed without the evidence above — the "plausible,
          // but nothing you kept establishes it" note. Only ever reachable with `requiresEvidence`.
          unsupportedNote: z.string().min(1).optional(),
        })
      )
      .min(2, "a closer needs at least two options"),
  })
  .superRefine((closer, ctx) => {
    const correct = closer.options.filter((option) => option.correct);
    if (correct.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `A closer must have exactly one correct option; found ${correct.length}.`,
      });
    }
    const firstSeenAt = new Map();
    closer.options.forEach((option, index) => {
      if (firstSeenAt.has(option.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "id"],
          message: `Duplicate closer option id "${option.id}" (first seen at index ${firstSeenAt.get(option.id)}).`,
        });
      } else {
        firstSeenAt.set(option.id, index);
      }
    });
  });

/** Defensive read: a save written before this field existed has no `notebook` on its state. */
function keptIdsOf(state) {
  const kept = state?.notebook?.kept;
  return Array.isArray(kept) ? kept : [];
}

/**
 * The findings the player is actually carrying, in the order they chose them.
 *
 * An activity that declares no `notebook` keeps everything — there is no selection step to make,
 * so the panel is a review of what the mission surfaced rather than a set of decisions.
 *
 * @param {{ notebook?: { capacity: number } }} activity
 * @param {object} [state]
 * @param {{ id: string, text: string, from?: string }[]} [findings]
 */
export function notebookKept(activity, state, findings = []) {
  if (!activity.notebook) return findings;
  return keptIdsOf(state)
    .map((id) => findings.find((finding) => finding.id === id))
    .filter(Boolean);
}

/**
 * The two Field Notebook verbs, shared by all four engines.
 *
 * Returns the identical state object for anything it does not handle, which is what lets an engine
 * delegate to it first and fall through — and is the same refusal contract the host relies on
 * (`if (next === entry.state) return;`).
 *
 * A full notebook refuses `keep` rather than evicting silently. Choosing what to drop is the whole
 * point of the cap, so it has to be a move the player makes.
 *
 * @param {{ notebook?: { capacity: number } }} activity
 * @param {object} state
 * @param {{ type: string, finding?: string }} action
 * @param {{ id: string }[]} findings
 */
export function actNotebook(activity, state, action = { type: "" }, findings = []) {
  if (!activity.notebook) return state;
  if (action.type !== "keep" && action.type !== "release") return state;
  const kept = keptIdsOf(state);

  if (action.type === "keep") {
    // Only something the mission has actually surfaced can be kept — otherwise the closer screen
    // becomes a way to fill the notebook with findings the player never earned.
    if (!findings.some((finding) => finding.id === action.finding)) return state;
    if (kept.includes(action.finding)) return state;
    if (kept.length >= activity.notebook.capacity) return state;
    return { ...state, notebook: { ...state.notebook, kept: [...kept, action.finding] } };
  }

  if (!kept.includes(action.finding)) return state;
  return {
    ...state,
    notebook: { ...state.notebook, kept: kept.filter((id) => id !== action.finding) },
  };
}

/**
 * The Field Notebook, rendered — beat 4 of the mission rhythm, and the thing a player reviews
 * before they decide anything.
 *
 * Rendered by the engine rather than the host, because the closer lives inside each engine's own
 * `render()` and a host-injected panel would land underneath it — reviewing your evidence after
 * you filed your conclusion reads backwards.
 *
 * `.evidence-notebook` is its own root class, not an `.activity-board` variant: that class is
 * shared with the practice check, Archive Challenges and non-map missions, and styling through it
 * re-lays every quest list in the game.
 *
 * @param {{ notebook?: { capacity: number, prompt?: string, emptyNote?: string } }} activity
 * @param {object} [state]
 * @param {{ id: string, text: string, from?: string }[]} [findings]
 */
export function renderNotebook(activity, state, findings = []) {
  const selectable = !!activity.notebook;
  const kept = notebookKept(activity, state, findings);
  const held = new Set(kept.map((finding) => finding.id));
  const capacity = activity.notebook?.capacity || 0;
  const full = selectable && kept.length >= capacity;

  const count = selectable
    ? `<em>${kept.length} of ${capacity}</em>`
    : findings.length
      ? `<em>${findings.length}</em>`
      : "";

  const entries = findings
    .map((finding) => {
      const isKept = held.has(finding.id);
      const control = !selectable
        ? ""
        : isKept
          ? `<button type="button" class="evidence-notebook__release" data-activity-action="release" data-finding="${escapeHtml(finding.id)}">Release</button>`
          : `<button type="button" class="evidence-notebook__keep" data-activity-action="keep" data-finding="${escapeHtml(finding.id)}"${full ? " disabled" : ""}>Add to Field Notebook</button>`;
      return `<li class="evidence-notebook__entry${selectable && isKept ? " is-kept" : ""}">
      <p>${escapeHtml(finding.text)}</p>
      ${finding.from ? `<cite>${escapeHtml(finding.from)}</cite>` : ""}
      ${control}
    </li>`;
    })
    .join("");

  const body = findings.length
    ? `<ul class="evidence-notebook__entries">${entries}</ul>`
    : `<p class="evidence-notebook__empty">${escapeHtml(
        activity.notebook?.emptyNote || "Nothing yet. What you gather on this record collects here."
      )}</p>`;

  // Said only when it binds. A capacity note printed from the start reads as a warning about a
  // limit the player has not met and cannot yet picture.
  const fullNote = full
    ? `<p class="evidence-notebook__full">Your Field Notebook is full. Release an entry to make room — and be able to say why the new one is stronger.</p>`
    : "";

  return `<section class="evidence-notebook">
  <h3>Field Notebook ${count}</h3>
  ${activity.notebook?.prompt ? `<p class="evidence-notebook__prompt">${escapeHtml(activity.notebook.prompt)}</p>` : ""}
  ${body}
  ${fullNote}
</section>`;
}

/**
 * Shared id-uniqueness check. Every engine has at least one array whose ids are
 * used as lookup keys, and a duplicate there fails silently at runtime (the
 * second entry is simply unreachable) rather than loudly, so it is worth a
 * schema issue.
 *
 * @param {{ id: string }[]} items
 * @param {import("zod").RefinementCtx} ctx
 * @param {string} label
 * @param {(string|number)[]} [path]
 */
export function checkUniqueIds(items, ctx, label, path = []) {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [...path, index, "id"],
        message: `Duplicate ${label} id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
}

/**
 * How a filed closer graded.
 *
 * `correct` and `supported` are two different questions and an activity is only finished when both
 * are yes. `correct` is whether this is the conclusion the record will bear; `supported` is whether
 * the player is carrying what it takes to argue it. An option that declares no `requiresEvidence`
 * is supported by definition — which is every option authored before Phase 72, so this is a no-op
 * for them.
 *
 * `kept` defaults to empty and the check is fail-closed: a conclusion that names evidence it does
 * not have is unsupported, including when a caller forgot to pass the notebook.
 *
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 * @param {{ id: string }[]} [kept]
 */
export function closerResult(closer, filedId, kept = []) {
  const option = closer.options.find((item) => item.id === filedId) || null;
  const required = option?.requiresEvidence;
  const held = new Set((Array.isArray(kept) ? kept : []).map((finding) => finding.id));
  const supported =
    !option || !Array.isArray(required) || required.length === 0
      ? !!option
      : required.every((id) => held.has(id));
  return { filed: !!option, correct: !!option?.correct, supported, option };
}

/**
 * The closer, rendered.
 *
 * `locked` is passed by an engine whose earlier phase isn't finished yet — the
 * options still render, so the player can read where the activity is going, but
 * they can't be filed. Hiding it entirely made the activity look like it had no
 * ending.
 *
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 * @param {{ locked?: boolean, lockedNote?: string, kept?: { id: string }[] }} [options]
 */
export function renderCloser(closer, filedId, { locked = false, lockedNote = "", kept = [] } = {}) {
  const { option, correct, supported } = closerResult(closer, filedId, kept);
  const options = closer.options
    .map((item) => {
      const chosen = item.id === filedId;
      // A chosen option that is right but unsupported is neither of the two existing tones. It
      // reads as a third state on purpose: you have not failed, and you are not finished.
      const state = chosen
        ? item.correct
          ? supported
            ? " is-correct"
            : " is-unsupported"
          : " is-wrong"
        : "";
      return `<button type="button" class="activity-option${state}" data-activity-action="file" data-option="${escapeHtml(item.id)}" aria-pressed="${chosen ? "true" : "false"}"${locked ? " disabled" : ""}>${escapeHtml(item.text)}</button>`;
    })
    .join("");
  const verdict = option
    ? !supported
      ? `<p class="activity-why is-unsupported">${escapeHtml(
          option.unsupportedNote ||
            "This may be defensible, but nothing you kept in your Field Notebook establishes it. Go back for the evidence, or file a conclusion your evidence can carry."
        )}</p>`
      : `<p class="activity-why ${correct ? "is-correct" : "is-wrong"}">${escapeHtml(option.why)}</p>`
    : locked && lockedNote
      ? `<p class="activity-why is-locked">${escapeHtml(lockedNote)}</p>`
      : "";
  return `<section class="activity-closer${locked ? " is-locked" : ""}">
  <h3>File the record</h3>
  <p class="activity-closer__prompt">${escapeHtml(closer.prompt)}</p>
  <div class="activity-closer__options">${options}</div>
  ${verdict}
</section>`;
}

/**
 * The skill-mastery outcome a filed closer reports.
 *
 * Deliberately the same `{ key, skillCategory, correct }` shape quest types
 * return from skillOutcomes(), so main.js's existing recordSkillOutcomes() can
 * consume an activity's outcome without learning anything new. Returns [] for
 * an unfiled closer or one with no skillCategory tag, matching mcqSkillOutcomes.
 *
 * @param {string} activityId
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 */
export function closerSkillOutcomes(activityId, closer, filedId) {
  const { filed, correct } = closerResult(closer, filedId);
  if (!filed || !closer.skillCategory) return [];
  return [{ key: activityId, skillCategory: closer.skillCategory, correct }];
}
