/**
 * Small validation helpers shared between scripts/validate-content.js and
 * its tests. Kept separate from the script itself so these pure functions
 * can be unit-tested without triggering the script's `process.exit()` calls.
 */

// Best-effort id lookup for a Zod issue's path, so error output can name the
// specific record without every schema having to thread its own id lookup.
export function idHintFor(data, issue) {
  const [first] = issue.path;
  if (typeof first === "number" && Array.isArray(data) && data[first]?.id !== undefined) {
    return data[first].id;
  }
  if (!Array.isArray(data) && data && typeof data === "object" && "id" in data) {
    return data.id;
  }
  return undefined;
}

export function runSchema(group, schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { group, errors: [] };
  const errors = result.error.issues.map((issue) => ({
    group,
    id: idHintFor(data, issue),
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
  return { group, errors };
}

// Checks that every item's `id` is unique across all given groups combined,
// not just unique within its own group's array. Chronicle's main.js looks
// up cases and sources globally across both units (`caseById`/`sourceById`),
// so a duplicate id in two different content files is a real bug, not a
// false positive.
export function checkUniqueGlobalIds(groupLabel, entries) {
  const seenAt = new Map();
  const errors = [];
  for (const { source, items } of entries) {
    for (const item of items) {
      if (seenAt.has(item.id)) {
        errors.push({
          group: groupLabel,
          id: item.id,
          path: source,
          message: `id "${item.id}" also appears in ${seenAt.get(item.id)} — ids must be globally unique across units (main.js looks these up across all units).`,
        });
      } else {
        seenAt.set(item.id, source);
      }
    }
  }
  return errors;
}

// Checks Investigation/Archive Challenge gating pointers (case.archiveChallenge.questType/
// questId, source.investigationMode/investigationQuestId) against the real quest-type engine
// (quest-types/index.js's QUEST_TYPES) — Zod alone can't do this, since a Zod schema can't see
// application code, which is why these fields are typed as plain strings, not enums (see the
// doc comments on source.schema.js/unit.schema.js). `questTypeKeys` and `questsByType` are
// passed in rather than imported directly so this stays a pure function, testable without
// importing the full quest-type engine or real content.
//
// Each entry represents one gating pointer: { source, path, questType, questId }, where
// questType/questId are the resolved (possibly null) values from content. A pointer with both
// left null is "not gated" and is skipped, not an error — most sources/cases don't (yet) have
// an Investigation/Archive Challenge assigned.
export function checkChallengeReferences(groupLabel, entries, questTypeKeys, questsByType) {
  const knownTypes = new Set(questTypeKeys);
  const errors = [];
  for (const { source, path, questType, questId } of entries) {
    if (questType == null && questId == null) continue;
    if (questType == null || questId == null) {
      errors.push({
        group: groupLabel,
        id: questId ?? undefined,
        path: `${source}.${path}`,
        message: `questType and questId must both be set together, or both left null — got questType=${JSON.stringify(questType)}, questId=${JSON.stringify(questId)}.`,
      });
      continue;
    }
    if (!knownTypes.has(questType)) {
      errors.push({
        group: groupLabel,
        id: questId,
        path: `${source}.${path}`,
        message: `questType "${questType}" is not a known quest type — known types: ${[...knownTypes].join(", ")}.`,
      });
      continue;
    }
    if (!(questsByType[questType] || new Set()).has(questId)) {
      errors.push({
        group: groupLabel,
        id: questId,
        path: `${source}.${path}`,
        message: `questId "${questId}" was not found among "${questType}" quest content.`,
      });
    }
  }
  return errors;
}
