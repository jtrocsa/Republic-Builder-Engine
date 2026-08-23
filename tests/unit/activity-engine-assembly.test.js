// ASSEMBLY replaced the ten-piece map jigsaw, which was welded to one source
// id, had no keyboard path, and said nothing when a piece went in the wrong
// slot. All three of those are pinned here: the board comes from content, the
// select-then-place path works without a drag event, and a misplaced fragment
// surfaces its `misread`.
import { describe, expect, it } from "vitest";
import {
  AssemblyActivitySchema,
  actAssembly,
  assemblyFindings,
  assemblyOutcome,
  boardOpen,
  boardStatus,
  defaultAssemblyState,
  fragmentNote,
  isAssemblyComplete,
  renderAssembly,
} from "../../apps/web/src/engine/activities/assembly.js";

const activity = () => ({
  kind: "assembly",
  id: "test-assembly",
  title: "Two halves",
  intro: "Rebuild it.",
  boards: [
    {
      id: "sheet",
      kind: "image",
      label: "The torn sheet",
      image: "sheet-scan",
      columns: 2,
      rows: 1,
      slots: [
        { id: "left", label: "Left half", row: 0, col: 0 },
        { id: "right", label: "Right half", row: 0, col: 1 },
      ],
      fragments: [
        { id: "west", label: "West", belongs: "left", misread: "The coastline runs the same way." },
        { id: "east", label: "East", belongs: "right", misread: "Both edges are torn alike." },
      ],
    },
    {
      id: "cartouches",
      kind: "label",
      label: "The blank cartouches",
      slots: [
        { id: "upper", label: "Upper cartouche" },
        { id: "lower", label: "Lower cartouche" },
      ],
      fragments: [
        { id: "america", label: "America", belongs: "upper", misread: "It is the newer name." },
        { id: "asia", label: "Asia", belongs: "lower", misread: "The old charts put it here." },
      ],
    },
  ],
  closer: {
    prompt: "What can it evidence?",
    skillCategory: "sourcing",
    options: [
      { id: "knowledge", text: "Changing knowledge", correct: true, why: "Right." },
      { id: "daily", text: "Daily life", correct: false, why: "It shows no one living." },
    ],
  },
});

const solved = () => {
  let state = defaultAssemblyState();
  const a = activity();
  state = actAssembly(a, state, { type: "place", board: "sheet", slot: "left", fragment: "west" });
  state = actAssembly(a, state, { type: "place", board: "sheet", slot: "right", fragment: "east" });
  state = actAssembly(a, state, {
    type: "place",
    board: "cartouches",
    slot: "upper",
    fragment: "america",
  });
  state = actAssembly(a, state, {
    type: "place",
    board: "cartouches",
    slot: "lower",
    fragment: "asia",
  });
  return state;
};

describe("AssemblyActivitySchema", () => {
  it("accepts a well-formed multi-board assembly (normal case)", () => {
    expect(AssemblyActivitySchema.safeParse(activity()).success).toBe(true);
  });

  it("rejects two fragments claiming the same slot (edge case)", () => {
    const broken = activity();
    broken.boards[0].fragments[1].belongs = "left";
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(
      result.error.issues.some((i) => i.message.includes("exactly one valid configuration"))
    ).toBe(true);
  });

  it("rejects a slot no fragment belongs in (boundary case)", () => {
    const broken = activity();
    broken.boards[1].fragments[1].belongs = "upper";
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("could never be completed"))).toBe(
      true
    );
  });

  it("rejects an image board whose slots have no grid position (edge case)", () => {
    const broken = activity();
    delete broken.boards[0].slots[0].col;
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("row and col"))).toBe(true);
  });

  it("accepts a distractor that belongs in no slot (normal case)", () => {
    // Without distractors a label board is a matching exercise whose answer is
    // implied by the count. `belongs: null` is what makes the choice real.
    const withDecoy = activity();
    withDecoy.boards[1].fragments.push({
      id: "vespucci",
      label: "Vespucci",
      belongs: null,
      misread:
        "His account is why the land is named at all — but the cartouche takes the name, not the man.",
    });
    expect(AssemblyActivitySchema.safeParse(withDecoy).success).toBe(true);
  });

  it("counts a placed distractor as misplaced and surfaces its misread (normal case)", () => {
    const withDecoy = activity();
    withDecoy.boards[1].fragments.push({
      id: "vespucci",
      label: "Vespucci",
      belongs: null,
      misread: "The cartouche takes the name, not the man.",
    });
    const state = actAssembly(withDecoy, defaultAssemblyState(), {
      type: "place",
      board: "cartouches",
      slot: "upper",
      fragment: "vespucci",
    });
    const status = boardStatus(withDecoy.boards[1], state);
    expect(status.solved).toBe(false);
    expect(status.misplaced[0].fragment.id).toBe("vespucci");
    expect(renderAssembly(withDecoy, state)).toContain(
      "The cartouche takes the name, not the man."
    );
  });

  it("rejects an image board with no image key (edge case)", () => {
    const broken = activity();
    delete broken.boards[0].image;
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("needs an image key"))).toBe(true);
  });

  it("rejects opensAfter naming a board that does not exist (edge case)", () => {
    const broken = activity();
    broken.boards[1].opensAfter = "ghost";
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("unknown board"))).toBe(true);
  });

  it("rejects an opensAfter cycle (edge case)", () => {
    // Two boards each waiting on the other locks both forever, and does so
    // silently — the activity simply has no first move.
    const broken = activity();
    broken.boards[0].opensAfter = "cartouches";
    broken.boards[1].opensAfter = "sheet";
    const result = AssemblyActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("opensAfter cycle"))).toBe(true);
  });
});

describe("boardOpen — a board that waits on another", () => {
  const gated = () => {
    const content = activity();
    content.boards[1].opensAfter = "sheet";
    return content;
  };

  it("is closed until its prerequisite is solved, then open (normal case)", () => {
    const content = gated();
    expect(boardOpen(content, content.boards[1], defaultAssemblyState())).toBe(false);
    let state = actAssembly(content, defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    state = actAssembly(content, state, {
      type: "place",
      board: "sheet",
      slot: "right",
      fragment: "east",
    });
    expect(boardOpen(content, content.boards[1], state)).toBe(true);
  });

  it("refuses a placement on a closed board (regression case)", () => {
    // The rendered `disabled` is a hint. Without the reducer guard a fragment
    // dropped into a locked board still counted toward completion.
    const content = gated();
    const before = defaultAssemblyState();
    expect(
      actAssembly(content, before, {
        type: "place",
        board: "cartouches",
        slot: "upper",
        fragment: "america",
      })
    ).toBe(before);
  });

  it("says which board is holding it up (normal case)", () => {
    const content = gated();
    const markup = renderAssembly(content, defaultAssemblyState());
    expect(markup).toContain("is-locked");
    expect(markup).toContain("Finish The torn sheet first.");
  });
});

describe("actAssembly", () => {
  it("places a fragment named explicitly, as a drop does (normal case)", () => {
    const state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    expect(state.placed.sheet).toEqual({ left: "west" });
  });

  it("places whatever is selected when no fragment is named, as a keypress does (normal case)", () => {
    // The keyboard path the jigsaw never had: select, then place.
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "select",
      board: "sheet",
      fragment: "west",
    });
    expect(state.selected).toEqual({ board: "sheet", fragment: "west" });
    state = actAssembly(activity(), state, { type: "place", board: "sheet", slot: "left" });
    expect(state.placed.sheet).toEqual({ left: "west" });
    expect(state.selected).toBe(null);
  });

  it("selecting the held fragment again puts it down (edge case)", () => {
    // Otherwise the only way out of a selected state is to place it somewhere.
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "select",
      board: "sheet",
      fragment: "west",
    });
    state = actAssembly(activity(), state, { type: "select", board: "sheet", fragment: "west" });
    expect(state.selected).toBe(null);
  });

  it("moving a placed fragment lifts it from where it was (regression case)", () => {
    // Without the sweep a fragment occupied two slots at once and the board
    // could read as solved with pieces missing from the tray.
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    state = actAssembly(activity(), state, {
      type: "place",
      board: "sheet",
      slot: "right",
      fragment: "west",
    });
    expect(state.placed.sheet).toEqual({ right: "west" });
  });

  it("displaces the previous occupant back to the tray (boundary case)", () => {
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    state = actAssembly(activity(), state, {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "east",
    });
    expect(state.placed.sheet).toEqual({ left: "east" });
  });

  it("lifts a placed fragment back to the tray (normal case)", () => {
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    state = actAssembly(activity(), state, { type: "lift", board: "sheet", slot: "left" });
    expect(state.placed.sheet).toEqual({});
  });

  it("refuses to file until every board is solved (regression case)", () => {
    let state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    state = actAssembly(activity(), state, { type: "file", option: "knowledge" });
    expect(state.filed).toBe(null);
    expect(actAssembly(activity(), solved(), { type: "file", option: "knowledge" }).filed).toBe(
      "knowledge"
    );
  });
});

describe("boardStatus / isAssemblyComplete / assemblyOutcome", () => {
  it("reports a misplaced fragment against the slot it landed in (normal case)", () => {
    const state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "right",
      fragment: "west",
    });
    const status = boardStatus(activity().boards[0], state);
    expect(status.solved).toBe(false);
    expect(status.misplaced).toHaveLength(1);
    expect(status.misplaced[0].fragment.id).toBe("west");
  });

  it("needs every board solved and a correctly filed closer (boundary case)", () => {
    const state = solved();
    expect(isAssemblyComplete(activity(), state)).toBe(false);
    const wrong = actAssembly(activity(), state, { type: "file", option: "daily" });
    expect(isAssemblyComplete(activity(), wrong)).toBe(false);
    const right = actAssembly(activity(), state, { type: "file", option: "knowledge" });
    expect(isAssemblyComplete(activity(), right)).toBe(true);
    expect(assemblyOutcome(activity(), right).skillOutcomes).toEqual([
      { key: "test-assembly", skillCategory: "sourcing", correct: true },
    ]);
  });

  // Spine Review Part 7. A filed record does not get re-filed. `file` used to overwrite
  // `state.filed` unconditionally once the board was settled, so reopening a finished mission from
  // the Mission Tracker and clicking a wrong option un-finished it — while the Codex, which
  // deliberately never unfiles, kept the entry it had already written.
  it("refuses a second conclusion once the record is filed (regression case)", () => {
    const board = solved();
    // The wrong option lands while the record is open, which is what makes the refusal below a
    // refusal rather than an unknown id being dropped on the floor.
    expect(actAssembly(activity(), board, { type: "file", option: "daily" }).filed).toBe("daily");

    const filed = actAssembly(activity(), board, { type: "file", option: "knowledge" });
    expect(isAssemblyComplete(activity(), filed)).toBe(true);
    // Identity, not merely equality: the host re-renders only when a reducer returns a new object.
    expect(actAssembly(activity(), filed, { type: "file", option: "daily" })).toBe(filed);
  });

  // P8-1. Closing the closer left `lift` open, and lifting one fragment out of a filed
  // reconstruction un-solves its board — isAssemblyComplete() goes false on a record the Codex has
  // already written and deliberately never unfiles.
  it("refuses every board verb once the record is filed (regression case)", () => {
    const a = activity();
    const filed = actAssembly(a, solved(), { type: "file", option: "knowledge" });
    expect(isAssemblyComplete(a, filed)).toBe(true);

    // The verb lands while the record is open, so the refusals below are refusals.
    const lifted = actAssembly(a, solved(), {
      type: "lift",
      board: "sheet",
      slot: "left",
      fragment: "west",
    });
    expect(lifted).not.toBe(solved());

    for (const action of [
      { type: "lift", board: "sheet", slot: "left", fragment: "west" },
      { type: "select", board: "sheet", fragment: "west" },
      { type: "release", finding: assemblyFindings(a, filed)[0]?.id },
    ]) {
      expect(actAssembly(a, filed, action)).toBe(filed);
    }
    expect(isAssemblyComplete(a, filed)).toBe(true);
  });
});

describe("renderAssembly", () => {
  it("cuts an image board into positioned tiles from the grid (normal case)", () => {
    const markup = renderAssembly(activity(), solved(), { images: { "sheet-scan": "/scan.jpg" } });
    expect(markup).toContain("background-image:url('/scan.jpg')");
    expect(markup).toContain("background-size:200% 100%");
    expect(markup).toContain("background-position:0.000% 0.000%");
    expect(markup).toContain("background-position:100.000% 0.000%");
  });

  it("surfaces the misread for a fragment in the wrong slot (normal case)", () => {
    const state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "right",
      fragment: "west",
    });
    expect(renderAssembly(activity(), state)).toContain("The coastline runs the same way.");
  });

  it("still renders a playable board when the host supplies no image (edge case)", () => {
    const markup = renderAssembly(activity(), solved());
    expect(markup).not.toContain("background-image");
    expect(markup).toContain('data-activity-action="lift"');
  });

  it("keeps a label board's captions and drops an image board's (normal case)", () => {
    // A text tile with no label is a blank button; a picture tile with one has a
    // pill of engraver's jargon sitting on the art it is meant to help you read.
    const markup = renderAssembly(activity(), solved(), { images: { "sheet-scan": "/scan.jpg" } });
    expect(markup).toContain(">America<");
    expect(markup).not.toContain(">West<");
    // Still named for a screen reader, which is the whole reason `label` stays
    // required on an unlabelled board.
    expect(markup).toContain('aria-label="Left half — holding West"');
  });

  it("shows an image board's labels when the board asks for them (boundary case)", () => {
    const trained = activity();
    trained.boards[0].showFragmentLabels = true;
    expect(renderAssembly(trained, solved())).toContain(">West<");
  });

  it("names a misplaced image tile by the slot it landed in (regression case)", () => {
    // Its own label is not on screen on an unlabelled board, so naming the piece
    // by it described something the player cannot see. The red slot is what they
    // are looking at.
    const state = actAssembly(activity(), defaultAssemblyState(), {
      type: "place",
      board: "sheet",
      slot: "right",
      fragment: "west",
    });
    const misread = renderAssembly(activity(), state).match(
      /<ul class="activity-misread">.*?<\/ul>/s
    )[0];
    expect(misread).toContain("Right half");
    expect(misread).not.toContain("West");
  });

  it("does not emit NaN when a board omits its grid size (regression case)", () => {
    // validate-content.js discards Zod's parsed output, so the schema's
    // .default(1) on columns/rows never reaches runtime. Before the guard an
    // omitted `columns` gave every tile background-size:NaN% and the board
    // rendered blank.
    const bare = activity();
    delete bare.boards[0].columns;
    delete bare.boards[0].rows;
    expect(renderAssembly(bare, solved())).not.toContain("NaN");
  });
});

// The hint ladder (Phase 76, decision log 0059). `misread` is the best writing on an assembly
// board and it used to fire the instant a piece landed wrong — all of them at once, at the moment
// a player is least able to read them. `hints` puts a short nudge first.
describe("ASSEMBLY's hint ladder", () => {
  const laddered = () => {
    const a = activity();
    a.boards[1].fragments[0].hints = ["Look at the slot again.", "One of these names is newer."];
    return a;
  };

  const misplace = (a, times) => {
    let state = defaultAssemblyState();
    for (let i = 0; i < times; i += 1) {
      state = actAssembly(a, state, {
        type: "place",
        board: "cartouches",
        slot: "lower",
        fragment: "america",
      });
    }
    return state;
  };

  it("counts a wrong placement and leaves a right one uncounted (normal case)", () => {
    const a = laddered();
    const wrong = misplace(a, 2);
    expect(wrong.attempts.cartouches.america).toBe(2);
    const right = actAssembly(a, wrong, {
      type: "place",
      board: "cartouches",
      slot: "upper",
      fragment: "america",
    });
    // Not reset, either: lifting a piece out and putting it back should not walk the player back
    // down to the first rung.
    expect(right.attempts.cartouches.america).toBe(2);
  });

  it("climbs the ladder one wrong placement at a time (normal case)", () => {
    const a = laddered();
    expect(fragmentNote(a.boards[1].fragments[0], 1)).toBe("Look at the slot again.");
    expect(fragmentNote(a.boards[1].fragments[0], 2)).toBe("One of these names is newer.");
    expect(fragmentNote(a.boards[1].fragments[0], 3)).toBe("It is the newer name.");
    expect(fragmentNote(a.boards[1].fragments[0], 9)).toBe("It is the newer name.");
  });

  it("goes straight to the misread for a fragment with no hints (regression case)", () => {
    // Every fragment shipped before this phase, and the reason the field is optional.
    expect(fragmentNote(activity().boards[1].fragments[0], 1)).toBe("It is the newer name.");
    const markup = renderAssembly(activity(), misplace(activity(), 1));
    expect(markup).toContain("It is the newer name.");
    expect(markup).not.toContain("is-hint");
  });

  it("renders the rung the player has reached, marked as a hint until the last (normal case)", () => {
    const a = laddered();
    const first = renderAssembly(a, misplace(a, 1));
    expect(first).toContain("Look at the slot again.");
    expect(first).not.toContain("It is the newer name.");
    expect(first).toContain('<li class="is-hint">');

    const third = renderAssembly(a, misplace(a, 3));
    expect(third).toContain("It is the newer name.");
    expect(third).not.toContain('<li class="is-hint">');
  });

  it("reads a save written before the ladder existed as attempt zero (regression case)", () => {
    // ensureSourceActivity() never rewrites an existing state object, so a pre-Phase-76 save has no
    // `attempts` key. That reads as zero, which lands on the gentlest rung rather than throwing.
    const a = laddered();
    const old = { placed: { cartouches: { lower: "america" } }, selected: null, filed: null };
    expect(() => renderAssembly(a, old)).not.toThrow();
    expect(renderAssembly(a, old)).toContain("Look at the slot again.");
  });

  it("caps the ladder at two rungs (edge case)", () => {
    const tooLong = activity();
    tooLong.boards[1].fragments[0].hints = ["one", "two", "three"];
    const result = AssemblyActivitySchema.safeParse(tooLong);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("two rungs"))).toBe(true);
  });
});
