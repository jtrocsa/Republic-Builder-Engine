// Phase 49D: derives which Historical Thinking Skills a case's own official
// quest content actually exercises — the 4th CED dimension the roadmap
// names (Period/Key Concept/Theme/Historical Thinking Skill), alongside the
// content-authored Period/Key Concept/Theme fields (case.ced in
// unit.schema.js). Deliberately NOT a 4th independently-authored field:
// hipp/mcq/sequencing/evidence-organizing quests already carry a real
// skillCategory tag (see PHASES-46-50.md's Phase 49B), so re-deriving from
// that keeps this truthful to what a case's content actually does rather
// than letting a separately-authored tag silently drift out of sync.
//
// Pure by design: takes the case's {questType, quest} slots and the fixed
// SKILL_CATEGORIES ordering as plain arguments (main.js supplies both —
// officialQuestSlotsForCase()/SKILL_CATEGORIES) rather than importing
// anything itself, so this is directly unit-testable with plain fixtures.
export function skillsForQuestSlots(slots, skillCategoryOrder) {
  const found = new Set();
  slots.forEach(({ questType, quest }) => {
    if (questType === "hipp") {
      found.add("Sourcing");
    } else if (questType === "evidence-organizing") {
      (quest.rubric?.skillCategories || []).forEach((category) => found.add(category));
    } else if (quest.skillCategory) {
      found.add(quest.skillCategory);
    }
  });
  return skillCategoryOrder.filter((category) => found.has(category));
}
