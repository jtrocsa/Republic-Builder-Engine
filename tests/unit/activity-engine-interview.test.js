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
  interviewFindings,
  interviewGoals,
  interviewLogReceipt,
  interviewOutcome,
  interviewSpeakerStatus,
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
      // Normalized to "" rather than left off, so every caller gets the same shape. A field absent
      // from this object is invisible to the whole engine — which is how `lead` shipped unreadable
      // on its first attempt in Phase 77.
      lead: "",
      authored: true,
    });
  });

  it("returns the speaker's flat fallback for a pair with no authored answer (normal case)", () => {
    // The whole lesson of the mission: asking the wrong person the wrong
    // question is a legal move that returns legitimate nothing.
    //
    // `authored: false` is what the host reads to withhold the log control. Both shipped interviews
    // leave one question per speaker unauthored (Phase 71), so this is a live path rather than a
    // guard — before that the fallback was unreachable in either of them.
    const elder = activity().speakers[0];
    expect(interviewAnswer(elder, "gold")).toEqual({
      text: "She waits for a better question.",
      useful: false,
      // A fallback is a stage direction, and a stage direction cannot hand over a lead.
      lead: "",
      authored: false,
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

  it("refuses to log a speaker's fallback (edge case)", () => {
    // A fallback is the speaker having nothing for you, not testimony, so there is nothing in it to
    // keep. The field bubble draws no log control for one — this is the same rule where it is
    // actually enforceable, since a disabled control is a hint and the reducer is the lock.
    let state = actInterview(activity(), defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "gold",
    });
    const asked = state;
    state = actInterview(activity(), state, { type: "log", speaker: "elder", question: "gold" });
    expect(state).toBe(asked);
    expect(state.logged.elder).toBeUndefined();
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
    // Re-asking and re-logging the same pair must not move any of the three numbers. (This used to
    // reach two questions by also logging the elder's `gold`, which is her fallback — since
    // Phase 71 the reducer refuses that, because a fallback is not testimony.)
    let state = askAndLog(defaultInterviewState(), "elder", "grows");
    state = askAndLog(state, "elder", "grows");
    expect(interviewCoverage(activity(), state)).toMatchObject({
      questions: 1,
      speakers: 1,
      useful: 1,
      met: false,
    });

    state = askAndLog(state, "captain", "gold");
    expect(interviewCoverage(activity(), state)).toMatchObject({
      questions: 2,
      speakers: 2,
      useful: 2,
      met: true,
    });
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

  // Spine Review Part 7. A filed record does not get re-filed. `file` used to overwrite
  // `state.filed` unconditionally once the board was settled, so reopening a finished mission from
  // the Mission Tracker and clicking a wrong option un-finished it — while the Codex, which
  // deliberately never unfiles, kept the entry it had already written.
  it("refuses a second conclusion once the record is filed (regression case)", () => {
    const board = fullyLogged();
    // The wrong option lands while the record is open, which is what makes the refusal below a
    // refusal rather than an unknown id being dropped on the floor.
    expect(actInterview(activity(), board, { type: "file", option: "there" }).filed).toBe("there");

    const filed = actInterview(activity(), board, { type: "file", option: "asked" });
    expect(isInterviewComplete(activity(), filed)).toBe(true);
    // Identity, not merely equality: the host re-renders only when a reducer returns a new object.
    expect(actInterview(activity(), filed, { type: "file", option: "there" })).toBe(filed);
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
    expect(after).toContain("In your Field Notebook");
    expect(after).not.toContain('data-activity-action="log"');
  });

  // Spine Review P0-3, the program's one S2 and its longest-open finding. `log` has three
  // outcomes and the receipt claimed the same one for all of them. Two thirds of every authored
  // answer in the shipped game is flat on purpose — one useful answer per speaker, two flat ones —
  // so the outcome it was wrong about is the common one, and it lands on the first interaction of
  // the first mission. The mechanic was never the problem; the sentence was.
  const withFlatAnswer = () => {
    const content = activity();
    content.speakers[0].answers.gold = {
      text: "She has heard the question before.",
      useful: false,
    };
    return content;
  };

  it("does not claim the notebook for a flat answer (edge case)", () => {
    const content = withFlatAnswer();
    const logged = askAndLog(defaultInterviewState(), "elder", "gold", content);
    const markup = renderInterviewInline(content, logged, "elder");
    expect(markup).toContain("is-flat");
    expect(markup).not.toContain("In your Field Notebook");
    // And it really is absent, which is the half the old string was wrong about rather than vague.
    expect(interviewFindings(content, logged)).toEqual([]);
  });

  it("calls a useful answer a candidate when the notebook is rationed (edge case)", () => {
    // A capacity means keeping is a second, separate press in the panel. Both shipped capacity
    // interviews ask for eight useful answers and hold three, so five of what the player logs will
    // not end up in the notebook at all.
    const content = { ...activity(), notebook: { capacity: 1 } };
    const logged = askAndLog(defaultInterviewState(), "elder", "grows", content);
    const markup = renderInterviewInline(content, logged, "elder");
    expect(markup).toContain("is-candidate");
    expect(markup).toContain("Available in your Field Notebook");
    expect(interviewOutcome(content, logged).evidence).toEqual([]);
  });

  it("offers the same words under a flat answer as under a useful one (edge case)", () => {
    // The receipt tells the truth; the offer must not. Which answers carry something is what an
    // interview is for, and a button that changed its words would give it away before the press.
    const content = withFlatAnswer();
    const ask = (question) =>
      actInterview(content, defaultInterviewState(), { type: "ask", speaker: "elder", question });
    const label = (markup) => markup.match(/class="field-interview__log"[^>]*>([^<]+)</)?.[1];
    const flat = label(renderInterviewInline(content, ask("gold"), "elder"));
    expect(flat).toBe("Add to Field Notebook");
    expect(flat).toBe(label(renderInterviewInline(content, ask("grows"), "elder")));
  });

  it("reports the three log outcomes apart (normal case)", () => {
    const rationed = { ...activity(), notebook: { capacity: 1 } };
    expect(interviewLogReceipt(activity(), { useful: false }).tone).toBe("flat");
    expect(interviewLogReceipt(rationed, { useful: false }).tone).toBe("flat");
    expect(interviewLogReceipt(rationed, { useful: true }).tone).toBe("candidate");
    expect(interviewLogReceipt(activity(), { useful: true }).tone).toBe("kept");
  });

  it("marks the three outcomes with the game's own three glyphs (normal case)", () => {
    // Phase 110. All three printed ✓ — "secured" — including on the 104 of 156 authored answers
    // that carry nothing. These are the marks the Mission Tracker's legend already teaches
    // ("✦ go here · ✓ secured · · locked") and the world markers and head badges already use.
    const rationed = { ...activity(), notebook: { capacity: 1 } };
    expect(interviewLogReceipt(activity(), { useful: true }).mark).toBe("✓");
    expect(interviewLogReceipt(rationed, { useful: true }).mark).toBe("✦");
    expect(interviewLogReceipt(activity(), { useful: false }).mark).toBe("·");
    // And the mark reaches the bubble, which is where the wrong one was printed. The shared fixture
    // is deliberately sparse, so the elder's "gold" is an unauthored fallback offering no receipt at
    // all — a flat answer has to be an authored one carrying nothing.
    const deflects = activity();
    deflects.speakers[0].answers.gold = { text: "We beat it thin and wear it.", useful: false };
    const state = actInterview(deflects, defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "gold",
    });
    const logged = actInterview(deflects, state, {
      type: "log",
      speaker: "elder",
      question: "gold",
    });
    const markup = renderInterviewInline(deflects, logged, "elder");
    expect(markup).toContain("is-flat");
    expect(markup).toContain("·");
    // There is no ✗ anywhere in this engine and a deflection is not a wrong answer.
    expect(markup).not.toContain("✗");
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
    expect(markup).toContain("Heard — not recorded");
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

// Leads (Phase 77, decision log 0060). One string on the answer that produces it — deliberately not
// a top-level list, which would be a second graph to keep in sync with the first.
describe("an answer that sends you somewhere", () => {
  const withLead = () => {
    const a = activity();
    a.speakers[0].answers.grows.lead = "Ask the clerk what he wrote in the book.";
    return a;
  };

  const askOnly = (a) =>
    actInterview(a, defaultInterviewState(), {
      type: "ask",
      speaker: a.speakers[0].id,
      question: "grows",
    });

  const askAndLog = (a) => {
    const asked = askOnly(a);
    return actInterview(a, asked, { type: "log", speaker: a.speakers[0].id, question: "grows" });
  };

  it("withholds the lead until the answer is in the notebook (normal case)", () => {
    // Hearing and keeping are two moves everywhere else in this engine. A lead handed over on the
    // strength of a question the player walked away from would be the one place that did not hold.
    const a = withLead();
    expect(renderInterviewInline(a, askOnly(a), a.speakers[0].id)).not.toContain(
      "Ask the clerk what he wrote"
    );
    expect(renderInterviewInline(a, askAndLog(a), a.speakers[0].id)).toContain(
      "Ask the clerk what he wrote"
    );
  });

  it("carries the lead into the notebook table beside its answer (normal case)", () => {
    const a = withLead();
    const markup = renderInterview(a, askAndLog(a));
    expect(markup).toContain('<b class="is-lead">');
    expect(markup).toContain("Ask the clerk what he wrote");
  });

  it("renders nothing extra for an answer with no lead (regression case)", () => {
    // Every answer shipped before this phase, and the reason the field is optional.
    const a = activity();
    expect(renderInterviewInline(a, askAndLog(a), a.speakers[0].id)).not.toContain(
      "field-interview__lead"
    );
    expect(renderInterview(a, askAndLog(a))).not.toContain("is-lead");
  });

  it("does not make a lead into evidence (boundary case)", () => {
    // A lead is a sentence pointing somewhere, not something gathered. It must not turn up as a
    // finding, or the Field Notebook starts filling with directions instead of testimony.
    const a = withLead();
    const findings = interviewOutcome(a, askAndLog(a)).findings;
    expect(findings.every((finding) => !finding.text.includes("Ask the clerk"))).toBe(true);
  });

  it("says who the interview still wants an account from (normal case)", () => {
    // Phase 111 — the head badge out on the map. Seven of the twenty-four missions are interviews of
    // six to eight people, and the cast was indistinguishable from the scenery until this existed.
    const content = activity();
    const fresh = defaultInterviewState();
    // Null for anyone outside the cast, which is what lets the field ask about every NPC on the map.
    expect(interviewSpeakerStatus(content, fresh, "not-in-this-mission")).toBe(null);
    expect(interviewSpeakerStatus(content, fresh, "elder")).toBe("available");

    // Heard and walked away is not secured. Everything else in this engine counts `logged`, and a
    // green badge on a deflection would be the head-badge version of the receipt Phase 110 fixed.
    const heard = actInterview(content, fresh, {
      type: "ask",
      speaker: "elder",
      question: "grows",
    });
    expect(interviewSpeakerStatus(content, heard, "elder")).toBe("available");

    const kept = actInterview(content, heard, {
      type: "log",
      speaker: "elder",
      question: "grows",
    });
    expect(interviewSpeakerStatus(content, kept, "elder")).toBe("secured");
    // And one person being done says nothing about the next.
    expect(interviewSpeakerStatus(content, kept, "captain")).toBe("available");
  });

  it("does not call a speaker secured for logging a deflection (edge case)", () => {
    const deflects = activity();
    deflects.speakers[0].answers.gold = { text: "We wear it.", useful: false };
    let state = actInterview(deflects, defaultInterviewState(), {
      type: "ask",
      speaker: "elder",
      question: "gold",
    });
    state = actInterview(deflects, state, { type: "log", speaker: "elder", question: "gold" });
    expect(interviewSpeakerStatus(deflects, state, "elder")).toBe("available");
  });
});
