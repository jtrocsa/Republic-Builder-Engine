// ASSEMBLY — the player rebuilds a broken thing from fragments, where exactly
// one configuration is right and a wrong placement is informative.
//
// The mechanic, with the subject stripped off: one or more boards, each a set
// of slots and a set of fragments, each fragment naming the slot it `belongs`
// in. The teaching lives in `misread` — every fragment carries a sentence
// explaining why it looks like it fits somewhere it doesn't, shown the moment
// it is placed wrong. A board that only says "no" has thrown away its best
// moment.
//
// Two board kinds, because the same mechanic covers both halves of a real
// reconstruction: `image` boards cut one picture into positioned tiles,
// `label` boards fit text into named blanks. An activity may mix them.
//
// Interaction is select-then-place, not drag-only. Drag/drop is an
// accelerator the host layers on top by passing `fragment` explicitly; the
// select-then-place path is what makes the board reachable from a keyboard,
// which the ten-piece jigsaw this engine replaces never was.
//
// Transfers as: a reaction pathway (chemistry), the steps of a proof
// (mathematics), a score from separated parts (music).
import { z } from "zod";
import {
  COMMON_ACTIVITY_FIELDS,
  ClosingChoiceSchema,
  actNotebook,
  checkUniqueIds,
  closerResult,
  closerSkillOutcomes,
  escapeHtml,
  notebookKept,
  renderCloser,
  renderNotebook,
} from "./contract.js";

const SlotSchema = z.object({
  id: z.string().min(1, "slot.id is required"),
  label: z.string().min(1, "slot.label is required"),
  // Grid position, required on an `image` board (it is what cuts the picture)
  // and ignored on a `label` board.
  row: z.number().int().min(0).optional(),
  col: z.number().int().min(0).optional(),
});

const FragmentSchema = z.object({
  id: z.string().min(1, "fragment.id is required"),
  label: z.string().min(1, "fragment.label is required"),
  // null means a distractor: a candidate that belongs in no slot on this board.
  // A label board without them is a matching exercise with the answer implied
  // by the count, so distractors are what make the choice real — and their
  // `misread` is where the engine does its best teaching, because a plausible
  // wrong candidate has an actual reason for being plausible.
  belongs: z.string().min(1).nullable(),
  misread: z
    .string()
    .min(1, "every fragment needs a `misread` — why it looks like it fits where it doesn't"),
  /**
   * What to say on the first wrong placements, before the full `misread`.
   *
   * A ladder, not a gate: `hints[0]` on the first wrong placement, `hints[1]` on the second,
   * `misread` from the third on. A fragment that declares none goes straight to `misread`, which is
   * every fragment shipped before Phase 76.
   *
   * The problem it solves is ordering, not withholding. `misread` is the best writing on the board —
   * a full paragraph on why a wrong piece looked right — and it fires the instant a piece lands
   * wrong, all of them at once. Place three pieces wrong on a label board and three paragraphs
   * arrive together, at the moment the player is least able to read them. A short nudge first is
   * what a person leaning over your shoulder would say, and it keeps the paragraph for the moment
   * you actually want it.
   *
   * Capped at two, because a third rung is a hint system rather than teaching.
   */
  hints: z
    .array(z.string().min(1))
    .max(2, "two rungs, then the misread — a longer ladder is a hint system")
    .optional(),
});

const BoardSchema = z.object({
  id: z.string().min(1, "board.id is required"),
  kind: z.enum(["image", "label"]),
  label: z.string().min(1, "board.label is required"),
  note: z.string().min(1).optional(),
  // An opaque key the host resolves to a bundled URL and passes back through
  // ctx.images. The engine never names an asset path: Vite needs
  // `new URL(..., import.meta.url)` at the call site, and engine/ shouldn't
  // know where a subject keeps its pictures.
  image: z.string().min(1).optional(),
  columns: z.number().int().min(1).default(1),
  rows: z.number().int().min(1).default(1),
  // Width divided by height of the picture, on an image board. Without it the board falls back to
  // 1.55 and the tiles are cut to the wrong shape, which is the difference between a puzzle that
  // reassembles into a picture and a grid of unrelated crops.
  aspect: z.number().positive().optional(),
  // Whether a fragment's `label` is printed on the fragment. A `label` board is
  // nothing but its labels, so they always show; on an `image` board the label
  // is a caption sitting on top of the art it is meant to help you read, and the
  // first playtest of the ten-piece sheet reported exactly that — engraver's
  // vocabulary in a pill over the map, unreadable and in the way. Off by default
  // there; a board that wants the training wheels asks for them.
  showFragmentLabels: z.boolean().optional(),
  // Another board on this activity that must be solved first. A reconstruction
  // often has a second question that only makes sense with the first one
  // finished — naming the three landmasses on a sheet you have not assembled is
  // a guess. The board still renders, with its note, so a player can see what is
  // coming.
  opensAfter: z.string().min(1).optional(),
  slots: z.array(SlotSchema).min(2, "a board needs at least two slots"),
  fragments: z.array(FragmentSchema).min(2, "a board needs at least two fragments"),
});

/** Whether following `opensAfter` from this board ever returns to it. */
function opensAfterCycle(boards, start) {
  const seen = new Set();
  let current = start;
  while (current?.opensAfter) {
    if (seen.has(current.id)) return true;
    seen.add(current.id);
    current = boards.find((board) => board.id === current.opensAfter);
    if (current?.id === start.id) return true;
  }
  return false;
}

export const AssemblyActivitySchema = z
  .object({
    ...COMMON_ACTIVITY_FIELDS,
    kind: z.literal("assembly"),
    boards: z.array(BoardSchema).min(1, "an assembly needs at least one board"),
    closer: ClosingChoiceSchema,
  })
  .superRefine((activity, ctx) => {
    checkUniqueIds(activity.boards, ctx, "assembly board", ["boards"]);
    const boardIds = new Set(activity.boards.map((board) => board.id));
    activity.boards.forEach((board, index) => {
      const path = ["boards", index];
      if (board.opensAfter !== undefined) {
        if (!boardIds.has(board.opensAfter)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "opensAfter"],
            message: `Board "${board.id}" opens after unknown board "${board.opensAfter}".`,
          });
          // A chain that loops back on itself locks every board in it forever,
          // and does so silently — the activity simply has no first move.
        } else if (opensAfterCycle(activity.boards, board)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "opensAfter"],
            message: `Board "${board.id}" is in an opensAfter cycle — no board in it could ever be started.`,
          });
        }
      }
      checkUniqueIds(board.slots, ctx, "slot", [...path, "slots"]);
      checkUniqueIds(board.fragments, ctx, "fragment", [...path, "fragments"]);

      const slotIds = new Set(board.slots.map((slot) => slot.id));
      const claimed = new Map();
      board.fragments.forEach((fragment, fragmentIndex) => {
        // A distractor claims nothing and is skipped by both checks below.
        if (fragment.belongs === null || fragment.belongs === undefined) return;
        if (!slotIds.has(fragment.belongs)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "fragments", fragmentIndex, "belongs"],
            message: `Fragment "${fragment.id}" belongs in unknown slot "${fragment.belongs}".`,
          });
          return;
        }
        if (claimed.has(fragment.belongs)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "fragments", fragmentIndex, "belongs"],
            message: `Slot "${fragment.belongs}" is claimed by both "${claimed.get(fragment.belongs)}" and "${fragment.id}" — a board has exactly one valid configuration.`,
          });
        } else {
          claimed.set(fragment.belongs, fragment.id);
        }
      });
      board.slots.forEach((slot, slotIndex) => {
        if (!claimed.has(slot.id)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "slots", slotIndex, "id"],
            message: `Slot "${slot.id}" has no fragment that belongs in it — the board could never be completed.`,
          });
        }
        if (board.kind === "image" && (slot.row === undefined || slot.col === undefined)) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "slots", slotIndex],
            message: `Slot "${slot.id}" is on an image board and needs row and col — they are what cut the picture.`,
          });
        }
      });
      if (board.kind === "image" && !board.image) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "image"],
          message: `Board "${board.id}" is an image board and needs an image key.`,
        });
      }
    });
  });

export function defaultAssemblyState() {
  return { placed: {}, selected: null, attempts: {}, filed: null, notebook: { kept: [] } };
}

function placedOn(state, boardId) {
  return state?.placed?.[boardId] || {};
}

/**
 * How many times this fragment has been placed somewhere it does not belong.
 *
 * Read defensively: `ensureSourceActivity()` never rewrites an existing state object, so a save
 * written before Phase 76 has no `attempts` at all and every fragment reads as zero — which lands
 * that player on `hints[0]`, the gentlest rung, rather than throwing.
 */
function attemptsFor(state, boardId, fragmentId) {
  return state?.attempts?.[boardId]?.[fragmentId] || 0;
}

/**
 * What to say about a fragment sitting in the wrong slot, given how often it has been tried.
 *
 * Exported because it is the whole of the ladder and worth testing directly: everything else here
 * is bookkeeping around this one expression.
 *
 * @param {{ misread: string, hints?: string[] }} fragment
 * @param {number} attempts
 */
export function fragmentNote(fragment, attempts = 1) {
  const hints = Array.isArray(fragment.hints) ? fragment.hints : [];
  // The first wrong placement is attempt 1, which is hints[0]. Past the end of the ladder — and
  // immediately, for a fragment that declares none — it is the misread.
  return hints[Math.max(0, attempts - 1)] || fragment.misread;
}

/**
 * Which fragment sits in which slot, and whether it belongs there.
 *
 * @param {import("zod").infer<typeof BoardSchema>} board
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 */
export function boardStatus(board, state = defaultAssemblyState()) {
  const placed = placedOn(state, board.id);
  const misplaced = [];
  let correct = 0;
  board.slots.forEach((slot) => {
    const fragmentId = placed[slot.id];
    if (!fragmentId) return;
    const fragment = board.fragments.find((item) => item.id === fragmentId);
    if (!fragment) return;
    if (fragment.belongs === slot.id) correct += 1;
    else misplaced.push({ slot, fragment });
  });
  return { correct, misplaced, solved: correct === board.slots.length };
}

/**
 * Whether this board is open for play, or still waiting on the one it follows.
 *
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {import("zod").infer<typeof BoardSchema>} board
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 */
export function boardOpen(activity, board, state = defaultAssemblyState()) {
  if (!board?.opensAfter) return true;
  const prerequisite = activity.boards.find((item) => item.id === board.opensAfter);
  return prerequisite ? boardStatus(prerequisite, state).solved : true;
}

/**
 * How far along this board is, in the one line a panel outside the activity has room for.
 *
 * INTERVIEW was the only engine to declare summary() until Phase 109, so the Mission Tracker's
 * progress line was blank on seventeen of the game's twenty-four missions — and so was the new
 * objective line on the board, which is what the copy column's folded reference blocks are paid for
 * with. Folding the instructions away on a screen that then says nothing about what it is waiting
 * for is a worse screen, not a shorter one.
 *
 * Reuses the per-item status function this engine's own renderer already calls, so there is no
 * second opinion on this board about what counts as done.
 */
export function assemblySummary(activity, state = defaultAssemblyState()) {
  const total = activity.boards.reduce((sum, board) => sum + board.slots.length, 0);
  if (!total) return null;
  const done = activity.boards.reduce((sum, board) => sum + boardStatus(board, state).correct, 0);
  return { key: "slots", label: "Pieces in place", done, total };
}

/**
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 * @param {{ type: string, board?: string, slot?: string, fragment?: string, option?: string }} action
 */
export function actAssembly(activity, state = defaultAssemblyState(), action = { type: "" }) {
  // A filed record is a finished record, and no verb on this board takes it back.
  //
  // Phase 90F stopped the closer accepting a second conclusion (decision log 0084). It was one door
  // of five: `lift` un-solves a board and `release` un-supports a conclusion, and either makes
  // isAssemblyComplete() false again on a record fileToCodex() has already written and deliberately
  // never unfiles — the board reading unfinished while the Archive reads filed.
  //
  // Above the notebook delegation on purpose, since `release` is handled in there.
  if (isAssemblyComplete(activity, state)) return state;

  // Before the board lookup: a Field Notebook verb carries no board, and the guard below would
  // wave it through into a chain of `if`s that all miss it.
  const notebook = actNotebook(activity, state, action, assemblyFindings(activity, state));
  if (notebook !== state) return notebook;

  const board = activity.boards.find((item) => item.id === action.board);
  // Guarded in the reducer, not only by the rendered `disabled`: a locked board's
  // controls are a hint, and a fragment placed into one before its prerequisite
  // was solved would count towards completion.
  if (board && !boardOpen(activity, board, state)) return state;

  if (action.type === "select") {
    if (!board) return state;
    const fragment = board.fragments.find((item) => item.id === action.fragment);
    if (!fragment) return state;
    const already = state.selected;
    // Clicking the selected fragment again puts it down rather than trapping
    // the player in a selected state with no visible way out.
    if (already && already.board === board.id && already.fragment === fragment.id) {
      return { ...state, selected: null };
    }
    return { ...state, selected: { board: board.id, fragment: fragment.id } };
  }

  if (action.type === "place") {
    if (!board) return state;
    const slot = board.slots.find((item) => item.id === action.slot);
    if (!slot) return state;
    // Drag/drop names the fragment; the keyboard/click path uses whatever is
    // selected. Both land here so the two entry points cannot drift.
    const fragmentId =
      action.fragment ||
      (state.selected && state.selected.board === board.id ? state.selected.fragment : null);
    const fragment = board.fragments.find((item) => item.id === fragmentId);
    if (!fragment) return state;
    const placed = { ...placedOn(state, board.id) };
    // A fragment lives in one slot at a time; placing it somewhere new lifts it
    // from wherever it was, and whatever was already in the target goes back to
    // the tray rather than vanishing.
    Object.keys(placed).forEach((slotId) => {
      if (placed[slotId] === fragment.id) delete placed[slotId];
    });
    placed[slot.id] = fragment.id;
    // Counted here rather than derived in the renderer, because it is a history and the board only
    // holds a present. Every wrong placement counts, including re-placing the same piece in the
    // same wrong slot — a player doing that has tried again, which is exactly what the ladder is
    // measuring. A correct placement is not counted and does not reset the count: lifting a piece
    // out and putting it back should not walk the player back down to the first rung.
    const wrong = fragment.belongs !== slot.id;
    const attempts = wrong
      ? {
          ...state.attempts,
          [board.id]: {
            ...(state.attempts?.[board.id] || {}),
            [fragment.id]: attemptsFor(state, board.id, fragment.id) + 1,
          },
        }
      : state.attempts;
    return {
      ...state,
      placed: { ...state.placed, [board.id]: placed },
      attempts,
      selected: null,
    };
  }

  if (action.type === "lift") {
    if (!board) return state;
    const placed = { ...placedOn(state, board.id) };
    if (!placed[action.slot]) return state;
    delete placed[action.slot];
    return { ...state, placed: { ...state.placed, [board.id]: placed }, selected: null };
  }

  if (action.type === "file") {
    // Guarded here rather than only in the UI: the closer's disabled attribute is a hint, not a
    // lock, and a filed-too-early record would read as complete. (Re-filing is refused at the top.)
    if (!activity.boards.every((item) => boardStatus(item, state).solved)) return state;
    const option = activity.closer.options.find((item) => item.id === action.option);
    return option ? { ...state, filed: option.id } : state;
  }

  return state;
}

/**
 * Background geometry for one tile of a cut-up picture. A slot at (col, row) of
 * a columns x rows grid shows that share of the image — the same trick the
 * ten-piece jigsaw used with hand-written `--nw`/`--ne` classes, generalised so
 * a board of any size needs no CSS of its own.
 */
function tileStyle(board, slot, url) {
  const { columns, rows } = gridOf(board);
  const x = columns > 1 ? ((slot.col || 0) / (columns - 1)) * 100 : 0;
  const y = rows > 1 ? ((slot.row || 0) / (rows - 1)) * 100 : 0;
  const size = `${columns * 100}% ${rows * 100}%`;
  const image = url ? `background-image:url('${escapeHtml(url)}');` : "";
  return `${image}background-size:${size};background-position:${x.toFixed(3)}% ${y.toFixed(3)}%`;
}

// Read defensively rather than trusting the schema's .default(1):
// validate-content.js discards the parsed output and content reaches the game
// as the raw imported object, so a schema default is documentation, never a
// runtime guarantee. Without this an omitted `columns` gives every tile a
// background-size of NaN% and the board renders blank.
function gridOf(board) {
  return { columns: board.columns || 1, rows: board.rows || 1 };
}

/**
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 * @param {{ images?: Record<string, string> }} [ctx]
 */
export function renderAssembly(activity, state = defaultAssemblyState(), ctx = {}) {
  const images = ctx.images || {};
  const solved = activity.boards.every((board) => boardStatus(board, state).solved);
  // Filed and finished. The reducer refuses every verb in this state, so the controls below say so
  // rather than looking live and doing nothing — the complaint Phase 90F made about the closer.
  const settled = isAssemblyComplete(activity, state);

  const boards = activity.boards
    .map((board) => {
      const status = boardStatus(board, state);
      const open = boardOpen(activity, board, state);
      const placed = placedOn(state, board.id);
      const url = board.image ? images[board.image] : undefined;
      const held = new Set(Object.values(placed));
      // Read defensively, like gridOf() below and for the same reason: a schema
      // default never reaches runtime here. A label board is nothing but its
      // labels, so it always shows them; an image board opts in.
      const showLabels = board.kind === "label" || board.showFragmentLabels === true;
      const lock = open && !settled ? "" : " disabled";

      const slots = board.slots
        .map((slot) => {
          const fragmentId = placed[slot.id];
          const fragment = board.fragments.find((item) => item.id === fragmentId);
          const wrong = fragment && fragment.belongs !== slot.id;
          const classes = [
            "activity-slot",
            fragment ? "is-filled" : "is-empty",
            wrong ? "is-wrong" : "",
            fragment && !wrong ? "is-right" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const style =
            board.kind === "image" && fragment ? ` style="${tileStyle(board, slot, url)}"` : "";
          // A label board keeps its caption after it is filled, so a completed cartouche still says
          // what it is a cartouche *for*. An image board drops it, because there the caption would
          // be sitting on top of the art it is meant to help you read.
          const caption = `<span class="activity-slot__hint">${escapeHtml(slot.label)}</span>`;
          const name = showLabels
            ? `<span class="activity-slot__label">${escapeHtml(fragment?.label || "")}</span>`
            : "";
          const body = fragment ? `${board.kind === "label" ? caption : ""}${name}` : caption;
          const act = fragment ? "lift" : "place";
          return `<button type="button" class="${classes}" data-activity-action="${act}" data-board="${escapeHtml(board.id)}" data-slot="${escapeHtml(slot.id)}" data-activity-slot="${escapeHtml(slot.id)}"${style}${lock} aria-label="${escapeHtml(fragment ? `${slot.label} — holding ${fragment.label}` : slot.label)}">${body}</button>`;
        })
        .join("");

      const tray = board.fragments
        .filter((fragment) => !held.has(fragment.id))
        .map((fragment) => {
          const isSelected =
            state.selected &&
            state.selected.board === board.id &&
            state.selected.fragment === fragment.id;
          // A tray tile shows its own art by borrowing the geometry of the slot
          // it belongs in — otherwise every unplaced piece of a jigsaw looks
          // identical and the puzzle is guesswork.
          const home = board.slots.find((slot) => slot.id === fragment.belongs);
          const style =
            board.kind === "image" && home ? ` style="${tileStyle(board, home, url)}"` : "";
          // The label is always the accessible name even when it is not printed:
          // an unlabelled image tile is a picture to a sighted player and nothing
          // at all to a screen reader.
          const body = showLabels ? `<span>${escapeHtml(fragment.label)}</span>` : "";
          return `<button type="button" class="activity-fragment${isSelected ? " is-selected" : ""}" draggable="${open ? "true" : "false"}" data-activity-action="select" data-board="${escapeHtml(board.id)}" data-fragment="${escapeHtml(fragment.id)}" data-activity-fragment="${escapeHtml(fragment.id)}"${style}${lock} aria-pressed="${isSelected ? "true" : "false"}" aria-label="${escapeHtml(fragment.label)}">${body}</button>`;
        })
        .join("");

      // Which piece went wrong is named by where it landed on an image board,
      // because there the fragment's own label is not on screen to name it by —
      // and the red slot is the thing the player is looking at anyway.
      const misread = status.misplaced
        .map(({ slot, fragment }) => {
          const note = fragmentNote(fragment, attemptsFor(state, board.id, fragment.id));
          // `is-hint` while the ladder is still short of the misread, so a nudge does not carry the
          // same visual weight as the full explanation.
          const rung = note === fragment.misread ? "" : ' class="is-hint"';
          return showLabels
            ? `<li${rung}><b>${escapeHtml(fragment.label)}</b> <i>→ ${escapeHtml(slot.label)}</i><span>${escapeHtml(note)}</span></li>`
            : `<li${rung}><b>${escapeHtml(slot.label)}</b><span>${escapeHtml(note)}</span></li>`;
        })
        .join("");

      const grid = gridOf(board);
      const geometry = `--assembly-columns:${grid.columns};--assembly-rows:${grid.rows};--assembly-aspect:${board.aspect || 1.55}`;
      const waiting = activity.boards.find((item) => item.id === board.opensAfter);
      return `<article class="activity-assembly-board activity-assembly-board--${escapeHtml(board.kind)}${status.solved ? " is-solved" : ""}${open ? "" : " is-locked"}" style="${geometry}">
  <h3>${escapeHtml(board.label)}</h3>
  ${board.note ? `<p class="activity-note">${escapeHtml(board.note)}</p>` : ""}
  ${open ? "" : `<p class="activity-note activity-note--locked">Finish ${escapeHtml(waiting?.label || "the board above")} first.</p>`}
  <div class="activity-slots">${slots}</div>
  ${tray ? `<div class="activity-tray" role="group" aria-label="Fragments">${tray}</div>` : ""}
  ${misread ? `<ul class="activity-misread">${misread}</ul>` : ""}
</article>`;
    })
    .join("");

  const findings = assemblyFindings(activity, state);
  return `<section class="activity-board activity-board--assembly">
  ${boards}
  ${renderNotebook(activity, state, findings, { settled })}
  ${renderCloser(activity.closer, state.filed, {
    locked: !solved,
    lockedNote:
      activity.lockedNote || "Finish the reconstruction before you decide what it can support.",
    kept: notebookKept(activity, state, findings),
  })}
</section>`;
}

/**
 * What the reconstruction has surfaced: one entry per board the player has actually rebuilt.
 *
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 */
export function assemblyFindings(activity, state = defaultAssemblyState()) {
  return activity.boards
    .filter((board) => boardStatus(board, state).solved)
    .map((board) => ({ id: board.id, text: board.label, from: activity.title }));
}

/**
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 */
export function isAssemblyComplete(activity, state = defaultAssemblyState()) {
  const kept = notebookKept(activity, state, assemblyFindings(activity, state));
  const result = closerResult(activity.closer, state.filed, kept);
  return (
    activity.boards.every((board) => boardStatus(board, state).solved) &&
    result.correct &&
    result.supported
  );
}

/**
 * @param {import("zod").infer<typeof AssemblyActivitySchema>} activity
 * @param {ReturnType<typeof defaultAssemblyState>} [state]
 */
export function assemblyOutcome(activity, state = defaultAssemblyState()) {
  const findings = assemblyFindings(activity, state);
  return {
    findings,
    evidence: notebookKept(activity, state, findings),
    skillOutcomes: closerSkillOutcomes(activity.id, activity.closer, state.filed),
  };
}
