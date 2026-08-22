// Unit 7 (Period 7: 1890-1945) quest content, structural mirror of unit-06-quests.js and built
// against the seven real CASE_019_SOURCES in apps/web/src/content/unit-07-campaign.js.
//
// ## Why the two missions are the types they are
//
// Unit 6 spent its two missions on the two thin types — `hipp` and `mcq`, one apiece — which is
// what makes this unit's choice free rather than owed. Both types here were picked because the
// material asked for them.
//
// **case-020 is `evidence-organizing`, because the Philippines argument has four parties and no
// single decisive document.** Beveridge and the Anti-Imperialist League are arguing about whether
// the United States should hold the islands; Aguinaldo is answering a question neither of them
// asked him; and the Supreme Court, three years later, decides something else entirely and
// thereby settles it. A student's real difficulty is not working out who was right. It is seeing
// that the winning answer was never in the debate, which is a sorting problem: put each document
// next to what it can actually establish and the shape appears.
//
// **case-021 is `sequencing`, because no document explains the removal and the chain does.** Every
// step was lawful, several were unremarkable standing alone, and the order is the argument. It is
// also the game's clearest case of the thing sequencing exists to teach — that "what happened
// next" and "what made the next thing possible" are different questions — because the executive
// order at the centre of it names nobody, and could not have removed a single person without the
// criminal statute Congress passed a month later.
//
// ## Where Progressivism, the war and the New Deal went
//
// Not into a third case. The Archive Challenges carry them: the DBQ's seven documents run from the
// Anti-Imperialist League to Executive Order 9066 and take in a returning soldier, two 1924
// statutes that point in opposite directions, and a fair-employment order won by threatening a
// march. A unit gets three cases and this one spends them on a threshold, a colony and a coast.
//
// ## No investigation quests, same as Units 4, 5 and 6
//
// A source's optional Investigation Challenge gate (source.schema.js's investigationMode /
// investigationQuestId) is left null on all seven records, for the reason Unit 5 recorded: every
// one is a composite reconstructed from a documentary form rather than one surviving item, and a
// pre-reveal "predict this source's point of view" exercise fits a named author's speech far
// better than an administrative form. The fields exist and default to null.

export const UNIT_07_MCQ_QUESTS = [
  {
    id: "case-019-mcq-manifest-sourcing",
    prompt:
      "The manifest carries a column headed “Nationality: country of which citizen or subject” and, immediately beside it, a column headed “Race or people.” A Bureau circular instructs inspectors that the two “are not to be made to agree,” and that where the traveller's own account of their race differs from the officer's, the officer's entry governs. What does the pairing of those two columns most directly reveal about the purpose of the manifest?",
    choices: [
      "The Bureau wanted a count of populations it defined itself, independent of any government's citizenship records, because the political argument about immigration was an argument about stocks rather than about passports",
      "The second column was a clerical safeguard, allowing an inspector to correct errors in the first when a traveller's papers were forged or missing",
      "The two columns record the same information twice so that a single sheet could serve both the Bureau of Immigration and the Census Bureau",
      "The race column recorded the traveller's own self-description, which is why the Bureau needed it separately from the state that issued the passport",
    ],
    answer: 0,
    explanation:
      "Read the instruction and the purpose is stated rather than inferred. Nationality is a fact about a government; race or people is a fact about a stock, and the Bureau wanted the second because the restriction debate then running in Congress was conducted in exactly those terms — that the “new” immigration from southern and eastern Europe was a different kind of people from the “old.” That is why the classification, adopted in 1899, was independent of country of birth, of last residence and of the passport carried, and why it ended in a published Dictionary of Races or Peoples in 1911. The last option inverts the rule that matters most: the circular directs an officer who disagrees with the traveller to enter what language, origin and “his own observation” indicate, and “not to enter the race merely as claimed.” The answer in that column is the officer's, which is the whole point of asking.",
    skillCategory: "Sourcing",
  },
  {
    id: "case-019-mcq-cabin-comparison",
    prompt:
      "A boarding party examined first- and second-cabin passengers aboard ship in the harbour and landed them at the company's Hudson River pier; steerage passengers were taken by barge to the immigration station for line inspection, registry and, in about a fifth of cases, detention. The boarding division's own return notes that nothing in the statute distinguishes the two, and that the difference is one of “the place and manner of examination only.” What is the best comparison to draw?",
    choices: [
      "One body of law was applied through two procedures whose severity tracked the price of a ticket, so the exclusion grounds used most heavily at the station were ones a passenger with money could rarely be charged under",
      "Cabin passengers were legally exempt from the immigration acts, which applied by their terms only to aliens travelling in steerage",
      "The procedures differed because cabin passengers had already been examined by their consulates before departure, while steerage passengers had not been examined at all",
      "The distinction was a wartime measure and disappeared once the volume of arrivals fell after 1914",
    ],
    answer: 0,
    explanation:
      "The return says it plainly, and it is telling the truth: the statute knows nothing about ticket class. The difference is administrative, and its stated justification was practical — a passenger who could afford a cabin was unlikely to be found “likely to become a public charge,” so a long examination was a poor use of officers. The consequence is the comparison worth making. The grounds actually used at the station were means, employment prospects and Class B medical certificates predicting a person's ability to earn a living, and those are grounds that almost never bite on someone with money. A cabin passenger who was sick or doubtful still went to the island, so this was a weighting rather than an exemption — which is precisely what makes it hard to see and hard to contest. And it long predates the war: it was routine practice through the whole peak decade.",
    skillCategory: "Comparison",
  },
  {
    id: "case-019-mcq-lpc-causation",
    prompt:
      "In the board of special inquiry minute, an inspector states the position aloud: if the alien has an offer of employment she is excludable under the contract labour provision, and if she has none, and eleven dollars, she is likely to become a public charge. What best explains why the immigration laws produced that result?",
    choices: [
      "Two statutes passed for different constituencies met in the same hearing — an 1885 law barring pre-arranged labour, sought by unions, and a public-charge ground sought by restrictionists — so an arriving worker could satisfy either only by failing the other",
      "The contract labour provision had been repealed by 1907 and the inspector was misstating the law, which is why the board reversed itself later the same day",
      "Congress deliberately drafted the two provisions as a single test intended to exclude all arriving labourers, and the boards applied it as written",
      "Both provisions applied only to unmarried men, so the bind described could not in fact have arisen in this hearing",
    ],
    answer: 0,
    explanation:
      "Neither statute was written with the other in mind, and that is the point. The alien contract labour act of 1885 was a union objective, meant to stop employers importing gangs of workers under pre-arranged contracts to break strikes and hold wages down. The likely-to-become-a-public-charge ground came from a different politics entirely and was aimed at arrivals without means. Laid over one another, they leave an arriving labourer with no safe answer — which is one reason the public-charge ground became the most-used ground of exclusion in the period: it was elastic enough to rest on a sum of money, a medical certificate, a woman travelling alone, or the shape of a conversation. Congress did not design the bind; it accumulated. The board's reversal turns on new evidence of support, not on the inspector having got the law wrong, and neither provision was limited by sex or marriage.",
    skillCategory: "Causation",
  },
  {
    id: "case-019-mcq-restriction-continuity",
    prompt:
      "At this station in 1907, admission turned on a line inspection, a clerk's questions and the discretion of a three-inspector board. By 1924 the Immigration Act set each nationality's annual quota at two per cent of its foreign-born population recorded in the census of 1890. Which statement best describes the change?",
    choices: [
      "Selection moved from individual judgment at the port to a national formula fixed in advance, and the choice of the 1890 census — taken before the great migration from southern and eastern Europe — set the quotas at the moment those groups were smallest",
      "The 1924 act ended discretionary exclusion at ports of entry, so boards of special inquiry and medical certification ceased to operate after that date",
      "The quotas applied the same percentage to every country, so the act treated all nationalities identically for the first time in American law",
      "The 1890 base year was chosen because it was the most recent census available when the act was drafted",
    ],
    answer: 0,
    explanation:
      "This is the change the station was pointing toward. In 1907 the question was answered person by person, in a hall, by officials exercising judgment; by 1924 the largest part of it was answered before anyone sailed, by arithmetic. The base year is the mechanism. Congress first used the 1910 census in the emergency act of 1921 and then moved the base back to 1890 in 1924 — a census taken before the peak decades of Italian, Polish, Russian, Greek and Slavic migration, so that the populations to be limited were counted at their smallest. The same percentage applied to every nationality is exactly what makes the outcome unequal, because the multiplier is a population that policy had chosen. And the act did not end port discretion: line inspection, boards and the public-charge ground all continued. It added a ceiling above them, and shut out entirely those “ineligible to citizenship,” which ended Japanese immigration.",
    skillCategory: "Continuity and Change",
  },
];

export const UNIT_07_SEQUENCING_QUESTS = [
  {
    id: "case-019-sequencing-how-a-person-is-sorted",
    prompt:
      "Arrange these steps in the order in which each one made the next possible — the passage of one arriving family from a village in Europe to a railway platform in New Jersey.",
    // **Authored out of order on purpose**, and enforced by
    // tests/unit/sequencing-quest-order.test.js: renderSequencingQuest() lays items out in this
    // array's order and never shuffles, so a list written 0,1,2,3,4,5 opens already solved and
    // grades a student correct for touching nothing. Keep each item's `position` right and its
    // place in this array wrong.
    items: [
      {
        id: "registry-desk",
        label:
          "At a desk in the inspection hall, an inspector with an interpreter puts the manifest's own questions back to the traveller and compares the two sets of answers",
        position: 4,
      },
      {
        id: "company-control-station",
        label:
          "A steamship line, liable to carry back at its own cost anyone America refuses, examines and bathes and holds the family at its own control station before it will sell them a ticket",
        position: 0,
      },
      {
        id: "railroad-ticket-and-ferry",
        label:
          "A ticket is bought at the railroad office on the island and a ferry carries the family to a terminal on the New Jersey shore, most of them bound for somewhere else entirely",
        position: 6,
      },
      {
        id: "manifest-written-in-europe",
        label:
          "The company's clerk writes the family onto a numbered line of the manifest — including one column answered from the clerk's own judgment rather than from anything the family said",
        position: 1,
      },
      {
        id: "barge-to-the-island",
        label:
          "The ship reaches quarantine, a boarding party passes the cabin passengers for landing at the company pier, and the steerage is taken off by barge to the station",
        position: 2,
      },
      {
        id: "board-of-special-inquiry",
        label:
          "Where the answers, the money or the doctor's certificate raise a question, the case goes to three inspectors in a closed room, who decide it by majority",
        position: 5,
      },
      {
        id: "line-inspection-stairs",
        label:
          "Surgeons stationed at the head of the stairs watch each person climb, and chalk a letter on the shoulder of anyone to be looked at again",
        position: 3,
      },
    ],
    explanation:
      "The chain begins in Europe and it begins with a company. Because the acts of 1891, 1893 and 1903 made a steamship line return a rejected alien at its own expense and fined it for a contagious disease it should have caught, the first inspection of most arrivals was commercial, conducted weeks before an American official saw them, with no appeal from a shipping clerk. The manifest written at that point is the document everything later hangs on — including column 9, which no traveller supplied. At quarantine the ship is sorted by ticket class, and only the steerage goes to the island. The stairs are the medical examination, because a climb shows a heart and a gait faster than any interview. The registry desk is a consistency check against a sheet written on the other side of the ocean. Only what fails one of those goes to a board, and only a small fraction of board cases ends in exclusion. The last step is the one students underrate: about two thirds of arrivals bought a railroad ticket on the island itself and left the same day, which is why the harbour is best read as a doorway rather than as a destination.",
    skillCategory: "Causation",
  },
];

export const UNIT_07_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-019-evidence-instrument-sourcing",
    prompt:
      "Match each record recovered at the station to the historical-thinking skill it best demonstrates, then explain what the manifest and the board minute reveal when they are read against each other. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "port-ship-manifest-page",
        label: "Manifest Sheet 14, Steerage",
        attribution:
          "The purser of a transatlantic steamer, filled in at the port of embarkation, April 1907",
        excerpt:
          "8 Nationality: country of which citizen or subject. 9 Race or people… LINE 11. Nationality, RUSSIA. Race or people, HEBREW… LINE 13. Nationality, AUSTRIA. Race or people, SOUTH ITALIAN.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "port-races-or-peoples-circular",
        label: "Instructions for Column Nine",
        attribution: "The office of the Commissioner-General of Immigration, Washington, 1907",
        excerpt:
          "Where the alien's own statement of his race is at variance with the facts as they appear to the inspecting officer, the officer will enter the race as indicated by the language habitually spoken, by the place of origin of the stock, and by his own observation, and will not enter the race merely as claimed.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "port-medical-inspection-card",
        label: "The Six-Second Examination",
        attribution:
          "A surgeon of the United States Public Health and Marine-Hospital Service, 17 April 1907",
        excerpt:
          "The climb is itself the examination for the heart, the lungs and the gait… Class A, a loathsome or a dangerous contagious disease: certification is mandatory… Class B, a mental or physical condition of such a nature as may affect the ability of the alien to earn a living: the certificate is referred to a board of special inquiry.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "port-special-inquiry-minute",
        label: "Minute of a Hearing, Board No. 2",
        attribution: "The clerk of the board; three immigrant inspectors sitting, 17 April 1907",
        excerpt:
          "If she has an offer she is excluded under the contract labour provision; if she has none, and eleven dollars, she is likely to become a public charge… Later, same day. The husband appearing at the bar of the board and producing a bank book and a statement from his employer, the board on its own motion reopens and reverses.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "port-cabin-passenger-return",
        label: "Return of the Boarding Division",
        attribution: "The boarding division, at quarantine in the Lower Bay, 17 April 1907",
        excerpt:
          "Passengers passed will land at the company's pier in the North River… Steerage, 1,106, to be landed at the station in the usual manner. — NOTE. Nothing in the statute distinguishes the cabin passenger from the steerage passenger as to the law to be applied; the distinction is one of the place and manner of examination only.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "port-commissioners-daily-statement",
        label: "Statement of Business, One Day",
        attribution:
          "The office of the Commissioner of Immigration, Port of New York, 17 April 1907",
        excerpt:
          "Aliens landed and examined, 11,747… Head tax collected at two dollars the head… The head tax provided by the act approved 20 February last, at four dollars the head, is to be collected from and after 1 July next; forms and instructions are requested in advance of that date.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "The manifest and the board minute describe the same woman on the same day. Explain what each one can establish that the other cannot, and what a historian holding only one of them would get wrong.",
    rubric: {
      skillCategories: [
        "Causation",
        "Comparison",
        "Continuity and Change",
        "Contextualization",
        "Sourcing",
      ],
      pointsTotal: 7,
      description:
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what the manifest and the board minute each establish and identifies what a historian holding only one of them would conclude wrongly.",
    },
    explanation:
      "The two documents are the same person seen from two desks, and neither is sufficient. The manifest establishes the categories exactly — age, means, destination, and the stock the Bureau has assigned — and it cannot tell you anything about how a decision was reached, because it is a record made before any decision existed. The minute establishes the reasoning precisely, including the bind stated aloud and the twenty-two minutes the whole thing took, and it cannot tell you what was written about her before she arrived, which is what the questions are being checked against. A historian with only the manifest would describe a classification system. A historian with only the minute would describe a hearing. Put them together and the hearing turns out to be an audit of a document the woman never saw, written in Europe by a company with a commercial interest in her admission — which is the finding neither record states and both support.",
  },
];

export const UNIT_07_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-019-hipp-races-circular",
    prompt:
      "Analyze the Bureau's circular using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes what the document instructs — not the one that merely names the correct answer.",
    document: {
      text: "The entry required in the column headed RACE OR PEOPLE is not the entry required in the column headed NATIONALITY, and the two are not to be made to agree… Race or people is the stock to which the alien belongs, and is to be entered from the list appended hereto, without regard to the country of birth, the country of last residence, or the passport carried… The distinction between NORTH ITALIAN and SOUTH ITALIAN is to be observed in every case… Where the alien's own statement of his race is at variance with the facts as they appear to the inspecting officer, the officer will enter the race as indicated by the language habitually spoken, by the place of origin of the stock, and by his own observation, and will not enter the race merely as claimed… Officers are reminded that this column is required for statistical purposes and that its accuracy is of the first importance to the work of the Bureau.",
      attribution:
        "Circular of the Commissioner-General of Immigration to inspectors in charge at all ports, 1907, reissuing a classification in use since 1899 (composite reconstructed from the form and substance of Bureau circulars)",
    },
    hippPrompts: [
      {
        id: "circular-purpose",
        dimension: "Purpose",
        argument:
          "The circular insists the race column and the nationality column must not agree, forbids the officer to enter what the traveller claims, and closes by calling the column's accuracy “of the first importance to the work of the Bureau.”",
        options: [
          {
            id: "circular-purpose-explained",
            text: "The column exists to produce a statistic the Bureau could not get from any government's records — a count of stocks rather than of citizens — because the restriction argument then running in Congress was conducted in exactly those terms, which is why an entry no traveller supplies is called the accurate one.",
            correct: true,
          },
          {
            id: "circular-purpose-named-only",
            text: "The purpose of the circular is to instruct immigration inspectors on how to complete one column of the manifest correctly.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "circular-purpose-wrong-service",
            text: "The purpose is to help arriving travellers be recorded as they would wish, by giving officers a fuller list of categories to choose from than nationality alone allows.",
            correct: false,
          },
          {
            id: "circular-purpose-wrong-fraud",
            text: "The purpose is to detect forged or purchased passports, since a traveller whose race does not match the passport's country of issue has probably obtained it fraudulently.",
            correct: false,
          },
        ],
      },
      {
        id: "circular-point-of-view",
        dimension: "Point of view",
        argument:
          "Where the traveller and the officer disagree, the officer enters what “the language habitually spoken, the place of origin of the stock, and his own observation” indicate, and “will not enter the race merely as claimed.”",
        options: [
          {
            id: "circular-pov-explained",
            text: "The document assumes that what a person is can be read off them by a stranger and that the stranger is the better authority, which is why a hurried judgment made across a desk leaves the building as a federal statistic — and why the classification's later critics attacked the categories without being able to touch the rule that made them.",
            correct: true,
          },
          {
            id: "circular-pov-named-only",
            text: "The circular was written by federal officials in Washington for federal officials at the ports.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "circular-pov-wrong-neutral",
            text: "The circular takes no position on how race should be determined; it simply asks officers to record whichever answer the evidence in front of them supports.",
            correct: false,
          },
          {
            id: "circular-pov-wrong-deferential",
            text: "The circular defers to the traveller's own understanding of their identity, which is why it lists so many categories for each country of birth.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 7.02's mission — the argument over the Philippines, sorted by what each document can
// actually establish. See this file's header for why it is an evidence-organizing rather than a
// two-sided debate question.
export const UNIT_07_ARCHIVE_EVIDENCE_QUESTS = [
  {
    id: "case-020-mission-under-the-flag",
    prompt:
      "Match each document from the argument over the Philippines to the historical-thinking skill it best demonstrates, then explain what the Supreme Court actually decided and why that answer outlasted both sides of the debate. More than one document may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "beveridge-march-of-the-flag",
        label: "“The March of the Flag”",
        attribution: "Albert J. Beveridge, campaign speech at Indianapolis, 16 September 1898",
        excerpt:
          "Shall we occupy new markets for what our farmers raise, new markets for what our factories make, new markets for what our merchants sell?… The Opposition tells us that we ought not to govern a people without their consent. I answer: the rule of liberty that all just government derives its authority from the consent of the governed applies only to those who are capable of self-government.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "anti-imperialist-league-platform",
        label: "Platform of the American Anti-Imperialist League",
        attribution: "American Anti-Imperialist League, Chicago, 18 October 1899",
        excerpt:
          "We hold that the policy known as imperialism is hostile to liberty and tends toward militarism, an evil from which it has been our glory to be free. We regret that it has become necessary in the land of Washington and Lincoln to reaffirm that all men, of whatever race or color, are entitled to life, liberty, and the pursuit of happiness. We maintain that governments derive their just powers from the consent of the governed.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "mckinley-benevolent-assimilation",
        label: "Benevolent Assimilation Proclamation",
        attribution: "William McKinley, executive order to the Secretary of War, 21 December 1898",
        excerpt:
          "The military government heretofore maintained by the United States in the city, harbor, and bay of Manila is to be extended with all possible dispatch to the whole of the ceded territory… it should be the earnest and paramount aim of the military administration to win the confidence, respect, and affection of the inhabitants of the Philippines by assuring them… that the mission of the United States is one of benevolent assimilation, substituting the mild sway of justice and right for arbitrary rule.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "aguinaldo-counter-proclamation",
        label: "Counter-proclamation from Malolos",
        attribution: "Emilio Aguinaldo, President of the Philippine Republic, 5 January 1899",
        excerpt:
          "My government cannot remain indifferent in view of such a violent and aggressive seizure of a portion of its territory by a nation which has arrogated to itself the title of champion of oppressed nations… I solemnly protest, in the name of God, the root and fountain of all justice, against this intrusion of the United States Government upon the sovereignty of these islands.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "treaty-of-paris-article-ix",
        label: "Treaty of Paris, Article IX",
        attribution: "Treaty of Peace between the United States and Spain, signed 10 December 1898",
        excerpt:
          "The civil rights and political status of the native inhabitants of the territories hereby ceded to the United States shall be determined by the Congress.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "downes-v-bidwell",
        label: "Downes v. Bidwell, 182 U.S. 244",
        attribution:
          "Opinion of the Court, delivered by Justice Brown, 27 May 1901 — a customs-duty case arising from Puerto Rico, whose doctrine governed the Philippines equally",
        excerpt:
          "…the Island of Porto Rico is a territory appurtenant and belonging to the United States, but not a part of the United States within the revenue clauses of the Constitution… If those possessions are inhabited by alien races, differing from us in religion, customs, laws, methods of taxation, and modes of thought, the administration of government and justice, according to Anglo-Saxon principles, may for a time be impossible.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "Beveridge and the Anti-Imperialist League disagree about whether the United States should hold the Philippines. Downes v. Bidwell answers a different question. State the question the Court actually decided, and explain why its answer outlasted both arguments.",
    rubric: {
      skillCategories: [
        "Causation",
        "Comparison",
        "Continuity and Change",
        "Contextualization",
        "Sourcing",
      ],
      pointsTotal: 7,
      description:
        "Earn 1 point per document correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that identifies the question Downes v. Bidwell actually decided — whether the Constitution applies of its own force in territory the United States holds but has not incorporated — and explains why that holding settled the matter more durably than either side's argument about consent.",
    },
    explanation:
      "Four parties, and the one that settles it is not in the debate. Beveridge argues from markets and destiny and answers the consent objection by narrowing who consent is owed to; read against the depression of the 1890s and the census announcement that the continental frontier had closed, it is the period's clearest statement of why expansion looked like necessity rather than choice. The League answers on principle, quoting the Declaration back at a government that had used the phrase “criminal aggression” itself. McKinley's proclamation is the causal document: extending military government “to the whole of the ceded territory” meant to a republic already governing it, and the shooting began six weeks later in a war that killed more than four thousand American soldiers and, by conservative estimates, over two hundred thousand Filipinos. Aguinaldo's protest is the sourcing document, because it is the only one written by the party the other five discuss rather than address. Then the Treaty's Article IX and Downes v. Bidwell do the thing that lasted. Article IX left the status of seven million people to Congress rather than settling it by treaty; Downes held that a possession could belong to the United States without being part of it for constitutional purposes, and Justice White's concurrence supplied the phrase that governed for a century — territory “foreign to the United States in a domestic sense.” Against the whole prior American practice, in which acquired territory moved toward statehood and citizenship on the Northwest Ordinance model, that is the change. It was a customs case about oranges, it never mentions the Philippines in its holding, and it decided them.",
  },
];

// Case 7.03's mission — the chain, not the document. See this file's header for why sequencing.
export const UNIT_07_ARCHIVE_SEQUENCING_QUESTS = [
  {
    id: "case-021-mission-the-order-and-the-map",
    prompt:
      "Arrange these developments in the order in which each one made the next possible — not simply the order the dates fall in.",
    // **Authored out of order on purpose** — see the note on the case-019 sequencing quest above,
    // and tests/unit/sequencing-quest-order.test.js.
    items: [
      {
        id: "executive-order-9066",
        label:
          "The President signs an order authorizing the Secretary of War and designated military commanders to prescribe military areas “from which any or all persons may be excluded.” It names no nationality, no ancestry and no race",
        position: 4,
      },
      {
        id: "ozawa-ineligible",
        label:
          "The Supreme Court holds that a Japanese immigrant is not eligible for naturalization, so an entire generation cannot become citizens however long it lives in the country — while their children, born here, are citizens by birth",
        position: 0,
      },
      {
        id: "exclusion-orders-posted",
        label:
          "Numbered civilian exclusion orders go up on telephone poles neighbourhood by neighbourhood, and about 120,000 people — roughly two thirds of them United States citizens — are given days to sell or store everything they cannot carry",
        position: 6,
      },
      {
        id: "alien-registration-and-list",
        label:
          "A federal statute requires every non-citizen resident over fourteen to register and be fingerprinted, and the Justice Department maintains a custodial detention list of community figures compiled from years of surveillance",
        position: 1,
      },
      {
        id: "korematsu-and-endo",
        label:
          "The Supreme Court upholds one man's conviction for refusing to go, and on the same day orders the release of a woman the government conceded was loyal — by which point the exclusion had been rescinded the day before",
        position: 7,
      },
      {
        id: "public-law-503",
        label:
          "Congress makes it a federal crime to disobey a military commander's exclusion order, turning an authorization to draw lines into something a person can be arrested and prosecuted for",
        position: 5,
      },
      {
        id: "pearl-harbor-arrests",
        label:
          "Within days of the attack on Pearl Harbor, agents arrest roughly a thousand people off that list — priests, language-school principals, newspaper editors, fishing-boat owners — and the communities lose the people who spoke for them in English",
        position: 2,
      },
      {
        id: "dewitt-recommendation",
        label:
          "The general commanding the West Coast recommends removing everyone of Japanese ancestry, citizen or not, and writes that the complete absence of any sabotage is itself proof that sabotage is being prepared",
        position: 3,
      },
    ],
    explanation:
      "Every link is lawful and most are unremarkable alone, which is why the chain has to be seen whole. It starts in 1922, with Ozawa v. United States: the Issei are declared ineligible for naturalization, so a generation is permanently alien by law and their American-born children are citizens — the split that made the phrase “citizen or not” usable eighteen years later. The Alien Registration Act of 1940 then requires those aliens to register and be fingerprinted, and the Justice Department already keeps a custodial detention list; when Pearl Harbor comes, the arrests are not an investigation but a filing operation, and they remove exactly the people who could have argued the community's case in English. General DeWitt's recommendation supplies the reasoning, including the inversion students should never forget: “the very fact that no sabotage has taken place to date is a disturbing and confirming indication that such action will be taken.” Executive Order 9066, signed 19 February 1942, names nobody — which is what let it be defended as a military measure rather than a racial one, and what makes reading the order alone so misleading. Public Law 503, a month later, is the step that is easiest to skip and hardest to do without: an authorization is not a power to arrest anyone until disobeying it is a crime. Then the orders go up on poles, and 120,000 people have about a week. The ending is the part most often got wrong. On 18 December 1944 the Court decided Korematsu and Ex parte Endo together — upholding the exclusion of a citizen from a military area, and simultaneously holding that the War Relocation Authority could not go on detaining a citizen whose loyalty the government conceded. The administration, knowing the decisions were coming, had announced the end of exclusion the day before. Korematsu was never overruled until the Court said so in passing in 2018, and Fred Korematsu's own conviction was vacated in 1983 after a researcher found the government had suppressed its own intelligence reports finding no military necessity at all.",
    skillCategory: "Causation",
  },
];

export const UNIT_07_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-07-archive-sorting-arrivals-saq",
    stimulus:
      "“The entry required in the column headed RACE OR PEOPLE is not the entry required in the column headed NATIONALITY, and the two are not to be made to agree… Where the alien's own statement of his race is at variance with the facts as they appear to the inspecting officer, the officer will enter the race as indicated by the language habitually spoken, by the place of origin of the stock, and by his own observation, and will not enter the race merely as claimed.” — Circular of the Commissioner-General of Immigration to inspectors in charge at all ports, 1907 (composite reconstructed from the form of Bureau circulars)",
    prompts: [
      "A. Identify one way in which federal officials exercised discretion over who was admitted to the United States at ports of entry in the period 1890–1924.",
      "B. Explain one way in which migration from southern and eastern Europe shaped American politics or culture in the period 1890–1924.",
      "C. Explain one way in which federal immigration policy changed between 1907 and 1924.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_07_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-07-archive-terms-of-belonging-dbq",
    prompt:
      "Evaluate the extent to which the United States redefined who belonged to the nation in the period from 1890 to 1945.",
    documents: [
      {
        id: "doc-anti-imperialist-platform",
        label: "Document 1",
        attribution: "Platform of the American Anti-Imperialist League, Chicago",
        date: "October 18, 1899",
        excerpt:
          "We hold that the policy known as imperialism is hostile to liberty and tends toward militarism, an evil from which it has been our glory to be free. We regret that it has become necessary in the land of Washington and Lincoln to reaffirm that all men, of whatever race or color, are entitled to life, liberty, and the pursuit of happiness. We maintain that governments derive their just powers from the consent of the governed. We insist that the subjugation of any people is criminal aggression and open disloyalty to the distinctive principles of our Government.",
      },
      {
        id: "doc-manifest-column-nine",
        label: "Document 2",
        attribution:
          "Bureau of Immigration circular to inspectors in charge at all ports (composite record reconstructed for Chronicle from the form of Bureau circulars)",
        date: "1907",
        excerpt:
          "Race or people is the stock to which the alien belongs, and is to be entered from the list appended hereto, without regard to the country of birth, the country of last residence, or the passport carried… The distinction between NORTH ITALIAN and SOUTH ITALIAN is to be observed in every case… The entry HEBREW will be made for aliens of that race whatever their nationality or country of birth.",
      },
      {
        id: "doc-du-bois-returning-soldiers",
        label: "Document 3",
        attribution: "W. E. B. Du Bois, “Returning Soldiers,” The Crisis",
        date: "May 1919",
        excerpt:
          "We are returning from war! The Crisis and tens of thousands of black men were drafted into a great struggle… This country of ours, despite all its better souls have done and dreamed, is yet a shameful land… We return. We return from fighting. We return fighting. Make way for Democracy! We saved it in France, and by the Great Jehovah, we will save it in the United States of America, or know the reason why.",
      },
      {
        id: "doc-johnson-reed",
        label: "Document 4",
        attribution: "Immigration Act of 1924 (Johnson-Reed Act)",
        date: "May 26, 1924",
        excerpt:
          "The annual quota of any nationality shall be 2 per centum of the number of foreign-born individuals of such nationality resident in continental United States as determined by the United States census of 1890, but the minimum quota of any nationality shall be 100… No alien ineligible to citizenship shall be admitted to the United States unless such alien is admissible as a non-quota immigrant.",
      },
      {
        id: "doc-indian-citizenship-act",
        label: "Document 5",
        attribution: "Indian Citizenship Act",
        date: "June 2, 1924",
        excerpt:
          "That all non-citizen Indians born within the territorial limits of the United States be, and they are hereby, declared to be citizens of the United States: Provided, That the granting of such citizenship shall not in any manner impair or otherwise affect the right of any Indian to tribal or other property.",
      },
      {
        id: "doc-executive-order-8802",
        label: "Document 6",
        attribution:
          "Executive Order 8802, issued after A. Philip Randolph threatened a march of 100,000 on Washington",
        date: "June 25, 1941",
        excerpt:
          "I do hereby reaffirm the policy of the United States that there shall be no discrimination in the employment of workers in defense industries or government because of race, creed, color, or national origin… and it is the duty of employers and of labor organizations… to provide for the full and equitable participation of all workers in defense industries.",
      },
      {
        id: "doc-executive-order-9066",
        label: "Document 7",
        attribution: "Executive Order 9066",
        date: "February 19, 1942",
        excerpt:
          "I hereby authorize and direct the Secretary of War, and the Military Commanders whom he may from time to time designate, whenever he or any designated Commander deems such action necessary or desirable, to prescribe military areas in such places and of such extent as he or the appropriate Military Commander may determine, from which any or all persons may be excluded, and with respect to which, the right of any person to enter, remain in, or leave shall be subject to whatever restrictions the Secretary of War or the appropriate Military Commander may impose in his discretion.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that the period narrowed belonging by ancestry (the race-or-people classification, the 1890 base year, the exclusion of those “ineligible to citizenship,” the removal authorized by Executive Order 9066) AND that the same years extended it by the same kinds of instrument (the Indian Citizenship Act passed weeks after Johnson-Reed, a fair-employment order won by the threat of a march), so that a student tracking only the direction of travel would miss that both movements ran through quotas, orders and forms rather than through declarations of principle.",
  },
];
