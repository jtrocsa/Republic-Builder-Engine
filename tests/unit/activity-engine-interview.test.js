// INTERVIEW is the only engine that runs part of itself out on the map, and the
// only one whose content matrix is allowed to be sparse. Both of those are load
// bearing, so both are pinned here: a speaker with no authored answer must give
// their flat fallback rather than crash, and a closer must not accept a filing
// before the coverage bar is met (the disabled attribute in the markup is a
// hint, not a lock).
//
// Phase 69 added the third load-bearing thing: hearing an answer and keeping it
// are separate moves. Everything downstream — coverage, the notebook, the
// outcome, and the host's evidence tokens for the DISCREPANCY audit — counts
// `logged`, never `asked`. A test that asserts on `asked` is asserting on the
// wrong list.
import { describe, expect, it } from "vitest";
import {
  InterviewActivitySchema,
  actInterview,
  defaultInterviewState,
  interviewAnswer,
  interviewCoverage,
  interviewGoals,
  interviewOutcome,
  interviewSummary,
  isInterviewComplete,
  renderInterview,
  renderInterviewInline,
} from "../../apps/web/src/engine/activities/interview.js";

const activity = () => ({
  kind: "interview",
  id: "test-interview",
  title: "Two questions",
  intro: "Ask them.",
  briefing: null,
  questions: [
    { id: "gold", label: "Where is the gold?" },
    { id: "grows", label: "What grows here?" },
  ],
  groups: [
    { id: "island", label: "The islanders" },
    { id: "fleet", label: "The fleet" },
  ],
  speakers: [
    {
      id: "elder",
      name: "Elder",
      role: "Community elder",
      group: "island",
      fallback: "She waits for a better question.",
      answers: { grows: { text: "Cassava, and maize after it.", useful: true } },
    },
    {
      id: "captain",
      name: "Captain",
      group: "fleet",
      fallback: "He has already stopped listening.",
      answers: { gold: { text: "Upriver, they say.", useful: true } },
    },
  ],
  requires: { questions: 2, speakers: 2 },
  closer: {
    prompt: "What does the record support?",
    skillCategory: "sourcing",
    options: [
      { id: "asked", text: "It records what was asked", correct: true, why: "Right." },
      { id: "there", text: "It records what was there", correct: false, why: "Not quite." },
    ],
  },
});

/** Ask, then log — the two moves the coverage bar actually counts. */
const askAndLog = (state, speaker, question, content = activity()) => {
  const asked = actInterview(content, state, { type: "ask", speaker, question });
  return actInterview(content, asked, { type: "log", speaker, question });
};

const fullyLogged = (content = activity()) => {
  let state = defaultInterviewState();
  state = askAndLog(state, "elder", "grows", content);
  state = askAndLog(state, "captain", "gold", content);
  return state;
};

describe("InterviewActivitySchema", () => {
  it("accepts a well-formed interview (normal case)", () => {
    expect(InterviewActivitySchema.safeParse(activity()).success).toBe(true);
  });

  it("rejects a speaker answering a question that was never authored (edge case)", () => {
    const broken = activity();
    broken.speakers[0].answers.weather = { text: "Rain.", useful: false };
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('unknown question "weather"');
  });

  it("rejects a coverage bar higher than the cast can satisfy (boundary case)", () => {
    const broken = activity();
    broken.requires.speakers = 3;
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("could never unlock");
  });

  it("rejects asking for more useful answers than are authored (boundary case)", () => {
    // Two answers carry `useful: true` in the fixture, so a bar of three is a
    // closer that can never open — and the only symptom at runtime would be a
    // student unable to finish a mission with nothing left to try.
    const broken = activity();
    broken.requires = { useful: 3 };
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("could never unlock");
  });

  it("rejects a requires block that asks for nothing (edge case)", () => {
    const broken = activity();
    broken.requires = {};
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("at least one of questions");
  });

  it("rejects a speaker who belongs to no authored group (edge case)", () => {
    // A grouped notebook renders one panel per group, so an ungrouped speaker
    // would silently vanish from the one screen where the mission is reviewed.
    const broken = activity();
    broken.speakers[1].group = "stowaways";
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("not one of the authored groups");
  });

  it("rejects a closer with no single correct option (edge case)", () => {
    const broken = activity();
    broken.closer.options[1].correct = true;
    const result = InterviewActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("exactly one correct option");
  });
});

describe("interviewAnswer — the sparse matrix", () => {
  it("returns the authored answer for a pair that has one (normal case)", () => {
    const elder = activity().speakers[0];
    expect(interviewAnswer(elder, "grows")).toEqual({
      text: "Cassava, and maize after it.",
      useful: true,
    });
  });

  it("returns the speaker's flat fallback for a pair with no authored answer (normal case)", () => {
    // The whole lesson of the mission: asking the wrong person the wrong
    // question is a legal move that returns legitimate nothing.
    const elder = activity().speakers[0];
    expect(interviewAnswer(elder, "gold")).toEqual({
      text: "She waits for a better question.",
      useful: false,
    });
  });

  it("falls back when `answers` is missing entirely (regression case)", () => {
    // validate-content.js discards Zod's parsed output, so the schema's
    // .default({}) never reaches runtime — content arrives as the raw object.
    // Before the guard this threw on the first NPC an author hadn't filled in.
    const bare = { id: "x", name: "X", fallback: "Nothing." };
    expect(interviewAnswer(bare, "gold").text).toBe("Nothing.");
  });
});

describe("actInterview", () => {
  it("records a question put to a speaker (normal case)", () => {
    const state = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "grows",
    });
    expect(state.asked.elder).toEqual(["grows"]);
    // Heard, not kept.
    expect(state.logged.elder).toBeUndefined();
  });

  it("re-asking moves the question to the end instead of duplicating it (regression case)", () => {
    // The last entry is what the bubble shows, which is how re-reading an
    // earlier answer costs no extra state. Pushing blindly grew the array
    // without bound and left the wrong answer on screen.
    let state = defaultInterviewState();
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "grows" });
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "gold" });
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "grows" });
    expect(state.asked.elder).toEqual(["gold", "grows"]);
  });

  it("ignores an unknown speaker or question (edge case)", () => {
    const before = defaultInterviewState();
    expect(
      actInterview(activity(), before, { type: "ask", speaker: "ghost", question: "gold" })
    ).toBe(before);
    expect(
      actInterview(activity(), before, { type: "ask", speaker: "elder", question: "nope" })
    ).toBe(before);
  });

  it("logs whatever the speaker is currently saying when no question is named (normal case)", () => {
    // The button under an answer in the field bubble carries no question of its
    // own; "the one showing" is the last asked.
    let state = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "grows",
    });
    state = actInterview(activity(), state, { type: "log", speaker: "elder" });
    expect(state.logged.elder).toEqual(["grows"]);
  });

  it("refuses to log something that was never asked (regression case)", () => {
    // Otherwise the notebook could be filled from the closer screen, where the
    // answers are not even on offer.
    const before = defaultInterviewState();
    expect(
      actInterview(activity(), before, { type: "log", speaker: "elder", question: "grows" })
    ).toBe(before);
  });

  it("logging the same answer twice is a no-op (boundary case)", () => {
    const once = askAndLog(defaultInterviewState(), "elder", "grows");
    expect(
      actInterview(activity(), once, { type: "log", speaker: "elder", question: "grows" })
    ).toBe(once);
  });

  it("refuses to file before the coverage bar is met (regression case)", () => {
    // The closer's disabled attribute is a UI hint; a record filed early would
    // read as complete. The guard belongs in the reducer.
    const state = actInterview(activity(), defaultInterviewState(), {
      type: "file",
      option: "asked",
    });
    expect(state.filed).toBe(null);
  });

  it("asking everything without logging any of it does not unlock the closer (regression case)", () => {
    // The distinction the log button exists to make. Before it, asking was
    // keeping, and there was no moment a player could see anything recorded.
    let state = defaultInterviewState();
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "grows" });
    state = actInterview(activity(), state, { type: "ask", speaker: "captain", question: "gold" });
    expect(interviewCoverage(activity(), state).met).toBe(false);
    expect(actInterview(activity(), state, { type: "file", option: "asked" }).filed).toBe(null);
  });

  it("files once coverage is met (normal case)", () => {
    const state = actInterview(activity(), fullyLogged(), { type: "file", option: "asked" });
    expect(state.filed).toBe("asked");
  });
});

describe("interviewCoverage / interviewGoals / interviewSummary", () => {
  it("counts distinct logged questions and speakers, not total asks (normal case)", () => {
    let state = askAndLog(defaultInterviewState(), "elder", "grows");
    state = askAndLog(state, "elder", "gold");
    const coverage = interviewCoverage(activity(), state);
    expect(coverage).toMatchObject({ questions: 2, speakers: 1, useful: 1, met: false });
  });

  it("reports one goal row per dimension the content actually asks for (normal case)", () => {
    // The root of the "4 questions / 5 people doesn't add up" complaint: an
    // activity that sets one bar reports one number.
    const single = activity();
    single.requires = { useful: 2, label: "Accounts secured" };
    const goals = interviewGoals(single, fullyLogged(single));
    expect(goals).toEqual([{ key: "useful", label: "Accounts secured", done: 2, total: 2 }]);
  });

  it("prefers the useful goal for the one-line summary (normal case)", () => {
    const mixed = activity();
    mixed.requires = { speakers: 2, useful: 2, label: "Accounts secured" };
    expect(interviewSummary(mixed, defaultInterviewState())).toMatchObject({
      key: "useful",
      label: "Accounts secured",
      done: 0,
      total: 2,
    });
  });

  it("caps a goal's `done` at its total (boundary case)", () => {
    // The tracker prints "3 of 2" otherwise, which reads as a bug rather than as
    // a player who kept going.
    const low = activity();
    low.requires = { questions: 1 };
    let state = askAndLog(defaultInterviewState(), "elder", "grows");
    state = askAndLog(state, "captain", "gold");
    expect(interviewGoals(low, state)[0]).toMatchObject({ done: 1, total: 1 });
  });
});

describe("isInterviewComplete / interviewOutcome", () => {
  it("needs both the coverage bar and a correctly filed closer (boundary case)", () => {
    const logged = fullyLogged();
    expect(isInterviewComplete(activity(), logged)).toBe(false);
    const wrong = actInterview(activity(), logged, { type: "file", option: "there" });
    expect(isInterviewComplete(activity(), wrong)).toBe(false);
    const right = actInterview(activity(), logged, { type: "file", option: "asked" });
    expect(isInterviewComplete(activity(), right)).toBe(true);
  });

  it("reports only the logged useful answers, plus one skill outcome (normal case)", () => {
    let state = fullyLogged();
    // A third question put and kept, but it has no authored answer.
    state = askAndLog(state, "elder", "gold");
    state = actInterview(activity(), state, { type: "file", option: "asked" });
    const outcome = interviewOutcome(activity(), state);
    expect(outcome.findings).toHaveLength(2);
    expect(outcome.skillOutcomes).toEqual([
      { key: "test-interview", skillCategory: "sourcing", correct: true },
    ]);
  });

  it("does not report an answer that was heard but never logged (regression case)", () => {
    let state = fullyLogged();
    state = actInterview(activity(), state, { type: "ask", speaker: "captain", question: "grows" });
    state = actInterview(activity(), state, { type: "file", option: "asked" });
    expect(interviewOutcome(activity(), state).findings).toHaveLength(2);
  });
});

describe("rendering", () => {
  it("renders nothing inline for someone who is not in the cast (normal case)", () => {
    expect(renderInterviewInline(activity(), defaultInterviewState(), "passer-by")).toBe("");
  });

  it("renders a chip per question for a speaker who is (normal case)", () => {
    const markup = renderInterviewInline(activity(), defaultInterviewState(), "elder");
    expect(markup).toContain('data-activity-action="ask"');
    expect((markup.match(/data-question=/g) || []).length).toBe(2);
    // No answer showing, so nothing to keep yet.
    expect(markup).not.toContain('data-activity-action="log"');
  });

  it("offers the log button under an answer, then reports it kept (normal case)", () => {
    const asked = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "grows",
    });
    const before = renderInterviewInline(activity(), asked, "elder");
    expect(before).toContain("Cassava, and maize after it.");
    expect(before).toContain('data-activity-action="log"');

    const logged = actInterview(activity(), asked, { type: "log", speaker: "elder" });
    const after = renderInterviewInline(activity(), logged, "elder");
    expect(after).toContain("In your notebook");
    expect(after).not.toContain('data-activity-action="log"');
  });

  it("groups the notebook into one panel per authored group (normal case)", () => {
    const markup = renderInterview(activity(), fullyLogged());
    expect(markup).toContain("The islanders");
    expect(markup).toContain("The fleet");
    expect((markup.match(/interview-group/g) || []).length).toBeGreaterThan(1);
  });

  it("tells apart never-asked, heard, and kept in the notebook (normal case)", () => {
    let state = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "gold",
    });
    state = askAndLog(state, "elder", "grows");
    const markup = renderInterview(activity(), state);
    expect(markup).toContain("Heard, not logged");
    expect(markup).toContain("is-useful");
    expect(markup).toContain("is-unasked");
  });

  it("escapes authored text in both renderers (regression case)", () => {
    const hostile = activity();
    hostile.speakers[0].fallback = '<script>alert("x")</script>';
    // The fallback only renders once a question has actually been put, so ask
    // the elder the one she has no answer for.
    const state = actInterview(hostile, defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "gold",
    });
    const inline = renderInterviewInline(hostile, state, "elder");
    expect(inline).toContain("&lt;script&gt;");
    expect(inline).not.toContain("<script>");
    expect(
      renderInterview(hostile, actInterview(hostile, state, { type: "log", speaker: "elder" }))
    ).not.toContain("<script>");
  });
});
