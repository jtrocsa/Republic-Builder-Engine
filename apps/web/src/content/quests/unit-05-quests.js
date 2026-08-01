// Unit 5 (Period 5: 1844–1877) quest content, structural mirror of unit-04-quests.js and built
// against the six real CASE_013_SOURCES in apps/web/src/content/unit-05-campaign.js.
//
// ## Why the two missions are the types they are
//
// **case-014 is `sequencing`, and it is deliberately not case-011's shape.** The Bank War chronology
// runs decision → consequence: one man's choices compounding until they arrive somewhere he did not
// intend. The road to disunion runs the other way — settlement → destabilization. Every item in that
// list is somebody *solving* the sectional crisis, and the reason the order matters is that each
// solution is what made the next quarrel unmanageable. A student who can recite 1846, 1850, 1854,
// 1857, 1860 has the dates and not the argument; the explanation is where the argument is.
//
// **case-015 is `evidence-organizing`, and it is the reason the type comes back after Unit 4 skipped
// it.** Reconstruction's central difficulty is that everybody agreed slavery was finished and nobody
// agreed on what replaced it, so "sort these claims by what each one holds freedom to require" is
// not a genre exercise dressed up as history — it is the actual historiographical problem, and the
// three lanes are three real programmes that three real constituencies pursued and lost.
//
// This is also where the four post-war characters generated for this unit live. A soldier of the
// United States Colored Troops, a freedwoman teaching a school, a Freedmen's Bureau agent and a
// delegate to a state constitutional convention cannot stand in Richmond in 1864 without breaking
// the map's own historical-state rule, and a mission renders no field sprites — so what they carry
// here is their argument rather than their art. Each of the six documents below is the kind of claim
// one of those people actually made, which is why the sort has six cards and not four.
//
// ## No investigation quests, same as Unit 4
//
// A source's optional Investigation Challenge gate (source.schema.js's
// investigationMode/investigationQuestId) is left null on all six records. Every one of them is a
// composite reconstructed from a documentary form rather than one surviving item, and a pre-reveal
// "predict this source's point of view" exercise is a weaker fit for an administrative form than for
// a named author's speech. The fields exist and default to null; adding them later costs nothing.

export const UNIT_05_MCQ_QUESTS = [
  {
    id: "case-013-mcq-impressment-causation",
    prompt:
      "The Confederate requisition orders slaveholders to deliver a fixed fraction of their enslaved men for sixty days' work on the fortifications, pays the hire to the owner, and compensates the owner if a man dies. Enslavers across the Confederacy protested it bitterly. What does that protest most directly reveal?",
    choices: [
      "A government founded on states' rights and on property in human beings had built a central state powerful enough to seize that property, and its own supporters experienced that as tyranny",
      "Most enslavers had already freed the people they held and had no one left to deliver",
      "The Confederate government lacked any legal authority to requisition labor and the protests were purely procedural",
      "Enslavers objected because the government refused to pay them anything for the labor it took",
    ],
    answer: 0,
    explanation:
      "Impressment is the sharpest illustration of the Confederacy's internal contradiction. Secession was justified in the language of limited central power and secure property rights; prosecuting the war required conscription, taxation in kind, and the seizure of the single asset the Confederacy's leadership most wanted protected. The government did pay owners, and did compensate them for deaths, which is exactly why the protests are revealing rather than merely self-interested — enslavers were being paid and still understood the requisition as an assault on the property right the war was fought to defend.",
    skillCategory: "Causation",
  },
  {
    id: "case-013-mcq-tredegar-comparison",
    prompt:
      "The Tredegar pay roll lists three classes of hands at the same furnaces: mechanics paid to themselves, enslaved men hired by the year whose hire goes to their owners, and impressed men paid nothing. What is the most defensible conclusion to draw from the document's own structure?",
    choices: [
      "Confederate war production depended on coerced Black labor, and the enterprise's own accounting treated free, hired and impressed workers as one workforce",
      "Southern industry had abandoned slavery by 1864 in favor of a fully waged workforce",
      "Enslaved and impressed workers were confined to unskilled tasks separate from the skilled trades",
      "The three classes were paid at the same rate, which shows wartime wage equalization",
    ],
    answer: 0,
    explanation:
      "The pay roll is a management document, not an argument, which is what makes it usable: the clerk grouped the three classes on one sheet because for the purpose of getting artillery made they were one workforce. Tredegar had used enslaved ironworkers in skilled positions since the 1840s — partly to weaken its white mechanics' bargaining power — and by the later war years roughly half its hands were Black. The wage columns are where the three classes stop being alike: one man is paid, one man's owner is paid, and one man is not paid at all.",
    skillCategory: "Comparison",
  },
  {
    id: "case-013-mcq-price-board-context",
    prompt:
      "The market board shows flour chalked at $40, then $125, then $250 a barrel, with the older figures left standing. A Chronicler wants to know what that line is evidence of. What must be established before the figures can be interpreted?",
    choices: [
      "How much the Confederate dollar had depreciated over the same period, since a price is a ratio and the currency side of it can move independently of the supply side",
      "Whether the grocer was licensed to sell flour in the city market",
      "Whether flour was measured by the same barrel weight in 1861 and 1864",
      "How many barrels of flour the city consumed in an average week before the war",
    ],
    answer: 0,
    explanation:
      "This is the contextualization move the record is built to teach. Prices in the wartime South rose partly because goods were genuinely scarce — the rail net was being destroyed, farms had lost their labor, the blockade held — and overwhelmingly because Confederate currency was collapsing under unbacked issue. Reading the flour line as pure scarcity would badly overstate how little flour there was, and would miss the more important fact: the money itself was failing, which is why employers began paying part of a wage in meal.",
    skillCategory: "Contextualization",
  },
  {
    id: "case-013-mcq-pass-sourcing",
    prompt:
      "The pass issued at the Richmond Dock names its bearer only as 'PETER, a slave the property of ———,' lists the streets he may walk and the hour he must be off them, and charges the cost of his arrest to his owner. A historian using only documents of this kind to write about impressed laborers would face which limitation?",
    choices: [
      "The record system names people by a first name and an owner, so it preserves what was done to a person while systematically destroying how that person identified himself",
      "Passes were rarely issued in Richmond, so surviving examples are unrepresentative",
      "The document is a forgery unless it carries the signature of the enslaver rather than the provost marshal",
      "Passes recorded only movement and never the terms of a person's service",
    ],
    answer: 0,
    explanation:
      "This is a sourcing problem about an entire archive rather than one page. Administrative records of slavery are abundant and precise about quantity, value, movement and control, and they are structurally silent about identity, kinship and intention, because the systems that produced them had no use for those things. Historians read them against testimony, pension files, church and Freedmen's Bureau records, and later interviews to recover what the forms omit — which is also why the man standing on that dock introducing himself with two names is doing something the paper in his hat cannot do.",
    skillCategory: "Sourcing",
  },
];

export const UNIT_05_SEQUENCING_QUESTS = [
  {
    id: "case-013-sequencing-capital-under-pressure",
    prompt:
      "Arrange these wartime developments in the order in which each one made the next possible — not simply the order the dates fall in.",
    // **Authored out of order on purpose.** renderSequencingQuest() lays the items out in this
    // array's order and does not shuffle, so a list written 0,1,2,3,4,5 renders already solved and
    // the student is graded correct for touching nothing. Unit 1's three sequencing quests are
    // authored scrambled for exactly this reason; the convention was undocumented and Units 2-4
    // lost it. Keep any new item's `position` correct and its place in this array wrong.
    items: [
      {
        id: "government-impresses-enslaved-labor",
        label:
          "To keep the fortifications, the hospitals and the ordnance works running, the government requisitions enslaved men from their enslavers — paying the hire to the owner, over the owner's objection",
        position: 3,
      },
      {
        id: "capital-moves-to-richmond",
        label:
          "Virginia secedes after Fort Sumter, and the Confederate government moves its capital to Richmond — a manufacturing city on a river, within a hundred miles of Washington",
        position: 0,
      },
      {
        id: "black-labor-runs-the-city",
        label:
          "By 1864 the ironworks, the hospitals and the government wharves are worked largely by hired and impressed Black laborers, whose passes route them daily past everything arriving in the city and everything leaving it",
        position: 5,
      },
      {
        id: "city-fills-up",
        label:
          "Government departments, hospitals, war workers and refugees pour in; the city's population roughly triples while its food has to come over a rail network the fighting is steadily breaking",
        position: 1,
      },
      {
        id: "prices-outrun-wages",
        label:
          "Scarcity and a collapsing currency push food beyond what a soldier's family can pay; women take bread from the shops in April 1863, and the city answers with relief committees and a free market day",
        position: 4,
      },
      {
        id: "conscription-drains-white-labor",
        label:
          "Conscription takes white men out of the workshops and the ironworks, while exemption and substitution let wealthier men stay out of the ranks",
        position: 2,
      },
    ],
    explanation:
      "The chain runs from a decision about geography to a fact about knowledge. Putting the capital at Richmond made the city both the Confederacy's administrative center and its arsenal, which is what drew the population that overwhelmed its supply. Conscription then removed the workforce that arsenal needed, and the only large labor pool the government could reach was one it did not own — hence impressment, and hence a fight with its own supporters. Currency collapse and shortage did the rest to the civilians. The last step is the one students most often miss: the same system that controlled Black movement by pass also routed Black workers through every wharf, depot and works in the city, and the intelligence that reached Union lines from Richmond traveled with people the Confederacy had decided were furniture.",
    skillCategory: "Causation",
  },
];

export const UNIT_05_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-013-evidence-record-sourcing",
    prompt:
      "Match each Richmond record to the historical-thinking skill it best demonstrates, then explain what the requisition and the pass reveal when they are read against each other. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "richmond-impressment-order",
        label: "Requisition for Slave Labour, Engineer Bureau",
        attribution: "Engineer Bureau, War Department, Confederate States, March 1864",
        excerpt:
          "You are required to deliver… the number of male slaves between the ages of eighteen and fifty set opposite your name, being not more than one fifth of those liable in this district. Term of service, sixty days… The Government will… pay to the owner the sum per month hereon endorsed for each hand delivered.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "richmond-tredegar-payroll",
        label: "Pay Roll, Tredegar Iron Works",
        attribution: "The works' pay clerk, August 1864",
        excerpt:
          "CLASS FIRST, mechanics and skilled hands, paid to themselves… CLASS SECOND, slaves hired by the year, the hire payable to the owner and not to the hand… CLASS THIRD, hands delivered under the Engineer Bureau's requisition… no wages payable at these works.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "richmond-price-board",
        label: "The Second Market Price Board",
        attribution: "Four hands, posted and chalked in the same week, August 1864",
        excerpt:
          "FLOUR, the barrel — 40 — 125 — 250… FREE MARKET. The ladies' committee will distribute on Wednesday morning to the families of soldiers in the service… ABSENT WITHOUT LEAVE. The following men of this city have failed to report to their commands.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "richmond-trader-day-book",
        label: "Day Book, Franklin Street Commission House",
        attribution: "The house's book-keeper, 1864",
        excerpt:
          "SALES: none. Two offered and withdrawn, no bid reaching the reserve. — HIRES, one year from January next… to the Nitre and Mining Bureau, four men… to Chimborazo Hospital, three women… to the Tredegar company, six men.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "richmond-ward-register",
        label: "Ward Register, Chimborazo Hospital",
        attribution: "The ward's matron, August 1864",
        excerpt:
          "Admitted this month, sixty-one… Of the whole number admitted, forty-two were entered as disease and nineteen as wound or injury. — MATRON'S MEMORANDUM: the ward is attended by four hired servants whose names are not entered in this book, they not being patients.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "richmond-labor-pass",
        label: "Pass and Certificate of Impressment, Richmond Dock",
        attribution: "Provost marshal's office, 1864",
        excerpt:
          "The bearer, PETER, a slave the property of ——— of the county of Sussex… has leave to pass between the Dock, the depot and the works… between sunrise and the ringing of the bell at nine in the evening. Endorsed: the term of sixty days extended by order until further notice.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
    ],
    reflectionPrompt:
      "The requisition and the pass describe the same arrangement from two ends of it — one orders men delivered, the other governs a delivered man's day. Explain what each one records that the other cannot, and name one thing that happened to the man in the pass that neither document would ever contain.",
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
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what each of the two documents records and names something outside both of them.",
    },
  },
];

export const UNIT_05_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-013-hipp-impressment-requisition",
    prompt:
      "Analyze the Engineer Bureau's requisition using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the document's argument — not the option that merely names the correct answer.",
    document: {
      text: "By authority of the Act of Congress approved the seventeenth of February last, and of the requisition of the Governor thereunder, you are required to deliver… the number of male slaves between the ages of eighteen and fifty set opposite your name, being not more than one fifth of those liable in this district… The Government will furnish rations and medical attendance, and will pay to the owner the sum per month hereon endorsed for each hand delivered… Should any hand die, or be lost to the owner while in the service of the Government, compensation will be made upon the value sworn to at the time of delivery, and not otherwise.",
      attribution:
        "Printed requisition for impressed slave labor, Engineer Bureau, Confederate War Department, Richmond, March 1864 — a composite reconstructed from the forms served under the Confederate impressment acts",
    },
    hippPrompts: [
      {
        id: "requisition-audience",
        dimension: "Intended audience",
        argument:
          "Every promise on the page is made to the owner — rations and medical attendance for the hand, monthly pay to the owner, compensation to the owner on a sworn valuation if the man dies — which tells a reader whom the document was written to reassure and whom it was written to move.",
        options: [
          {
            id: "requisition-audience-explained",
            text: "Addressing the whole document to slaveholders, and promising them payment, care of their property and compensation for its loss, shows the government negotiating with the constituency whose support the war depended on — which is why the same page can order a seizure and read like a contract, and why enslavers still experienced it as an attack on the property right secession was meant to secure.",
            correct: true,
          },
          {
            id: "requisition-audience-named-only",
            text: "The requisition is addressed to slaveholders in the district.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "requisition-audience-wrong-laborers",
            text: "The requisition is addressed to the enslaved men themselves, setting out the terms of employment they are being offered.",
            correct: false,
          },
          {
            id: "requisition-audience-wrong-congress",
            text: "The requisition is addressed to the Confederate Congress, requesting authority the Engineer Bureau did not yet possess.",
            correct: false,
          },
        ],
      },
      {
        id: "requisition-point-of-view",
        dimension: "Point of view",
        argument:
          "The form counts, ages, values, transports and compensates for the loss of the people it moves, and never once names one of them.",
        options: [
          {
            id: "requisition-pov-explained",
            text: "A document that records a man's age bracket and his sworn cash value but not his name is written from the position that he is an asset being temporarily transferred, which is both the Confederate state's actual legal view and the reason the surviving administrative record of slavery is so precise about quantity and so empty of persons — a gap a historian has to fill from testimony, not from forms like this one.",
            correct: true,
          },
          {
            id: "requisition-pov-named-only",
            text: "The document is written from the point of view of the Confederate government.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "requisition-pov-wrong-neutral",
            text: "The form is a neutral administrative record with no point of view, since it makes no argument and only states procedures.",
            correct: false,
          },
          {
            id: "requisition-pov-wrong-abolition",
            text: "The form reflects a growing Confederate view that enslaved laborers should be emancipated in exchange for government service.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 1.14's mission — the sectional crisis as a chain of settlements that each destabilized the
// next. See this file's header for why this is not a repeat of case-011's shape.
export const UNIT_05_ARCHIVE_SEQUENCING_QUESTS = [
  {
    id: "case-014-mission-road-to-disunion-chronology",
    prompt:
      "Arrange the road to disunion in the order in which each settlement produced the next quarrel. The dates are given; the reasoning the question wants is why each attempt to settle the question made the next dispute harder to settle.",
    // Authored out of order, for the reason recorded on the practice-check sequencing above: the
    // renderer does not shuffle, so an array written in position order ships already solved.
    items: [
      {
        id: "northern-resistance-1851-1854",
        label:
          "Northern states answer with personal liberty laws and public rescues, and Uncle Tom's Cabin sells hundreds of thousands of copies — slavery stops being a distant Southern institution for Northern voters and becomes something their own courts are being made to enforce (1851–1854)",
        position: 2,
      },
      {
        id: "election-and-secession-1860",
        label:
          "Lincoln wins the presidency with no Southern electoral votes on a platform of no slavery in the territories; South Carolina secedes within six weeks, and its declaration names Northern refusal to enforce the fugitive slave law as an immediate cause (1860–1861)",
        position: 5,
      },
      {
        id: "wilmot-proviso-1846",
        label:
          "David Wilmot moves that slavery be barred from any territory acquired from Mexico; the House passes it repeatedly and the Senate never does, and the question of slavery in the territories becomes the permanent business of Congress (1846)",
        position: 0,
      },
      {
        id: "kansas-nebraska-1854",
        label:
          "Stephen Douglas's Kansas-Nebraska Act repeals the Missouri Compromise line in favor of popular sovereignty; Kansas is settled by partisans, its elections are stolen and its territory fought over, the Whig Party collapses, and the Republican Party forms as an avowedly sectional party (1854)",
        position: 3,
      },
      {
        id: "compromise-1850",
        label:
          "The Compromise of 1850 admits California free, leaves Utah and New Mexico to popular sovereignty, and pays for the settlement with a Fugitive Slave Act that puts federal commissioners, denial of jury trial, and a duty to assist into Northern states (1850)",
        position: 1,
      },
      {
        id: "dred-scott-1857",
        label:
          "In Dred Scott v. Sandford the Supreme Court holds that Black Americans cannot be citizens and that Congress cannot bar slavery from a territory — which makes the Republican Party's central plank unconstitutional and popular sovereignty incoherent at the same stroke (1857)",
        position: 4,
      },
    ],
    explanation:
      "Read as a chain, the decade's logic is that every settlement had to be paid for, and each payment created the grievance that broke the next one. The Proviso failed and made the territorial question unavoidable; 1850 bought the Union five years and spent Northern consent by conscripting Northern citizens into slave-catching; that enforcement is what made Northern opposition popular rather than marginal, which is the audience Kansas-Nebraska then radicalized by reopening ground everyone had believed closed since 1820. Kansas destroyed the last national party and produced a sectional one; Dred Scott tried to settle the question by judicial fiat and instead removed the middle ground, since a ruling that Congress could not exclude slavery left Republicans no constitutional programme and Douglas no coherent one. By 1860 there was no arrangement left that both sections would accept, which is what makes the secession winter the end of an argument rather than the start of one. Historians still argue about contingency — whether Douglas, or the Court, or the Democratic split of 1860 could have gone otherwise — but the sequence is what any version of that argument has to work with.",
    skillCategory: "Causation",
  },
];

// Case 1.15's mission — Reconstruction as three competing programmes rather than one policy. See
// this file's header for why the type is evidence-organizing and where the unit's four post-war
// characters live.
export const UNIT_05_ARCHIVE_EVIDENCE_QUESTS = [
  {
    id: "case-015-mission-meanings-of-freedom",
    prompt:
      "Everyone here agrees that slavery is finished. Sort each claim by what its author holds freedom to actually require. More than one document belongs under some headings.",
    slots: [
      { id: "land-and-labor", label: "Land, and labor on your own terms" },
      { id: "the-vote-and-office", label: "The ballot, and a seat in the government" },
      { id: "federal-protection", label: "A federal guarantee that the law will protect you" },
    ],
    sources: [
      {
        id: "frazier-savannah-colloquy",
        label: "Answer of the Savannah ministers to Secretary Stanton and General Sherman",
        attribution:
          "Garrison Frazier, speaking for twenty Black ministers, Savannah, January 12, 1865",
        excerpt:
          "The way we can best take care of ourselves is to have land, and turn it and till it by our own labor… and we can soon maintain ourselves and have something to spare… We want to be placed on land until we are able to buy it and make it our own.",
        skillCategory: "Sourcing",
        correctSlotId: "land-and-labor",
      },
      {
        id: "sharecropping-contract-1867",
        label: "Sharecropping contract between a planter and freedpeople",
        attribution:
          "A Southern cotton district, 1867 — composite reconstructed from the standard form of postwar labor contracts",
        excerpt:
          "The said freedmen agree to work faithfully and diligently, to be under the direction of the said proprietor in all farm work, to furnish their own provisions until the crop is gathered, and to receive one third part of the crop when divided; and any hand leaving before the end of the year forfeits his whole share.",
        skillCategory: "Continuity and Change",
        correctSlotId: "land-and-labor",
      },
      {
        id: "colored-convention-suffrage-address",
        label: "Address of a state convention of freedpeople to the people of the state",
        attribution:
          "A Southern state capital, November 1865 — composite reconstructed from the addresses of the freedpeople's conventions of 1865–1866",
        excerpt:
          "We ask only that the same laws which govern other men shall govern us; and we say plainly that so long as we may not vote, the men who make those laws will be chosen without us, and the laws they make will be what we have already seen this year.",
        skillCategory: "Causation",
        correctSlotId: "the-vote-and-office",
      },
      {
        id: "constitutional-convention-schools",
        label: "A delegate's speech at a state constitutional convention",
        attribution:
          "A Reconstruction constitutional convention with a Black majority of delegates, 1868 — composite reconstructed from the published proceedings",
        excerpt:
          "We are told we are not fit to sit in this hall. I answer that we are here, elected as other men are elected, and that the first article we shall write into this constitution is a free public school open to every child in this state, white and colored alike — for the men who kept us from reading knew exactly what they were doing.",
        skillCategory: "Comparison",
        correctSlotId: "the-vote-and-office",
      },
      {
        id: "fourteenth-amendment-section-one",
        label: "Fourteenth Amendment, Section 1",
        attribution: "Proposed by Congress June 1866; ratified July 1868",
        excerpt:
          "All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.",
        skillCategory: "Contextualization",
        correctSlotId: "federal-protection",
      },
      {
        id: "freedmens-bureau-complaint",
        label: "Complaint laid before a Freedmen's Bureau agent, with the agent's endorsement",
        attribution:
          "A Bureau sub-district office, 1867 — composite reconstructed from the Bureau's complaint and labor-contract records",
        excerpt:
          "Complainant states that he worked the crop the whole year under contract and at the division was put off the place with nothing, and that the civil magistrate would not hear him. — Endorsed: contract on file at this office; the planter summoned; settlement ordered. The complainant is advised that this office cannot compel obedience once the troops are withdrawn from this county.",
        skillCategory: "Sourcing",
        correctSlotId: "federal-protection",
      },
    ],
    reflectionPrompt:
      "All three of these programmes were attempted, and by 1877 none of them held. Choose the one you think came closest to succeeding, and explain what defeated it — naming at least one specific development between 1868 and 1877.",
    rubric: {
      skillCategories: [
        "Sourcing",
        "Continuity and Change",
        "Causation",
        "Comparison",
        "Contextualization",
      ],
      pointsTotal: 7,
      description:
        "Earn 1 point per claim correctly sorted by what its author holds freedom to require, and 1 point for a reflection that identifies a specific development between 1868 and 1877 which defeated the programme chosen.",
    },
  },
];

export const UNIT_05_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-05-archive-confederate-labor-saq",
    stimulus:
      "“By authority of the Act of Congress approved the seventeenth of February last… you are required to deliver at the place named below… the number of male slaves between the ages of eighteen and fifty set opposite your name, being not more than one fifth of those liable in this district. Term of service, sixty days from the day of delivery… The Government will furnish rations and medical attendance, and will pay to the owner the sum per month hereon endorsed for each hand delivered… Should any hand die, or be lost to the owner while in the service of the Government, compensation will be made upon the value sworn to at the time of delivery, and not otherwise.” — Printed requisition for impressed slave labor, Confederate Engineer Bureau, Richmond, 1864 (composite reconstructed from the forms served under the Confederate impressment acts)",
    prompts: [
      "A. Identify one way this document shows how the demands of war affected slavery within the Confederacy.",
      "B. Explain one way that policies like the one described in the document created political conflict inside the Confederacy.",
      "C. Explain one way that the actions of enslaved people themselves contributed to the destruction of slavery during the Civil War.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_05_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-05-archive-meaning-of-freedom-dbq",
    prompt:
      "Evaluate the extent to which the Civil War and Reconstruction changed the meaning of freedom and citizenship in the United States in the period from 1860 to 1877.",
    documents: [
      {
        id: "doc-sc-secession-declaration",
        label: "Document 1",
        attribution:
          "Declaration of the Immediate Causes Which Induce and Justify the Secession of South Carolina from the Federal Union",
        date: "December 24, 1860",
        excerpt:
          "We assert that fourteen of the States have deliberately refused for years past to fulfill their constitutional obligations… They have denounced as sinful the institution of slavery… They have encouraged and assisted thousands of our slaves to leave their homes; and those who remain have been incited by emissaries, books, and pictures, to servile insurrection.",
      },
      {
        id: "doc-impressment-requisition",
        label: "Document 2",
        attribution:
          "Printed requisition for impressed slave labor, Confederate Engineer Bureau, Richmond (composite reconstructed from the forms served under the Confederate impressment acts)",
        date: "1864",
        excerpt:
          "You are required to deliver… the number of male slaves between the ages of eighteen and fifty set opposite your name… The Government will furnish rations and medical attendance, and will pay to the owner the sum per month hereon endorsed for each hand delivered… Should any hand die… compensation will be made upon the value sworn to at the time of delivery.",
      },
      {
        id: "doc-emancipation-proclamation",
        label: "Document 3",
        attribution: "Abraham Lincoln, Emancipation Proclamation",
        date: "January 1, 1863",
        excerpt:
          "All persons held as slaves within any State or designated part of a State, the people whereof shall then be in rebellion against the United States, shall be then, thenceforward, and forever free… And I further declare and make known that such persons of suitable condition will be received into the armed service of the United States to garrison forts, positions, stations, and other places, and to man vessels of all sorts in said service.",
      },
      {
        id: "doc-frazier-savannah",
        label: "Document 4",
        attribution:
          "Garrison Frazier, speaking for twenty Black ministers to Secretary of War Stanton and General Sherman, Savannah",
        date: "January 12, 1865",
        excerpt:
          "The way we can best take care of ourselves is to have land, and turn it and till it by our own labor… and we can soon maintain ourselves and have something to spare… We want to be placed on land until we are able to buy it and make it our own.",
      },
      {
        id: "doc-mississippi-black-code",
        label: "Document 5",
        attribution: "Mississippi Black Code, enacted under Presidential Reconstruction",
        date: "November 1865",
        excerpt:
          "All freedmen, free negroes and mulattoes in this State, over the age of eighteen years, found on the second Monday in January, 1866, or thereafter, with no lawful employment or business… shall be deemed vagrants, and on conviction thereof shall be fined… Every civil officer shall, and every person may, arrest and carry back to his or her legal employer any freedman, free negro, or mulatto who shall have quit the service of his or her employer before the expiration of his or her term of service without good cause.",
      },
      {
        id: "doc-fourteenth-amendment",
        label: "Document 6",
        attribution: "Fourteenth Amendment to the United States Constitution, Section 1",
        date: "Ratified July 1868",
        excerpt:
          "All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.",
      },
      {
        id: "doc-sharecropping-contract",
        label: "Document 7",
        attribution:
          "Sharecropping contract between a planter and freedpeople, a Southern cotton district (composite reconstructed from the standard form of postwar labor contracts)",
        date: "1867",
        excerpt:
          "The said freedmen agree to work faithfully and diligently, to be under the direction of the said proprietor in all farm work, to furnish their own provisions until the crop is gathered, and to receive one third part of the crop when divided; and any hand leaving before the end of the year forfeits his whole share.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that emancipation and the Reconstruction amendments made a genuine and permanent change in the legal meaning of citizenship AND that the economic and political settlement of the 1870s left most freedpeople without land, without protection, and soon without the vote, so that the change in law and the change in life ran on different timetables.",
  },
];
