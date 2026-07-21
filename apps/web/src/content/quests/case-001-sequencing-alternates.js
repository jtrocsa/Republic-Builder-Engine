// Curated pool of teacher-selectable alternates for Case 1.01's Sequencing
// quest — Teacher Mode's "swap a question" picker, generalized from the
// source+MCQ-only pattern established by case-001-mcq-alternates.js to the
// generic Sequencing quest type
// (apps/web/src/quest-types/generic/sequencing-quest.js). Each entry's
// `quest` object is validated against the same SequencingQuestSchema shape
// as UNIT_01_SEQUENCING_QUESTS (apps/web/src/content/quests/unit-01-quests.js).
// `replacesQuestId` must match a real UNIT_01_SEQUENCING_QUESTS id.
//
// Proof-of-pipeline seed (one alternate for one slot) — extending coverage
// to more quests or other units is pure content work.
//
// This alternate keeps Case 1.01's real events but shifts emphasis from the
// official quest's record-and-knowledge chain (Taíno society → Columbus's
// letter → the Waldseemüller map → the Hispaniola smallpox epidemic →
// horses) to a labor-and-disease chain built from the Exchange Ledger's
// real cited sources (apps/web/src/content/unit-01-campaign.js,
// EXCHANGE_RECORDS): pre-contact American agriculture, Spanish conquest
// enabled by horses, the resulting smallpox epidemic, and the forced
// African migration that Indigenous population loss helped drive — a
// distinct causal argument a teacher might prefer to assign instead.
export const CASE_001_SEQUENCING_ALTERNATES = [
  {
    replacesQuestId: "case-001-sequencing-columbian-exchange",
    quest: {
      id: "case-001-sequencing-columbian-exchange-alt-labor-and-disease",
      prompt:
        "Arrange these Case 1.01 developments in the order that reflects how each one caused or enabled the next — not simply the order the dates occurred in.",
      // Item array is deliberately NOT authored in already-correct order —
      // see renderSequencingQuest()'s own doc comment in
      // quest-types/generic/sequencing-quest.js: the array's authored order
      // is what renders before the player makes any move, so an
      // already-sorted array would hand the player the answer with zero
      // interaction. `position` (not array order) is the real answer key.
      items: [
        {
          id: "smallpox-population-collapse",
          label:
            "Sustained Spanish contact and conquest expose Indigenous populations to Old World pathogens, and Motolinía's account records smallpox devastating communities in New Spain by 1520",
          position: 2,
        },
        {
          id: "enslaved-africans-labor-migration",
          label:
            "Colonial demand for labor, intensified by catastrophic Indigenous population losses, accelerates the forced migration of Africans to the Americas under Spanish crown licenses like the 1518 authorization",
          position: 3,
        },
        {
          id: "maize-precontact-agriculture",
          label:
            "American societies already cultivate maize as a staple crop, as Acosta's 1590 account of Indigenous grain use makes clear, sustaining the large, organized populations Spanish expeditions encounter",
          position: 0,
        },
        {
          id: "horses-enable-conquest",
          label:
            "Spanish forces use horses, an animal introduced from the Old World, to help extend conquest and colonization across American societies, as Díaz del Castillo's account of Indigenous wonder at horses reflects",
          position: 1,
        },
      ],
      explanation:
        "Each step enables the next: pre-contact American societies already sustained large populations through established agriculture like maize cultivation, which is what Spanish expeditions actually encountered; horses, introduced by those same expeditions, helped Spanish forces extend conquest and colonization across those societies; that same sustained contact and conquest is what exposed Indigenous populations to Old World pathogens, producing the smallpox devastation Motolinía records in New Spain by 1520; and the resulting catastrophic population losses, combined with growing colonial labor demands, are what accelerated Spanish reliance on forced African migration under crown licenses like the 1518 authorization.",
    },
  },
];
