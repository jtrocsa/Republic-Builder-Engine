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
