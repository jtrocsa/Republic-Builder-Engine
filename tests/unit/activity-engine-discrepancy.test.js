// DISCREPANCY's second question — "is that gap an error or a design?" — is the
// whole engine, and it must never be shown for a claim whose verdict the player
// has not yet landed, because seeing it asked is itself the answer to the first
// question. That gating is pinned here, along with the observation column's
// `requires` token, which is how one player's earlier work changes what they
// have to audit with.
import { describe, expect, it } from "vitest";
import {
  DiscrepancyActivitySchema,
  actDiscrepancy,
  claimStatus,
  defaultDiscrepancyState,
  discrepancyOutcome,
  discrepancySettled,
  isDiscrepancyComplete,
  renderDiscrepancy,
} from "../../apps/web/src/engine/activities/discrepancy.js";

const activity = () => ({
  kind: "discrepancy",
  id: "test-discrepancy",
  title: "The letter",
  intro: "Check it.",
  record: { label: "A letter home", attribution: "The captain, 1493" },
  verdicts: [
    { id: "supported", label: "Supported" },
    { id: "contradicted", label: "Contradicted" },
    { id: "cannot", label: "Cannot tell" },
  ],
  gapRequiredFor: "contradicted",
  gapKinds: [
    { id: "error", label: "An error" },
    { id: "design", label: "A design" },
  ],
  claims: [
    {
      id: "harbours",
      text: "The harbours are deep and safe.",
      verdict: "supported",
      gap: null,
      why: "You walked the anchorage yourself.",
    },
    {
      id: "empty",
      text: "The land lies empty and unworked.",
      verdict: "contradicted",
      gap: "design",
      why: "He needed unclaimed land more than he needed an accurate one.",
    },
  ],
  observed: [
    { id: "anchorage", text: "Deep water at the point.", requires: null },
    { id: "conuco", text: "Cassava in worked rows.", from: "Gardener", requires: "asked:grows" },
  ],
  closer: {
    prompt: "File it.",
    skillCategory: "sourcing",
    options: [
      { id: "purpose", text: "Written to persuade", correct: true, why: "Right." },
      {
        id: "mistake",
        text: "An honest mistake",
        correct: false,
        why: "He says otherwise himself.",
      },
    ],
  },
});

const settled = () => {
  const a = activity();
  let state = defaultDiscrepancyState();
  state = actDiscrepancy(a, state, { type: "verdict", claim: "harbours", verdict: "supported" });
  state = actDiscrepancy(a, state, { type: "verdict", claim: "empty", verdict: "contradicted" });
  state = actDiscrepancy(a, state, { type: "gap", claim: "empty", gap: "design" });
  return state;
};

describe("DiscrepancyActivitySchema", () => {
  it("accepts a well-formed audit (normal case)", () => {
    expect(DiscrepancyActivitySchema.safeParse(activity()).success).toBe(true);
  });

  it("rejects a claim whose verdict was never authored (edge case)", () => {
    const broken = activity();
    broken.claims[0].verdict = "maybe";
    const result = DiscrepancyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes('unknown verdict "maybe"'))).toBe(
      true
    );
  });

  it("rejects a failing claim with no gap kind (boundary case)", () => {
    const broken = activity();
    broken.claims[1].gap = null;
    const result = DiscrepancyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("requires a gap kind"))).toBe(true);
  });

  it("rejects a gap kind on a claim that will never be asked for one (edge case)", () => {
    // Authored but unreachable content is worse than missing content: it reads
    // as done and never appears.
    const broken = activity();
    broken.claims[0].gap = "error";
    const result = DiscrepancyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("never asks for one"))).toBe(true);
  });

  it("rejects a gapRequiredFor that is not one of the verdicts (edge case)", () => {
    const broken = activity();
    broken.gapRequiredFor = "wrong";
    const result = DiscrepancyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(
      result.error.issues.some((i) => i.message.includes("not one of the authored verdicts"))
    ).toBe(true);
  });
});

describe("claimStatus — when the gap question opens", () => {
  it("stays shut while the verdict is wrong (regression case)", () => {
    // Showing "error or design?" for a claim the player marked supported would
    // tell them their verdict was wrong before they earned it.
    const state = actDiscrepancy(activity(), defaultDiscrepancyState(), {
      type: "verdict",
      claim: "empty",
      verdict: "supported",
    });
    const status = claimStatus(activity(), activity().claims[1], state);
    expect(status.verdictRight).toBe(false);
    expect(status.gapOpen).toBe(false);
  });

  it("opens once the failing verdict is landed (normal case)", () => {
    const state = actDiscrepancy(activity(), defaultDiscrepancyState(), {
      type: "verdict",
      claim: "empty",
      verdict: "contradicted",
    });
    expect(claimStatus(activity(), activity().claims[1], state).gapOpen).toBe(true);
  });

  it("never opens for a claim whose right verdict does not call for one (boundary case)", () => {
    const state = actDiscrepancy(activity(), defaultDiscrepancyState(), {
      type: "verdict",
      claim: "harbours",
      verdict: "supported",
    });
    const status = claimStatus(activity(), activity().claims[0], state);
    expect(status.gapOpen).toBe(false);
    expect(status.settled).toBe(true);
  });
});

describe("actDiscrepancy", () => {
  it("changing a verdict abandons the gap chosen under the old one (regression case)", () => {
    // Otherwise a stale answer survives to a question no longer on screen and
    // the claim reads as settled the moment the verdict is re-landed.
    let state = settled();
    expect(state.gaps.empty).toBe("design");
    state = actDiscrepancy(activity(), state, {
      type: "verdict",
      claim: "empty",
      verdict: "cannot",
    });
    expect(state.gaps.empty).toBeUndefined();
  });

  it("ignores a gap answer for a claim whose gap question is shut (regression case)", () => {
    const before = defaultDiscrepancyState();
    const after = actDiscrepancy(activity(), before, {
      type: "gap",
      claim: "empty",
      gap: "design",
    });
    expect(after).toBe(before);
  });

  it("refuses to file until every claim is settled (boundary case)", () => {
    const partial = actDiscrepancy(activity(), defaultDiscrepancyState(), {
      type: "verdict",
      claim: "harbours",
      verdict: "supported",
    });
    expect(actDiscrepancy(activity(), partial, { type: "file", option: "purpose" }).filed).toBe(
      null
    );
    expect(discrepancySettled(activity(), settled())).toBe(true);
    expect(actDiscrepancy(activity(), settled(), { type: "file", option: "purpose" }).filed).toBe(
      "purpose"
    );
  });
});

describe("isDiscrepancyComplete / discrepancyOutcome", () => {
  it("needs every claim settled and a correctly filed closer (boundary case)", () => {
    const state = settled();
    expect(isDiscrepancyComplete(activity(), state)).toBe(false);
    const right = actDiscrepancy(activity(), state, { type: "file", option: "purpose" });
    expect(isDiscrepancyComplete(activity(), right)).toBe(true);
    expect(discrepancyOutcome(activity(), right).findings).toHaveLength(2);
  });

  // Spine Review Part 7. A filed record does not get re-filed. `file` used to overwrite
  // `state.filed` unconditionally once the board was settled, so reopening a finished mission from
  // the Mission Tracker and clicking a wrong option un-finished it — while the Codex, which
  // deliberately never unfiles, kept the entry it had already written.
  it("refuses a second conclusion once the record is filed (regression case)", () => {
    const board = settled();
    // The wrong option lands while the record is open, which is what makes the refusal below a
    // refusal rather than an unknown id being dropped on the floor.
    expect(actDiscrepancy(activity(), board, { type: "file", option: "mistake" }).filed).toBe(
      "mistake"
    );

    const filed = actDiscrepancy(activity(), board, { type: "file", option: "purpose" });
    expect(isDiscrepancyComplete(activity(), filed)).toBe(true);
    // Identity, not merely equality: the host re-renders only when a reducer returns a new object.
    expect(actDiscrepancy(activity(), filed, { type: "file", option: "mistake" })).toBe(filed);
  });

  // P8-1. Closing the closer left the verdict buttons open, and one flipped verdict un-settles a
  // filed audit — isDiscrepancyComplete() goes false on a record the Codex never unfiles.
  it("refuses every board verb once the record is filed (regression case)", () => {
    const a = activity();
    const filed = actDiscrepancy(a, settled(), { type: "file", option: "purpose" });
    expect(isDiscrepancyComplete(a, filed)).toBe(true);

    // The verb lands while the record is open, so the refusals below are refusals.
    const flipped = actDiscrepancy(a, settled(), {
      type: "verdict",
      claim: "harbours",
      verdict: "contradicted",
    });
    expect(flipped.verdicts.harbours).toBe("contradicted");

    for (const action of [
      { type: "verdict", claim: "harbours", verdict: "contradicted" },
      { type: "gap", claim: "empty", gap: "mistake" },
    ]) {
      expect(actDiscrepancy(a, filed, action)).toBe(filed);
    }
    expect(isDiscrepancyComplete(a, filed)).toBe(true);
  });
});

describe("renderDiscrepancy — the observation column", () => {
  it("hides an observation whose token the player does not hold (normal case)", () => {
    const markup = renderDiscrepancy(activity(), defaultDiscrepancyState(), { holds: [] });
    expect(markup).toContain("You did not gather this.");
    expect(markup).not.toContain("Cassava in worked rows.");
  });

  it("shows it once the token is held (normal case)", () => {
    // This is the cause-and-effect hook: what the player asked elsewhere
    // changes what they can audit the record against.
    const markup = renderDiscrepancy(activity(), defaultDiscrepancyState(), {
      holds: ["asked:grows"],
    });
    expect(markup).toContain("Cassava in worked rows.");
  });

  it("always shows an observation with no token (boundary case)", () => {
    expect(renderDiscrepancy(activity(), defaultDiscrepancyState())).toContain(
      "Deep water at the point."
    );
  });

  it("counts what the player is actually holding in the column heading (normal case)", () => {
    // The nudge that says go back and ask more. Without it the missing rows read
    // as content that failed to load.
    expect(renderDiscrepancy(activity(), defaultDiscrepancyState(), { holds: [] })).toContain(
      "1 of 2"
    );
    expect(
      renderDiscrepancy(activity(), defaultDiscrepancyState(), { holds: ["asked:grows"] })
    ).toContain("2 of 2");
  });

  it("withholds a claim's `why` until it is settled (normal case)", () => {
    const before = renderDiscrepancy(activity(), defaultDiscrepancyState());
    expect(before).not.toContain("He needed unclaimed land");
    expect(renderDiscrepancy(activity(), settled())).toContain("He needed unclaimed land");
  });
});

describe("renderDiscrepancy — the record itself", () => {
  const documented = () => {
    const content = activity();
    content.record.context = "The captain is writing to the treasurer who paid for the voyage.";
    content.record.text = ["“The harbours are deep and safe.”", "“The land lies empty.”"];
    content.verdictPrompt = "Does what you gathered support this, contradict it, or neither?";
    return content;
  };

  it("prints the context, the passage and the standing instruction (normal case)", () => {
    // All three were missing on the first playtest, which reported not knowing
    // who the writer was or what the three buttons were comparing against.
    const markup = renderDiscrepancy(documented(), defaultDiscrepancyState());
    expect(markup).toContain("the treasurer who paid for the voyage");
    expect(markup).toContain("activity-transcript");
    expect(markup).toContain("“The land lies empty.”");
    expect(markup).toContain("Does what you gathered support this");
  });

  it("renders without them, exactly as before (boundary case)", () => {
    const markup = renderDiscrepancy(activity(), defaultDiscrepancyState());
    expect(markup).not.toContain("activity-transcript");
    expect(markup).not.toContain("activity-verdict-prompt");
    expect(markup).toContain("A letter home");
  });

  it("escapes an authored transcript (regression case)", () => {
    const hostile = documented();
    hostile.record.text = ['<script>alert("x")</script>'];
    const markup = renderDiscrepancy(hostile, defaultDiscrepancyState());
    expect(markup).toContain("&lt;script&gt;");
    expect(markup).not.toContain("<script>");
  });

  it("says something when a verdict misses, and nothing before one is given (normal case)", () => {
    // Phase 110. A wrong verdict turned the pressed button red and said nothing at all, while the
    // claim's own `why` waited until the player was already right — so the only feedback on the way
    // to an answer was a colour. This engine and TRACE are eleven of the twenty-four missions.
    const content = activity();
    expect(renderDiscrepancy(content, defaultDiscrepancyState())).not.toContain(
      "activity-reconsider"
    );

    const wrong = actDiscrepancy(content, defaultDiscrepancyState(), {
      type: "verdict",
      claim: "harbours",
      verdict: "contradicted",
    });
    expect(renderDiscrepancy(content, wrong)).toContain("activity-reconsider");

    const right = actDiscrepancy(content, wrong, {
      type: "verdict",
      claim: "harbours",
      verdict: "supported",
    });
    expect(renderDiscrepancy(content, right)).not.toContain("activity-reconsider");
  });
});
