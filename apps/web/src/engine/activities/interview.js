// INTERVIEW — the player puts a fixed set of questions to a cast, and every
// speaker answers only what was asked.
//
// The mechanic, with the subject stripped off: N questions x M speakers, a
// sparse answer matrix, and a coverage bar. What makes it teach rather than
// quiz is that the matrix is allowed to be *disappointing* — a speaker with no
// authored answer for a question falls back to their `fallback` line, which is
// a real, flat, useless answer rather than a missing-content crash. Asking the
// wrong person the wrong question is a legitimate move that returns legitimate
// nothing, and the player learns more from that than from feedback text.
//
// Hearing an answer and *keeping* it are two moves, not one. `asked` is what a
// speaker has been put and is currently saying; `logged` is what went into the
// notebook, and it is what coverage, the notebook, the outcome and the host's
// evidence tokens all read. The first playtest asked for this in as many words:
// with a single implicit step there was no moment where a player could see that
// anything had been recorded.
//
// This is the only engine that implements renderInline(): its questions are put
// to people standing on the map, inside the field dialogue bubble, rather than
// on a screen. render() is the notebook you come back to.
//
// Transfers as: characters' conflicting accounts of one event (literature),
// researchers on a disputed result (science), stakeholders in a live policy
// (civics).
import { z } from "zod";
import {
  COMMON_ACTIVITY_FIELDS,
  ClosingChoiceSchema,
  checkUniqueIds,
  closerResult,
  closerSkillOutcomes,
  escapeHtml,
  renderCloser,
} from "./contract.js";

const AnswerSchema = z.object({
  text: z.string().min(1, "an interview answer needs text"),
  // Whether this answer actually yields something worth filing. Defaults to
  // false, so the flat answers cost nothing to author — an author writes
  // `useful: true` on the handful that carry the mission.
  useful: z.boolean().default(false),
});

const SpeakerSchema = z.object({
  id: z.string().min(1, "speaker.id is required"),
  name: z.string().min(1, "speaker.name is required"),
  role: z.string().min(1).optional(),
  // Free-form grouping the content owns (a side, a faction, a discipline). When
  // `groups` is authored the notebook renders one panel per group, which is what
  // makes two accounts of the same thing comparable on screen instead of
  // interleaved in one table.
  group: z.string().min(1).optional(),
  fallback: z.string().min(1, "speaker.fallback is required — it is what an unasked question gets"),
  answers: z.record(z.string(), AnswerSchema).default({}),
});

// The three dimensions an activity can set a bar on, and the engine's own name
// for each. `useful` is the one whose name is worth overriding from content
// (`requires.label`) — "answers worth keeping" is accurate but bloodless, and it
// is the number a player actually watches.
const GOAL_LABELS = {
  questions: "Questions put",
  speakers: "People asked",
  useful: "Answers worth keeping",
};

export const InterviewActivitySchema = z
  .object({
    ...COMMON_ACTIVITY_FIELDS,
    kind: z.literal("interview"),
    // `briefing` used to be declared here. It is in COMMON_ACTIVITY_FIELDS as of Phase 71, because
    // the Mission Instructions screen opens on the giver's profile and every engine needs one.
    questions: z
      .array(
        z.object({
          id: z.string().min(1, "question.id is required"),
          label: z.string().min(1, "question.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "an interview needs at least two questions, or there is no choice to make"),
    groups: z
      .array(
        z.object({
          id: z.string().min(1, "group.id is required"),
          label: z.string().min(1, "group.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "grouping a cast into one group is not a grouping")
      .optional(),
    speakers: z.array(SpeakerSchema).min(2, "an interview needs at least two speakers"),
    // The coverage bar before the closer unlocks. Content owns it because "how
    // much asking is enough" is a pedagogy call, not an engine one. Every
    // dimension is optional and at least one must be set: an activity that asks
    // for two of them at once reports two numbers, and a player reads that as a
    // contradiction rather than a goal — which is exactly what the first
    // playtest of "4 questions / 5 people" produced.
    requires: z
      .object({
        questions: z.number().int().min(1).optional(),
        speakers: z.number().int().min(1).optional(),
        useful: z.number().int().min(1).optional(),
        label: z.string().min(1).optional(),
      })
      .superRefine((requires, ctx) => {
        if (!requires.questions && !requires.speakers && !requires.useful) {
          ctx.addIssue({
            code: "custom",
            message: "requires needs at least one of questions, speakers or useful.",
          });
        }
      }),
    closer: ClosingChoiceSchema,
  })
  .superRefine((activity, ctx) => {
    checkUniqueIds(activity.questions, ctx, "interview question", ["questions"]);
    checkUniqueIds(activity.speakers, ctx, "interview speaker", ["speakers"]);
    if (activity.groups) checkUniqueIds(activity.groups, ctx, "interview group", ["groups"]);

    const questionIds = new Set(activity.questions.map((question) => question.id));
    const groupIds = activity.groups ? new Set(activity.groups.map((group) => group.id)) : null;
    let useful = 0;

    activity.speakers.forEach((speaker, index) => {
      Object.entries(speaker.answers).forEach(([questionId, answer]) => {
        if (!questionIds.has(questionId)) {
          ctx.addIssue({
            code: "custom",
            path: ["speakers", index, "answers", questionId],
            message: `Speaker "${speaker.id}" answers unknown question "${questionId}".`,
          });
        }
        if (answer.useful) useful += 1;
      });
      // A speaker with no group in a grouped cast would silently fall out of the
      // notebook, which is the one place the whole activity is reviewed.
      if (groupIds && !groupIds.has(speaker.group || "")) {
        ctx.addIssue({
          code: "custom",
          path: ["speakers", index, "group"],
          message: `Speaker "${speaker.id}" has group "${speaker.group || ""}", which is not one of the authored groups.`,
        });
      }
    });

    const ceilings = {
      questions: activity.questions.length,
      speakers: activity.speakers.length,
      useful,
    };
    Object.entries(ceilings).forEach(([key, ceiling]) => {
      const asked = activity.requires[key];
      if (asked && asked > ceiling) {
        ctx.addIssue({
          code: "custom",
          path: ["requires", key],
          message: `requires.${key} (${asked}) exceeds the ${ceiling} authored — the closer could never unlock.`,
        });
      }
    });
  });

export function defaultInterviewState() {
  // asked[speakerId] is ordered and the last entry is what the bubble is
  // showing, which is how re-reading an earlier answer costs no extra state:
  // asking again moves that question to the end rather than duplicating it.
  // logged[speakerId] is the notebook, and is deliberately a separate list —
  // everything downstream counts logged, never asked.
  return { asked: {}, logged: {}, filed: null };
}

/** @param {ReturnType<typeof defaultInterviewState>} [state] */
function askedFor(state, speakerId) {
  const asked = state?.asked?.[speakerId];
  return Array.isArray(asked) ? asked : [];
}

/** @param {ReturnType<typeof defaultInterviewState>} [state] */
function loggedFor(state, speakerId) {
  const logged = state?.logged?.[speakerId];
  return Array.isArray(logged) ? logged : [];
}

/**
 * How much of the matrix the player has actually written down.
 *
 * Counted off `logged` rather than `asked`: an answer heard and left on the
 * ground is not evidence, and the host's `requires` tokens read the same list.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function interviewCoverage(activity, state = defaultInterviewState()) {
  const questions = new Set();
  const speakers = new Set();
  let useful = 0;
  activity.speakers.forEach((speaker) => {
    const logged = loggedFor(state, speaker.id);
    if (logged.length) speakers.add(speaker.id);
    logged.forEach((questionId) => {
      questions.add(questionId);
      if (interviewAnswer(speaker, questionId).useful) useful += 1;
    });
  });
  const totals = { questions: questions.size, speakers: speakers.size, useful };
  const met = Object.keys(GOAL_LABELS).every(
    (key) => !activity.requires[key] || totals[key] >= activity.requires[key]
  );
  return { ...totals, met };
}

/**
 * One row per dimension this activity actually asks for, in a fixed order, so
 * the notebook and the host's tracker report the same numbers with the same
 * names.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function interviewGoals(activity, state = defaultInterviewState()) {
  const coverage = interviewCoverage(activity, state);
  return Object.keys(GOAL_LABELS)
    .filter((key) => !!activity.requires[key])
    .map((key) => ({
      key,
      label: (key === "useful" && activity.requires.label) || GOAL_LABELS[key],
      done: Math.min(coverage[key], activity.requires[key]),
      total: activity.requires[key],
    }));
}

/**
 * The one line worth putting on a panel that has room for one line. Prefers the
 * `useful` goal, which is the one an author names, and falls back to whichever
 * dimension is set.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function interviewSummary(activity, state = defaultInterviewState()) {
  const goals = interviewGoals(activity, state);
  return goals.find((goal) => goal.key === "useful") || goals[0] || null;
}

/**
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 * @param {{ type: string, speaker?: string, question?: string, option?: string }} action
 */
export function actInterview(activity, state = defaultInterviewState(), action = { type: "" }) {
  if (action.type === "ask") {
    const speaker = activity.speakers.find((item) => item.id === action.speaker);
    const question = activity.questions.find((item) => item.id === action.question);
    if (!speaker || !question) return state;
    const asked = askedFor(state, speaker.id).filter((id) => id !== question.id);
    return { ...state, asked: { ...state.asked, [speaker.id]: [...asked, question.id] } };
  }

  if (action.type === "log") {
    const speaker = activity.speakers.find((item) => item.id === action.speaker);
    if (!speaker) return state;
    const asked = askedFor(state, speaker.id);
    // Defaults to whatever they are currently saying, so the button beneath an
    // answer needs to carry no question id of its own.
    const questionId = action.question || asked[asked.length - 1];
    // Logging something never heard would let a player fill the notebook from
    // the closer screen, where the answers are not even on offer.
    if (!questionId || !asked.includes(questionId)) return state;
    // A fallback is the speaker having nothing for you; the UI offers no control for it, and this
    // is the same rule stated where it is enforceable rather than only where it is drawn.
    if (!interviewAnswer(speaker, questionId).authored) return state;
    const logged = loggedFor(state, speaker.id);
    if (logged.includes(questionId)) return state;
    return { ...state, logged: { ...state.logged, [speaker.id]: [...logged, questionId] } };
  }

  if (action.type === "file") {
    // Guarded here rather than only in the UI: the closer's disabled attribute
    // is a hint, not a lock, and a filed-too-early record would read as
    // complete.
    if (!interviewCoverage(activity, state).met) return state;
    const option = activity.closer.options.find((item) => item.id === action.option);
    return option ? { ...state, filed: option.id } : state;
  }

  return state;
}

/**
 * Whether this speaker has been put a question yet.
 *
 * The host uses it to decide whether a speaker is still standing there saying their ambient line or
 * is now mid-conversation — which is what lets the dialogue bubble drop the ambient line once it
 * has been answered, instead of stacking both and outgrowing the field viewport.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 * @param {string} speakerId
 */
export function interviewHasAsked(activity, state = defaultInterviewState(), speakerId = "") {
  if (!activity.speakers.some((speaker) => speaker.id === speakerId)) return false;
  return askedFor(state, speakerId).length > 0;
}

/**
 * What a speaker says to a question — the authored answer, or their fallback.
 *
 * @param {import("zod").infer<typeof SpeakerSchema>} speaker
 * @param {string} questionId
 */
export function interviewAnswer(speaker, questionId) {
  // `answers` is read defensively rather than trusting the schema's
  // .default({}): validate-content.js discards the parsed output and content
  // reaches the game as the raw imported object, so a schema default is
  // documentation, never a runtime guarantee.
  //
  // `authored` distinguishes a real answer from the speaker's fallback, which
  // matters now that authored grids are deliberately sparse: a fallback is a
  // stage direction ("She turns back to the row she was working"), not testimony,
  // so there is nothing in it to write down. Both the log control and the reducer
  // key off this.
  const authored = (speaker.answers || {})[questionId];
  return authored
    ? { text: authored.text, useful: authored.useful === true, authored: true }
    : { text: speaker.fallback, useful: false, authored: false };
}

/**
 * The question chips, the current answer, and the button that keeps it —
 * rendered into the field dialogue bubble for one speaker. Returns "" for anyone
 * who is not part of this interview, which is what lets the host call it for
 * every NPC on the map without knowing who is in the cast.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 * @param {string} actorId
 */
export function renderInterviewInline(activity, state = defaultInterviewState(), actorId = "") {
  const speaker = activity.speakers.find((item) => item.id === actorId);
  if (!speaker) return "";
  const asked = askedFor(state, speaker.id);
  const logged = loggedFor(state, speaker.id);
  const showing = asked[asked.length - 1] || null;
  const answer = showing ? interviewAnswer(speaker, showing) : null;
  const chips = activity.questions
    .map((question) => {
      const isShowing = question.id === showing;
      const classes = [
        "field-interview__q",
        asked.includes(question.id) ? "is-asked" : "",
        logged.includes(question.id) ? "is-logged" : "",
        isShowing ? "is-showing" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<button type="button" class="${classes}" data-activity-action="ask" data-speaker="${escapeHtml(speaker.id)}" data-question="${escapeHtml(question.id)}" aria-pressed="${isShowing ? "true" : "false"}">${escapeHtml(question.label)}</button>`;
    })
    .join("");
  // The log control is the only thing on this panel that changes what the player
  // is carrying, so it says so in both states rather than disappearing once
  // taken — a control that vanishes reads as a control that failed.
  const keep =
    !answer || !answer.authored
      ? ""
      : logged.includes(showing)
        ? `<p class="field-interview__logged">✓ In your notebook</p>`
        : `<button type="button" class="field-interview__log" data-activity-action="log" data-speaker="${escapeHtml(speaker.id)}" data-question="${escapeHtml(showing)}">Log this response</button>`;
  return `<div class="field-interview">
  ${
    answer
      ? `<p class="field-interview__answer${answer.useful ? " is-useful" : ""}">${escapeHtml(answer.text)}</p>`
      : ""
  }
  ${keep}
  <div class="field-interview__questions" role="group" aria-label="Questions you can ask">${chips}</div>
</div>`;
}

/**
 * One row per speaker: what they were asked, and what of it was kept.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 * @param {import("zod").infer<typeof SpeakerSchema>[]} speakers
 */
function notebookTable(activity, state, speakers) {
  const head = activity.questions
    .map((question) => `<th scope="col">${escapeHtml(question.label)}</th>`)
    .join("");
  const rows = speakers
    .map((speaker) => {
      const asked = askedFor(state, speaker.id);
      const logged = loggedFor(state, speaker.id);
      const cells = activity.questions
        .map((question) => {
          if (logged.includes(question.id)) {
            const answer = interviewAnswer(speaker, question.id);
            // The tick is the "I secured the right one" signal the first
            // playtest asked for by name.
            const mark = answer.useful ? `<i aria-hidden="true">✓</i>` : "";
            return `<td class="${answer.useful ? "is-useful" : "is-flat"}">${mark}${escapeHtml(answer.text)}</td>`;
          }
          if (asked.includes(question.id)) {
            return `<td class="is-heard"><span>Heard, not logged</span></td>`;
          }
          return `<td class="is-unasked"><span class="visually-hidden">Not asked</span></td>`;
        })
        .join("");
      return `<tr><th scope="row"><b>${escapeHtml(speaker.name)}</b>${speaker.role ? `<small>${escapeHtml(speaker.role)}</small>` : ""}</th>${cells}</tr>`;
    })
    .join("");
  return `<div class="activity-scroller">
    <table class="interview-notebook">
      <thead><tr><th scope="col"><span class="visually-hidden">Speaker</span></th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/**
 * The notebook: every question against every speaker you have actually spoken
 * to, then the closer.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function renderInterview(activity, state = defaultInterviewState()) {
  const coverage = interviewCoverage(activity, state);
  const goals = interviewGoals(activity, state)
    .map(
      (goal) => `<p><span>${escapeHtml(goal.label)}</span><b>${goal.done}</b> of ${goal.total}</p>`
    )
    .join("");
  // Grouping is what turns the notebook into a comparison. Ungrouped, the two
  // accounts of the same island interleave by authoring order and the closer's
  // question about the difference between them has nothing on screen to answer
  // it with.
  const panels = activity.groups
    ? activity.groups
        .map((group) => {
          const speakers = activity.speakers.filter((speaker) => speaker.group === group.id);
          if (!speakers.length) return "";
          return `<section class="interview-group">
    <h4>${escapeHtml(group.label)}</h4>
    ${group.note ? `<p class="activity-note">${escapeHtml(group.note)}</p>` : ""}
    ${notebookTable(activity, state, speakers)}
  </section>`;
        })
        .join("")
    : notebookTable(activity, state, activity.speakers);

  return `<section class="activity-board activity-board--interview">
  <div class="activity-progress">${goals}</div>
  ${panels}
  ${renderCloser(activity.closer, state.filed, {
    locked: !coverage.met,
    lockedNote:
      "Every person on this island is holding one thing worth writing down. Find the rest before you file.",
  })}
</section>`;
}

/**
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function isInterviewComplete(activity, state = defaultInterviewState()) {
  return (
    interviewCoverage(activity, state).met && closerResult(activity.closer, state.filed).correct
  );
}

/**
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function interviewOutcome(activity, state = defaultInterviewState()) {
  const findings = [];
  activity.speakers.forEach((speaker) => {
    loggedFor(state, speaker.id).forEach((questionId) => {
      const answer = interviewAnswer(speaker, questionId);
      if (!answer.useful) return;
      findings.push({ id: `${speaker.id}:${questionId}`, text: answer.text, from: speaker.name });
    });
  });
  return {
    findings,
    skillOutcomes: closerSkillOutcomes(activity.id, activity.closer, state.filed),
  };
}
