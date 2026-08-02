export const BRAND = {
  engine: "Republic Builder Engine",
  campaign: "Chronicle",
  status: "Archive connection secure",
};

export const UNIT_01 = {
  id: "unit-01",
  title: "The Atlantic World",
  period: "Period 1 · 1491–1607",
  description:
    "Investigate the societies, exchanges, and colonial systems that reshaped the Atlantic world after 1492.",
  centralQuestion:
    "How did contact among Europe, Africa, and the Americas reshape societies on both sides of the Atlantic?",
  // The unit's Archive Challenge — its extended written work, reached from the
  // Archive Terminal in the Archive Room. Completing it, alongside every case,
  // is required for unit completion (see main.js's unitReadyForReview()).
  //
  // Phase 58 made this an SAQ. It was an evidence-organizing claim board, which
  // is one of the four types the Nav Table's missions use, so the Archive Room
  // was rendering the same kind of work as a mission and the split between the
  // two groups was only a matter of which door you came through. A student who
  // had already completed the retired quest is not asked to redo it — see
  // RETIRED_ARCHIVE_CHALLENGE_IDS in main.js.
  archiveChallenges: [
    {
      questType: "saq",
      questId: "unit-01-archive-atlantic-world-saq",
    },
  ],
  cases: [
    {
      id: "case-001",
      shortTitle: "Caribbean",
      title: "Case 1.01 — The Atlantic Crossroads",
      date: "1493",
      mapPosition: { lat: 15.3, lon: -61.4 },
      location: "Caribbean · 1493",
      question: "How did early contact begin to reshape societies on both sides of the Atlantic?",
      mechanic: "Record Reconstruction",
      route: "field",
      summary:
        "Establish what existed before contact, analyze a European account, and trace how early voyages changed the historical record.",
      // Phase 49D: real College Board CED alignment (see
      // content/ced-taxonomy.js/unit.schema.js's CedAlignmentSchema).
      // KC 1.1 (established pre-contact societies) + 1.2 (contact and the
      // start of the Columbian Exchange) — this case's own reconstruction
      // mechanic walks both halves in sequence.
      ced: { period: 1, keyConcepts: ["1.1", "1.2"], themes: ["MIG", "WOR"] },
    },
    {
      id: "case-002",
      shortTitle: "Atlantic Routes",
      title: "Case 1.02 — The Exchange Ledger",
      date: "1493–1540",
      mapPosition: { lat: 30, lon: -45 },
      location: "Atlantic Ocean · c. 1493–1540",
      question:
        "How did the movement of crops, diseases, animals, and people transform the Atlantic world?",
      mechanic: "Atlantic Route Puzzle",
      // A non-map mission (Phase 48A, re-routed in Phase 58) — Chronotravel goes
      // to missionScreen(), which renders this case's own archiveChallenge quest
      // and nothing else. Until Phase 58 the route was "archive-challenges" and
      // all six non-map cases landed on one shared list of every case's quest.
      route: "mission",
      summary:
        "Build a route ledger that distinguishes movement across the Atlantic from its historical consequences.",
      archiveChallenge: {
        questType: "evidence-organizing",
        questId: "case-002-archive-exchange-claims",
      },
      // KC 1.2 — the Columbian Exchange itself. Themes: WXT (the economic
      // exchange of crops/animals/people this case's whole ledger mechanic
      // tracks) and GEO (the environmental transformation that exchange
      // produced on both sides of the Atlantic).
      ced: { period: 1, keyConcepts: ["1.2"], themes: ["WXT", "GEO"] },
    },
    {
      id: "case-003",
      shortTitle: "Hispaniola",
      title: "Case 1.03 — Empire’s Foundations",
      date: "1502",
      mapPosition: { lat: 18.48, lon: -69.93 },
      location: "Spanish Caribbean · c. 1502",
      question:
        "How did conquest and colonization create new systems of labor, power, and social hierarchy?",
      mechanic: "Colonial System Builder",
      // A non-map mission — see case-002's note above.
      route: "mission",
      summary:
        "Connect evidence about conquest, labor, forced migration, hierarchy, resistance, and cultural exchange.",
      archiveChallenge: {
        questType: "sequencing",
        questId: "case-003-archive-empire-system",
      },
      // KC 1.2 — conquest/colonization's "significant social, cultural, and
      // political changes." Themes: PCE (the new hierarchy/power structure
      // this case's Colonial System Builder mechanic connects) and MIG
      // (forced migration/labor systems central to that system).
      ced: { period: 1, keyConcepts: ["1.2"], themes: ["PCE", "MIG"] },
    },
  ],
};

export const CASE_001_SOURCES = [
  {
    id: "taino-context",
    type: "Secondary context",
    title: "The Caribbean—Island Society",
    creator: "Library of Congress exhibition text",
    date: "1991 exhibition text",
    record: "1492: An Ongoing Voyage, Library of Congress",
    visual: "context",
    activityRoute: "interview",
    // No Investigation Challenge. This record used to be gated behind a quest asking a
    // player to predict the sourcing of the worksheet they were about to open — and since
    // Phase 68 there is no worksheet, there is an INTERVIEW put to seven people out on the
    // map. The gate's replacement is the activity's own `howItWorks` panel, which explains
    // the mechanic instead of quizzing the record's metadata. Both questions survive in
    // UNIT_01_INVESTIGATION_MCQ_QUESTS; see docs/decision-log/0052.
    excerpt:
      "The largest group of people living in the islands of the Caribbean were the Taínos. Their villages were governed by chieftains, or caciques. Related families lived together in large houses built of poles, mats, and thatch.",
    prompt:
      "What does this record establish about Caribbean societies before contact? Use one specific detail.",
    // Which HIPP elements the AI Archive Evaluator should score for this
    // source's initial-reading response — see api/_lib/rubrics.js's HIPP
    // rubric, which explicitly evaluates only the elements a prompt asks for.
    hippElementsAsked: ["historical_situation"],
    feedback:
      "The record establishes that Caribbean societies were organized and longstanding before European arrival. It is useful context, but it is not a Taíno-authored primary source.",
    citation:
      "Library of Congress, “What Came To Be Called ‘America’,” 1492: An Ongoing Voyage, “The Caribbean—Island Society.”",
    externalUrl: "https://www.loc.gov/exhibits/1492/america.html",
    reconstruction: "precontact",
  },
  {
    id: "columbus-letter",
    type: "Primary source · letter",
    title: "Letter Reporting on the First Voyage",
    creator: "Christopher Columbus",
    date: "1493",
    record: "Letter to Rafael Sánchez, written after the first voyage",
    visual: "letter",
    activityRoute: "discrepancy",
    // Nothing but the village observation is reachable until the village has been observed. That
    // rule shipped as a `caseId === "case-001"` literal inside sourceAvailability() until Phase 70,
    // when Riverbend needed the same gate and the second consumer paid to make it content. Same
    // behaviour, stated where the record is. See decision log 0053.
    requiresSourceId: "taino-context",
    excerpt:
      "“They are so ingenuous and free with all they have, that no one would believe it without seeing it.”",
    prompt: "How do the creator and intended audience shape what this letter emphasizes?",
    hippElementsAsked: ["intended_audience", "purpose", "point_of_view"],
    feedback:
      "Columbus wrote as the leader of a Spanish expedition reporting to a royal official. His word choices and claims can reveal his goals, assumptions, and effort to justify further support.",
    citation:
      "Christopher Columbus, Letter to Rafael Sánchez, 1493; Library of Congress digital collections; public-domain English translation, wording varies by translation.",
    externalUrl: "https://www.loc.gov/item/18018461/",
    reconstruction: "encounter",
  },
  {
    id: "waldseemuller-map",
    type: "Primary source · map",
    title: "Universalis cosmographia",
    creator: "Martin Waldseemüller",
    date: "1507",
    record: "Printed world map; Library of Congress Geography and Map Division",
    visual: "map",
    activityRoute: "assembly",
    // See columbus-letter above: Case 1.01's ordering gate, expressed as content in Phase 70.
    requiresSourceId: "taino-context",
    // Investigation Challenge (Phase A of the Investigation/Archive Challenge
    // plan's catalog-expansion pass) — gates this source's sourceReader()
    // worksheet behind a pre-reveal prediction quest
    // (UNIT_01_INVESTIGATION_SEQUENCING_QUESTS).
    investigationMode: "sequencing",
    investigationQuestId: "case-001-investigation-sequencing-waldseemuller-naming",
    // Reader questions instead of a written initial reading. Rebuilding the sheet, naming
    // the cartouches and filing what it can evidence is already three acts of reading; a
    // paragraph box after them was a fourth ending for one record. Opt-in per source —
    // every other record in the game keeps the textarea and the Archive Evaluator.
    readerQuestType: "mcq",
    readerQuestIds: [
      "case-001-reader-mcq-waldseemuller-naming",
      "case-001-reader-mcq-waldseemuller-ptolemy",
    ],
    excerpt:
      "A printed European world map made after early Atlantic voyages. It depicts a separate Western Hemisphere and labels the new lands “America.”",
    prompt:
      "What does this map reveal about changing European geographic knowledge after early Atlantic voyages?",
    hippElementsAsked: ["historical_situation"],
    feedback:
      "The map helps show that European geographic knowledge was changing after contact. It should not be treated as a direct picture of Caribbean life in 1493.",
    citation:
      "Martin Waldseemüller, Universalis cosmographia secundum Ptholomaei traditionem et Americi Vespucii aliorumque lustrationes, 1507. Library of Congress.",
    externalUrl: "https://www.loc.gov/item/2003626426",
    localAsset: "source-waldseemuller-1507.jpg",
    reconstruction: "knowledge",
  },
];

// The "Exchange Ledger" per-record MCQ content that used to live here as
// EXCHANGE_RECORDS (feeding the now-deleted exchangeLedgerScreen()) was
// migrated onto the quest-type system — its content is fully preserved in
// content/quests/unit-01-quests.js's UNIT_01_ARCHIVE_EVIDENCE_QUESTS entry
// "case-002-archive-exchange-claims" (evidence-organizing), which is now
// Case 1.02's entire mechanic rather than a bespoke ledger screen. The
// mechanic itself changed from 4 independent per-record MCQ questions to a
// single "sort each record under the claim it supports" exercise — the same
// real historical content and citations, reframed the same way the
// pre-existing "unit-01-archive-claim-and-evidence-builder" unit-level bonus
// challenge (also in unit-01-quests.js) already reframed this exact content.
//
// The "Empire's Foundations" causal-order-building content that used to live
// here as EMPIRE_EVIDENCE/EMPIRE_CONNECTIONS (feeding the now-deleted
// empireScreen()) was migrated onto the quest-type system — its content is
// fully preserved in content/quests/unit-01-quests.js's
// UNIT_01_ARCHIVE_CHALLENGE_QUESTS entry "case-003-archive-empire-system"
// (sequencing, now with a reflectionPrompt added to preserve the original
// screen's graded reflection), which is now Case 1.03's entire mechanic
// rather than a parallel bonus path.

export const REVIEW = {
  mcq: [
    {
      prompt:
        "The Taíno context record most directly challenges which interpretation of the Caribbean before 1492?",
      choices: [
        "The islands lacked organized communities before European arrival.",
        "Caribbean societies depended entirely on European leadership.",
        "European colonization began before Indigenous settlement.",
        "Indigenous peoples had no political or social structures.",
      ],
      answer: 0,
      explanation:
        "The record describes caciques, villages, and related families living in large houses, supporting the existence of organized societies before European arrival.",
    },
    {
      prompt:
        "Columbus’s intended audience most likely influenced his 1493 letter because he was writing to",
      choices: [
        "a Taíno community that asked him to describe Spain",
        "a Spanish royal official whose support could affect future expeditions",
        "a mapmaker who had already visited the Caribbean",
        "an African leader negotiating Atlantic trade",
      ],
      answer: 1,
      explanation:
        "The letter was addressed to Rafael Sánchez, treasurer to the Spanish monarchs, so the report could help justify future royal support.",
    },
    {
      prompt:
        "Which development best explains the immediate demographic effect of smallpox in the Americas?",
      choices: [
        "Indigenous communities had already developed widespread immunity.",
        "Smallpox only spread among European settlers.",
        "Many Indigenous populations had no previous exposure to the disease.",
        "The disease entered the Americas only after 1800.",
      ],
      answer: 2,
      explanation:
        "Lack of previous exposure contributed to devastating epidemics among Indigenous communities.",
    },
    {
      prompt:
        "The forced migration of enslaved Africans to the Americas was most directly connected to",
      choices: [
        "colonial demand for labor in expanding Atlantic economies",
        "the disappearance of all Indigenous labor systems before 1492",
        "a voluntary exchange of workers among equal states",
        "an effort to reduce social hierarchy in Spanish colonies",
      ],
      answer: 0,
      explanation:
        "Colonial demand for labor, especially in plantation and mining economies, drove the expansion of Atlantic slavery.",
    },
    {
      prompt: "The Waldseemüller map is most useful for historians studying",
      choices: [
        "the exact daily routines of Taíno villages in 1493",
        "changes in European geographic knowledge after Atlantic voyages",
        "the final boundaries of modern Latin American nation-states",
        "the first English settlement at Jamestown",
      ],
      answer: 1,
      explanation:
        "The 1507 map reflects changing European geographic knowledge after early voyages.",
    },
    {
      prompt: "Which statement best describes cultural interaction in the early Atlantic world?",
      choices: [
        "It was limited to peaceful trade among equal groups.",
        "It occurred only after the United States became independent.",
        "It involved conflict, coercion, adaptation, and the creation of new practices.",
        "It eliminated all Indigenous and African cultural traditions.",
      ],
      answer: 2,
      explanation:
        "Early Atlantic interaction included violence and coercion as well as adaptation and cultural persistence.",
    },
  ],
  saq: {
    stimulus:
      "“They are so ingenuous and free with all they have, that no one would believe it without seeing it.” — Christopher Columbus, 1493",
    prompts: [
      "A. Identify one feature of Columbus’s position or audience that shaped this document.",
      "B. Explain one way the Columbian Exchange changed societies in either the Americas or the Old World between 1491 and 1607.",
      "C. Explain one way Spanish colonial labor systems contributed to a new social hierarchy in the Americas.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
};
