// ASSEMBLY replaced the ten-piece map jigsaw, which was welded to one source
// id, had no keyboard path, and said nothing when a piece went in the wrong
// slot. All three of those are pinned here: the board comes from content, the
// select-then-place path works without a drag event, and a misplaced fragment
// surfaces its `misread`.
import { describe, expect, it } from "vitest";
import {
  AssemblyActivitySchema,
  actAssembly,
  assemblyOutcome,
  boardStatus,
  defaultAssemblyState,
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
