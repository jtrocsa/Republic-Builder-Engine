/**
 * Loads "all active Chronicle content" in one call, for the validator, the field-guide builder
 * and the content sweeps in tests/unit/. It does not move, duplicate or transform any content —
 * every value it returns is the same object `main.js` imports directly, under a shorter key.
 * `main.js` keeps importing `content/*.js` itself and is unaffected by this file's existence.
 *
 * This file used to name all sixty quest arrays and twenty-three campaign exports by hand, which
 * made it one of the four files a new unit had to be threaded through. It doesn't any more: the
 * per-unit blocks are derived from each module's own export names, because those names are
 * perfectly regular and always have been.
 *
 *   UNIT_07_ARCHIVE_EVIDENCE_QUESTS  ->  archiveEvidenceQuests
 *   CASE_019_SOURCES                 ->  sources
 *   UNIT_02_REVIEW                   ->  review
 *
 * The important property is not that this is shorter. It is that the old shape failed silently: a
 * quest array left off the list was simply never validated, and nothing said so. Here every export
 * of a registered module is picked up, and `validate-content.js` refuses a key it has no schema
 * for — so the same mistake now fails loudly at the other end instead of quietly here.
 *
 * The one thing still written out by hand is Teacher Mode's curated swap pool. Those are keyed to
 * individual cases rather than to units (Case 1.01 and Case 1.06 only — a proof-of-pipeline seed,
 * see apps/web/src/content/case-001-source-alternates.js), so there is no per-unit pattern to
 * derive them from, and inventing one would be pretending the pipeline is broader than it is.
 */
import { UNIT_IDS, unitContentKey, unitNumber } from "../content/unit-registry.js";
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
import { UNIT_07_ACTIVITIES } from "../content/activities/unit-07-activities.js";
import { CASE_001_SOURCE_ALTERNATES } from "../content/case-001-source-alternates.js";
import { CASE_001_MCQ_ALTERNATES } from "../content/quests/case-001-mcq-alternates.js";
import { CASE_001_SEQUENCING_ALTERNATES } from "../content/quests/case-001-sequencing-alternates.js";
import { CASE_001_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-001-evidence-organizing-alternates.js";
import { CASE_001_HIPP_ALTERNATES } from "../content/quests/case-001-hipp-alternates.js";
import { CASE_006_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-006-evidence-organizing-alternates.js";

/**
 * The three modules that make up a unit. This is the only per-unit list left in the file, and a
 * new unit costs one line in it plus its three imports above — static, because Vite has to see
 * them, and because a grep for `unit-08-quests.js` should find this file.
 *
 * Activity content is keyed by the source id each activity opens from, for the four engines in
 * engine/activities/. Every authored field map has three.
 */
const UNIT_MODULES = {
  "unit-01": { campaign: unit01Campaign, quests: unit01Quests, activities: UNIT_01_ACTIVITIES },
  "unit-02": { campaign: unit02Campaign, quests: unit02Quests, activities: UNIT_02_ACTIVITIES },
  "unit-03": { campaign: unit03Campaign, quests: unit03Quests, activities: UNIT_03_ACTIVITIES },
  "unit-04": { campaign: unit04Campaign, quests: unit04Quests, activities: UNIT_04_ACTIVITIES },
  "unit-05": { campaign: unit05Campaign, quests: unit05Quests, activities: UNIT_05_ACTIVITIES },
  "unit-06": { campaign: unit06Campaign, quests: unit06Quests, activities: UNIT_06_ACTIVITIES },
  "unit-07": { campaign: unit07Campaign, quests: unit07Quests, activities: UNIT_07_ACTIVITIES },
};

/**
 * Teacher Mode's curated swap pool, and the only content here not keyed by unit. Case 1.01 and
 * Case 1.06 only — a proof-of-pipeline seed, see apps/web/src/content/case-001-source-alternates.js
 * for what it is and is not. There is no per-unit pattern to derive these from, and inventing one
 * would be pretending the pipeline is broader than it is.
 */
const ALTERNATES = {
  unit01: {
    sourceAlternates: ["case-001-source-alternates.js", CASE_001_SOURCE_ALTERNATES],
    mcqAlternates: ["case-001-mcq-alternates.js", CASE_001_MCQ_ALTERNATES],
    sequencingAlternates: ["case-001-sequencing-alternates.js", CASE_001_SEQUENCING_ALTERNATES],
    evidenceOrganizingAlternates: [
      "case-001-evidence-organizing-alternates.js",
      CASE_001_EVIDENCE_ORGANIZING_ALTERNATES,
    ],
    sourceAnalysisAlternates: ["case-001-hipp-alternates.js", CASE_001_HIPP_ALTERNATES],
  },
  unit02: {
    evidenceOrganizingAlternates: [
      "case-006-evidence-organizing-alternates.js",
      CASE_006_EVIDENCE_ORGANIZING_ALTERNATES,
    ],
  },
};

/** The export name each alternates file uses, recovered from its filename: `case-001-x.js` -> `CASE_001_X`. */
function alternatesExportName(file) {
  return file.replace(/\.js$/, "").replace(/-/g, "_").toUpperCase();
}

/** `ARCHIVE_EVIDENCE_QUESTS` -> `archiveEvidenceQuests`. */
function camelCase(screamingSnake) {
  return screamingSnake.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * A campaign module's exports don't share one prefix the way a quest module's do — a unit's own
 * object is `UNIT_04`, its sources and lanes are named for the case they belong to, and only Units
 * 1 and 2 carry a review at all. Five rules cover all twenty-three exports across the seven
 * campaigns. Anything a future campaign exports that none of them match is returned under its own
 * camelCased name rather than dropped, so a new export shows up somewhere rather than nowhere.
 */
function campaignEntries(unitId, campaign) {
  const unitExport = `UNIT_${unitNumber(unitId)}`;
  const file = `${unitId}-campaign.js`;
  const keyFor = (name) => {
    if (name === unitExport) return "unit";
    if (name === "BRAND") return "brand";
    if (name.endsWith("_SOURCES")) return "sources";
    if (name.endsWith("_LANES")) return "lanes";
    if (name.endsWith("REVIEW")) return "review";
    return camelCase(name);
  };
  return Object.entries(campaign).map(([name, value]) => ({
    key: keyFor(name),
    value,
    origin: { file, exportName: name },
  }));
}

/**
 * A quest module's exports are entirely regular: every one is `UNIT_NN_` followed by the quest
 * list's name. The throw is worth keeping rather than tidying away — it is the thing standing
 * between "someone exported a quest array under a different name" and that array never being
 * validated again.
 */
function questEntries(unitId, quests) {
  const prefix = `UNIT_${unitNumber(unitId)}_`;
  const file = `${unitId}-quests.js`;
  return Object.entries(quests).map(([name, value]) => {
    if (!name.startsWith(prefix)) {
      throw new Error(
        `${unitId} quests: export "${name}" does not start with "${prefix}". Every quest array is ` +
          "named for its unit so the validator can find it — rename the export rather than " +
          "special-casing it here, or it will stop being validated."
      );
    }
    return {
      key: camelCase(name.slice(prefix.length)),
      value,
      origin: { file, exportName: name },
    };
  });
}

/**
 * Every content entry of every registered unit, as `{ key, value, origin }`. The two exported
 * loaders below are both views of this — one keeps the values, one keeps the origins — so they
 * cannot drift apart into a validator that reports one file's name while checking another's.
 */
function unitEntries(unitId) {
  const missing = UNIT_IDS.filter((id) => !UNIT_MODULES[id]);
  if (missing.length) {
    throw new Error(
      `unit-registry.js lists ${missing.join(", ")} but local-content-repository.js has no ` +
        "modules for them — add the imports and the UNIT_MODULES line."
    );
  }
  const { campaign, quests, activities } = UNIT_MODULES[unitId];
  const alternates = ALTERNATES[unitContentKey(unitId)] || {};
  return [
    ...campaignEntries(unitId, campaign),
    {
      key: "activities",
      value: activities,
      origin: {
        file: `${unitId}-activities.js`,
        exportName: `UNIT_${unitNumber(unitId)}_ACTIVITIES`,
      },
    },
    ...questEntries(unitId, quests),
    ...Object.entries(alternates).map(([key, [file, value]]) => ({
      key,
      value,
      origin: { file, exportName: alternatesExportName(file) },
    })),
  ];
}

/** Every unit's content, keyed `unit01`...`unit07`. The shape the validator and tests read. */
export function loadChronicleContent() {
  return Object.fromEntries(
    UNIT_IDS.map((unitId) => [
      unitContentKey(unitId),
      Object.fromEntries(unitEntries(unitId).map(({ key, value }) => [key, value])),
    ])
  );
}

/**
 * The same shape, but each value is the `{ file, exportName }` the content came from — so a
 * validation failure can name `unit-04-quests.js: UNIT_04_ARCHIVE_DBQ_QUESTS` rather than the
 * camelCased key nobody can grep for.
 */
export function chronicleContentOrigins() {
  return Object.fromEntries(
    UNIT_IDS.map((unitId) => [
      unitContentKey(unitId),
      Object.fromEntries(unitEntries(unitId).map(({ key, origin }) => [key, origin])),
    ])
  );
}
