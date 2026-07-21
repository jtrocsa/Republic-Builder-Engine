// Curated pool of teacher-selectable alternates for Case 6's Evidence
// Organizing Archive Challenge — Teacher Mode's "swap a question" picker,
// generalized from the source+MCQ-only pattern established by
// case-001-mcq-alternates.js to the history Evidence Organizing quest type
// (apps/web/src/quest-types/history/evidence-organizing-quest.js). Each
// entry's `quest` object is validated against the same
// EvidenceOrganizingQuestSchema shape as UNIT_02_ARCHIVE_CHALLENGE_QUESTS
// (apps/web/src/content/quests/unit-02-quests.js). `replacesQuestId` must
// match a real UNIT_02_ARCHIVE_CHALLENGE_QUESTS id.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to more quests or other units is pure content work.
//
// The official case-006-archive-region-display quest sorts six founding
// records across New England, the Middle Colonies, and the Southern
// Colonies. This alternate is a shorter, simpler variant for a teacher who
// wants an easier version of the same region-comparison task: just three
// records, one per region, using real primary-source excerpts different
// from the official six — the Mayflower Compact (1620), the Flushing
// Remonstrance (1657), and Richard Frethorne's 1623 servant's letter (the
// same letter already used, in full, as a real Case 4 source in
// apps/web/src/content/unit-02-campaign.js's CASE_004_SOURCES).
export const CASE_006_EVIDENCE_ORGANIZING_ALTERNATES = [
  {
    replacesQuestId: "case-006-archive-region-display",
    quest: {
      id: "case-006-archive-region-display-alt-three-record",
      prompt:
        "The Archive's display of the colonial regions is damaged. Return each founding record to the society it built, then defend one comparison in your reflection.",
      slots: [
        { id: "new-england", label: "New England" },
        { id: "middle", label: "Middle Colonies" },
        { id: "southern", label: "Southern Colonies" },
      ],
      sources: [
        {
          id: "mayflower-compact",
          label: "Mayflower Compact",
          attribution: "Plymouth colonists, 1620",
          excerpt:
            "“We whose names are underwritten … do by these presents solemnly and mutually in the presence of God and one another, covenant and combine ourselves together into a civil body politic, for our better ordering and preservation … and by virtue hereof to enact, constitute, and frame such just and equal laws, ordinances, acts, constitutions, and offices … as shall be thought most meet and convenient for the general good of the colony.”",
          skillCategory: "Comparison",
          correctSlotId: "new-england",
        },
        {
          id: "flushing-remonstrance",
          label: "Flushing Remonstrance",
          attribution:
            "Residents of Flushing, New Netherland, petition to Director-General Peter Stuyvesant, 1657",
          excerpt:
            "“Love, peace, and liberty, extending to all in Christ Jesus, condemns hatred, war, and bondage” — a protest against Stuyvesant's order banning Quaker worship, arguing the colony's charter obliged it to tolerate diverse faiths.",
          skillCategory: "Comparison",
          correctSlotId: "middle",
        },
        {
          id: "frethorne-letter-region",
          label: "Servant's letter",
          attribution: "Richard Frethorne to his father and mother, Virginia, 1623",
          excerpt:
            "Frethorne wrote home describing hunger, sickness, and fear as a bound servant recruited to Virginia under the promise of land at the end of his term, begging his parents to secure his release.",
          skillCategory: "Comparison",
          correctSlotId: "southern",
        },
      ],
      reflectionPrompt: "Which difference between two regions does your evidence best prove?",
      rubric: {
        skillCategories: ["Comparison"],
        pointsTotal: 3,
        description: "Earn 1 point per founding record correctly returned to the region it built.",
      },
    },
  },
];
