/**
 * Thin wrapper around Chronicle's existing content module imports.
 *
 * This does not move, duplicate, or transform any content — it re-exports
 * the same named exports `main.js` already imports directly, grouped into
 * one shape so a caller (currently only `scripts/validate-content.js`) can
 * load "all active Chronicle content" in one call instead of importing each
 * content file itself. `main.js` keeps importing `content/*.js` directly and
 * is unaffected by this file's existence.
 */
import * as unit01Campaign from "../content/unit-01-campaign.js";
import * as unit02Campaign from "../content/unit-02-campaign.js";
import * as unit03Campaign from "../content/unit-03-campaign.js";
import * as unit04Campaign from "../content/unit-04-campaign.js";
import * as unit05Campaign from "../content/unit-05-campaign.js";
import * as unit06Campaign from "../content/unit-06-campaign.js";
import * as unit07Campaign from "../content/unit-07-campaign.js";
import * as unit01Quests from "../content/quests/unit-01-quests.js";
import * as unit02Quests from "../content/quests/unit-02-quests.js";
import * as unit03Quests from "../content/quests/unit-03-quests.js";
import * as unit04Quests from "../content/quests/unit-04-quests.js";
import * as unit05Quests from "../content/quests/unit-05-quests.js";
import * as unit06Quests from "../content/quests/unit-06-quests.js";
import * as unit07Quests from "../content/quests/unit-07-quests.js";
import { UNIT_01_ACTIVITIES } from "../content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "../content/activities/unit-02-activities.js";
import { UNIT_03_ACTIVITIES } from "../content/activities/unit-03-activities.js";
import { UNIT_04_ACTIVITIES } from "../content/activities/unit-04-activities.js";
import { UNIT_05_ACTIVITIES } from "../content/activities/unit-05-activities.js";
import { UNIT_06_ACTIVITIES } from "../content/activities/unit-06-activities.js";
import { CASE_001_SOURCE_ALTERNATES } from "../content/case-001-source-alternates.js";
import { CASE_001_MCQ_ALTERNATES } from "../content/quests/case-001-mcq-alternates.js";
import { CASE_001_SEQUENCING_ALTERNATES } from "../content/quests/case-001-sequencing-alternates.js";
import { CASE_001_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-001-evidence-organizing-alternates.js";
import { CASE_001_HIPP_ALTERNATES } from "../content/quests/case-001-hipp-alternates.js";
import { CASE_006_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-006-evidence-organizing-alternates.js";

export function loadChronicleContent() {
  return {
    unit01: {
      brand: unit01Campaign.BRAND,
      unit: unit01Campaign.UNIT_01,
      sources: unit01Campaign.CASE_001_SOURCES,
      // Activity content for the four engines in engine/activities/, keyed by the source id each
      // one opens from. Every authored field map has three as of Phase 81F.
      activities: UNIT_01_ACTIVITIES,
      review: unit01Campaign.REVIEW,
      mcqQuests: unit01Quests.UNIT_01_MCQ_QUESTS,
      evidenceOrganizingQuests: unit01Quests.UNIT_01_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit01Quests.UNIT_01_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit01Quests.UNIT_01_SOURCE_ANALYSIS_QUESTS,
      investigationMcqQuests: unit01Quests.UNIT_01_INVESTIGATION_MCQ_QUESTS,
      investigationSequencingQuests: unit01Quests.UNIT_01_INVESTIGATION_SEQUENCING_QUESTS,
      readerMcqQuests: unit01Quests.UNIT_01_READER_MCQ_QUESTS,
      archiveChallengeQuests: unit01Quests.UNIT_01_ARCHIVE_CHALLENGE_QUESTS,
      archiveEvidenceQuests: unit01Quests.UNIT_01_ARCHIVE_EVIDENCE_QUESTS,
      archiveSaqQuests: unit01Quests.UNIT_01_ARCHIVE_SAQ_QUESTS,
      // Teacher Mode's curated swap pool (apps/web/src/repositories/
      // remote-content-selection-repository.js) — proof-of-pipeline seed for
      // Case 1.01 only, see docs/architecture for the plan this was built
      // against.
      sourceAlternates: CASE_001_SOURCE_ALTERNATES,
      mcqAlternates: CASE_001_MCQ_ALTERNATES,
      sequencingAlternates: CASE_001_SEQUENCING_ALTERNATES,
      evidenceOrganizingAlternates: CASE_001_EVIDENCE_ORGANIZING_ALTERNATES,
      sourceAnalysisAlternates: CASE_001_HIPP_ALTERNATES,
    },
    unit02: {
      unit: unit02Campaign.UNIT_02,
      sources: unit02Campaign.CASE_004_SOURCES,
      lanes: unit02Campaign.CASE_004_LANES,
      activities: UNIT_02_ACTIVITIES,
      review: unit02Campaign.UNIT_02_REVIEW,
      mcqQuests: unit02Quests.UNIT_02_MCQ_QUESTS,
      readerMcqQuests: unit02Quests.UNIT_02_READER_MCQ_QUESTS,
      evidenceOrganizingQuests: unit02Quests.UNIT_02_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit02Quests.UNIT_02_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit02Quests.UNIT_02_SOURCE_ANALYSIS_QUESTS,
      archiveChallengeQuests: unit02Quests.UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
      investigationEvidenceQuests: unit02Quests.UNIT_02_INVESTIGATION_EVIDENCE_QUESTS,
      archiveStrongestEvidenceQuests: unit02Quests.UNIT_02_ARCHIVE_STRONGEST_EVIDENCE_QUESTS,
      archiveSequencingQuests: unit02Quests.UNIT_02_ARCHIVE_SEQUENCING_QUESTS,
      archiveSaqQuests: unit02Quests.UNIT_02_ARCHIVE_SAQ_QUESTS,
      evidenceOrganizingAlternates: CASE_006_EVIDENCE_ORGANIZING_ALTERNATES,
    },
    unit03: {
      unit: unit03Campaign.UNIT_03,
      sources: unit03Campaign.CASE_007_SOURCES,
      lanes: unit03Campaign.CASE_007_LANES,
      activities: UNIT_03_ACTIVITIES,
      mcqQuests: unit03Quests.UNIT_03_MCQ_QUESTS,
      evidenceOrganizingQuests: unit03Quests.UNIT_03_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit03Quests.UNIT_03_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit03Quests.UNIT_03_SOURCE_ANALYSIS_QUESTS,
      investigationQuests: unit03Quests.UNIT_03_INVESTIGATION_QUESTS,
      investigationMcqQuests: unit03Quests.UNIT_03_INVESTIGATION_MCQ_QUESTS,
      archiveChallengeQuests: unit03Quests.UNIT_03_ARCHIVE_CHALLENGE_QUESTS,
      archiveMcqQuests: unit03Quests.UNIT_03_ARCHIVE_MCQ_QUESTS,
      archiveSaqQuests: unit03Quests.UNIT_03_ARCHIVE_SAQ_QUESTS,
      archiveDbqQuests: unit03Quests.UNIT_03_ARCHIVE_DBQ_QUESTS,
    },
    // Unit 4 carries no investigation quests — see the header of unit-04-quests.js for why, and
    // note that adding them later is additive rather than a change to anything here.
    unit04: {
      unit: unit04Campaign.UNIT_04,
      sources: unit04Campaign.CASE_010_SOURCES,
      lanes: unit04Campaign.CASE_010_LANES,
      activities: UNIT_04_ACTIVITIES,
      mcqQuests: unit04Quests.UNIT_04_MCQ_QUESTS,
      evidenceOrganizingQuests: unit04Quests.UNIT_04_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit04Quests.UNIT_04_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit04Quests.UNIT_04_SOURCE_ANALYSIS_QUESTS,
      archiveSequencingQuests: unit04Quests.UNIT_04_ARCHIVE_SEQUENCING_QUESTS,
      archiveSourceAnalysisQuests: unit04Quests.UNIT_04_ARCHIVE_SOURCE_ANALYSIS_QUESTS,
      archiveSaqQuests: unit04Quests.UNIT_04_ARCHIVE_SAQ_QUESTS,
      archiveDbqQuests: unit04Quests.UNIT_04_ARCHIVE_DBQ_QUESTS,
    },
    // Unit 5 carries no investigation quests either, for the same reason Unit 4 does not. Its two
    // missions are a sequencing and an evidence-organizing, so it has an archiveEvidenceQuests key
    // where Unit 4 has archiveSourceAnalysisQuests.
    unit05: {
      unit: unit05Campaign.UNIT_05,
      sources: unit05Campaign.CASE_013_SOURCES,
      lanes: unit05Campaign.CASE_013_LANES,
      activities: UNIT_05_ACTIVITIES,
      mcqQuests: unit05Quests.UNIT_05_MCQ_QUESTS,
      evidenceOrganizingQuests: unit05Quests.UNIT_05_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit05Quests.UNIT_05_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit05Quests.UNIT_05_SOURCE_ANALYSIS_QUESTS,
      archiveSequencingQuests: unit05Quests.UNIT_05_ARCHIVE_SEQUENCING_QUESTS,
      archiveEvidenceQuests: unit05Quests.UNIT_05_ARCHIVE_EVIDENCE_QUESTS,
      archiveSaqQuests: unit05Quests.UNIT_05_ARCHIVE_SAQ_QUESTS,
      archiveDbqQuests: unit05Quests.UNIT_05_ARCHIVE_DBQ_QUESTS,
    },
    // Unit 6 reached parity with Units 1-5 in Phase 87: its map shipped in Phase 85, its two
    // interiors in Phase 86, and its three activities here. Its two missions are a hipp and an mcq,
    // so it has archiveSourceAnalysisQuests and archiveMcqQuests where Unit 5 has
    // archiveSequencingQuests and archiveEvidenceQuests. First unit to carry that pair.
    unit06: {
      unit: unit06Campaign.UNIT_06,
      sources: unit06Campaign.CASE_016_SOURCES,
      lanes: unit06Campaign.CASE_016_LANES,
      activities: UNIT_06_ACTIVITIES,
      mcqQuests: unit06Quests.UNIT_06_MCQ_QUESTS,
      evidenceOrganizingQuests: unit06Quests.UNIT_06_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit06Quests.UNIT_06_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit06Quests.UNIT_06_SOURCE_ANALYSIS_QUESTS,
      archiveSourceAnalysisQuests: unit06Quests.UNIT_06_ARCHIVE_SOURCE_ANALYSIS_QUESTS,
      archiveMcqQuests: unit06Quests.UNIT_06_ARCHIVE_MCQ_QUESTS,
      archiveSaqQuests: unit06Quests.UNIT_06_ARCHIVE_SAQ_QUESTS,
      archiveDbqQuests: unit06Quests.UNIT_06_ARCHIVE_DBQ_QUESTS,
    },
    // Unit 7 is registered here for validation and is deliberately NOT wired into main.js's UNITS
    // yet: its map is unbuilt, so a Chronotravel to case-019 has nowhere to land and
    // activeFieldMap() would silently fall back to Unit 1's Caribbean. It carries no `activities`
    // key for the same reason Unit 6 carried none between Phase 85 and Phase 87 — every one of its
    // seven sources has `activityRoute: null`, and checkActivityRoutes() only demands an activity
    // for a route that names an engine. Its two missions are an evidence-organizing and a
    // sequencing, which is Unit 5's pair rather than Unit 6's.
    unit07: {
      unit: unit07Campaign.UNIT_07,
      sources: unit07Campaign.CASE_019_SOURCES,
      lanes: unit07Campaign.CASE_019_LANES,
      mcqQuests: unit07Quests.UNIT_07_MCQ_QUESTS,
      evidenceOrganizingQuests: unit07Quests.UNIT_07_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit07Quests.UNIT_07_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit07Quests.UNIT_07_SOURCE_ANALYSIS_QUESTS,
      archiveEvidenceQuests: unit07Quests.UNIT_07_ARCHIVE_EVIDENCE_QUESTS,
      archiveSequencingQuests: unit07Quests.UNIT_07_ARCHIVE_SEQUENCING_QUESTS,
      archiveSaqQuests: unit07Quests.UNIT_07_ARCHIVE_SAQ_QUESTS,
      archiveDbqQuests: unit07Quests.UNIT_07_ARCHIVE_DBQ_QUESTS,
    },
  };
}
