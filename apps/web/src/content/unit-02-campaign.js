/**
 * Unit 2 — Period 2: 1607–1754.
 *
 * Structural mirror of unit-01-campaign.js. Real, cited historical content
 * for all three cases (Riverbend, Triangle Ledger, Charter & Compact) and the
 * unit-level Archive Review (UNIT_02_REVIEW).
 */

export const UNIT_02 = {
  id: "unit-02",
  title: "Colonial Crossroads",
  period: "Period 2 · 1607–1754",
  description:
    "How distinct colonial societies took shape along the Atlantic seaboard — Chesapeake tobacco settlements built on headright land grants and bound labor, New England's covenanted farming and fishing towns, and the Middle Colonies' diverse grain-exporting ports — all bound together by a transatlantic economy in goods, cash crops, and enslaved people.",
  centralQuestion:
    "How did geography, labor systems, and the transatlantic economy produce distinct colonial societies in British North America between 1607 and 1754?",
  // Unit-level bonus Archive Challenges (Phase C of the Investigation/Archive
  // Challenge plan's catalog-expansion pass) — not tied to relocating any
  // single case's activity screen; reachable from the Archive Terminal's
  // archiveChallengesScreen(). Completing both, alongside every case, is
  // required for unit completion (see main.js's unitReadyForReview()).
  archiveChallenges: [
    {
      questType: "mcq",
      questId: "unit-02-archive-strongest-evidence-coerced-labor",
    },
    {
      questType: "mcq",
      questId: "unit-02-archive-strongest-evidence-mercantile-policy",
    },
  ],
  cases: [
    {
      id: "case-004",
      shortTitle: "Riverbend",
      title: "The Riverbend Settlement",
      date: "1619",
      mapPosition: { lat: 37.24, lon: -76.78 },
      location: "Chesapeake tidewater, Virginia · 1619–1630",
      question:
        "What do a land charter, a servant's letter, and a wharf ledger reveal about who did this settlement's work and who held its power?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a young tobacco settlement on the James River, speak with its people, and secure three records — a company land charter, a servant's letter, and a wharf account — before they are lost.",
      // Phase 49D CED alignment (content/ced-taxonomy.js). KC 2.1 (colonial
      // migration/settlement patterns and competition for resources — the
      // headright charter) + 2.2 (economic ties to Britain — the wharf
      // ledger). Themes: WXT (the tobacco/labor economy this case's whole
      // wharf-ledger record documents) and MIG (headright-driven settlement
      // and bound-labor migration).
      ced: { period: 2, keyConcepts: ["2.1", "2.2"], themes: ["WXT", "MIG"] },
    },
    {
      id: "case-005",
      shortTitle: "Triangle Ledger",
      title: "The Triangle Ledger",
      date: "1732",
      mapPosition: { lat: 13.1, lon: -59.6 },
      location: "The Atlantic circuit",
      question:
        "What did each leg of the transatlantic trade actually carry, and who bore its human and economic costs?",
      mechanic: "Trade Route Plotter",
      // An Archive Challenge mission (Phase 48A) — Chronotravel routes straight
      // to archiveChallengesScreen() rather than a bespoke field screen. The
      // mission's mechanic is entirely its archiveChallenge quest below (see
      // the now-deleted triangleScreen()/TRIANGLE_LEGS/TRIANGLE_CARGO note
      // further down this file), matching the Case 1.06 precedent.
      route: "archive-challenges",
      summary:
        "Reconstruct the triangular trade from six real shipping and testimony records — plot each cargo onto the leg of the circuit that carried it, then weigh what each record proves about the system binding Europe, Africa, and the Americas together.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-005-archive-triangle-cargo",
      },
      // KC 2.2 — the transatlantic economic exchanges (mercantile trade)
      // this case's whole route-plotter mechanic reconstructs. Themes: WXT
      // (the trade system itself), WOR (Europe/Africa/Americas interaction),
      // MIG (the forced migration of enslaved people this case names as one
      // of the circuit's human costs).
      ced: { period: 2, keyConcepts: ["2.2"], themes: ["WXT", "WOR", "MIG"] },
    },
    {
      id: "case-006",
      shortTitle: "Charter & Compact",
      title: "Charter & Compact",
      date: "1607–1754",
      mapPosition: { lat: 42.4, lon: -71.1 },
      location: "The thirteen colonies",
      question:
        "What do a town covenant, a headright grant, an indenture, a liberty-of-conscience clause, a grain manifest, and a school law reveal about the different societies colonists built in British North America?",
      mechanic: "Region Builder",
      // An Archive Challenge mission (Phase 48A) — Chronotravel routes straight
      // to archiveChallengesScreen() rather than a bespoke field screen (see
      // archiveChallenge below).
      route: "archive-challenges",
      summary:
        "Restore the Archive's damaged display of the colonial regions by returning each founding record — from a Puritan town covenant to a Quaker liberty-of-conscience clause — to the society it built, then defend one difference between two regions in your own words.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-006-archive-region-display",
      },
      // KC 2.1 — distinct colonization/migration patterns across regions,
      // the exact comparison this case's Region Builder mechanic asks for.
      // Themes: MIG (regional settlement patterns) and GEO (how each
      // region's environment shaped the society built on it).
      ced: { period: 2, keyConcepts: ["2.1"], themes: ["MIG", "GEO"] },
    },
  ],
};

export const CASE_004_SOURCES = [
  {
    id: "riverbend-charter",
    type: "Primary source · charter instructions",
    title: "Instructions to Governor George Yeardley",
    creator: "Virginia Company of London",
    date: "1618",
    record: "Company instructions establishing the headright system, Virginia",
    visual: "context",
    activityRoute: null,
    excerpt:
      "The Virginia Company instructed its governor to grant fifty acres of land to every person transported into the colony at his own charge, and fifty acres more for every servant he brought and settled there — a policy meant to draw settlers by tying land ownership to the number of people, free or bound, a planter could bring across the Atlantic.",
    prompt:
      "What did the Virginia Company hope to accomplish by tying land grants to the number of people a planter transported — including servants?",
    feedback:
      "Institute Context: the 1618 instructions to Governor Yeardley created the headright system — fifty acres for every settler transported, and fifty more for every servant brought with him. By rewarding planters for importing labor, the policy directly encouraged the recruitment of indentured servants like the one whose letter follows.",
    citation:
      "Virginia Company of London, “Instructions to Governor George Yeardley,” 1618, in Susan Myra Kingsbury, ed., The Records of the Virginia Company of London, vol. III (Washington, D.C.: Government Printing Office, 1906–1935).",
    externalUrl: "https://www.loc.gov/item/06019229/",
    reconstruction: "founding",
  },
  {
    id: "riverbend-letter",
    type: "Primary source · letter",
    title: "Letter to His Parents from Jamestown",
    creator: "Richard Frethorne",
    date: "1623",
    record: "Personal letter from an indentured servant in Virginia",
    visual: "letter",
    activityRoute: null,
    excerpt:
      "“I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death, except that one had money to lay out in some things for profit … People cry out day and night — Oh, that they were in England without their limbs — and would not care to lose any limb to be in England again, yea, though they beg from door to door.”",
    prompt:
      "What does Frethorne's letter reveal about the conditions of bound labor in Virginia, and how might writing to his parents have shaped what he chose to say?",
    feedback:
      "Institute Context: Richard Frethorne wrote home in 1623 as an indentured servant, describing hunger, sickness, and fear so severe that colonists wished they could trade any limb to return to England. Writing to parents who might intervene on his behalf, he had reason to describe his suffering plainly rather than minimize it — the opposite pull from a report meant for a patron or investor.",
    citation:
      "Richard Frethorne to his father and mother, March 20, 1623, reprinted in Susan Myra Kingsbury, ed., The Records of the Virginia Company of London, vol. IV (Washington, D.C.: Government Printing Office, 1906–1935).",
    externalUrl: "https://www.loc.gov/item/06019229/",
    reconstruction: "labor",
  },
  {
    id: "riverbend-ledger",
    type: "Primary source · account book",
    title: "Wharf Account: Tobacco Shipped, Goods Received",
    creator: "Ship's factor, James River wharf",
    date: "1630",
    record: "Representative cargo account, Chesapeake tobacco trade",
    visual: "context",
    activityRoute: null,
    // Investigation Challenge (Phase A of the Investigation/Archive Challenge
    // plan's catalog-expansion pass) — gates this source's sourceReader()
    // worksheet behind a pre-reveal prediction quest
    // (UNIT_02_INVESTIGATION_EVIDENCE_QUESTS).
    investigationMode: "evidence-organizing",
    investigationQuestId: "case-004-investigation-evidence-riverbend-ledger",
    excerpt:
      "Received of the ship Speedwell: fourteen hogsheads of tobacco, casked and weighed as within noted. Delivered in return: three pieces of Kentish cloth, two dozen iron hoes, six dozen knives, and sundry other English wares, per the planters' order at the landing.",
    prompt:
      "What does this account entry prove about the settlement's place in a wider Atlantic economy?",
    feedback:
      "Institute Context: entries like this one recur throughout early Chesapeake wharf and factor account books — tobacco hogsheads shipped out, English cloth and tools shipped back in return. The pattern shows a settlement whose economy already depended on exporting a single staple crop to pay for manufactured goods it could not make for itself.",
    citation:
      "Representative wharf account entry, modeled on the invoice and cargo-account pattern documented throughout Susan Myra Kingsbury, ed., The Records of the Virginia Company of London (Washington, D.C.: Government Printing Office, 1906–1935); no single verbatim entry is quoted here.",
    externalUrl: "https://www.loc.gov/item/06019229/",
    reconstruction: "exchange",
  },
];

export const CASE_004_LANES = [
  { id: "founding", label: "Founding & land" },
  { id: "labor", label: "Labor & people" },
  { id: "exchange", label: "Trade & empire" },
];

// Note: the "Charter & Compact" region-evidence content that used to live here
// as REGION_RECORDS/REGION_EVIDENCE (feeding the now-deleted regionsScreen())
// was migrated to content/quests/unit-02-quests.js's UNIT_02_ARCHIVE_CHALLENGE_QUESTS
// in plan Phase 2; the bespoke screen/route/data here were deleted in Phase 5
// once that migration was verified stable.
//
// The "Triangle Ledger" cargo-plotting content that used to live here as
// TRIANGLE_LEGS/TRIANGLE_CARGO (feeding the now-deleted triangleScreen()) was
// likewise migrated onto the quest-type system — its content is fully
// preserved in content/quests/unit-02-quests.js's
// UNIT_02_ARCHIVE_CHALLENGE_QUESTS entry "case-005-archive-triangle-cargo"
// (evidence-organizing), which is now Case 1.05's entire mechanic rather than
// a parallel bonus path.

export const UNIT_02_REVIEW = {
  mcq: [
    {
      prompt:
        "The Virginia Company's 1618 instructions to Governor Yeardley, which granted fifty acres of land for every settler transported and fifty more for every servant brought along, were most directly designed to",
      choices: [
        "guarantee equal landholdings to all settlers regardless of how many servants they brought",
        "restrict landownership to colonists who arrived without any indentured servants",
        "encourage planters to recruit labor by tying land grants to the number of people, free or bound, they transported to the colony",
        "transfer control of Virginia's land distribution from the Company to the Crown",
      ],
      answer: 2,
      explanation:
        "The headright system rewarded planters for importing labor by granting land per person transported — including servants — which directly encouraged the recruitment of indentured servants like Richard Frethorne.",
    },
    {
      prompt:
        "Richard Frethorne's 1623 letter describing hunger and sickness in Virginia is especially valuable evidence for historians of indentured servitude because",
      choices: [
        "it was composed by the Virginia Company to recruit new settlers",
        "it was written to parents who might intervene on his behalf, giving him reason to describe his suffering candidly rather than minimize it for a patron or investor",
        "it describes servitude entirely in positive terms to reassure his family",
        "it was written decades after Frethorne's service ended, allowing him distance to reflect calmly",
      ],
      answer: 1,
      explanation:
        "Writing to parents who might act on his behalf gave Frethorne reason to describe his conditions plainly, the opposite pull from a report meant for a patron or investor.",
    },
    {
      prompt:
        "A historian researching the Middle Passage would find Olaudah Equiano's narrative and the 1788 diagram of the ship Brooks especially useful together because",
      choices: [
        "both sources were produced by the same ship's crew for the same voyage",
        "the Brooks diagram provides firsthand testimony while Equiano's narrative supplies measured cargo data",
        "neither source describes conditions aboard slave ships, only trade goods carried outbound",
        "Equiano's account supplies firsthand testimony of suffering below deck, while the Brooks diagram documents, in the traders' own measured terms, how enslaved people were packed into the hold",
      ],
      answer: 3,
      explanation:
        "Equiano's narrative offers a survivor's firsthand account of conditions, while the Brooks diagram shows how slave-ship owners themselves calculated maximum hold capacity — complementary but distinct kinds of evidence.",
    },
    {
      prompt:
        "The enumerated-commodities clause of the Navigation Act of 1660 required colonial growers of tobacco and other listed goods to",
      choices: [
        "sell their crop exclusively to Dutch merchants at fixed prices",
        "grow tobacco only for consumption within their own colony",
        "ship their crop only to England or other English possessions rather than sell it directly to foreign markets",
        "pay a tariff to Spain before shipping tobacco to any market",
      ],
      answer: 2,
      explanation:
        "The clause barred enumerated goods like tobacco from being shipped to any destination other than English plantations or the kingdom of England, Ireland, or Wales — a core mercantilist restriction.",
    },
    {
      prompt:
        'The Dedham Covenant\'s requirement that new residents be admitted only if they were "probably of one heart" with existing members best illustrates which feature of New England town founding?',
      choices: [
        "Towns were organized as self-governing, covenanted communities that screened membership around shared religious commitment",
        "New England towns admitted all settlers equally regardless of religious belief",
        "Town government in New England was appointed directly by the Crown",
        "New England settlement depended on a single export staple crop",
      ],
      answer: 0,
      explanation:
        "Dedham's founding families bound themselves by covenant to worship together and admit only the like-minded, a pattern of self-governing, congregationally organized settlement typical of New England towns.",
    },
    {
      prompt:
        "Compared to the Southern colonies' reliance on tobacco and rice worked by indentured servants and enslaved Africans, the Middle Colonies' grain-export economy and Pennsylvania's liberty-of-conscience law best illustrate",
      choices: [
        "that all thirteen colonies converged on an identical economic and religious model by 1754",
        "that the Middle Colonies rejected the Atlantic trade the Southern colonies depended on",
        "that religious toleration only existed in the Southern colonies",
        "how differing labor systems and religious policies produced distinct regional societies along the Atlantic seaboard",
      ],
      answer: 3,
      explanation:
        "A staple-crop plantation economy built on bound labor, a diversified grain-export economy open to many faiths, and covenanted farming towns each produced a recognizably different colonial society by the mid-1700s.",
    },
  ],
  saq: {
    stimulus:
      "“We whose names are hereunto subscribed do, in the fear and reverence of our Almighty God, mutually and severally promise amongst ourselves and each to other, to profess and practice one truth … and receive only such unto us as be such as may be probably of one heart with us.” — The Dedham Covenant, Massachusetts, founding families, 17th century\n\n“I have nothing to comfort me, nor is there nothing to be gotten here but sickness and death … People cry out day and night — Oh, that they were in England without their limbs.” — Richard Frethorne, letter to his parents from Jamestown, Virginia, March 20, 1623",
    prompts: [
      "A. Identify one difference between the two colonial societies reflected in these records.",
      "B. Explain one cause of the difference identified in part A.",
      "C. Explain one way the transatlantic economy connected New England and the Chesapeake despite that difference.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
};
