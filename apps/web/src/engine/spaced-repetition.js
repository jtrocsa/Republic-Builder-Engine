// Pure scheduling logic for "The Archive Rotation" (Phase 49C) — a daily
// spaced-repetition loop over the existing mcq/sequencing/hipp quest pool.
// Deliberately has no knowledge of main.js's `progress` global or any DOM:
// every function takes its inputs explicitly (including `nowMs`) so this is
// directly unit-testable and never needs Date.now() mocked at the call site.
//
// Standing rule this module exists to respect (see PHASES-46-50.md's Phase
// 49C entry): reviewing here must never confer a graded-assessment
// advantage. It reuses quest content that is already gradeable elsewhere
// (Practice Check) rather than introducing a second scoring system, and its
// only persisted effect is a per-item review schedule plus a cosmetic streak
// counter — never a change to completedCases/badges/skillMastery weighting.
//
// A plain 5-box Leitner system: a correct review promotes the item one box
// (capped at 5); an incorrect review resets it to box 1. Box number maps to
// a fixed re-review interval in days.
export const LEITNER_INTERVAL_DAYS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 };
export const MAX_LEITNER_BOX = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_DAILY_ROTATION_TARGET = 8;

/**
 * @param {{box: number, dueAt: number, lastSeenAt: number}|undefined} existingState
 * @param {boolean} correct
 * @param {number} nowMs
 */
export function reviewRotationItem(existingState, correct, nowMs) {
  const currentBox = existingState?.box || 1;
  const nextBox = correct ? Math.min(currentBox + 1, MAX_LEITNER_BOX) : 1;
  return {
    box: nextBox,
    dueAt: nowMs + LEITNER_INTERVAL_DAYS[nextBox] * DAY_MS,
    lastSeenAt: nowMs,
  };
}

/** @param {{dueAt: number}|undefined} state */
export function isRotationItemDue(state, nowMs) {
  return !state || typeof state.dueAt !== "number" || state.dueAt <= nowMs;
}

// itemKeys: stable-ordered array of pool item keys (e.g. "mcq::case-001-mcq-1").
// itemStates: map of key -> {box, dueAt, lastSeenAt} (only present for
// previously-reviewed items). Returns up to targetCount keys: due-for-review
// items first (earliest due first), then never-seen items in pool order —
// so a day with few reviews due still gets filled with fresh material.
export function selectDailyRotationQueue(itemKeys, itemStates, nowMs, targetCount) {
  const due = itemKeys
    .filter((key) => itemStates[key] && itemStates[key].dueAt <= nowMs)
    .sort((a, b) => itemStates[a].dueAt - itemStates[b].dueAt);
  const fresh = itemKeys.filter((key) => !itemStates[key]);
  return [...due, ...fresh].slice(0, targetCount);
}

// UTC-based on purpose: this only needs to identify "a new day" for the
// daily-loop/streak cadence, not model a player's actual local midnight —
// keeping it UTC keeps the function pure and deterministic in tests
// regardless of the machine's timezone.
export function rotationDateString(nowMs) {
  return new Date(nowMs).toISOString().slice(0, 10);
}

// One day after `dateString` (also UTC, see rotationDateString above).
export function nextRotationDateString(dateString) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Cosmetic-only streak counter (no assessment weight — see module doc
// comment). `today`/`lastCompletedDate` are rotationDateString() values.
export function nextStreakDays(lastCompletedDate, today, currentStreakDays) {
  if (lastCompletedDate === today) return currentStreakDays;
  if (lastCompletedDate && nextRotationDateString(lastCompletedDate) === today) {
    return currentStreakDays + 1;
  }
  return 1;
}
