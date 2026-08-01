// INTERVIEW is the only engine that runs part of itself out on the map, and the
// only one whose content matrix is allowed to be sparse. Both of those are load
// bearing, so both are pinned here: a speaker with no authored answer must give
// their flat fallback rather than crash, and a closer must not accept a filing
// before the coverage bar is met (the disabled attribute in the markup is a
// hint, not a lock).
import { describe, expect, it } from "vitest";
import {
  InterviewActivitySchema,
  actInterview,
  defaultInterviewState,
  interviewAnswer,
  interviewCoverage,
  interviewOutcome,
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

const fullyAsked = () => {
  let state = defaultInterviewState();
  state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "grows" });
  state = actInterview(activity(), state, { type: "ask", speaker: "captain", question: "gold" });
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

  it("refuses to file before the coverage bar is met (regression case)", () => {
    // The closer's disabled attribute is a UI hint; a record filed early would
    // read as complete. The guard belongs in the reducer.
    const state = actInterview(activity(), defaultInterviewState(), {
      type: "file",
      option: "asked",
    });
    expect(state.filed).toBe(null);
  });

  it("files once coverage is met (normal case)", () => {
    const state = actInterview(activity(), fullyAsked(), { type: "file", option: "asked" });
    expect(state.filed).toBe("asked");
  });
});

describe("interviewCoverage / isInterviewComplete / interviewOutcome", () => {
  it("counts distinct questions and speakers, not total asks (normal case)", () => {
    let state = defaultInterviewState();
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "grows" });
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "gold" });
    const coverage = interviewCoverage(activity(), state);
    expect(coverage).toMatchObject({ questions: 2, speakers: 1, met: false });
  });

  it("needs both the coverage bar and a correctly filed closer (boundary case)", () => {
    const asked = fullyAsked();
    expect(isInterviewComplete(activity(), asked)).toBe(false);
    const wrong = actInterview(activity(), asked, { type: "file", option: "there" });
    expect(isInterviewComplete(activity(), wrong)).toBe(false);
    const right = actInterview(activity(), asked, { type: "file", option: "asked" });
    expect(isInterviewComplete(activity(), right)).toBe(true);
  });

  it("reports only the useful answers, plus one skill outcome (normal case)", () => {
    let state = fullyAsked();
    state = actInterview(activity(), state, { type: "ask", speaker: "elder", question: "gold" });
    state = actInterview(activity(), state, { type: "file", option: "asked" });
    const outcome = interviewOutcome(activity(), state);
    // Three questions were put; only the two authored ones yielded anything.
    expect(outcome.findings).toHaveLength(2);
    expect(outcome.skillOutcomes).toEqual([
      { key: "test-interview", skillCategory: "sourcing", correct: true },
    ]);
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
  });

  it("shows the most recently asked answer (normal case)", () => {
    const state = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "grows",
    });
    expect(renderInterviewInline(activity(), state, "elder")).toContain(
      "Cassava, and maize after it."
    );
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
    expect(renderInterview(hostile, state)).not.toContain("<script>");
  });
});
