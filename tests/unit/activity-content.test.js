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
// Covers every authored unit. Units 4 and 5 have no activities yet and the loops below simply find
// nothing for them, which is the correct behaviour for this file until they do.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import { FIELD_MAPS } from "../../apps/web/src/main.js";
import { UNIT_01_ACTIVITIES } from "../../apps/web/src/content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "../../apps/web/src/content/activities/unit-02-activities.js";
import { UNIT_03_ACTIVITIES } from "../../apps/web/src/content/activities/unit-03-activities.js";
import { CASE_001_SOURCES } from "../../apps/web/src/content/unit-01-campaign.js";
import { CASE_004_SOURCES } from "../../apps/web/src/content/unit-02-campaign.js";
import { CASE_007_SOURCES } from "../../apps/web/src/content/unit-03-campaign.js";

// `sources` rides along because one rule below is about the *order* a case can be finished in, and
// that lives on the record (`requiresSourceId`) rather than on the activity.
const AUTHORED_UNITS = [
  { unitId: "unit-01", activities: UNIT_01_ACTIVITIES, sources: CASE_001_SOURCES },
  { unitId: "unit-02", activities: UNIT_02_ACTIVITIES, sources: CASE_004_SOURCES },
  { unitId: "unit-03", activities: UNIT_03_ACTIVITIES, sources: CASE_007_SOURCES },
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
      // And capped, which the schema also enforces — asserted here too because the reason is a
      // content rule rather than a shape one. These are now a screen a player reads before the
      // mission opens (Phase 71), and six bullets is a wall nobody reads. Detail goes in `note`.
      expect(
        activity.howItWorks.steps.length,
        `${sourceId} has ${activity.howItWorks.steps.length} howItWorks steps`
      ).toBeLessThanOrEqual(4);
      expect(activity.terms?.length, `${sourceId} has no glossary`).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(AUTHORED_UNITS)("$unitId names who hands each mission over", ({ unitId, activities }) => {
    // The Mission Instructions screen opens on the giver's own portrait and their line. A briefing
    // naming somebody who is not on this unit's map renders a plate with a blank name on it, and
    // the failure is silent — main.js's fieldNpcName() returns "" rather than throwing.
    //
    // Not every activity has to have one: a record found on a shore was handed over by nobody, and
    // the screen has a deliberate third tier for that. What it may not do is name a ghost.
    //
    // The debrief's optional speaker is held to the same rule, and for the same reason — it renders
    // through the same plate at the other end of the mission.
    const npcIds = new Set((FIELD_MAPS[unitId]?.npcs || []).map((npc) => npc.id));
    for (const [sourceId, activity] of entriesOf(activities)) {
      if (activity.briefing) {
        expect(npcIds, `${sourceId} is briefed by an NPC not on this map`).toContain(
          activity.briefing.speaker
        );
      }
      if (activity.debrief?.speaker) {
        expect(npcIds, `${sourceId} is debriefed by an NPC not on this map`).toContain(
          activity.debrief.speaker
        );
      }
    }
  });

  it.each(AUTHORED_UNITS)("$unitId says what each mission is asking", ({ activities }) => {
    // "Make the task obvious, make the answer require judgment." The obvious half is one sentence,
    // and a mission that cannot state its own question in one sentence usually does not have one.
    for (const [sourceId, activity] of entriesOf(activities)) {
      expect(activity.missionQuestion, `${sourceId} states no mission question`).toBeTruthy();
      expect(
        activity.missionQuestion.trim().endsWith("?"),
        `${sourceId}'s mission question is not a question`
      ).toBe(true);
    }
  });

  it.each(AUTHORED_UNITS)("$unitId ends by saying what it could not settle", ({ activities }) => {
    // A debrief that only reports what was proved teaches that investigation ends in certainty.
    // `remains` is where a mission admits the edge of its own record, and it is required by the
    // schema — asserted here because the reason is pedagogy rather than shape.
    for (const [sourceId, activity] of entriesOf(activities)) {
      expect(activity.debrief?.established, `${sourceId} has no debrief`).toBeTruthy();
      expect(activity.debrief.remains, `${sourceId} settles everything`).toBeTruthy();
    }
  });

  it.each(AUTHORED_UNITS)("$unitId labels its own fiction", ({ activities }) => {
    // The historical-fiction policy, enforced. Chronicle invents composite people, writes probable
    // conversations and runs the whole thing inside a time-travel frame; the defence of doing that
    // is being explicit at the end, per mission, rather than in a disclaimer nobody reads.
    //
    // `documented` and `fiction` are what every Chronicle mission has by construction — real
    // history, and a Chronicler standing in it — so both are required and neither may be empty.
    for (const [sourceId, activity] of entriesOf(activities)) {
      const record = activity.historicalRecord;
      expect(record, `${sourceId} does not separate history from fiction`).toBeTruthy();
      expect(
        record.documented?.length,
        `${sourceId} rests on nothing documented`
      ).toBeGreaterThanOrEqual(1);
      expect(
        record.fiction?.length,
        `${sourceId} does not own its Chronicle fiction`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(AUTHORED_UNITS)("$unitId files every mission into the Codex", ({ activities }) => {
    // The Codex is what survives leaving a case, and a mission with no `codexFiling` leaves nothing
    // behind — it is played, finished, and forgotten by the only screen that spans the course.
    for (const [sourceId, activity] of entriesOf(activities)) {
      expect(activity.codexFiling?.summary, `${sourceId} files nothing to the Codex`).toBeTruthy();
      expect(
        activity.codexFiling.tags?.length,
        `${sourceId} is filed with no tags`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("makes every Codex tag a connection rather than a label", () => {
    // A tag carried by exactly one activity can never appear in the Codex's cross-references, so it
    // is decoration — and, much more often, it is a typo of a tag that does connect ("Who does the
    // work" against "Who did the work"). Both failures are silent at runtime: the archive simply
    // shows one fewer thread than the author thought they had wired.
    //
    // Deliberately checked across all authored units at once rather than per unit. A thread that
    // only ever runs inside one case is legal; a thread with one end is not.
    const uses = new Map();
    for (const { activities } of AUTHORED_UNITS) {
      for (const [, activity] of entriesOf(activities)) {
        for (const tag of activity.codexFiling?.tags || []) {
          uses.set(tag, (uses.get(tag) || 0) + 1);
        }
      }
    }
    const orphans = [...uses.entries()].filter(([, count]) => count < 2).map(([tag]) => tag);
    expect(
      orphans,
      "a Codex tag used by one activity connects nothing — tag both ends of the thread, or drop it"
    ).toEqual([]);
  });

  it("points `seeAlso` at activities that exist", () => {
    // An unresolvable pointer is silent by design — codexSeeAlso() drops anything not filed, which
    // is what stops it spoiling a mission the player has not reached, and which also means a typo
    // here never surfaces. So it surfaces at build time instead.
    const known = new Set(
      AUTHORED_UNITS.flatMap(({ activities }) =>
        entriesOf(activities).map(([, activity]) => activity.id)
      )
    );
    for (const { activities } of AUTHORED_UNITS) {
      for (const [sourceId, activity] of entriesOf(activities)) {
        for (const target of activity.codexFiling?.seeAlso || []) {
          expect(
            known,
            `${sourceId} points seeAlso at "${target}", which is not an activity`
          ).toContain(target);
          expect(target, `${sourceId} points seeAlso at itself`).not.toBe(activity.id);
        }
      }
    }
  });

  it.each(AUTHORED_UNITS)(
    "$unitId closes its arc wherever the player ends it",
    ({ activities, sources }) => {
      // The arc close rides the debrief of whichever mission is finished last, gated by the host on
      // the whole case being in the Codex. So it has to be authored on every mission that *can* be
      // last, and which those are is a fact about the records rather than the activities: a record
      // named by another record's `requiresSourceId` always precedes it and can never be the ending.
      //
      // Riverbend gates one of three (the letter needs the charter), so its charter is exempt and its
      // other two must carry one. Philadelphia gates nothing, so all three must. Authoring it on one
      // and shipping is the bug this exists to catch, and it is silent — a player who finished in the
      // other order simply gets no ending and has no way to know they were owed one.
      const required = new Set(sources.map((source) => source.requiresSourceId).filter(Boolean));
      const canBeLast = entriesOf(activities).filter(([sourceId]) => !required.has(sourceId));
      const closers = entriesOf(activities).filter(([, activity]) => activity.arcClose);
      // A unit that closes no arc at all is legal — Unit 1 predates the field — so the rule only
      // binds once one mission in the unit has one.
      if (!closers.length) return;
      for (const [sourceId, activity] of canBeLast) {
        expect(
          activity.arcClose?.established,
          `${sourceId} can be last and closes nothing`
        ).toBeTruthy();
      }
      // Deliberately *not* asserting the closers are byte-identical. They have to mean the same
      // thing, which is a different requirement: Riverbend's two say the same argument with the
      // record you are standing in moved to the end of the list, and that is a real authorial choice
      // rather than drift. Philadelphia buys the guarantee structurally instead — all three read
      // `established` from one const in the content file, so there is nothing here left to check.
    }
  );

  it("says the same thing at both of Riverbend's two endings", () => {
    // The specific pin for the case that has two authored wordings of one claim. What must survive
    // an edit to either is the claim, not the sentence order.
    const claim = (text) => text.replace(/\s+/g, " ").trim();
    for (const sourceId of ["riverbend-letter", "riverbend-ledger"]) {
      expect(claim(UNIT_02_ACTIVITIES[sourceId].arcClose.established), sourceId).toContain(
        "one arrangement described by three people who each thought they were recording something else"
      );
    }
  });

  it("plants at most one anomaly per unit", () => {
    // An anomaly is the frame's own plot leaking into a historical record, and its whole force is
    // scarcity. Two per map and it is a collectible; one per map and it is a thing that happened.
    for (const { unitId, activities } of AUTHORED_UNITS) {
      const flagged = entriesOf(activities).filter(([, activity]) => activity.anomaly);
      expect(flagged.length, `${unitId} flags ${flagged.length} anomalies`).toBeLessThanOrEqual(1);
    }
  });

  it("keeps a lead on an answer the player can actually earn", () => {
    // A lead only renders once its answer is in the Field Notebook, and only an *authored* answer
    // can be logged at all — a fallback is a stage direction. A lead on an unauthored pair would be
    // permanently unreachable, which is the same family of dead content as Phase 71's `fallback`
    // and Phase 72's unprinted `note`.
    for (const { activities } of AUTHORED_UNITS) {
      for (const [sourceId, activity] of ofKind(activities, "interview")) {
        for (const speaker of activity.speakers) {
          for (const [questionId, answer] of Object.entries(speaker.answers || {})) {
            if (!answer.lead) continue;
            expect(
              answer.useful,
              `${sourceId}: ${speaker.id}'s lead on "${questionId}" hangs off an answer worth nothing, so a player has no reason to keep it`
            ).toBe(true);
          }
        }
      }
    }
  });

  it("keeps `variant` a label, with no engine branching on it", () => {
    // `variant` names a mission's shape inside its engine family — "Ask the Right Question", "Follow
    // the Shipment". The registry's whole value is that adding an engine is one more entry in
    // index.js, and a second dispatch axis ends that: behaviour differences have to come from the
    // other optional fields content sets, never from this string.
    //
    // Cheap to state as a rule and cheap to break by accident, so it is a test. See
    // docs/design/CHRONICLE-VOCABULARY.md §3.
    // Resolved off the repo root rather than import.meta.url: Vitest rewrites that to a non-file
    // URL and readdirSync rejects it.
    const dir = join(process.cwd(), "apps/web/src/engine/activities");
    const offenders = readdirSync(dir)
      .filter((file) => file.endsWith(".js"))
      .filter((file) => /\bvariant\s*(===|!==|==|!=)/.test(readFileSync(join(dir, file), "utf8")));
    expect(offenders, "an engine is branching on `variant`").toEqual([]);
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

  it.each(AUTHORED_UNITS)("$unitId leaves every speaker's fallback reachable", ({ activities }) => {
    // This assertion used to say the opposite — that every speaker answers every question — and
    // holding to it is what made both interviews unplayable in the way the Phase 71 playtest found.
    // With a full grid, asking everyone everything is strictly dominant, `fallback` is unreachable
    // dead content on all fifteen speakers, and reading a person's position buys nothing.
    //
    // A speaker now answers some of the questions and not others. The one they do not answer is
    // where their authored fallback finally fires, which is the game's whole "that is not my job"
    // register. At least two answers, so nobody is a one-line vending machine; at least one gap.
    for (const [sourceId, activity] of ofKind(activities, "interview")) {
      const total = activity.questions.length;
      for (const speaker of activity.speakers) {
        const answered = Object.keys(speaker.answers || {}).length;
        expect(answered, `${sourceId}: ${speaker.id} answers too few`).toBeGreaterThanOrEqual(2);
        expect(answered, `${sourceId}: ${speaker.id} has no unanswered question`).toBeLessThan(
          total
        );
      }
    }
  });

  it.each(AUTHORED_UNITS)("$unitId keeps its deflections short", ({ activities }) => {
    // The useful answer is the long one and the mission is finding it. When a flat answer runs as
    // long as a useful one — Unit 2 shipped at 31 words a flat answer against 73 useful — the
    // player cannot feel the difference and logs everything. 40 words is a ceiling, not a target;
    // the shipped flats sit around 15.
    for (const [sourceId, activity] of ofKind(activities, "interview")) {
      for (const speaker of activity.speakers) {
        for (const [questionId, answer] of Object.entries(speaker.answers || {})) {
          if (answer.useful === true) continue;
          const words = answer.text.trim().split(/\s+/).length;
          expect(words, `${sourceId}: ${speaker.id}/${questionId} is ${words} words`).toBeLessThan(
            40
          );
        }
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

  it("asks how far the record carries every single leg (normal case)", () => {
    // This assertion replaced one requiring `not-established` to be the *effect* of exactly one leg
    // (Phase 76, decision log `0059`). That shape taught a meta-rule rather than a skill: a chain
    // needs one leg keyed to "not shown" or the idea goes untaught, and a player who spots that is
    // finding the odd one out, not weighing evidence. The judgement is on every leg now.
    expect(ONE_HOGSHEAD.supportLevels?.length, "the trace asks only one question").toBeGreaterThan(
      1
    );
    for (const leg of ONE_HOGSHEAD.legs) {
      expect(
        leg.support,
        `leg "${leg.id}" is not asked how far the record carries it`
      ).toBeTruthy();
    }
  });

  it("keeps the true-but-unsourced reading reachable, and unsupported (edge case)", () => {
    // The guard rail this replaced said: `labor-cost` is offered on all four legs and is the answer
    // to none of them, because bound labor did produce this cargo — the player interviewed the
    // people two records earlier — and a wharf account that opens at the landing cannot establish
    // it. Its warning was that a well-meaning edit "fixing" leg 1 would delete the point.
    //
    // The split axis keeps that point and stops hiding it behind an unavailable answer. Leg 1's
    // effect *is* now `labor-cost` — true, and the player says so — and its support is the level
    // meaning the page does not show it. Being right about the world and wrong about the evidence
    // is now a thing the player can state in two moves rather than a trap they avoid in one.
    const first = ONE_HOGSHEAD.legs[0];
    expect(first.effect).toBe("labor-cost");
    expect(first.support).toBe("not-shown");
  });

  it("uses more than one support level, and does not use one only once (normal case)", () => {
    // An axis where every leg answers the same way is a formality. An axis where one level is the
    // answer exactly once is the odd-one-out puzzle this design replaced, rebuilt on the new field.
    const used = ONE_HOGSHEAD.legs.map((leg) => leg.support);
    expect(new Set(used).size, "every leg gives the same support answer").toBeGreaterThan(1);
    expect(new Set(used).size, "the support axis is one leg against the rest").toBeGreaterThan(2);
  });

  it("keeps a standing distractor that is the answer to no leg (normal case)", () => {
    // With four legs and four live effects the board is solvable by elimination. `planter-choice`
    // is the intuitive reading of a consignment — the man who grew it decides where it sells — and
    // it is exactly what the arrangement takes away from him.
    const answered = new Set(ONE_HOGSHEAD.legs.map((leg) => leg.effect));
    const unused = ONE_HOGSHEAD.effects.filter((effect) => !answered.has(effect.id));
    expect(
      unused.length,
      "every effect is some leg's answer — the chain solves by elimination"
    ).toBeGreaterThanOrEqual(1);
  });
});
