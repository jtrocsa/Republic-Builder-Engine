/**
 * Validates Chronicle's active content (apps/web/src/content/*.js) with Zod
 * and checks cross-references that individual schemas can't see on their
 * own (global case/source id uniqueness across both units). Read-only: it
 * never writes back to a content file.
 *
 * Run: npm run validate:content
 */
import {
  loadChronicleContent,
  chronicleContentOrigins,
} from "../apps/web/src/repositories/local-content-repository.js";
import { BrandSchema, UnitSchema } from "../apps/web/src/content/schemas/unit.schema.js";
import {
  buildSourceSchema,
  buildSourcesSchema,
} from "../apps/web/src/content/schemas/source.schema.js";
import { ReviewSchema } from "../apps/web/src/content/schemas/review.schema.js";
import { CaseLanesSchema } from "../apps/web/src/content/schemas/unit02-activities.schema.js";
import {
  runSchema,
  checkUniqueGlobalIds,
  checkChallengeReferences,
  checkAlternateReferences,
  checkCasePeriodMatchesUnit,
} from "../apps/web/src/content/schemas/cross-reference.js";
import { z } from "zod";
import {
  McqQuestSchema,
  McqQuestListSchema,
} from "../apps/web/src/quest-types/generic/mcq-quest.js";
import {
  SequencingQuestSchema,
  SequencingQuestListSchema,
} from "../apps/web/src/quest-types/generic/sequencing-quest.js";
import {
  EvidenceOrganizingQuestSchema,
  EvidenceOrganizingQuestListSchema,
} from "../apps/web/src/quest-types/history/evidence-organizing-quest.js";
import {
  SourceAnalysisQuestSchema,
  SourceAnalysisQuestListSchema,
} from "../apps/web/src/quest-types/history/source-analysis-quest.js";
import { SaqQuestListSchema } from "../apps/web/src/quest-types/history/saq-quest.js";
import { DbqQuestListSchema } from "../apps/web/src/quest-types/history/dbq-quest.js";
import { QUEST_TYPES } from "../apps/web/src/quest-types/index.js";
import { ActivityMapSchema, isActivityEngine } from "../apps/web/src/engine/activities/index.js";
import {
  buildPrimarySourcesSchema,
  buildVisualSourcesSchema,
  UnitMetaSchema,
} from "../apps/web/src/content/schemas/primary-source-library.schema.js";
import { PRIMARY_SOURCE_LIBRARY_UNITS } from "../apps/web/src/content/primary-source-library/index.js";

const ACTIVITY_ROUTE_GROUP = "cross-reference: activity routes match activity kinds";

/**
 * The two halves of an activity have to agree. A source's `activityRoute` is the screen main.js
 * routes to; the activity's own `kind` is the engine that renders there. No schema can catch a
 * mismatch because the two live in different files — and the symptom is a student sent to a screen
 * that immediately bounces them back to the field.
 *
 * Also checks the reverse direction: an activity keyed to a source id that does not exist is
 * content nobody can ever reach.
 */
function checkActivityRoutes(content) {
  const errors = [];
  ["unit01", "unit02", "unit03", "unit04", "unit05", "unit06", "unit07"].forEach((key) => {
    const unit = content[key] || {};
    const activities = unit.activities || {};
    const sources = unit.sources || [];
    const sourceIds = new Set(sources.map((source) => source.id));

    sources.forEach((source) => {
      const route = source.activityRoute;
      const activity = activities[source.id];
      if (route && isActivityEngine(route) && !activity) {
        errors.push({
          group: ACTIVITY_ROUTE_GROUP,
          id: source.id,
          path: `${key}.sources`,
          message: `activityRoute is "${route}" but no activity is authored for this source.`,
        });
      }
      if (activity && activity.kind !== route) {
        errors.push({
          group: ACTIVITY_ROUTE_GROUP,
          id: source.id,
          path: `${key}.sources`,
          message: `activityRoute is ${JSON.stringify(route ?? null)} but its activity is kind "${activity.kind}" — these name the same engine and must match.`,
        });
      }
    });

    Object.keys(activities).forEach((sourceId) => {
      if (sourceIds.has(sourceId)) return;
      errors.push({
        group: ACTIVITY_ROUTE_GROUP,
        id: sourceId,
        path: `${key}.activities`,
        message: `keyed to a source that is not in this unit — the activity is unreachable.`,
      });
    });
  });
  return errors;
}

/**
 * Which schema validates which content key.
 *
 * This table replaces ninety-eight hand-written `runSchema(...)` calls, one per unit per content
 * array. That shape had the failure mode every hand-maintained per-unit list has: a quest array
 * left off the list was simply never validated, and nothing said so. Here the loop walks whatever
 * `loadChronicleContent()` actually returns, and a key with no schema is a hard error — so the
 * mistake that used to be silent is now the loudest thing in the run.
 *
 * `sources` is absent on purpose: its schema depends on the unit's own lanes, so it is built per
 * unit in `schemaForKey()` below.
 */
const SINGLE_SCHEMAS = {
  unit: UnitSchema,
  brand: BrandSchema,
  review: ReviewSchema,
  lanes: CaseLanesSchema,
  activities: ActivityMapSchema,
};

/**
 * Which of `QUEST_TYPES`' keys each quest array belongs to. The key names say it themselves —
 * `archiveSaqQuests` is an saq, `investigationMcqQuests` is an mcq — which is what makes the
 * mapping worth writing down once instead of ninety-eight times.
 *
 * `archiveStrongestEvidenceQuests` is the one name that misleads: it is a multiple-choice quest
 * about which evidence is strongest, not an evidence-organizing one.
 */
const QUEST_KEY_TYPES = {
  mcqQuests: "mcq",
  readerMcqQuests: "mcq",
  investigationMcqQuests: "mcq",
  archiveMcqQuests: "mcq",
  archiveStrongestEvidenceQuests: "mcq",
  sequencingQuests: "sequencing",
  investigationSequencingQuests: "sequencing",
  archiveSequencingQuests: "sequencing",
  evidenceOrganizingQuests: "evidence-organizing",
  investigationEvidenceQuests: "evidence-organizing",
  archiveEvidenceQuests: "evidence-organizing",
  sourceAnalysisQuests: "hipp",
  investigationQuests: "hipp",
  archiveSourceAnalysisQuests: "hipp",
  archiveSaqQuests: "saq",
  archiveDbqQuests: "dbq",
};

/**
 * The one quest key whose name does not say its type. `archiveChallengeQuests` predates the
 * per-type naming the other fifty-nine arrays use, and the three units carrying it do not agree
 * on what is in it. Renaming those exports to `UNIT_0N_ARCHIVE_SEQUENCING_QUESTS` and
 * `UNIT_0N_ARCHIVE_EVIDENCE_QUESTS` would delete this table — but it would also rename live
 * content that main.js resolves by array, so it is a content change, not a tooling one.
 */
const QUEST_KEY_TYPES_BY_UNIT = {
  unit01: { archiveChallengeQuests: "sequencing" },
  unit02: { archiveChallengeQuests: "evidence-organizing" },
  unit03: { archiveChallengeQuests: "evidence-organizing" },
};

function questTypeForKey(unitKey, key) {
  return QUEST_KEY_TYPES_BY_UNIT[unitKey]?.[key] ?? QUEST_KEY_TYPES[key] ?? null;
}

function main() {
  const content = loadChronicleContent();
  const origins = chronicleContentOrigins();
  const results = [];

  // Teacher Mode's curated swap pool — each entry wraps a full official-shape source/quest object
  // plus a `replacesXId` pointer, validated against the exact same schemas as the official content
  // it is meant to replace (see apps/web/src/content/case-001-source-alternates.js's doc comment).
  const alternatesSchema = (inner, field) =>
    z.array(
      z.object({
        [`replaces${field}Id`]: z.string().min(1, `replaces${field}Id is required`),
        [field.toLowerCase()]: inner,
      })
    );
  const ALTERNATE_SCHEMAS = {
    sourceAlternates: alternatesSchema(buildSourceSchema({}), "Source"),
    mcqAlternates: alternatesSchema(McqQuestSchema, "Quest"),
    sequencingAlternates: alternatesSchema(SequencingQuestSchema, "Quest"),
    evidenceOrganizingAlternates: alternatesSchema(EvidenceOrganizingQuestSchema, "Quest"),
    sourceAnalysisAlternates: alternatesSchema(SourceAnalysisQuestSchema, "Quest"),
  };

  const QUEST_LIST_SCHEMAS = {
    mcq: McqQuestListSchema,
    sequencing: SequencingQuestListSchema,
    "evidence-organizing": EvidenceOrganizingQuestListSchema,
    hipp: SourceAnalysisQuestListSchema,
    saq: SaqQuestListSchema,
    dbq: DbqQuestListSchema,
  };

  function schemaForKey(unitKey, key, unit) {
    if (key === "sources") {
      // A unit with lanes reconstructs some of its sources from them; Unit 1 has none.
      return unit.lanes
        ? buildSourcesSchema({ reconstructionIds: unit.lanes.map((lane) => lane.id) })
        : buildSourcesSchema({});
    }
    const questType = questTypeForKey(unitKey, key);
    if (questType) return QUEST_LIST_SCHEMAS[questType];
    return SINGLE_SCHEMAS[key] ?? ALTERNATE_SCHEMAS[key] ?? null;
  }

  // Every content array of every registered unit, against its schema. Order follows UNIT_IDS and
  // then each module's own export order, which is why the run reads unit by unit.
  for (const [unitKey, unit] of Object.entries(content)) {
    for (const [key, value] of Object.entries(unit)) {
      const schema = schemaForKey(unitKey, key, unit);
      const origin = origins[unitKey][key];
      if (!schema) {
        console.error(
          `\nvalidate-content.js has no schema for ${unitKey}.${key} ` +
            `(${origin.file}: ${origin.exportName}).\n\n` +
            "Every content export is validated, so a new one has to say what it is: add its key to " +
            "QUEST_KEY_TYPES if it is a quest array, or to SINGLE_SCHEMAS if it is not. This is " +
            "deliberately an error rather than a skip — content that quietly stops being validated " +
            "is the failure this table exists to prevent.\n"
        );
        process.exit(1);
      }
      results.push(runSchema(`${origin.file}: ${origin.exportName}`, schema, value));
    }
  }

  // Primary source reference library (apps/web/src/content/primary-source-library/)
  // — syllabus-wide research reference for Units 1-9, not gameplay content.
  // See docs/content-guide/primary-source-library.md.
  const primarySourcesSchema = buildPrimarySourcesSchema();
  const visualSourcesSchema = buildVisualSourcesSchema();
  for (const { meta, sources, visualSources } of PRIMARY_SOURCE_LIBRARY_UNITS) {
    const label = `unit-0${meta.unit}-source-library.js`;
    results.push(
      runSchema(`${label}: UNIT_0${meta.unit}_SOURCE_LIBRARY_META`, UnitMetaSchema, meta)
    );
    results.push(runSchema(`${label}: UNIT_0${meta.unit}_SOURCES`, primarySourcesSchema, sources));
    results.push(
      runSchema(`${label}: UNIT_0${meta.unit}_VISUAL_SOURCES`, visualSourcesSchema, visualSources)
    );
  }

  // Cross-file checks: main.js's caseById()/unitForCase()/sourceById() all
  // search across every unit, so case ids and source ids must be unique
  // globally, not just within their own unit's array.
  const crossFileGroups = [
    "cross-reference: case ids",
    "cross-reference: source ids",
    "cross-reference: case ced.period matches unit period",
    ...Object.keys(QUEST_TYPES).map((type) => `cross-reference: ${type} quest ids`),
    "cross-reference: archive challenge quest references",
    "cross-reference: investigation challenge quest references",
    "cross-reference: reader question references",
    "cross-reference: source alternate references",
    "cross-reference: mcq alternate references",
    "cross-reference: sequencing alternate references",
    "cross-reference: evidence-organizing alternate references",
    "cross-reference: hipp alternate references",
    "cross-reference: primary source library ids",
    "cross-reference: primary source library visual ids",
    ACTIVITY_ROUTE_GROUP,
  ];

  /** `unit-04-quests.js:UNIT_04_MCQ_QUESTS` — the label a cross-reference error is reported under. */
  const label = (unitKey, key) => {
    const origin = origins[unitKey][key];
    return `${origin.file}:${origin.exportName}`;
  };
  /** One `{ source, items }` entry per unit for a key every unit carries. */
  const everyUnit = (key, pick = (value) => value) =>
    Object.entries(content).map(([unitKey, unit]) => ({
      source: label(unitKey, key),
      items: pick(unit[key]),
    }));

  // Every quest id, grouped by QUEST_TYPES key, across every unit — the resolution set the
  // archiveChallenge/investigationMode pointers below get checked against. Every array here gets
  // merged into ONE flat lookup per type in main.js's ARCHIVE_CHALLENGE_QUESTS_BY_TYPE /
  // INVESTIGATION_QUESTS_BY_TYPE / PRACTICE_CHECK_QUESTS, so an id reused across two of these
  // arrays would silently resolve to whichever one main.js's .find() hits first.
  const questArraysByType = Object.fromEntries(Object.keys(QUEST_TYPES).map((type) => [type, []]));
  for (const [unitKey, unit] of Object.entries(content)) {
    for (const key of Object.keys(unit)) {
      const type = questTypeForKey(unitKey, key);
      if (type) questArraysByType[type].push({ source: label(unitKey, key), items: unit[key] });
    }
  }

  const idsOf = (list) => list.map((quest) => quest.id);
  const questsByType = Object.fromEntries(
    Object.entries(questArraysByType).map(([type, entries]) => [
      type,
      new Set(entries.flatMap(({ items }) => idsOf(items))),
    ])
  );
  const questTypeKeys = Object.keys(QUEST_TYPES);

  const archiveChallengeEntries = (unitLabel, unit) => [
    ...unit.cases.map((c) => ({
      source: unitLabel,
      path: `cases[${JSON.stringify(c.id)}].archiveChallenge`,
      questType: c.archiveChallenge?.questType ?? null,
      questId: c.archiveChallenge?.questId ?? null,
    })),
    ...(unit.archiveChallenges || []).map((challenge, index) => ({
      source: unitLabel,
      path: `archiveChallenges[${index}]`,
      questType: challenge.questType ?? null,
      questId: challenge.questId ?? null,
    })),
  ];
  const investigationEntries = (sourceLabel, sources) =>
    sources.map((s) => ({
      source: sourceLabel,
      path: `find(${JSON.stringify(s.id)}).investigationMode`,
      questType: s.investigationMode,
      questId: s.investigationQuestId,
    }));
  // A source's reader questions (readerQuestType/readerQuestIds) replace the written
  // "initial reading" in sourceReader(). Array-valued, unlike the single-pointer
  // investigation gate, so one source flattens into one entry per question id.
  const readerEntries = (sourceLabel, sources) =>
    sources.flatMap((s) =>
      (Array.isArray(s.readerQuestIds) ? s.readerQuestIds : []).map((questId, index) => ({
        source: sourceLabel,
        path: `find(${JSON.stringify(s.id)}).readerQuestIds[${index}]`,
        questType: s.readerQuestType,
        questId,
      }))
    );
  /** Flattens one of the three entry builders above across every unit. */
  const acrossUnits = (key, build) =>
    Object.entries(content).flatMap(([unitKey, unit]) => build(label(unitKey, key), unit[key]));

  /** One `{ source, replacesId, altId }` entry per alternate in a curated swap pool. */
  const alternateEntries = (unitKey, key, idField) =>
    content[unitKey][key].map((entry) => ({
      source: label(unitKey, key),
      replacesId: entry[`replaces${idField}Id`],
      altId: (entry.source ?? entry.quest).id,
    }));

  const crossFileErrors = [
    ...checkUniqueGlobalIds(
      "cross-reference: case ids",
      everyUnit("unit", (unit) => unit.cases).map((entry) => ({
        ...entry,
        source: `${entry.source}.cases`,
      }))
    ),
    ...checkUniqueGlobalIds("cross-reference: source ids", everyUnit("sources")),
    ...checkCasePeriodMatchesUnit(
      "cross-reference: case ced.period matches unit period",
      Object.values(content).map((unit) => unit.unit)
    ),
    // Every array feeding one QUEST_TYPES key gets merged into one flat
    // lookup in main.js (ARCHIVE_CHALLENGE_QUESTS_BY_TYPE/
    // INVESTIGATION_QUESTS_BY_TYPE/PRACTICE_CHECK_QUESTS' per-type
    // .find(id)), so a quest id reused across two arrays of the same type
    // would silently resolve to whichever array .find() reaches first —
    // check per-type uniqueness the same way case/source ids are checked
    // globally above.
    ...Object.entries(questArraysByType).flatMap(([type, entries]) =>
      checkUniqueGlobalIds(`cross-reference: ${type} quest ids`, entries)
    ),
    ...checkChallengeReferences(
      "cross-reference: archive challenge quest references",
      acrossUnits("unit", archiveChallengeEntries),
      questTypeKeys,
      questsByType
    ),
    ...checkChallengeReferences(
      "cross-reference: investigation challenge quest references",
      acrossUnits("sources", investigationEntries),
      questTypeKeys,
      questsByType
    ),
    ...checkChallengeReferences(
      "cross-reference: reader question references",
      acrossUnits("sources", readerEntries),
      questTypeKeys,
      questsByType
    ),
    ...checkAlternateReferences(
      "cross-reference: source alternate references",
      alternateEntries("unit01", "sourceAlternates", "Source"),
      idsOf(content.unit01.sources)
    ),
    ...checkAlternateReferences(
      "cross-reference: mcq alternate references",
      alternateEntries("unit01", "mcqAlternates", "Quest"),
      idsOf(content.unit01.mcqQuests)
    ),
    ...checkAlternateReferences(
      "cross-reference: sequencing alternate references",
      alternateEntries("unit01", "sequencingAlternates", "Quest"),
      idsOf(content.unit01.sequencingQuests)
    ),
    ...checkAlternateReferences(
      "cross-reference: evidence-organizing alternate references",
      [
        ...alternateEntries("unit01", "evidenceOrganizingAlternates", "Quest"),
        ...alternateEntries("unit02", "evidenceOrganizingAlternates", "Quest"),
      ],
      idsOf([...content.unit01.evidenceOrganizingQuests, ...content.unit02.archiveChallengeQuests])
    ),
    ...checkAlternateReferences(
      "cross-reference: hipp alternate references",
      alternateEntries("unit01", "sourceAnalysisAlternates", "Quest"),
      idsOf(content.unit01.sourceAnalysisQuests)
    ),
    ...checkUniqueGlobalIds(
      "cross-reference: primary source library ids",
      PRIMARY_SOURCE_LIBRARY_UNITS.map(({ meta, sources }) => ({
        source: `unit-0${meta.unit}-source-library.js:UNIT_0${meta.unit}_SOURCES`,
        items: sources,
      }))
    ),
    ...checkUniqueGlobalIds(
      "cross-reference: primary source library visual ids",
      PRIMARY_SOURCE_LIBRARY_UNITS.map(({ meta, visualSources }) => ({
        source: `unit-0${meta.unit}-source-library.js:UNIT_0${meta.unit}_VISUAL_SOURCES`,
        items: visualSources,
      }))
    ),
    ...checkActivityRoutes(content),
  ];

  const allErrors = results.flatMap((result) => result.errors).concat(crossFileErrors);
  const groupsChecked = results.length + crossFileGroups.length;

  console.log(`Chronicle content validation — ${groupsChecked} groups checked\n`);

  if (allErrors.length === 0) {
    for (const result of results) {
      console.log(`  ok  ${result.group}`);
    }
    for (const group of crossFileGroups) {
      console.log(`  ok  ${group}`);
    }
    console.log(`\nAll content is valid. 0 errors.`);
    process.exit(0);
  }

  for (const result of results) {
    console.log(`${result.errors.length ? "FAIL" : "  ok"}  ${result.group}`);
  }
  for (const group of crossFileGroups) {
    console.log(`${crossFileErrors.some((e) => e.group === group) ? "FAIL" : "  ok"}  ${group}`);
  }

  console.log(`\n${allErrors.length} error(s):\n`);
  for (const error of allErrors) {
    const idPart = error.id !== undefined ? ` [id: ${error.id}]` : "";
    console.log(`  ✗ ${error.group}${idPart} — ${error.path}: ${error.message}`);
  }
  console.log("");
  process.exit(1);
}

main();
