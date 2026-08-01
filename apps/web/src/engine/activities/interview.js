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
// This is the only engine that implements renderInline(): its questions are put
// to people standing on the map, inside the field dialogue bubble, rather than
// on a screen. render() is the notebook you come back to.
//
// Transfers as: characters' conflicting accounts of one event (literature),
// researchers on a disputed result (science), stakeholders in a live policy
// (civics).
import { z } from "zod";
import {
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
  // Free-form grouping the content owns (a side, a faction, a discipline). The
  // engine only ever compares it for equality when reporting coverage.
  group: z.string().min(1).optional(),
  fallback: z.string().min(1, "speaker.fallback is required — it is what an unasked question gets"),
  answers: z.record(z.string(), AnswerSchema).default({}),
});

export const InterviewActivitySchema = z
  .object({
    kind: z.literal("interview"),
    id: z.string().min(1, "activity.id is required"),
    title: z.string().min(1, "activity.title is required"),
    intro: z.string().min(1, "activity.intro is required"),
    // Who hands the player the questions, and the line they hand them over
    // with. Optional: an activity can simply open with them.
    briefing: z
      .object({
        speaker: z.string().min(1),
        line: z.string().min(1),
      })
      .nullable()
      .default(null),
    questions: z
      .array(
        z.object({
          id: z.string().min(1, "question.id is required"),
          label: z.string().min(1, "question.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "an interview needs at least two questions, or there is no choice to make"),
    speakers: z.array(SpeakerSchema).min(2, "an interview needs at least two speakers"),
    // The coverage bar before the closer unlocks. Content owns it because "how
    // much asking is enough" is a pedagogy call, not an engine one.
    requires: z.object({
      questions: z.number().int().min(1),
      speakers: z.number().int().min(1),
    }),
    closer: ClosingChoiceSchema,
  })
  .superRefine((activity, ctx) => {
    checkUniqueIds(activity.questions, ctx, "interview question", ["questions"]);
    checkUniqueIds(activity.speakers, ctx, "interview speaker", ["speakers"]);

    const questionIds = new Set(activity.questions.map((question) => question.id));
    activity.speakers.forEach((speaker, index) => {
      Object.keys(speaker.answers).forEach((questionId) => {
        if (!questionIds.has(questionId)) {
          ctx.addIssue({
            code: "custom",
            path: ["speakers", index, "answers", questionId],
            message: `Speaker "${speaker.id}" answers unknown question "${questionId}".`,
          });
        }
      });
    });

    if (activity.requires.questions > activity.questions.length) {
      ctx.addIssue({
        code: "custom",
        path: ["requires", "questions"],
        message: `requires.questions (${activity.requires.questions}) exceeds the ${activity.questions.length} questions authored — the closer could never unlock.`,
      });
    }
    if (activity.requires.speakers > activity.speakers.length) {
      ctx.addIssue({
        code: "custom",
        path: ["requires", "speakers"],
        message: `requires.speakers (${activity.requires.speakers}) exceeds the ${activity.speakers.length} speakers authored — the closer could never unlock.`,
      });
    }
  });

export function defaultInterviewState() {
  // asked[speakerId] is ordered and the last entry is what the bubble is
  // showing, which is how re-reading an earlier answer costs no extra state:
  // asking again moves that question to the end rather than duplicating it.
  return { asked: {}, filed: null };
}

/** @param {ReturnType<typeof defaultInterviewState>} [state] */
function askedFor(state, speakerId) {
  const asked = state?.asked?.[speakerId];
  return Array.isArray(asked) ? asked : [];
}

/**
 * How much of the matrix the player has actually walked.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 */
export function interviewCoverage(activity, state = defaultInterviewState()) {
  const questions = new Set();
  const speakers = new Set();
  activity.speakers.forEach((speaker) => {
    const asked = askedFor(state, speaker.id);
    if (asked.length) speakers.add(speaker.id);
    asked.forEach((questionId) => questions.add(questionId));
  });
  return {
    questions: questions.size,
    speakers: speakers.size,
    met:
      questions.size >= activity.requires.questions && speakers.size >= activity.requires.speakers,
  };
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
  return (speaker.answers || {})[questionId] || { text: speaker.fallback, useful: false };
}

/**
 * The question chips and the current answer, for one speaker, rendered into the
 * field dialogue bubble. Returns "" for anyone who is not part of this
 * interview, which is what lets the host call it for every NPC on the map
 * without knowing who is in the cast.
 *
 * @param {import("zod").infer<typeof InterviewActivitySchema>} activity
 * @param {ReturnType<typeof defaultInterviewState>} [state]
 * @param {string} actorId
 */
export function renderInterviewInline(activity, state = defaultInterviewState(), actorId = "") {
  const speaker = activity.speakers.find((item) => item.id === actorId);
  if (!speaker) return "";
  const asked = askedFor(state, speaker.id);
  const showing = asked[asked.length - 1] || null;
  const answer = showing ? interviewAnswer(speaker, showing) : null;
  const chips = activity.questions
    .map((question) => {
      const wasAsked = asked.includes(question.id);
      const isShowing = question.id === showing;
      const classes = [
        "field-interview__q",
        wasAsked ? "is-asked" : "",
        isShowing ? "is-showing" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `<button type="button" class="${classes}" data-activity-action="ask" data-speaker="${escapeHtml(speaker.id)}" data-question="${escapeHtml(question.id)}" aria-pressed="${isShowing ? "true" : "false"}">${escapeHtml(question.label)}</button>`;
    })
    .join("");
  return `<div class="field-interview">
  ${
    answer
      ? `<p class="field-interview__answer${answer.useful ? " is-useful" : ""}">${escapeHtml(answer.text)}</p>`
      : ""
  }
  <div class="field-interview__questions" role="group" aria-label="Questions you can ask">${chips}</div>
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
  const head = activity.questions
    .map((question) => `<th scope="col">${escapeHtml(question.label)}</th>`)
    .join("");
  const rows = activity.speakers
    .map((speaker) => {
      const asked = askedFor(state, speaker.id);
      const cells = activity.questions
        .map((question) => {
          if (!asked.includes(question.id)) {
            return `<td class="is-unasked"><span class="visually-hidden">Not asked</span></td>`;
          }
          const answer = interviewAnswer(speaker, question.id);
          return `<td class="${answer.useful ? "is-useful" : "is-flat"}">${escapeHtml(answer.text)}</td>`;
        })
        .join("");
      return `<tr><th scope="row"><b>${escapeHtml(speaker.name)}</b>${speaker.role ? `<small>${escapeHtml(speaker.role)}</small>` : ""}</th>${cells}</tr>`;
    })
    .join("");
  return `<section class="activity-board activity-board--interview">
  <div class="activity-progress">
    <p>Questions put: <b>${coverage.questions}</b> of ${activity.requires.questions} needed · People asked: <b>${coverage.speakers}</b> of ${activity.requires.speakers} needed</p>
  </div>
  <div class="activity-scroller">
    <table class="interview-notebook">
      <thead><tr><th scope="col"><span class="visually-hidden">Speaker</span></th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${renderCloser(activity.closer, state.filed, {
    locked: !coverage.met,
    lockedNote: "Put more of your questions to more of the people on the island before you file.",
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
    askedFor(state, speaker.id).forEach((questionId) => {
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
