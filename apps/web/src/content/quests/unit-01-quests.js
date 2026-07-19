// First real content built against the generic MCQ and history
// evidence-organizing quest-type contracts (apps/web/src/quest-types/).
// Source-grounded practice tied to Case 1.01's real CASE_001_SOURCES
// (apps/web/src/content/unit-01-campaign.js) — supplements the existing
// end-of-unit REVIEW.mcq, it does not replace it.
export const UNIT_01_MCQ_QUESTS = [
  {
    id: "case-001-mcq-taino-sourcing",
    prompt:
      "The Library of Congress exhibition text on Taíno society is best classified as which kind of record?",
    choices: [
      "A primary source written by a Taíno community leader",
      "A secondary source written well after the events it describes",
      "A primary source created during first contact in 1492",
      "An administrative record issued by the Spanish crown",
    ],
    answer: 1,
    explanation:
      "The exhibition text was written in 1991 to summarize existing scholarship — useful context, but a secondary source, not a Taíno-authored primary account.",
  },
  {
    id: "case-001-mcq-columbus-audience",
    prompt:
      "Columbus's 1493 letter to Rafael Sánchez most directly reflects the influence of which factor?",
    choices: [
      "His audience: a royal treasurer whose support could shape future voyages",
      "His training as a professional cartographer",
      "Direct editorial review by Taíno leaders before publication",
      "A requirement to write only in Latin for the Spanish court",
    ],
    answer: 0,
    explanation:
      "The letter was addressed to Rafael Sánchez, treasurer to the Spanish monarchs — Columbus had reason to frame his account to justify continued royal backing.",
  },
  {
    id: "case-001-mcq-waldseemuller-change",
    prompt: "What does the 1507 Waldseemüller map most directly provide evidence of?",
    choices: [
      "The precise daily life of Caribbean communities in 1493",
      "A change in European geographic knowledge following Atlantic voyages",
      "The final political borders of the modern Americas",
      "Direct testimony from an Indigenous mapmaker",
    ],
    answer: 1,
    explanation:
      "As a printed European map made after early Atlantic voyages, it documents how European geographic understanding was changing — not what Caribbean life looked like on the ground.",
  },
];

export const UNIT_01_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-001-evidence-record-sourcing",
    prompt:
      "Match each Case 1.01 record to the historical-thinking skill it best demonstrates, then explain why using more than one kind of record strengthens a historical argument.",
    slots: [
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
      { id: "continuity-and-change", label: "Continuity and Change" },
    ],
    sources: [
      {
        id: "taino-context",
        label: "The Caribbean—Island Society",
        attribution: "Library of Congress exhibition text, 1991",
        excerpt:
          "The largest group of people living in the islands of the Caribbean were the Taínos. Their villages were governed by chieftains, or caciques.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "columbus-letter",
        label: "Letter Reporting on the First Voyage",
        attribution: "Christopher Columbus, 1493",
        excerpt:
          "“They are so ingenuous and free with all they have, that no one would believe it without seeing it.”",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "waldseemuller-map",
        label: "Universalis cosmographia",
        attribution: "Martin Waldseemüller, 1507",
        excerpt:
          "A printed European world map made after early Atlantic voyages, labeling the new lands “America.”",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "In 2–3 sentences, explain how using context, a primary letter, and a map together builds a stronger historical argument than any one record alone.",
    rubric: {
      skillCategories: ["Contextualization", "Sourcing", "Continuity and Change"],
      pointsTotal: 3,
      description:
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates.",
    },
  },
];

// Second content pass, proving out the generic Sequencing quest-type contract
// (apps/web/src/quest-types/generic/sequencing-quest.js) and the history
// Source Analysis (HIPP) quest-type contract
// (apps/web/src/quest-types/history/source-analysis-quest.js) against Case
// 1.01's real CASE_001_SOURCES and EXCHANGE_RECORDS (also in
// apps/web/src/content/unit-01-campaign.js).
export const UNIT_01_SEQUENCING_QUESTS = [
  {
    id: "case-001-sequencing-columbian-exchange",
    prompt:
      "Arrange these Case 1.01 developments in the order that reflects how each one caused or enabled the next — not simply the order the dates occurred in.",
    items: [
      {
        id: "smallpox-epidemic-1518",
        label:
          "Sustained Atlantic contact and colonization trigger the Hispaniola smallpox epidemic beginning in December 1518, devastating Taíno populations with no prior immunity",
        position: 3,
      },
      {
        id: "horses-reshape-societies",
        label:
          "Introduced horses reshape mobility, warfare, transport, and later Indigenous and colonial societies",
        position: 4,
      },
      {
        id: "taino-society-precontact",
        label:
          "Organized Taíno communities already exist across the Caribbean, governed by caciques, before any European arrival",
        position: 0,
      },
      {
        id: "columbus-first-contact-letter",
        label:
          "Columbus's 1492 voyage makes first contact, and his 1493 letter to Rafael Sánchez reports it to secure continued Spanish crown backing",
        position: 1,
      },
      {
        id: "waldseemuller-map-knowledge",
        label:
          "European geographic knowledge changes as voyages continue, reflected in the 1507 Waldseemüller map's separate Western Hemisphere",
        position: 2,
      },
    ],
    explanation:
      "Each step enables the next: organized pre-contact Taíno society is what Columbus's expedition actually encountered; his letter's success in reassuring the crown's treasurer helped secure the continued backing that funded further voyages; those repeated voyages are what changed European geographic knowledge, shown in the Waldseemüller map; that same sustained contact and colonization is what exposed Taíno populations to Old World pathogens, causing the Hispaniola smallpox epidemic that began in December 1518 and killed roughly a third of the island's remaining Taíno population by May 1519; and the ongoing exchange of the same period introduced horses, which went on to reshape conquest, transport, and Indigenous ways of life well beyond the moment of first contact.",
  },
];

// Investigation Challenge content (Phase A of the Investigation/Archive
// Challenge plan's catalog-expansion pass) — gates each source's
// sourceReader() worksheet behind a pre-reveal prediction quest, the same
// mechanic UNIT_03_INVESTIGATION_QUESTS pioneered for case-007's Dunmore
// proclamation (apps/web/src/content/quests/unit-03-quests.js), but proving
// out the generic mcq quest-type contract as the gating mechanic instead of
// hipp. Kept in their own arrays (not merged into UNIT_01_MCQ_QUESTS) so they
// don't also surface as a practiceCheckScreen() card, and framed as
// predictions made from a record's title/creator/date/type alone — the only
// metadata investigationScreen() exposes before the quest is complete — not
// as a restatement of the existing post-reveal UNIT_01_MCQ_QUESTS questions
// on the same sources. Two entries are authored per source; only the first
// is wired via investigationQuestId (CASE_001_SOURCES), matching how a
// single object is fetched by investigationQuestFor() in main.js — the
// second is kept as a ready second question for a future multi-question
// gate.
export const UNIT_01_INVESTIGATION_MCQ_QUESTS = [
  {
    id: "case-001-investigation-mcq-taino-origins",
    prompt:
      "This record's title is “The Caribbean—Island Society,” credited to a Library of Congress exhibition written in 1991 — centuries after the Taíno societies it describes. Before opening the full record, what should a Chronicler predict about how a record like this was assembled, given that no Taíno-authored written account survives from before contact?",
    choices: [
      "It synthesizes archaeological findings and later documentary evidence into a modern secondary account, since the Taínos left no known written record of their own for historians to draw on directly",
      "It is a direct English translation of a Taíno written chronicle preserved in Spanish royal archives",
      "It transcribes interviews Library of Congress staff conducted with Taíno community members in 1991",
      "It reprints Columbus's 1493 letter verbatim with no independent research behind it",
    ],
    answer: 0,
    explanation:
      "Because no Taíno-authored written account from before contact survives, any modern record describing pre-contact Taíno society — including this 1991 exhibition text — has to be built from archaeological and later documentary evidence rather than a Taíno-authored original.",
  },
  {
    id: "case-001-investigation-mcq-taino-emphasis",
    prompt:
      "Before opening the full record, its title (“The Caribbean—Island Society”) and its listing as context for the record “1492: An Ongoing Voyage” are the only clues available. What kind of detail should a Chronicler predict this record emphasizes?",
    choices: [
      "How Caribbean societies were organized and governed — village structure, kinship, and leadership — rather than a narrative of the 1492 voyage itself",
      "A firsthand, day-by-day account of Columbus's Atlantic crossing",
      "Technical specifications of Spanish ships used in early voyages",
      "A legal transcript of a Spanish crown court proceeding",
    ],
    answer: 0,
    explanation:
      "A record titled around Caribbean “society,” framed as background context rather than voyage narrative, most plausibly emphasizes how communities were organized and governed — which the full record confirms by describing villages led by caciques.",
  },
];

export const UNIT_01_INVESTIGATION_SEQUENCING_QUESTS = [
  {
    id: "case-001-investigation-sequencing-waldseemuller-naming",
    prompt:
      "Before you open the full 1507 Waldseemüller map record, arrange these developments in the order that reflects how each one caused or enabled the next — the chain of voyages, publications, and revisions that produced, and later reconsidered, the name “America.”",
    // Item array is deliberately NOT authored in already-correct order — see
    // renderSequencingQuest()'s own doc comment in
    // quest-types/generic/sequencing-quest.js: the array's authored order is
    // what renders before the player makes any move, so an already-sorted
    // array would hand the player the answer with zero interaction. `position`
    // (not array order) is the real answer key.
    items: [
      {
        id: "waldseemuller-names-america-1507",
        label:
          "Working at Saint-Dié, Martin Waldseemüller and Matthias Ringmann publish the 1507 map Universalis cosmographia, applying the name “America” — a Latinized form of Amerigo's first name — to the new lands",
        position: 2,
      },
      {
        id: "columbus-voyages-asia-belief",
        label:
          "Columbus's transatlantic voyages (1492–1504) reach Caribbean islands he insists, to his death, are part of Asia",
        position: 0,
      },
      {
        id: "mercator-cements-name-1538",
        label:
          "Gerardus Mercator's 1538 world map reapplies “America” to both continents, cementing the name still used today",
        position: 4,
      },
      {
        id: "waldseemuller-drops-name-1513",
        label:
          "Reconsidering the claim, Waldseemüller drops the “America” label from his own 1513 world map edition",
        position: 3,
      },
      {
        id: "vespucci-new-world-account",
        label:
          "Amerigo Vespucci's voyages along South America's coast and his widely printed 1503 account, Mundus Novus, argue these lands are a separate “New World,” not Asia",
        position: 1,
      },
    ],
    explanation:
      "Columbus's voyages made first contact but he never accepted these lands were anything other than Asia; Vespucci's later voyages and published account were what first argued in print that this was a separate “New World”; that argument is what led Waldseemüller and Ringmann to label the 1507 map “America” after Vespucci; Waldseemüller himself then had second thoughts and dropped the name from his 1513 edition; and it was Mercator's 1538 map, not Waldseemüller's own later doubts, that permanently cemented “America” as the name for both continents.",
  },
];

// Archive Challenge content (Phase B of the Investigation/Archive Challenge
// plan's catalog-expansion pass) — case-003's Archive Challenge, migrating
// EMPIRE_CONNECTIONS' real causal chain (also in
// apps/web/src/content/unit-01-campaign.js) onto the sequencing quest-type
// contract. empireScreen()/the "empire" route stays case-003's primary
// Navigation Table experience — this is a parallel, additional way to
// engage the same content, not a replacement.
export const UNIT_01_ARCHIVE_CHALLENGE_QUESTS = [
  {
    id: "case-003-archive-empire-system",
    prompt:
      "The Archive's record of how Hispaniola's colonial system took shape has come loose from its causal order. Arrange these six records in the order that reflects how each development caused or enabled the next.",
    // Item array is deliberately NOT authored in already-correct order — see
    // renderSequencingQuest()'s own doc comment in
    // quest-types/generic/sequencing-quest.js: the array's authored order is
    // what renders before the player makes any move, so an already-sorted
    // array would hand the player the answer with zero interaction. `position`
    // (not array order) is the real answer key.
    items: [
      {
        id: "hierarchy",
        label:
          "Caste and social hierarchy: colonial labor systems tied to Indigenous tribute and African slavery develop into a social order ranking people by ancestry, legal status, and place of birth",
        position: 3,
      },
      {
        id: "claim",
        label:
          "The Requerimiento (1513): Spanish officials assert authority over Indigenous communities and demand submission to the Spanish crown and Christianity",
        position: 0,
      },
      {
        id: "resistance",
        label:
          "Resistance and adaptation: Indigenous and African communities resist exploitation within and against this hierarchy, preserving practices and adapting to change",
        position: 4,
      },
      {
        id: "encomienda",
        label:
          "Encomienda labor: Spanish claims of authority help justify Spanish colonists' right to demand labor and tribute from Indigenous communities",
        position: 1,
      },
      {
        id: "exchange",
        label:
          "Cultural interaction: that same conflict, coercion, adaptation, and survival reshape language, religion, foodways, and customs into new Atlantic cultural forms",
        position: 5,
      },
      {
        id: "slavery",
        label:
          "Expansion of African slavery: encomienda labor demands and Indigenous population losses accelerate the forced migration of Africans to the Americas",
        position: 2,
      },
    ],
    explanation:
      "Each step enables the next: the Requerimiento's assertion of Spanish authority over Indigenous communities is what colonists used to justify demanding their labor and tribute under the encomienda; encomienda's labor demands, combined with Indigenous population losses, are what drove colonists to rely increasingly on forced African migration; the labor systems built on both encomienda tribute and African slavery are what produced a caste hierarchy ranking people by ancestry, legal status, and birthplace; that same hierarchy is what Indigenous and African communities resisted and adapted within and against; and it was precisely that ongoing conflict, coercion, and adaptation that reshaped language, religion, foodways, and customs into the new cultural forms of the Atlantic world.",
  },
];

// Unit-level bonus Archive Challenge content (Phase C of the
// Investigation/Archive Challenge plan's catalog-expansion pass) — the first
// content in unit.archiveChallenges[] (a Zod field that existed but had
// never been populated by any unit). Not tied to relocating any single
// case's activity screen; reachable from archiveChallengesScreen()'s new
// bonus section. Kept in a separate array from UNIT_01_ARCHIVE_CHALLENGE_QUESTS
// above since that array is validated as a homogeneous sequencing list
// (case-003's quest) and this one is evidence-organizing-shaped — mixing
// shapes in one array would fail schema validation. Reuses Case 1.02's real
// EXCHANGE_RECORDS content (also in apps/web/src/content/unit-01-campaign.js)
// — record text duplicated from EXCHANGE_RECORDS rather than imported,
// matching how UNIT_01_EVIDENCE_ORGANIZING_QUESTS above already duplicates
// CASE_001_SOURCES excerpts instead of importing them. A claim-and-evidence
// builder: each of the four Exchange Ledger records is sorted under the
// claim about the Columbian Exchange's impact its content most directly
// supports (a 1:1 mapping, so every placement has exactly one defensible
// answer).
export const UNIT_01_ARCHIVE_EVIDENCE_QUESTS = [
  {
    id: "unit-01-archive-claim-and-evidence-builder",
    prompt:
      "The Archive's claim board for the Columbian Exchange has come apart from its evidence. Sort each record beneath the claim about the Exchange's impact that its content most directly supports.",
    slots: [
      { id: "agriculture-diet", label: "Transformed Agriculture and Diet" },
      { id: "demographic-catastrophe", label: "Caused Demographic Catastrophe" },
      { id: "mobility-warfare", label: "Reshaped Mobility, Warfare, and Transport" },
      { id: "forced-labor", label: "Built Systems of Forced Labor" },
    ],
    sources: [
      {
        id: "maize-claim-evidence",
        label: "Maize",
        attribution: "José de Acosta, Natural and Moral History of the Indies, 1590",
        excerpt:
          "“The principal grain of the Indies is maize … whereof the Indians make their bread.”",
        skillCategory: "Continuity and Change",
        correctSlotId: "agriculture-diet",
      },
      {
        id: "smallpox-claim-evidence",
        label: "Smallpox",
        attribution:
          "Toribio de Benavente “Motolinía,” History of the Indians of New Spain, c. 1541",
        excerpt: "“In the year 1520 came the smallpox … and a very great many Indians died of it.”",
        skillCategory: "Causation",
        correctSlotId: "demographic-catastrophe",
      },
      {
        id: "horses-claim-evidence",
        label: "Horses",
        attribution:
          "Bernal Díaz del Castillo, True History of the Conquest of New Spain, completed c. 1568",
        excerpt: "“The sight of the horses caused them great wonder.”",
        skillCategory: "Contextualization",
        correctSlotId: "mobility-warfare",
      },
      {
        id: "enslaved-africans-claim-evidence",
        label: "Enslaved Africans",
        attribution: "Spanish Crown license for African captives to the Indies, 1518",
        excerpt:
          "The Crown authorized the transport of African captives to “the Indies” under royal license.",
        skillCategory: "Sourcing",
        correctSlotId: "forced-labor",
      },
    ],
    reflectionPrompt:
      "In 2–3 sentences, choose one claim above and explain why its record is the strongest possible evidence for that claim specifically — not just plausible evidence for the Columbian Exchange in general.",
    rubric: {
      skillCategories: ["Continuity and Change", "Causation", "Contextualization", "Sourcing"],
      pointsTotal: 4,
      description:
        "Earn 1 point per record correctly matched to the claim its evidence best supports.",
    },
  },
];

export const UNIT_01_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-001-hipp-columbus-letter",
    prompt:
      "Analyze Columbus's 1493 letter to Rafael Sánchez using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the letter's argument — not the option that merely names the correct answer.",
    document: {
      text: "Since I know you will be pleased at the great victory our Lord has given me in this voyage, I write to tell you that in thirty-three days I passed from the Canary Islands to the Indies, where I found very many islands, and took possession of all of them for their Highnesses. The people of these islands are so guileless and generous with all they possess that no one would believe it without seeing it; whatever is asked of them, they never refuse, and they show as much love as if they gave their hearts. I have found gold in some rivers, and on the island they call Hispaniola there are mines of metal in great quantity. I am confident that, with a little more help from Your Highnesses, I shall bring back as much gold as is needed, and as much spice and cotton as their ships can carry, together with people to be converted to our holy faith.",
      attribution: "Christopher Columbus, Letter to Rafael Sánchez, 1493",
    },
    hippPrompts: [
      {
        id: "columbus-audience",
        dimension: "Intended audience",
        argument:
          "Rafael Sánchez was treasurer to the Spanish crown, the official who controlled funding for further voyages — this shapes what Columbus chooses to emphasize.",
        options: [
          {
            id: "audience-explained",
            text: "Because Sánchez was the treasurer overseeing crown funds for exploration, Columbus foregrounds gold, valuable goods, and easily governed peoples to reassure the official most able to authorize further voyages.",
            correct: true,
          },
          {
            id: "audience-named-only",
            text: "Rafael Sánchez was the treasurer to the Spanish crown, the official responsible for managing the monarchy's finances.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "audience-wrong-sailor",
            text: "Sánchez had sailed on the voyage himself, so Columbus wrote informally about hardships they had shared at sea.",
            correct: false,
          },
          {
            id: "audience-wrong-public",
            text: "The letter was written for a general Spanish public readership from its first draft, with no connection to any crown official.",
            correct: false,
          },
        ],
      },
      {
        id: "columbus-purpose",
        dimension: "Purpose",
        argument:
          "Columbus's purpose was to secure continued royal financial backing for further exploration, leading him to foreground profitable discoveries over hardships encountered.",
        options: [
          {
            id: "purpose-explained",
            text: "By foregrounding gold, valuable goods, and peaceable, convertible peoples, Columbus frames the voyage as a profitable investment, building the case for the crown to fund additional expeditions.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "Columbus wrote the letter to inform the Spanish crown of his voyage and describe the lands and people he had encountered.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-resign",
            text: "Columbus's purpose was to formally resign his command after the voyage's failures.",
            correct: false,
          },
          {
            id: "purpose-wrong-navigation",
            text: "The letter's purpose was to record precise longitude measurements for training future navigators.",
            correct: false,
          },
        ],
      },
    ],
  },
];
