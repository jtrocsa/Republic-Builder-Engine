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
import { buildSourcesSchema } from "../apps/web/src/content/schemas/source.schema.js";
import { ExchangeRecordsSchema } from "../apps/web/src/content/schemas/exchange-record.schema.js";
import {
  EmpireEvidenceListSchema,
  buildEmpireConnectionsSchema,
} from "../apps/web/src/content/schemas/empire.schema.js";
import { ReviewSchema } from "../apps/web/src/content/schemas/review.schema.js";
import {
  CaseLanesSchema,
  TriangleLegsSchema,
  buildTriangleCargoSchema,
  RegionRecordsSchema,
  buildRegionEvidenceSchema,
} from "../apps/web/src/content/schemas/unit02-activities.schema.js";
import {
  runSchema,
  checkUniqueGlobalIds,
  checkChallengeReferences,
} from "../apps/web/src/content/schemas/cross-reference.js";
import { McqQuestListSchema } from "../apps/web/src/quest-types/generic/mcq-quest.js";
import { SequencingQuestListSchema } from "../apps/web/src/quest-types/generic/sequencing-quest.js";
import { EvidenceOrganizingQuestListSchema } from "../apps/web/src/quest-types/history/evidence-organizing-quest.js";
import { SourceAnalysisQuestListSchema } from "../apps/web/src/quest-types/history/source-analysis-quest.js";
import { QUEST_TYPES } from "../apps/web/src/quest-types/index.js";

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
    runSchema(
      "unit-01-quests.js: UNIT_01_MCQ_QUESTS",
      McqQuestListSchema,
      content.unit01.mcqQuests
    )
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
    runSchema(
      "unit-02-campaign.js: REGION_RECORDS",
      RegionRecordsSchema,
      content.unit02.regionRecords
    )
  );
  results.push(
    runSchema(
      "unit-02-campaign.js: REGION_EVIDENCE",
      buildRegionEvidenceSchema(content.unit02.regionRecords.map((region) => region.id)),
      content.unit02.regionEvidence
    )
  );
  results.push(
    runSchema("unit-02-campaign.js: UNIT_02_REVIEW", ReviewSchema, content.unit02.review)
  );
  results.push(
    runSchema(
      "unit-02-quests.js: UNIT_02_MCQ_QUESTS",
      McqQuestListSchema,
      content.unit02.mcqQuests
    )
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
    runSchema(
      "unit-03-quests.js: UNIT_03_MCQ_QUESTS",
      McqQuestListSchema,
      content.unit03.mcqQuests
    )
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

  // Cross-file checks: main.js's caseById()/unitForCase()/sourceById() all
  // search across every unit, so case ids and source ids must be unique
  // globally, not just within their own unit's array.
  const crossFileGroups = [
    "cross-reference: case ids",
    "cross-reference: source ids",
    "cross-reference: archive challenge quest references",
    "cross-reference: investigation challenge quest references",
  ];

  // Every quest id, grouped by QUEST_TYPES key, across all three units — the resolution set
  // archiveChallenge/investigationMode pointers below get checked against. Mirrors the same
  // questType -> content-array mapping quest-types/index.js's QUEST_TYPES keys use.
  const idsOf = (list) => list.map((quest) => quest.id);
  const questsByType = {
    mcq: new Set([
      ...idsOf(content.unit01.mcqQuests),
      ...idsOf(content.unit02.mcqQuests),
      ...idsOf(content.unit03.mcqQuests),
    ]),
    sequencing: new Set([
      ...idsOf(content.unit01.sequencingQuests),
      ...idsOf(content.unit02.sequencingQuests),
      ...idsOf(content.unit03.sequencingQuests),
    ]),
    "evidence-organizing": new Set([
      ...idsOf(content.unit01.evidenceOrganizingQuests),
      ...idsOf(content.unit02.evidenceOrganizingQuests),
      ...idsOf(content.unit03.evidenceOrganizingQuests),
      ...idsOf(content.unit02.archiveChallengeQuests),
    ]),
    hipp: new Set([
      ...idsOf(content.unit01.sourceAnalysisQuests),
      ...idsOf(content.unit02.sourceAnalysisQuests),
      ...idsOf(content.unit03.sourceAnalysisQuests),
      ...idsOf(content.unit03.investigationQuests),
    ]),
  };
  const questTypeKeys = Object.keys(QUEST_TYPES);

  const archiveChallengeEntries = (unitLabel, unit) =>
    unit.cases.map((c) => ({
      source: unitLabel,
      path: `cases[${JSON.stringify(c.id)}].archiveChallenge`,
      questType: c.archiveChallenge?.questType ?? null,
      questId: c.archiveChallenge?.questId ?? null,
    }));
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
