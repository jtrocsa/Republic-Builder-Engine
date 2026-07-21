// Curated pool of teacher-selectable alternates for Case 1.01 primary
// sources — Teacher Mode's "swap a source" picker. Each entry's `source`
// object is validated against the same buildSourceSchema() shape as
// CASE_001_SOURCES (see scripts/validate-content.js), and keeps its own
// distinct `id` — the resolution layer (remote-content-selection-repository.js)
// re-pins the official slot's id onto the resolved object at render time, so
// nothing downstream (evidence tracking, investigation-quest gating) needs to
// know a swap happened. `replacesSourceId` must match a real CASE_001_SOURCES
// id — checked by validate-content.js's checkAlternateReferences.
//
// This is a proof-of-pipeline seed (one alternate for one slot), not full
// content parity — adding more alternates or covering case-004/case-007 is
// pure content work, no engine changes required.
export const CASE_001_SOURCE_ALTERNATES = [
  {
    replacesSourceId: "taino-context",
    source: {
      id: "taino-context-alt-encyclopedia",
      type: "Secondary context",
      title: "The Caribbean—Island Society (chiefdoms focus)",
      creator: "Library of Congress exhibition text",
      date: "1991 exhibition text",
      record: "1492: An Ongoing Voyage, Library of Congress",
      visual: "context",
      activityRoute: "village-activity",
      investigationMode: "mcq",
      investigationQuestId: "case-001-investigation-mcq-taino-origins",
      excerpt:
        "Taíno villages were governed by chieftains, or caciques, who organized farming, trade between villages, and shared ceremonies held on a central plaza.",
      prompt:
        "What does this record establish about how Taíno communities were organized before contact? Use one specific detail.",
      hippElementsAsked: ["historical_situation"],
      feedback:
        "The record establishes that Taíno communities had an organized political and social structure before European arrival. It is useful context, but it is not a Taíno-authored primary source.",
      citation:
        "Library of Congress, “What Came To Be Called ‘America’,” 1492: An Ongoing Voyage, “The Caribbean—Island Society.”",
      externalUrl: "https://www.loc.gov/exhibits/1492/america.html",
      reconstruction: "precontact",
    },
  },
];
