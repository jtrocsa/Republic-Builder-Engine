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
import * as unit01Quests from "../content/quests/unit-01-quests.js";

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
    },
  };
}
