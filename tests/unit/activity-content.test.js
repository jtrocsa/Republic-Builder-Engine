// The invariants that hold *between* two authored activities, and between an activity and the map
// it is played on. No schema catches any of these, because each one spans two files.
//
// The engines in engine/activities/ validate an activity against itself: ids are unique, a trace
// joins up, a claim requiring a gap has one. What they cannot see is that DISCREPANCY's evidence
// column is addressed by opaque `asked:<npc>:<question>` tokens which must name a speaker and a
// question in a *different* activity, that an INTERVIEW's speaker ids must be real NPCs standing on
// a *different* file's field map, or that the missions' shared authoring rules were followed at all.
//
// Every failure below shipped-and-was-silent at least once in some form: an interview requiring
// more useful answers than were flagged (Unit 1 claimed seven and shipped six until Phase 69), an
// observation keyed to a question nobody can ask, an activity with no `howItWorks` that a student
// has to reverse-engineer.
//
// Covers both authored units. Units 3-5 have no activities yet and the loops below simply find
// nothing for them, which is the correct behaviour for this file until they do.

import { describe, it, expect } from "vitest";

import { FIELD_MAPS } from "../../apps/web/src/main.js";
import { UNIT_01_ACTIVITIES } from "../../apps/web/src/content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "../../apps/web/src/content/activities/unit-02-activities.js";

const AUTHORED_UNITS = [
  { unitId: "unit-01", activities: UNIT_01_ACTIVITIES },
  { unitId: "unit-02", activities: UNIT_02_ACTIVITIES },
];

const entriesOf = (activities) => Object.entries(activities);
const ofKind = (activities, kind) =>
  entriesOf(activities).filter(([, activity]) => activity.kind === kind);
const usefulAnswersOf = (speaker) =>
  Object.entries(speaker.answers || {}).filter(([, answer]) => answer.useful === true);

describe("activity content: the rules every authored mission is held to", () => {
  it.each(AUTHORED_UNITS)("$unitId states its own rules on every activity", ({ activities }) => {
    // MISSION-ACTIVITY-CATALOG §6 row 7, a standing condition rather than a task: an activity
    // shipped without these is a mechanic a student has to work out by trial, which is exactly what
    // the Phase 69 playtest found. It costs five sentences, so the rule is enforceable.
    for (const [sourceId, activity] of entriesOf(activities)) {
      expect(
        activity.howItWorks?.steps?.length,
        `${sourceId} has no howItWorks steps`
      ).toBeGreaterThanOrEqual(2);
      expect(activity.terms?.length, `${sourceId} has no glossary`).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(AUTHORED_UNITS)("$unitId asks for one number, not two", ({ activities }) => {
    // Decision log 0052 §3. A bar reported as "4 questions and 5 people" reads as a contradiction
    // rather than as a goal, so an interview sets exactly one dimension of `requires`.
    for (const [sourceId, activity] of ofKind(activities, "interview")) {
      const set = ["questions", "speakers", "useful"].filter(
        (key) => typeof activity.requires?.[key] === "number"
      );
      expect(set, `${sourceId} states ${set.length} goals`).toHaveLength(1);
    }
  });
});

describe("activity content: an interview's bar is one useful answer per person", () => {
  it.each(AUTHORED_UNITS)(
    "$unitId gives every speaker exactly one thing worth having",
    ({ activities }) => {
      // The design both authored interviews are built on: everyone knows one thing and only one of
      // the questions reaches it. A speaker with two useful answers makes the bar reachable without
      // meeting them all; a speaker with none makes it unreachable by the intended route, and the
      // schema's `requires.useful <= total useful` check passes in both cases.
      for (const [sourceId, activity] of ofKind(activities, "interview")) {
        const counts = activity.speakers.map((speaker) => ({
          id: speaker.id,
          useful: usefulAnswersOf(speaker).length,
        }));
        expect(counts.filter((entry) => entry.useful !== 1)).toEqual([]);
        expect(activity.requires.useful, `${sourceId} requires`).toBe(activity.speakers.length);
      }
    }
  );

  it.each(AUTHORED_UNITS)("$unitId leaves no question dead", ({ activities }) => {
    // A question no speaker answers usefully is a question with no reason to be on the list — the
    // player learns to stop putting it, and one quarter of the mission goes unplayed.
    for (const [sourceId, activity] of ofKind(activities, "interview")) {
      const reached = new Set(
        activity.speakers.flatMap((speaker) =>
          usefulAnswersOf(speaker).map(([questionId]) => questionId)
        )
      );
      const dead = activity.questions.map((q) => q.id).filter((id) => !reached.has(id));
      expect(dead, `${sourceId} has questions with no useful answer`).toEqual([]);
    }
  });

  it.each(AUTHORED_UNITS)("$unitId answers every question from every speaker", ({ activities }) => {
    // `fallback` exists for a speaker who has not been asked yet, not as a way to leave a cell
    // blank. A missing answer renders as the fallback and reads to the player as a bug.
    for (const [sourceId, activity] of ofKind(activities, "interview")) {
      const questionIds = activity.questions.map((q) => q.id);
      for (const speaker of activity.speakers) {
        expect(Object.keys(speaker.answers || {}).sort(), `${sourceId}: ${speaker.id}`).toEqual(
          [...questionIds].sort()
        );
      }
    }
  });
});

describe("activity content: a speaker is a person standing on the map", () => {
  it.each(AUTHORED_UNITS)(
    "$unitId's interview speakers are real NPCs",
    ({ unitId, activities }) => {
      // main.js builds interviewTokens() and renders the inline question chips from NPC ids, so a
      // speaker id that does not match an NPC on this unit's map is an activity nobody can play out
      // in the field — and the symptom is silence, not an error.
      const npcIds = new Set((FIELD_MAPS[unitId]?.npcs || []).map((npc) => npc.id));
      for (const [sourceId, activity] of ofKind(activities, "interview")) {
        const strangers = activity.speakers.map((s) => s.id).filter((id) => !npcIds.has(id));
        expect(strangers, `${sourceId} names speakers not on the ${unitId} map`).toEqual([]);
        if (activity.briefing) {
          expect(npcIds.has(activity.briefing.speaker), `${sourceId} briefing speaker`).toBe(true);
        }
      }
    }
  );
});

describe("activity content: a discrepancy's evidence column is addressable", () => {
  it.each(AUTHORED_UNITS)(
    "$unitId keys every observation to a question that can be asked",
    ({ activities }) => {
      // The token format is `asked:<npc id>:<question id>`, built by main.js's interviewTokens() from
      // the interview's *logged* answers. It is an opaque string to the engine, which is what makes
      // one engine's content able to gate another's — and what makes a typo in it invisible. An
      // observation keyed to a token nobody can earn renders permanently as "You did not gather
      // this," and the mission looks broken in a way that never throws.
      const askable = new Set();
      for (const [, activity] of ofKind(activities, "interview")) {
        for (const speaker of activity.speakers) {
          for (const question of activity.questions) {
            askable.add(`asked:${speaker.id}:${question.id}`);
          }
        }
      }
      for (const [sourceId, activity] of ofKind(activities, "discrepancy")) {
        const unearnable = activity.observed
          .map((entry) => entry.requires)
          .filter((token) => typeof token === "string" && token.startsWith("asked:"))
          .filter((token) => !askable.has(token));
        expect(unearnable, `${sourceId} keys observations to unaskable questions`).toEqual([]);
      }
    }
  );

  it.each(AUTHORED_UNITS)(
    "$unitId guarantees the column is full on the required route",
    ({ activities }) => {
      // Decision log 0052 §3: size the interview's bar so the audit that consumes it always has
      // something to audit with. Every observation keyed to a *useful* answer is one the interview's
      // `requires` makes unavoidable, so the count of those is the floor on the evidence column
      // however hurriedly a player got here.
      const guaranteed = new Set();
      for (const [, activity] of ofKind(activities, "interview")) {
        for (const speaker of activity.speakers) {
          for (const [questionId] of usefulAnswersOf(speaker)) {
            guaranteed.add(`asked:${speaker.id}:${questionId}`);
          }
        }
      }
      for (const [sourceId, activity] of ofKind(activities, "discrepancy")) {
        const always = activity.observed.filter(
          (entry) => entry.requires === null || guaranteed.has(entry.requires)
        );
        expect(always.length, `${sourceId} opens with too little evidence`).toBeGreaterThanOrEqual(
          activity.claims.length
        );
      }
    }
  );
});

describe("activity content: Riverbend's trace turns on what the record cannot say", () => {
  const [, ONE_HOGSHEAD] = ofKind(UNIT_02_ACTIVITIES, "trace")[0];

  it("keys at least one leg to the record not establishing it (normal case)", () => {
    // trace.js's own header: the effect list is expected to include an option meaning "the evidence
    // does not establish this," and choosing it correctly is the scored move. A trace where every
    // leg has a positive answer is a table with arrows drawn on it.
    const keys = ONE_HOGSHEAD.legs.map((leg) => leg.effect);
    expect(keys).toContain("not-established");
    expect(keys[0]).toBe("not-established");
  });

  it("never makes the true-but-unsourced answer correct (edge case)", () => {
    // `labor-cost` is offered on all four legs and is the answer to none of them. Bound labor did
    // produce this cargo — the player interviewed the people two records earlier — and a wharf
    // account that opens at the landing cannot establish it. This distractor is the mission, and a
    // well-meaning edit that "fixes" leg 1 would delete the point of it.
    expect(ONE_HOGSHEAD.effects.map((effect) => effect.id)).toContain("labor-cost");
    expect(ONE_HOGSHEAD.legs.filter((leg) => leg.effect === "labor-cost")).toEqual([]);
  });
});
