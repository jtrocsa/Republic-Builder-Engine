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
import * as unit01Quests from "../content/quests/unit-01-quests.js";
import * as unit02Quests from "../content/quests/unit-02-quests.js";
import * as unit03Quests from "../content/quests/unit-03-quests.js";

export function loadChronicleContent() {
  return {
    unit01: {
      brand: unit01Campaign.BRAND,
      unit: unit01Campaign.UNIT_01,
      sources: unit01Campaign.CASE_001_SOURCES,
      exchangeRecords: unit01Campaign.EXCHANGE_RECORDS,
      empireEvidence: unit01Campaign.EMPIRE_EVIDENCE,
      empireConnections: unit01Campaign.EMPIRE_CONNECTIONS,
      review: unit01Campaign.REVIEW,
      mcqQuests: unit01Quests.UNIT_01_MCQ_QUESTS,
      evidenceOrganizingQuests: unit01Quests.UNIT_01_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit01Quests.UNIT_01_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit01Quests.UNIT_01_SOURCE_ANALYSIS_QUESTS,
    },
    unit02: {
      unit: unit02Campaign.UNIT_02,
      sources: unit02Campaign.CASE_004_SOURCES,
      lanes: unit02Campaign.CASE_004_LANES,
      triangleLegs: unit02Campaign.TRIANGLE_LEGS,
      triangleCargo: unit02Campaign.TRIANGLE_CARGO,
      regionRecords: unit02Campaign.REGION_RECORDS,
      regionEvidence: unit02Campaign.REGION_EVIDENCE,
      review: unit02Campaign.UNIT_02_REVIEW,
      mcqQuests: unit02Quests.UNIT_02_MCQ_QUESTS,
      evidenceOrganizingQuests: unit02Quests.UNIT_02_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit02Quests.UNIT_02_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit02Quests.UNIT_02_SOURCE_ANALYSIS_QUESTS,
      archiveChallengeQuests: unit02Quests.UNIT_02_ARCHIVE_CHALLENGE_QUESTS,
    },
    unit03: {
      unit: unit03Campaign.UNIT_03,
      sources: unit03Campaign.CASE_007_SOURCES,
      lanes: unit03Campaign.CASE_007_LANES,
      mcqQuests: unit03Quests.UNIT_03_MCQ_QUESTS,
      evidenceOrganizingQuests: unit03Quests.UNIT_03_EVIDENCE_ORGANIZING_QUESTS,
      sequencingQuests: unit03Quests.UNIT_03_SEQUENCING_QUESTS,
      sourceAnalysisQuests: unit03Quests.UNIT_03_SOURCE_ANALYSIS_QUESTS,
    },
  };
}
