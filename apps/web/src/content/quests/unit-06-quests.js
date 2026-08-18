// Unit 6 (Period 6: 1865-1898) quest content, structural mirror of unit-05-quests.js and built
// against the six real CASE_016_SOURCES in apps/web/src/content/unit-06-campaign.js.
//
// ## Why the two missions are the types they are
//
// **Unit 6 is the first unit to run `hipp` and `mcq` together**, and that is the whole reason for
// the pairing: across Units 1-5 the two missions per unit used `sequencing` four times and
// `evidence-organizing` four times, against one `hipp` (case-012) and one `mcq` (case-009). The
// two thin types get a unit of their own.
//
// **case-017 is `hipp`, and its document is a historian rather than a participant.** Every other
// HIPP in the game analyses somebody inside the events — Jackson writing to Congress about a
// removal he ordered. Turner is analysing the same century from outside it, twenty years after
// this unit's field case, and the reason that is worth a mission is that a student who can only
// source participants will take a historian's argument as a summary of what happened. The two
// tagged dimensions are Historical situation and Point of view, because those are the two the text
// itself makes arguable; Purpose and Intended audience are real here too and are handled in the
// explanations rather than forced into tags the schema caps at two.
//
// **case-018 is `mcq`, one stimulus question, the shape case-009 established.** It compares the
// Chinese Exclusion Act with the Geary Act's certificate of residence, and it is in this unit
// rather than Unit 7 because it is the field case's own question moved from a place to a person:
// the receiver's receipt says a quarter-section belongs to whoever holds the slip, and ten years
// later a statute says the same thing about a man. Unit 7's port is about being sorted on arrival,
// which is a different question and gets a different unit.
//
// ## Where industrial labour went
//
// It is not a third case. The Archive Challenges carry it — the DBQ's seven documents run from the
// Knights of Labor's open membership to the Omaha Platform, and the complexity clause of its rubric
// is about the American Federation of Labor's opposite answer. A unit gets three cases and this
// one spends them on land, on the story told about land, and on the paper a person carries.
//
// ## No investigation quests, same as Units 4 and 5
//
// A source's optional Investigation Challenge gate (source.schema.js's investigationMode /
// investigationQuestId) is left null on all six records, for the reason Unit 5 records: every one
// is a composite reconstructed from a documentary form rather than one surviving item, and a
// pre-reveal "predict this source's point of view" exercise fits a named author's speech far
// better than an administrative form. The fields exist and default to null.

export const UNIT_06_MCQ_QUESTS = [
  {
    id: "case-016-mcq-receipt-causation",
    prompt:
      "The receiver's receipt sells a quarter-section of the Kaw reserve for cash and directs that the proceeds, less expenses, be credited to the Kansas or Kaw tribe. The tribe left Kansas under compulsion in the same month. What does the combination most directly reveal about how the United States transferred Indigenous land in this period?",
    choices: [
      "Dispossession was carried out through ordinary legal instruments that paid and accounted for what they took, which is what made it defensible to the people carrying it out and difficult to contest afterward",
      "The sale was legally void, because a tribe cannot be credited with proceeds while it is being removed",
      "The receipt shows that the Kanza had voluntarily sold the reserve and were leaving of their own accord",
      "Land transfers of this kind were rare after 1871, when Congress stopped making treaties with tribes",
    ],
    answer: 0,
    explanation:
      "The instrument is the point. There is no fraud on this slip: an act of Congress authorised the sale, a commission appraised the land, the auction was advertised, cash was paid, and the proceeds really were credited to a tribal account. That is precisely why it worked and why it was hard to fight — a transaction that pays is far more durable than a seizure that does not. The receipt is not void; the removal was ordered by the same Congress that authorised the sale, over Chief Allegawaho's protest. And the end of treaty-making in 1871 did not slow the transfers: it moved them from treaties to statutes, which is exactly the form this one takes.",
    skillCategory: "Causation",
  },
  {
    id: "case-016-mcq-survey-sourcing",
    prompt:
      "Two deputy surveyors ran the same reserve boundary fourteen years apart and marked it in two places, thirty-three chains and sixty links apart. The 1859 line is the one shown on the plat of record; the 1873 deputy reports that the treaty's own description puts the line elsewhere. A historian using these field notes should conclude which of the following?",
    choices: [
      "The boundary existed in two incompatible legal forms at once, and the one that governed was the one the land office could sell from",
      "The 1873 deputy was incompetent, since a boundary can only be in one place and the plat of record settles it",
      "The discrepancy proves deliberate fraud by the General Land Office in order to open the tracts to sale",
      "Field notes are unreliable evidence, because compass and chain surveys were too crude to fix any boundary",
    ],
    answer: 0,
    explanation:
      "This is a sourcing question about what a record is for rather than whether it is accurate. Both surveys are competent work of the same kind, done under contract to the same office, and both are on file. What separates them is institutional: a plat of record is the document a land office can sell, patent and tax from, and a treaty description is not. Once patents had issued from the 1859 plat, that line was the operative boundary whatever the treaty said, and the tracts between the two lines were returned as unsurveyed — a legal limbo, not a clerical gap. Fraud is the wrong conclusion and also the less disturbing one: routine, reviewable, well-executed survey work moved far more ground than any conspiracy did.",
    skillCategory: "Sourcing",
  },
  {
    id: "case-016-mcq-payroll-contextualization",
    prompt:
      "The construction pay sheet allows $1.75 a day, works out a gross of $45.50 for the month, deducts $29.03 for board, outfit, tools, store account, doctor and hospital fund, and pays the $16.47 balance in a time check redeemable at the company office at the end of the quarter or discounted for cash at the company store. Which context is most necessary to interpret what the man was actually paid?",
    choices: [
      "That every party on the deduction side of the sheet — the boarding car, the store, the surgeon, the office issuing the check — was the same company that set the rate, so it controlled both the wage and its value",
      "That $1.75 a day was above the average manufacturing wage in 1873, so the arrangement was generous by the standards of the period",
      "That railroad construction was seasonal, so the man would have been unemployed for part of the year regardless",
      "That the federal government set minimum wage rates for federally chartered railroads",
    ],
    answer: 0,
    explanation:
      "Follow the money out of the sheet and it all goes to one address. The company sets the rate, boards the man and charges him for it, outfits him on credit, sells him goods on an order book, levies him for a surgeon it employs, pays him in its own paper at a date it chooses, and then discounts that paper at its own store. The advertised rate is real and describes almost nothing. Seasonality is true and irrelevant to this question; there was no federal minimum wage in 1873, and no federal rate-setting for railroad labour. The forfeiture clause — a man leaving before the section is finished loses his unpaid balance — is what kept him from testing any of it, and after the Panic of September 1873 tightened eastern credit, the discount on a time check was whatever the store said it was.",
    skillCategory: "Contextualization",
  },
  {
    id: "case-016-mcq-tariff-continuity",
    prompt:
      "Tariff No. 9 charges 24 cents per hundredweight on car-load grain from Cottonwood Junction to Kansas City, 141 miles, and 19 cents from Florence, 168 miles. The nearer station pays more. Which statement best traces what this pattern led to over the following fifteen years?",
    choices: [
      "Shipper protest produced state 'Granger' rate laws, which the Supreme Court sustained in Munn v. Illinois and then narrowed in Wabash, leaving a gap Congress filled with the Interstate Commerce Act and the first federal regulatory commission",
      "Railroads voluntarily equalized rates in the 1880s once competition reached every station, and no legislation proved necessary",
      "The federal courts held in Munn v. Illinois that no government could regulate the rates of a private corporation, ending the question",
      "Congress responded immediately with the Sherman Antitrust Act, which was written specifically to set railroad freight rates",
    ],
    answer: 0,
    explanation:
      "Florence is farther away and pays less because it is served by more than one road; the Junction has one, and pays for the rate war fought elsewhere. That grievance organized the Grange, produced maximum-rate statutes in several midwestern states in the early 1870s, and reached the Supreme Court twice. Munn v. Illinois (1877) upheld state regulation of a business 'affected with a public interest' — the opposite of option three. Wabash (1886) then held that states could not reach interstate rates, which is what made a federal answer unavoidable: the Interstate Commerce Act of 1887 created the ICC, the first federal regulatory commission of its kind. The Sherman Act came in 1890 and is antitrust law, not rate regulation.",
    skillCategory: "Continuity and Change",
  },
];

export const UNIT_06_SEQUENCING_QUESTS = [
  {
    id: "case-016-sequencing-how-a-railhead-happens",
    prompt:
      "Arrange these developments in the order in which each one made the next possible — not simply the order the dates fall in.",
    // **Authored out of order on purpose**, and now enforced by
    // tests/unit/sequencing-quest-order.test.js: renderSequencingQuest() lays items out in this
    // array's order and never shuffles, so a list written 0,1,2,3,4,5 opens already solved and
    // grades a student correct for touching nothing. Keep each item's `position` right and its
    // place in this array wrong.
    items: [
      {
        id: "congress-orders-the-reserve-sold",
        label:
          "Pressed by railroad and town-site interests who want the land in the market, Congress orders the Kaw reserve appraised and sold in 160-acre tracts, and the tribe removed to Indian Territory",
        position: 3,
      },
      {
        id: "land-grant",
        label:
          "Congress grants the railroad alternate sections along a line it has not yet built, so the company's return depends on finding buyers for land it does not yet own outright",
        position: 0,
      },
      {
        id: "farmers-organize-against-the-rate",
        label:
          "The farmers the company recruited find that a station with one railroad pays more to ship grain than a station twenty-seven miles farther out with two, and organize against the corporation that sold them the land",
        position: 5,
      },
      {
        id: "crews-grade-west",
        label:
          "Survey and grading crews push the line west, boarded in company cars, outfitted on the company's credit and paid in the company's paper",
        position: 1,
      },
      {
        id: "land-office-opens-the-reserve",
        label:
          "The district land office puts the reserve up at public auction for cash, and writes receipts crediting the proceeds to a tribe that is walking south",
        position: 4,
      },
      {
        id: "town-company-plats-a-site",
        label:
          "A town company plats a site where the rails will reach, and its trustees buy the weekly newspaper that will advertise it to the East",
        position: 2,
      },
    ],
    explanation:
      "The chain runs from a federal grant to a farmers' revolt, and every step is somebody acting rationally on the step before. Granting alternate sections along an unbuilt line made the company a land dealer as much as a carrier, which is why it needed settlers and needed them fast. Grading the line created the labour system the pay sheet records. Platting a town and buying its newspaper was how settlers were found. The reserve was sold because it was the largest block of good land the promoters could not otherwise reach, and the land office's own receipts credit the proceeds to the people being removed from it. The last step is the one students most often miss, because it looks like a reversal: the settlers the railroad recruited became its most determined political opponents within a decade, and the Granger laws, Munn, Wabash and the Interstate Commerce Commission all descend from farmers who were on that land because a railroad put them there.",
    skillCategory: "Causation",
  },
];

export const UNIT_06_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-016-evidence-instrument-sourcing",
    prompt:
      "Match each Cottonwood Junction record to the historical-thinking skill it best demonstrates, then explain what the receiver's receipt and the removal roll reveal when they are read against each other. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "railhead-land-office-receipt",
        label: "Receiver's Receipt, Kaw Trust Lands",
        attribution: "The receiver of the district land office, June 1873",
        excerpt:
          "…sold this day at public sale under the act of Congress approved the eighth of May, eighteen hundred and seventy-two… Sold to the highest bidder, for cash, no tract exceeding one hundred and sixty acres. The proceeds of this sale, less the expenses thereof, to be placed to the credit of the said tribe.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "railhead-removal-roll",
        label: "Roll of the Kansas Tribe, Taken Preparatory to Removal",
        attribution: "The agent for the Kansas or Kaw tribe, June 1873",
        excerpt:
          "Whole number of souls, 533… Houses of stone erected for the tribe upon the reserve and now abandoned, 138… The tribe left this agency on the fourth day of June. [Several entries are set down only as “wife of” the man written above.]",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "railhead-survey-field-book",
        label: "Field Notes, Township 18 South, Range 8 East",
        attribution: "A deputy surveyor under contract to the Surveyor General, 1873",
        excerpt:
          "The line here run and marked is the north boundary of the diminished reserve as that boundary is described by course and distance in the treaty. The line run in 1859… and shown on the plat of record in this office, lies thirty-three chains and sixty links to the south of it… The tracts lying between the two lines are returned herewith as unsurveyed.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "railhead-town-paper",
        label: "The Cottonwood Junction Clarion",
        attribution: "The proprietor, who is also a town-site trustee, June 1873",
        excerpt:
          "A CARD. The undersigned, having no interest in any town site whatever, cheerfully recommends the Junction to all persons seeking homes. — THE INDIANS. The Kaws took their departure on Wednesday… Their late reserve being now open, we may look for a large immigration.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "railhead-construction-payroll",
        label: "Time Check and Pay Sheet, Construction Department",
        attribution: "The division paymaster's clerk, July 1873",
        excerpt:
          "Rate allowed, one dollar and seventy-five cents the day… TOTAL DEDUCTIONS, 29.03. — BALANCE, sixteen dollars and forty-seven cents, PAYABLE IN TIME CHECK at the company's office at the close of the quarter, or discounted for cash at the store at the rate current there.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "railhead-freight-tariff",
        label: "Tariff No. 9, and One Car of Wheat",
        attribution: "The general freight agent of the division, July 1873",
        excerpt:
          "COTTONWOOD JUNCTION to Kansas City, 141 miles: grain, in car-loads, 24 cents. — FLORENCE to Kansas City, 168 miles: grain, in car-loads, 19 cents… “shipped in the name of the elevator, the rate to the elevator being by special arrangement.”",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "The receipt and the roll were written in the same month about the same people and the same ground. Explain what each one can establish that the other cannot, and what a historian who had only one of them would get wrong.",
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
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what the receipt and the roll each establish and identifies what a historian holding only one of them would conclude wrongly.",
    },
    explanation:
      "The two documents are one transaction seen from two desks, and neither is sufficient. The receipt establishes the legal machinery precisely — the authorising act, the appraisal, the auction, the cash, the credit to the tribal account — and it cannot tell you that anybody was removed, because the removal is not its business. The roll establishes the human fact exactly — 533 people, 15 wagons, 143 head of stock, twenty days' rations, 160 miles — and cannot tell you why, because a count does not carry a cause. A historian with only the receipt would describe a land sale. A historian with only the roll would describe a migration. Put them together and the removal and the auction are the same event, which is the finding neither document states and both support.",
  },
];

export const UNIT_06_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-016-hipp-clarion",
    prompt:
      "Analyze the Clarion's front page using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes what the page says — not the one that merely names the correct answer.",
    document: {
      text: "LANDS! LANDS! LANDS! The finest bottom and second-bottom in the State now offering. Trust lands of the Kaw Reserve, appraised and in market, at figures that will not be seen again in the lifetime of any man reading this… A CARD. The undersigned, having no interest in any town site whatever, cheerfully recommends the Junction to all persons seeking homes… THE INDIANS. The Kaws took their departure on Wednesday for their new home in the Territory. The removal was effected without disturbance. Their late reserve being now open, we may look for a large immigration.",
      attribution:
        "The Cottonwood Junction Clarion, June 1873; the proprietor is a trustee of the town company (composite reconstructed from the form and contents of Kansas frontier weeklies)",
    },
    hippPrompts: [
      {
        id: "clarion-purpose",
        dimension: "Purpose",
        argument:
          "The page devotes its largest type to land for sale and three lines to the removal of 533 people, and reports that removal chiefly as a reason to expect buyers.",
        options: [
          {
            id: "clarion-purpose-explained",
            text: "The paper is a town-site promotion before it is a newspaper, so events are sized by what they do to the land market rather than by what they are — which is why a removal appears as a supply announcement, and why the proportions on the page are themselves evidence about what its owner was selling.",
            correct: true,
          },
          {
            id: "clarion-purpose-named-only",
            text: "The purpose of the paper is to inform the residents of Cottonwood Junction about local news.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "clarion-purpose-wrong-neutral",
            text: "The purpose is to record the week's events in proportion to their importance, which is why the land advertisements are longest.",
            correct: false,
          },
          {
            id: "clarion-purpose-wrong-protest",
            text: "The purpose is to protest the removal of the Kaws by drawing attention to it on the front page.",
            correct: false,
          },
        ],
      },
      {
        id: "clarion-audience",
        dimension: "Intended audience",
        argument:
          "The land notice addresses “any man reading this” at prices “that will not be seen again,” and the appeal “TO THE CAPITALIST” asks the East only to come and look.",
        options: [
          {
            id: "clarion-audience-explained",
            text: "The page is written past its own town to readers in the East who might buy land or invest, which explains both the urgency and the “A CARD” disclaimer — a stranger cannot check whether the man recommending the Junction owns lots in it, and a neighbour would not need telling.",
            correct: true,
          },
          {
            id: "clarion-audience-named-only",
            text: "The intended audience is people who might want to buy land in Kansas.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "clarion-audience-wrong-local",
            text: "The intended audience is the town's existing residents, who already knew the removal had happened and needed no explanation of it.",
            correct: false,
          },
          {
            id: "clarion-audience-wrong-officials",
            text: "The intended audience is federal land office officials, whom the paper is attempting to persuade to reopen the reserve.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 6.02's mission — Turner read as a source rather than as a summary. See this file's header
// for why the document is a historian and why only two dimensions are tagged.
export const UNIT_06_ARCHIVE_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-017-mission-frontier-thesis-hipp",
    prompt:
      "Analyze Turner's frontier thesis using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes the argument — not the one that merely names the correct answer.",
    document: {
      text: "In a recent bulletin of the Superintendent of the Census for 1890 appear these significant words: 'Up to and including 1880 the country had a frontier of settlement, but at present the unsettled area has been so broken into by isolated bodies of settlement that there can hardly be said to be a frontier line.'… This brief official statement marks the closing of a great historic movement. Up to our own day American history has been in a large degree the history of the colonization of the Great West. The existence of an area of free land, its continuous recession, and the advance of American settlement westward, explain American development… The frontier is the line of most rapid and effective Americanization. The wilderness masters the colonist… Little by little he transforms the wilderness, but the outcome is not the old Europe… here is a new product that is American.",
      attribution:
        "Frederick Jackson Turner, 'The Significance of the Frontier in American History,' read to the American Historical Association at the World's Columbian Exposition, Chicago, July 12, 1893",
    },
    hippPrompts: [
      {
        id: "turner-situation",
        dimension: "Historical situation",
        argument:
          "Turner opens on a Census bulletin declaring the frontier line gone, and reads the paper at a world's fair staged to mark four centuries since Columbus and to display what the United States had become.",
        options: [
          {
            id: "turner-situation-explained",
            text: "He is writing at the exact moment the process he describes is announced to be over, in a city built on the plains trade and inside an exposition celebrating the result — which is why the essay reads as an elegy with a warning in it, and why an audience predisposed to see the settlement of the West as an accomplishment received an explanation of themselves rather than a challenge.",
            correct: true,
          },
          {
            id: "turner-situation-named-only",
            text: "Turner delivered the paper in 1893, three years after the 1890 census.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "turner-situation-wrong-frontier-open",
            text: "Turner was writing while the frontier was still open, so his argument was a prediction about settlement that had not yet occurred.",
            correct: false,
          },
          {
            id: "turner-situation-wrong-obscure",
            text: "Turner was writing in obscurity to a hostile profession that rejected the thesis, which is why the essay had little influence.",
            correct: false,
          },
        ],
      },
      {
        id: "turner-point-of-view",
        dimension: "Point of view",
        argument:
          "The argument rests on 'the existence of an area of free land' and on a wilderness that 'masters the colonist' — a West that is empty and a process with only one party to it.",
        options: [
          {
            id: "turner-pov-explained",
            text: "Calling the land free and the continent a wilderness is not a stray adjective but the thesis's load-bearing premise: if the West is empty, settlement is a meeting between Americans and nature, and every treaty, removal, survey and war required to empty it disappears from the causal account — which is why the essay can explain American democracy without mentioning the people who were living on the land it explains.",
            correct: true,
          },
          {
            id: "turner-pov-named-only",
            text: "Turner is a professional historian from Wisconsin writing about the American West.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "turner-pov-wrong-neutral",
            text: "Turner writes as a detached observer whose thesis makes no assumptions about who was on the land.",
            correct: false,
          },
          {
            id: "turner-pov-wrong-critique",
            text: "Turner's argument is a critique of westward expansion that centers the dispossession of Native nations as its principal cause.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 6.03's mission — the field case's question moved from a place to a person. See this file's
// header for why exclusion is in Unit 6 and not Unit 7.
export const UNIT_06_ARCHIVE_MCQ_QUESTS = [
  {
    id: "case-018-mission-certificate-of-residence",
    relatedSource: {
      label: "Two federal statutes, ten years apart",
      attribution:
        "Chinese Exclusion Act (May 6, 1882) and the Geary Act (May 5, 1892), which extended it",
      excerpt:
        "1882: “…the coming of Chinese laborers to the United States be, and the same is hereby, suspended; and during such suspension it shall not be lawful for any Chinese laborer to come… to remain within the United States.” · 1892: “…all Chinese laborers within the limits of the United States… shall be entitled to apply to the collector of internal revenue of their respective districts, within one year, for a certificate of residence, and any Chinese laborer… who shall neglect, fail, or refuse to comply… or who, after one year from the passage hereof, shall be found within the jurisdiction of the United States without such certificate of residence, shall be deemed and adjudged to be unlawfully within the United States, and may be arrested… and deported.”",
    },
    prompt:
      "Both statutes restrict the same population, but they act on different things. Which statement best explains what the 1892 provision changed about the legal position of a Chinese laborer already living lawfully in the United States?",
    choices: [
      "It shifted the burden of proof onto the resident: lawful presence stopped being a status he held and became a document he had to obtain and produce, so that failing to carry paper was itself the offense that made him deportable",
      "It repealed the 1882 exclusion and replaced it with a registration system that allowed new Chinese laborers to enter if they registered on arrival",
      "It applied only to Chinese laborers arriving after 1892, leaving the position of existing residents entirely unchanged",
      "It granted Chinese laborers already in the United States a path to naturalization on condition that they registered within one year",
    ],
    answer: 0,
    explanation:
      "1882 acts on the border: it suspends the coming of Chinese laborers. 1892 acts on the person: every Chinese laborer already inside the country must apply for a certificate of residence within a year, and anyone found without one afterward is by that fact unlawfully present and deportable. The change is in where the burden sits. Before, the government had to establish that someone had entered unlawfully; after, the resident had to be able to prove at any moment that he had not. Roughly nine in ten refused to register, in an organized campaign of civil disobedience that the Chinese Six Companies took to the Supreme Court and lost in Fong Yue Ting v. United States (1893). The Geary Act did not repeal exclusion, did not admit new laborers, and offered no path to naturalization — Chinese immigrants remained barred from citizenship until 1943. This is also the first general federal requirement that a class of residents carry documentary proof of their right to be present, which is why it is the ancestor of every later one.",
    skillCategory: "Comparison",
  },
];

export const UNIT_06_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-06-archive-western-transformation-saq",
    stimulus:
      "“The line here run and marked is the north boundary of the diminished reserve as that boundary is described by course and distance in the treaty. The line run in 1859 by the deputy under the previous contract, and shown on the plat of record in this office, lies thirty-three chains and sixty links to the south of it. I have run the treaty line, have marked it, and report both. The tracts lying between the two lines are returned herewith as unsurveyed.” — Deputy surveyor's field notes, Township 18 South, Range 8 East of the Sixth Principal Meridian, Kansas, 1873 (composite reconstructed from the form of General Land Office field notes)",
    prompts: [
      "A. Identify one way the federal government's survey and land-office system contributed to the transfer of Indigenous land to non-Native owners in the period 1865–1898.",
      "B. Explain one way that railroad expansion shaped federal policy toward Native nations in the same period.",
      "C. Explain one way that Native nations responded to federal policy in the West between 1865 and 1898.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_06_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-06-archive-industrial-order-dbq",
    prompt:
      "Evaluate the extent to which industrialization changed who was considered to belong in the United States in the period from 1865 to 1898.",
    documents: [
      {
        id: "doc-receivers-receipt",
        label: "Document 1",
        attribution:
          "Receiver's receipt, United States land office, Kaw trust lands, Kansas (composite reconstructed from General Land Office forms and the act of 8 May 1872)",
        date: "June 1873",
        excerpt:
          "Received… in full for the north-east quarter of section twenty-one… sold this day at public sale under the act of Congress approved the eighth of May, eighteen hundred and seventy-two, providing for the appraisement and sale of the trust lands and the diminished reserve of the Kansas or Kaw tribe of Indians… The proceeds of this sale, less the expenses thereof, to be placed to the credit of the said tribe.",
      },
      {
        id: "doc-knights-of-labor",
        label: "Document 2",
        attribution: "Preamble and Declaration of Principles of the Knights of Labor",
        date: "1878",
        excerpt:
          "The alarming development and aggressiveness of great capitalists and corporations, unless checked, will inevitably lead to the pauperization and hopeless degradation of the toiling masses… We therefore have formed the Order of the Knights of Labor… to secure to the toilers a proper share of the wealth that they create… The organization is open to all who work, without distinction of race, creed, colour or sex, excepting only lawyers, bankers, stockbrokers, professional gamblers and those who sell intoxicating drink.",
      },
      {
        id: "doc-chinese-exclusion-act",
        label: "Document 3",
        attribution: "Chinese Exclusion Act",
        date: "May 6, 1882",
        excerpt:
          "Whereas, in the opinion of the Government of the United States the coming of Chinese laborers to this country endangers the good order of certain localities within the territory thereof: Therefore, be it enacted… that from and after the expiration of ninety days next after the passage of this act… the coming of Chinese laborers to the United States be… suspended… And hereafter no State court or court of the United States shall admit Chinese to citizenship.",
      },
      {
        id: "doc-dawes-act",
        label: "Document 4",
        attribution: "Dawes Severalty Act",
        date: "February 8, 1887",
        excerpt:
          "…the President of the United States be… authorized… to allot the lands in said reservation in severalty to any Indian located thereon… And every Indian born within the territorial limits of the United States to whom allotments shall have been made… and who has adopted the habits of civilized life, is hereby declared to be a citizen of the United States, and is entitled to all the rights, privileges, and immunities of such citizens… The residue of lands remaining after allotment may be purchased by the United States.",
      },
      {
        id: "doc-riis",
        label: "Document 5",
        attribution: "Jacob Riis, How the Other Half Lives",
        date: "1890",
        excerpt:
          "The tenements to-day are New York, harboring three-fourths of its population… A map of the city, colored to designate nationalities, would show more stripes than on the skin of a zebra, and more colors than any rainbow… The one thing you shall vainly ask for in the chief city of America is a distinctively American community. There is none; certainly not among the tenements.",
      },
      {
        id: "doc-omaha-platform",
        label: "Document 6",
        attribution: "People's Party (Populist) Omaha Platform",
        date: "July 4, 1892",
        excerpt:
          "We meet in the midst of a nation brought to the verge of moral, political, and material ruin… The fruits of the toil of millions are boldly stolen to build up colossal fortunes for a few… We believe that the power of government — in other words, of the people — should be expanded… The land, including all the natural sources of wealth, is the heritage of the people and should not be monopolized for speculative purposes, and alien ownership of land should be prohibited.",
      },
      {
        id: "doc-ida-b-wells",
        label: "Document 7",
        attribution: "Ida B. Wells, Southern Horrors: Lynch Law in All Its Phases",
        date: "1892",
        excerpt:
          "Somebody must show that the Afro-American race is more sinned against than sinning, and it seems to have fallen upon me to do so… The lesson this teaches and which every Afro-American should ponder well, is that a Winchester rifle should have a place of honor in every black home, and it should be used for that protection which the law refuses to give… The strong arm of the law must be brought to bear upon lynchers in severe punishment, but this cannot and will not be done unless a healthy public sentiment demands and sustains such action.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that industrialization drew in and depended on people it then defined as outsiders (the Knights of Labor organizing across race and sex while the American Federation of Labor built on skilled craft membership and supported exclusion; allotment offering citizenship on condition of ceasing to live as a nation) AND that the period's most consequential decisions about belonging were written into ordinary instruments — land patents, membership rules, certificates of residence — rather than into declarations of principle, so that a student tracking only the rhetoric would miss where the question was actually settled.",
  },
];
