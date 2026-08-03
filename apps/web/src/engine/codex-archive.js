/**
 * The Codex, as pure data.
 *
 * The Field Notebook records what you found. The Codex records what you can defend: one entry per
 * mission you closed with a conclusion your evidence could carry, kept permanently, across every
 * case and every unit. It is the only thing in the game that survives leaving a case.
 *
 * Everything here is a pure function over plain objects. No `progress`, no DOM, no content imports,
 * and — the standing rule for `engine/` — no historical facts: a tag is an opaque string, a unit is
 * an id and a label somebody else supplied. main.js keeps the wiring (what is filed, when, and how
 * it renders); this keeps the shape of a filed record and the arithmetic of how records relate.
 *
 * The entry shape is deliberately a snapshot rather than a live view of activity state. A record
 * filed with three pieces of evidence still shows those three afterwards, even if the player later
 * reopens the mission and releases one — the Codex says what you filed, not what you are holding.
 */

/** Everything a filed record carries, in the order it reads on screen. */
const ENTRY_FIELDS = [
  "activityId",
  "kind",
  "variant",
  "title",
  "missionQuestion",
  "summary",
  "sourceId",
  "sourceTitle",
  "caseId",
  "caseLabel",
  "unitId",
  "unitLabel",
  "conclusion",
  "why",
  "supported",
  "evidence",
  "openQuestions",
  "tags",
  "seeAlso",
  "filedAt",
];

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

/**
 * Normalize a descriptor into a Codex entry, or null if it has no identity.
 *
 * Every field is optional except `activityId`, which is the key. A caller that cannot supply a
 * label supplies nothing and the renderer skips that line — a Codex that throws because a case has
 * no number would be a save-breaking dependency on a content convention only Unit 1 follows.
 *
 * @param {Record<string, unknown>} descriptor
 * @returns {Record<string, any>|null}
 */
export function buildCodexEntry(descriptor = {}) {
  if (!descriptor || !descriptor.activityId) return null;
  const entry = {};
  ENTRY_FIELDS.forEach((field) => {
    const value = descriptor[field];
    if (
      field === "evidence" ||
      field === "openQuestions" ||
      field === "tags" ||
      field === "seeAlso"
    )
      entry[field] = asList(value);
    else if (field === "supported") entry[field] = !!value;
    else entry[field] = value == null ? "" : String(value);
  });
  return entry;
}

/**
 * Every filed record, oldest first.
 *
 * Chronological because the Codex is a career: the order you established things in is the order
 * they happened to you, and re-sorting it by unit would hide the fact that a Chronicler's second
 * unit reopened a question from their first.
 *
 * **Ties break on curriculum order — unit, then case, then activity id — and that is load-bearing,
 * not tidiness.** `backfillCodex()` files a whole save inside one loop, so every record it writes
 * carries the same millisecond whenever the machine is quick enough, and a tie is the *normal* case
 * for a backfilled archive rather than an edge one. Sorting those by title is arbitrary: it put a
 * Unit 2 wharf ledger above a Unit 1 interview purely because "One Hogshead" sorts before "The
 * Question Nobody Asked". When the timestamps genuinely cannot say what order the player worked in,
 * the order the course goes in is the only honest answer. Caught by a visual baseline that came back
 * with the two records swapped on a slower run.
 *
 * @param {Record<string, any>} codex
 */
export function codexEntries(codex = {}) {
  return Object.values(codex || {})
    .filter((entry) => entry && entry.activityId)
    .sort(
      (a, b) =>
        String(a.filedAt || "").localeCompare(String(b.filedAt || "")) ||
        String(a.unitId || "").localeCompare(String(b.unitId || "")) ||
        String(a.caseId || "").localeCompare(String(b.caseId || "")) ||
        String(a.activityId).localeCompare(String(b.activityId))
    );
}

/**
 * Filed records grouped by unit, in the order those units first appear in the archive.
 *
 * @param {Record<string, any>[]} entries
 * @returns {{ unitId: string, unitLabel: string, entries: any[] }[]}
 */
export function codexByUnit(entries = []) {
  const groups = new Map();
  entries.forEach((entry) => {
    const unitId = entry.unitId || "";
    if (!groups.has(unitId))
      groups.set(unitId, { unitId, unitLabel: entry.unitLabel || "", entries: [] });
    groups.get(unitId).entries.push(entry);
  });
  return [...groups.values()];
}

/**
 * Where two filed records meet.
 *
 * A tag carried by a single record is not a cross-reference — it is a label, and the Codex says
 * nothing about it. Two or more and the archive has noticed something: the same question turning up
 * in two investigations. `spansUnits` is the strong case, and it is what makes the Codex an argument
 * for the whole course rather than a case file — "Who does the work" appearing in both a Caribbean
 * shore in 1492 and a Chesapeake landing in 1630 is the continuity the unit boundaries hide.
 *
 * Sorted by breadth: cross-unit threads first, then by how many records carry them, then
 * alphabetically so the list never reshuffles between renders.
 *
 * @param {Record<string, any>[]} entries
 * @returns {{ tag: string, entries: any[], spansUnits: boolean }[]}
 */
export function codexCrossReferences(entries = []) {
  const byTag = new Map();
  entries.forEach((entry) => {
    asList(entry.tags).forEach((tag) => {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(entry);
    });
  });
  return [...byTag.entries()]
    .filter(([, tagged]) => tagged.length > 1)
    .map(([tag, tagged]) => ({
      tag,
      entries: tagged,
      spansUnits: new Set(tagged.map((entry) => entry.unitId)).size > 1,
    }))
    .sort(
      (a, b) =>
        Number(b.spansUnits) - Number(a.spansUnits) ||
        b.entries.length - a.entries.length ||
        a.tag.localeCompare(b.tag)
    );
}

/**
 * The records this one points at, resolved against what the player has actually filed.
 *
 * Unresolved pointers are dropped rather than rendered as absences. A "see also" naming a mission
 * the player has not reached is either a spoiler or a dead link, and the interesting moment is the
 * other one: filing a record in Unit 2 and finding it has just connected itself to something you
 * filed in Unit 1.
 *
 * @param {Record<string, any>} entry
 * @param {Record<string, any>[]} entries
 */
export function codexSeeAlso(entry, entries = []) {
  const wanted = new Set(asList(entry?.seeAlso));
  if (!wanted.size) return [];
  return entries.filter(
    (other) => other.activityId !== entry.activityId && wanted.has(other.activityId)
  );
}

/**
 * The one line at the top of the screen: how much of an archive this is.
 *
 * @param {Record<string, any>[]} entries
 */
export function codexStats(entries = []) {
  return {
    records: entries.length,
    units: new Set(entries.map((entry) => entry.unitId).filter(Boolean)).size,
    threads: codexCrossReferences(entries).length,
  };
}
