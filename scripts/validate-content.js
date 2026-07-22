/**
 * Validates Chronicle's active content (apps/web/src/content/*.js) with Zod
 * and checks cross-references that individual schemas can't see on their
 * own (global case/source id uniqueness across both units). Read-only: it
 * never writes back to a content file.
 *
 * Run: npm run validate:content
 */
import { loadChronicleContent } from "../apps/web/src/repositories/local-content-repository.js";
import { BrandSchema, UnitSchema } from "../apps/web/src/content/schemas/unit.schema.js";
import {
  buildSourceSchema,
  buildSourcesSchema,
} from "../apps/web/src/content/schemas/source.schema.js";
import {
  ExchangeRecordSchema,
  ExchangeRecordsSchema,
} from "../apps/web/src/content/schemas/exchange-record.schema.js";
import {
  EmpireEvidenceListSchema,
  buildEmpireConnectionsSchema,
} from "../apps/web/src/content/schemas/empire.schema.js";
import { ReviewSchema } from "../apps/web/src/content/schemas/review.schema.js";
import {
  CaseLanesSchema,
  TriangleLegsSchema,
  buildTriangleCargoSchema,
} from "../apps/web/src/content/schemas/unit02-activities.schema.js";
import {
  runSchema,
  checkUniqueGlobalIds,
  checkChallengeReferences,
  checkAlternateReferences,
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
import { QUEST_TYPES } from "../apps/web/src/quest-types/index.js";
import {
  buildPrimarySourcesSchema,
  buildVisualSourcesSchema,
  UnitMetaSchema,
} from "../apps/web/src/content/schemas/primary-source-library.schema.js";
import { PRIMARY_SOURCE_LIBRARY_UNITS } from "../apps/web/src/content/primary-source-library/index.js";

function main() {
  const content = loadChronicleContent();
  const results = [];

  results.push(runSchema("unit-01-campaign.js: BRAND", BrandSchema, content.unit01.brand));
  results.push(runSchema("unit-01-campaign.js: UNIT_01", UnitSchema, content.unit01.unit));
  results.push(
    runSchema(
      "unit-01-campaign.js: CASE_001_SOURCES",
      buildSourcesSchema({}),
      content.unit01.sources
    )
  );
  results.push(
    runSchema(
      "unit-01-campaign.js: EXCHANGE_RECORDS",
      ExchangeRecordsSchema,
      content.unit01.exchangeRecords
    )
  );
  results.push(
    runSchema(
      "unit-01-campaign.js: EMPIRE_EVIDENCE",
      EmpireEvidenceListSchema,
      content.unit01.empireEvidence
    )
  );
  results.push(
    runSchema(
      "unit-01-campaign.js: EMPIRE_CONNECTIONS",
      buildEmpireConnectionsSchema(content.unit01.empireEvidence.map((card) => card.id)),
      content.unit01.empireConnections
    )
  );
  results.push(runSchema("unit-01-campaign.js: REVIEW", ReviewSchema, content.unit01.review));
  results.push(
    runSchema("unit-01-quests.js: UNIT_01_MCQ_QUESTS", McqQuestListSchema, content.unit01.mcqQuests)
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_EVIDENCE_ORGANIZING_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit01.evidenceOrganizingQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_SEQUENCING_QUESTS",
      SequencingQuestListSchema,
      content.unit01.sequencingQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_SOURCE_ANALYSIS_QUESTS",
      SourceAnalysisQuestListSchema,
      content.unit01.sourceAnalysisQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_INVESTIGATION_MCQ_QUESTS",
      McqQuestListSchema,
      content.unit01.investigationMcqQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_INVESTIGATION_SEQUENCING_QUESTS",
      SequencingQuestListSchema,
      content.unit01.investigationSequencingQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_ARCHIVE_CHALLENGE_QUESTS",
      SequencingQuestListSchema,
      content.unit01.archiveChallengeQuests
    )
  );
  results.push(
    runSchema(
      "unit-01-quests.js: UNIT_01_ARCHIVE_EVIDENCE_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit01.archiveEvidenceQuests
    )
  );

  // Teacher Mode's curated swap pool — each entry wraps a full official-shape
  // source/quest object plus a `replacesXId` pointer, validated against the
  // exact same schemas as the official content it's meant to replace (see
  // apps/web/src/content/case-001-source-alternates.js's doc comment).
  const SourceAlternatesSchema = z.array(
    z.object({
      replacesSourceId: z.string().min(1, "replacesSourceId is required"),
      source: buildSourceSchema({}),
    })
  );
  const McqAlternatesSchema = z.array(
    z.object({
      replacesQuestId: z.string().min(1, "replacesQuestId is required"),
      quest: McqQuestSchema,
    })
  );
  const SequencingAlternatesSchema = z.array(
    z.object({
      replacesQuestId: z.string().min(1, "replacesQuestId is required"),
      quest: SequencingQuestSchema,
    })
  );
  const EvidenceOrganizingAlternatesSchema = z.array(
    z.object({
      replacesQuestId: z.string().min(1, "replacesQuestId is required"),
      quest: EvidenceOrganizingQuestSchema,
    })
  );
  const SourceAnalysisAlternatesSchema = z.array(
    z.object({
      replacesQuestId: z.string().min(1, "replacesQuestId is required"),
      quest: SourceAnalysisQuestSchema,
    })
  );
  const LedgerRecordAlternatesSchema = z.array(
    z.object({
      replacesQuestId: z.string().min(1, "replacesQuestId is required"),
      quest: ExchangeRecordSchema,
    })
  );
  results.push(
    runSchema(
      "case-001-source-alternates.js: CASE_001_SOURCE_ALTERNATES",
      SourceAlternatesSchema,
      content.unit01.sourceAlternates
    )
  );
  results.push(
    runSchema(
      "case-001-mcq-alternates.js: CASE_001_MCQ_ALTERNATES",
      McqAlternatesSchema,
      content.unit01.mcqAlternates
    )
  );
  results.push(
    runSchema(
      "case-001-sequencing-alternates.js: CASE_001_SEQUENCING_ALTERNATES",
      SequencingAlternatesSchema,
      content.unit01.sequencingAlternates
    )
  );
  results.push(
    runSchema(
      "case-001-evidence-organizing-alternates.js: CASE_001_EVIDENCE_ORGANIZING_ALTERNATES",
      EvidenceOrganizingAlternatesSchema,
      content.unit01.evidenceOrganizingAlternates
    )
  );
  results.push(
    runSchema(
      "case-001-hipp-alternates.js: CASE_001_HIPP_ALTERNATES",
      SourceAnalysisAlternatesSchema,
      content.unit01.sourceAnalysisAlternates
    )
  );
  results.push(
    runSchema(
      "case-002-ledger-alternates.js: CASE_002_LEDGER_ALTERNATES",
      LedgerRecordAlternatesSchema,
      content.unit01.ledgerRecordAlternates
    )
  );
  results.push(
    runSchema(
      "case-006-evidence-organizing-alternates.js: CASE_006_EVIDENCE_ORGANIZING_ALTERNATES",
      EvidenceOrganizingAlternatesSchema,
      content.unit02.evidenceOrganizingAlternates
    )
  );

  results.push(runSchema("unit-02-campaign.js: UNIT_02", UnitSchema, content.unit02.unit));
  results.push(
    runSchema("unit-02-campaign.js: CASE_004_LANES", CaseLanesSchema, content.unit02.lanes)
  );
  results.push(
    runSchema(
      "unit-02-campaign.js: CASE_004_SOURCES",
      buildSourcesSchema({ reconstructionIds: content.unit02.lanes.map((lane) => lane.id) }),
      content.unit02.sources
    )
  );
  results.push(
    runSchema("unit-02-campaign.js: TRIANGLE_LEGS", TriangleLegsSchema, content.unit02.triangleLegs)
  );
  results.push(
    runSchema(
      "unit-02-campaign.js: TRIANGLE_CARGO",
      buildTriangleCargoSchema(content.unit02.triangleLegs.map((leg) => leg.id)),
      content.unit02.triangleCargo
    )
  );
  results.push(
    runSchema("unit-02-campaign.js: UNIT_02_REVIEW", ReviewSchema, content.unit02.review)
  );
  results.push(
    runSchema("unit-02-quests.js: UNIT_02_MCQ_QUESTS", McqQuestListSchema, content.unit02.mcqQuests)
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_EVIDENCE_ORGANIZING_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit02.evidenceOrganizingQuests
    )
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_SEQUENCING_QUESTS",
      SequencingQuestListSchema,
      content.unit02.sequencingQuests
    )
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_SOURCE_ANALYSIS_QUESTS",
      SourceAnalysisQuestListSchema,
      content.unit02.sourceAnalysisQuests
    )
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_ARCHIVE_CHALLENGE_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit02.archiveChallengeQuests
    )
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_INVESTIGATION_EVIDENCE_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit02.investigationEvidenceQuests
    )
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS",
      McqQuestListSchema,
      content.unit02.archiveStrongestEvidenceQuests
    )
  );

  results.push(runSchema("unit-03-campaign.js: UNIT_03", UnitSchema, content.unit03.unit));
  results.push(
    runSchema("unit-03-campaign.js: CASE_007_LANES", CaseLanesSchema, content.unit03.lanes)
  );
  results.push(
    runSchema(
      "unit-03-campaign.js: CASE_007_SOURCES",
      buildSourcesSchema({ reconstructionIds: content.unit03.lanes.map((lane) => lane.id) }),
      content.unit03.sources
    )
  );
  results.push(
    runSchema("unit-03-quests.js: UNIT_03_MCQ_QUESTS", McqQuestListSchema, content.unit03.mcqQuests)
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_EVIDENCE_ORGANIZING_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit03.evidenceOrganizingQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_SEQUENCING_QUESTS",
      SequencingQuestListSchema,
      content.unit03.sequencingQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_SOURCE_ANALYSIS_QUESTS",
      SourceAnalysisQuestListSchema,
      content.unit03.sourceAnalysisQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_INVESTIGATION_QUESTS",
      SourceAnalysisQuestListSchema,
      content.unit03.investigationQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_INVESTIGATION_MCQ_QUESTS",
      McqQuestListSchema,
      content.unit03.investigationMcqQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-quests.js: UNIT_03_ARCHIVE_CHALLENGE_QUESTS",
      EvidenceOrganizingQuestListSchema,
      content.unit03.archiveChallengeQuests
    )
  );
  results.push(
    runSchema(
      "unit-03-campaign.js: FOUNDING_RECORDS",
      ExchangeRecordsSchema,
      content.unit03.foundingRecords
    )
  );

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
    "cross-reference: mcq quest ids",
    "cross-reference: sequencing quest ids",
    "cross-reference: evidence-organizing quest ids",
    "cross-reference: hipp quest ids",
    "cross-reference: archive challenge quest references",
    "cross-reference: investigation challenge quest references",
    "cross-reference: source alternate references",
    "cross-reference: mcq alternate references",
    "cross-reference: sequencing alternate references",
    "cross-reference: evidence-organizing alternate references",
    "cross-reference: hipp alternate references",
    "cross-reference: ledger record alternate references",
    "cross-reference: primary source library ids",
    "cross-reference: primary source library visual ids",
  ];

  // Every quest id, grouped by QUEST_TYPES key, across all three units — the resolution set
  // archiveChallenge/investigationMode pointers below get checked against. Mirrors the same
  // questType -> content-array mapping quest-types/index.js's QUEST_TYPES keys use.
  const idsOf = (list) => list.map((quest) => quest.id);
  // Source-tagged per-type quest arrays — the single source of truth both
  // questsByType (below, for resolving a questType/questId pointer) and the
  // cross-bucket uniqueness check (further below) are built from. Every
  // array here gets merged into ONE flat lookup per type in main.js's
  // ARCHIVE_CHALLENGE_QUESTS_BY_TYPE/INVESTIGATION_QUESTS_BY_TYPE/
  // PRACTICE_CHECK_QUESTS, so an id reused across two of these arrays would
  // silently resolve to whichever one main.js's .find() hits first.
  const questArraysByType = {
    mcq: [
      { source: "unit-01-quests.js:UNIT_01_MCQ_QUESTS", items: content.unit01.mcqQuests },
      { source: "unit-02-quests.js:UNIT_02_MCQ_QUESTS", items: content.unit02.mcqQuests },
      { source: "unit-03-quests.js:UNIT_03_MCQ_QUESTS", items: content.unit03.mcqQuests },
      {
        source: "unit-01-quests.js:UNIT_01_INVESTIGATION_MCQ_QUESTS",
        items: content.unit01.investigationMcqQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_INVESTIGATION_MCQ_QUESTS",
        items: content.unit03.investigationMcqQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS",
        items: content.unit02.archiveStrongestEvidenceQuests,
      },
    ],
    sequencing: [
      {
        source: "unit-01-quests.js:UNIT_01_SEQUENCING_QUESTS",
        items: content.unit01.sequencingQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_SEQUENCING_QUESTS",
        items: content.unit02.sequencingQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_SEQUENCING_QUESTS",
        items: content.unit03.sequencingQuests,
      },
      {
        source: "unit-01-quests.js:UNIT_01_INVESTIGATION_SEQUENCING_QUESTS",
        items: content.unit01.investigationSequencingQuests,
      },
      {
        source: "unit-01-quests.js:UNIT_01_ARCHIVE_CHALLENGE_QUESTS",
        items: content.unit01.archiveChallengeQuests,
      },
    ],
    "evidence-organizing": [
      {
        source: "unit-01-quests.js:UNIT_01_EVIDENCE_ORGANIZING_QUESTS",
        items: content.unit01.evidenceOrganizingQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_EVIDENCE_ORGANIZING_QUESTS",
        items: content.unit02.evidenceOrganizingQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_EVIDENCE_ORGANIZING_QUESTS",
        items: content.unit03.evidenceOrganizingQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_ARCHIVE_CHALLENGE_QUESTS",
        items: content.unit02.archiveChallengeQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_INVESTIGATION_EVIDENCE_QUESTS",
        items: content.unit02.investigationEvidenceQuests,
      },
      {
        source: "unit-01-quests.js:UNIT_01_ARCHIVE_EVIDENCE_QUESTS",
        items: content.unit01.archiveEvidenceQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_ARCHIVE_CHALLENGE_QUESTS",
        items: content.unit03.archiveChallengeQuests,
      },
    ],
    hipp: [
      {
        source: "unit-01-quests.js:UNIT_01_SOURCE_ANALYSIS_QUESTS",
        items: content.unit01.sourceAnalysisQuests,
      },
      {
        source: "unit-02-quests.js:UNIT_02_SOURCE_ANALYSIS_QUESTS",
        items: content.unit02.sourceAnalysisQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_SOURCE_ANALYSIS_QUESTS",
        items: content.unit03.sourceAnalysisQuests,
      },
      {
        source: "unit-03-quests.js:UNIT_03_INVESTIGATION_QUESTS",
        items: content.unit03.investigationQuests,
      },
    ],
  };
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

  const crossFileErrors = [
    ...checkUniqueGlobalIds("cross-reference: case ids", [
      { source: "unit-01-campaign.js:UNIT_01.cases", items: content.unit01.unit.cases },
      { source: "unit-02-campaign.js:UNIT_02.cases", items: content.unit02.unit.cases },
      { source: "unit-03-campaign.js:UNIT_03.cases", items: content.unit03.unit.cases },
    ]),
    ...checkUniqueGlobalIds("cross-reference: source ids", [
      { source: "unit-01-campaign.js:CASE_001_SOURCES", items: content.unit01.sources },
      { source: "unit-02-campaign.js:CASE_004_SOURCES", items: content.unit02.sources },
      { source: "unit-03-campaign.js:CASE_007_SOURCES", items: content.unit03.sources },
    ]),
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
      [
        ...archiveChallengeEntries("unit-01-campaign.js:UNIT_01", content.unit01.unit),
        ...archiveChallengeEntries("unit-02-campaign.js:UNIT_02", content.unit02.unit),
        ...archiveChallengeEntries("unit-03-campaign.js:UNIT_03", content.unit03.unit),
      ],
      questTypeKeys,
      questsByType
    ),
    ...checkChallengeReferences(
      "cross-reference: investigation challenge quest references",
      [
        ...investigationEntries("unit-01-campaign.js:CASE_001_SOURCES", content.unit01.sources),
        ...investigationEntries("unit-02-campaign.js:CASE_004_SOURCES", content.unit02.sources),
        ...investigationEntries("unit-03-campaign.js:CASE_007_SOURCES", content.unit03.sources),
      ],
      questTypeKeys,
      questsByType
    ),
    ...checkAlternateReferences(
      "cross-reference: source alternate references",
      content.unit01.sourceAlternates.map((entry) => ({
        source: "case-001-source-alternates.js:CASE_001_SOURCE_ALTERNATES",
        replacesId: entry.replacesSourceId,
        altId: entry.source.id,
      })),
      content.unit01.sources.map((s) => s.id)
    ),
    ...checkAlternateReferences(
      "cross-reference: mcq alternate references",
      content.unit01.mcqAlternates.map((entry) => ({
        source: "case-001-mcq-alternates.js:CASE_001_MCQ_ALTERNATES",
        replacesId: entry.replacesQuestId,
        altId: entry.quest.id,
      })),
      content.unit01.mcqQuests.map((q) => q.id)
    ),
    ...checkAlternateReferences(
      "cross-reference: sequencing alternate references",
      content.unit01.sequencingAlternates.map((entry) => ({
        source: "case-001-sequencing-alternates.js:CASE_001_SEQUENCING_ALTERNATES",
        replacesId: entry.replacesQuestId,
        altId: entry.quest.id,
      })),
      content.unit01.sequencingQuests.map((q) => q.id)
    ),
    ...checkAlternateReferences(
      "cross-reference: evidence-organizing alternate references",
      [
        ...content.unit01.evidenceOrganizingAlternates.map((entry) => ({
          source:
            "case-001-evidence-organizing-alternates.js:CASE_001_EVIDENCE_ORGANIZING_ALTERNATES",
          replacesId: entry.replacesQuestId,
          altId: entry.quest.id,
        })),
        ...content.unit02.evidenceOrganizingAlternates.map((entry) => ({
          source:
            "case-006-evidence-organizing-alternates.js:CASE_006_EVIDENCE_ORGANIZING_ALTERNATES",
          replacesId: entry.replacesQuestId,
          altId: entry.quest.id,
        })),
      ],
      [...content.unit01.evidenceOrganizingQuests, ...content.unit02.archiveChallengeQuests].map(
        (q) => q.id
      )
    ),
    ...checkAlternateReferences(
      "cross-reference: hipp alternate references",
      content.unit01.sourceAnalysisAlternates.map((entry) => ({
        source: "case-001-hipp-alternates.js:CASE_001_HIPP_ALTERNATES",
        replacesId: entry.replacesQuestId,
        altId: entry.quest.id,
      })),
      content.unit01.sourceAnalysisQuests.map((q) => q.id)
    ),
    ...checkAlternateReferences(
      "cross-reference: ledger record alternate references",
      content.unit01.ledgerRecordAlternates.map((entry) => ({
        source: "case-002-ledger-alternates.js:CASE_002_LEDGER_ALTERNATES",
        replacesId: entry.replacesQuestId,
        altId: entry.quest.id,
      })),
      content.unit01.exchangeRecords.map((r) => r.id)
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
