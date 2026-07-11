// Minimal quest-type lookup — not a registry, not a plugin-discovery system.
// Adding a third quest type later means one more entry here; nothing else
// changes. See docs/architecture/QUEST-TYPE-ARCHITECTURE.md for why this is
// deliberately this small (PlatformCore/QuestEngine renderer registries
// remain a separate, deferred, cross-subject concern — see
// docs/architecture/ARCHITECTURE-QUICKREF.md §8).
import {
  McqQuestSchema,
  McqQuestListSchema,
  renderMcqQuest,
  gradeMcqQuest,
} from "./generic/mcq-quest.js";
import {
  SequencingQuestSchema,
  SequencingQuestListSchema,
  renderSequencingQuest,
  gradeSequencingQuest,
} from "./generic/sequencing-quest.js";
import {
  EvidenceOrganizingQuestSchema,
  EvidenceOrganizingQuestListSchema,
  renderEvidenceOrganizingQuest,
  gradeEvidenceOrganizingQuest,
} from "./history/evidence-organizing-quest.js";
import {
  SourceAnalysisQuestSchema,
  SourceAnalysisQuestListSchema,
  renderSourceAnalysisQuest,
  gradeSourceAnalysisQuest,
} from "./history/source-analysis-quest.js";

// Key naming note: the evidence-organizing entry keeps the key
// "evidence-organizing" (established in Phase 8, already wired into
// local-content-repository.js/validate-content.js/tests) rather than the
// shorter "evidence" a later planning note suggested — renaming a shipped
// key for no functional reason isn't worth the churn.
export const QUEST_TYPES = {
  mcq: {
    schema: McqQuestSchema,
    listSchema: McqQuestListSchema,
    render: renderMcqQuest,
    grade: gradeMcqQuest,
  },
  sequencing: {
    schema: SequencingQuestSchema,
    listSchema: SequencingQuestListSchema,
    render: renderSequencingQuest,
    grade: gradeSequencingQuest,
  },
  "evidence-organizing": {
    schema: EvidenceOrganizingQuestSchema,
    listSchema: EvidenceOrganizingQuestListSchema,
    render: renderEvidenceOrganizingQuest,
    grade: gradeEvidenceOrganizingQuest,
  },
  hipp: {
    schema: SourceAnalysisQuestSchema,
    listSchema: SourceAnalysisQuestListSchema,
    render: renderSourceAnalysisQuest,
    grade: gradeSourceAnalysisQuest,
  },
};

function requireQuestType(questType) {
  const type = QUEST_TYPES[questType];
  if (!type) {
    throw new Error(
      `Unknown quest type "${questType}" — known types: ${Object.keys(QUEST_TYPES).join(", ")}`,
    );
  }
  return type;
}

export function renderQuest(questType, quest, state) {
  return requireQuestType(questType).render(quest, state);
}

export function gradeQuest(questType, quest, state) {
  return requireQuestType(questType).grade(quest, state);
}
