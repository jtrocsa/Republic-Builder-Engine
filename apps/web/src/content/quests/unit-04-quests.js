// Unit 4 (Period 4: 1800–1848) quest content, structural mirror of unit-03-quests.js and built
// against the five real CASE_010_SOURCES in apps/web/src/content/unit-04-campaign.js.
//
// Two things here are deliberate departures from the three units before it.
//
// **Neither mission is an evidence-organizing sort.** Six of the nine cases across Units 1–3 used
// that type, and the decision log already records that every non-map mission was starting to feel
// like the same mission from a different door. case-011 is `sequencing` because the Bank War's
// difficulty is genuinely causal ordering — each step made the next possible, and the Panic of 1837
// is the end of a chain rather than a separate disaster. case-012 is `hipp`, which no mission in the
// game had used before: the Removal Message is a document whose *argument* is the thing to analyze,
// and HIPP is the tool the exam actually asks students to bring to it.
//
// **No investigation quests.** A source's optional Investigation Challenge gate (see
// source.schema.js's investigationMode/investigationQuestId) is left null on all five records.
// Every one of them is a composite document reconstructed from a documentary form rather than one
// surviving item, and a pre-reveal "predict this source's point of view" exercise is a weaker fit
// for that than for a named author's speech. Adding them later costs nothing: the fields exist and
// default to null.

export const UNIT_04_MCQ_QUESTS = [
  {
    id: "case-010-mcq-toll-receipt-causation",
    prompt:
      "Before the Erie Canal, moving a ton of wheat from Buffalo to New York City cost roughly $100 and took about three weeks; by the 1840s it cost under $10 and took about eight days. Which consequence follows most directly from that change?",
    choices: [
      "Farmers in western New York and the Old Northwest could profitably grow crops for distant markets rather than mainly for household use, which also made them dependent on prices set far away",
      "Farm families became more self-sufficient, since cheaper transport meant they no longer needed to sell anything",
      "New York City declined as a port because goods could now reach the interior directly",
      "Wheat prices in New York City rose sharply because transport had become more expensive",
    ],
    answer: 0,
    explanation:
      "Cheap freight is what turns subsistence-plus-surplus farming into commercial farming: it makes a distant market reachable, so growing for that market becomes rational. The same change makes a farm household's income depend on a price it does not set and cannot see, which is why the market revolution produced both new prosperity and a new kind of vulnerability.",
    skillCategory: "Causation",
  },
  {
    id: "case-010-mcq-time-book-continuity",
    prompt:
      "The workshop time book fixes the working day by bells — first bell at 4.30, gate closed at the second bell, evening bell at 7.00 — and binds operatives to a one-year engagement. Compared with the older pattern of rural household and craft work, this represents which change?",
    choices: [
      "Work was increasingly measured as time bought from a worker rather than as tasks completed, with the employer controlling the clock",
      "Workers gained control over the pace of their own labor for the first time",
      "The length of the working day fell sharply compared with farm labor",
      "Wages were no longer paid in money, only in goods",
    ],
    answer: 0,
    explanation:
      "Household and craft work was task-oriented — the day ended when the field was ploughed or the barrel raised. Bell-governed factory work substitutes time for task, and the employer owns the clock. The working day did not necessarily get longer than a farm day; what changed is who decided when it began and ended, and that a worker could now be locked out for lateness.",
    skillCategory: "Continuity and Change",
  },
  {
    id: "case-010-mcq-notice-board-sourcing",
    prompt:
      "The Reform Square board carries an antislavery meeting notice and, beside it, a warning that calls the meeting the work of 'fanatics and incendiaries' and asks 'gentlemen of property and standing' to stop it. What does the wording of that second notice most strongly suggest about Northern opposition to abolition?",
    choices: [
      "It was often organized by respectable, propertied men with commercial interests, not only by disorderly crowds",
      "It came almost entirely from enslavers who had traveled north for the purpose",
      "It was rare in the North and confined to the slaveholding states",
      "It was directed at the tavern-keepers who opposed the temperance movement",
    ],
    answer: 0,
    explanation:
      "The notice addresses itself to gentlemen of property and standing, which is who it expects to answer. That matches what historians find: Northern anti-abolition mobs — the Utica convention of October 1835 among them — were frequently led by bankers, merchants, lawyers and judges whose businesses depended on Southern trade. Reading opposition to abolition as merely a mob phenomenon misses that it had respectable organization behind it.",
    skillCategory: "Sourcing",
  },
  {
    id: "case-010-mcq-job-book-comparison",
    prompt:
      "The printing office's order book shows the same press producing a temperance pledge and the tavern-keeper's answer to it, and an antislavery meeting notice and the handbill opposing it, all in one week for cash. What does this best illustrate about print in the 1840s?",
    choices: [
      "Cheap print was commercial infrastructure available to every side of a controversy, which is part of why organized reform and organized opposition both grew",
      "Printers in this period worked only for the political party that owned their newspaper",
      "Reform movements controlled access to printing and could keep opponents from publishing",
      "Handbills were too expensive for most local organizations to use",
    ],
    answer: 0,
    explanation:
      "The country printing office made its living from job work taken from whoever paid, not from its newspaper's politics. That makes cheap print a neutral technology in a way that matters historically: it lowered the cost of organizing for temperance, abolition and women's rights, and by exactly the same amount for the people who opposed them.",
    skillCategory: "Comparison",
  },
];

export const UNIT_04_SEQUENCING_QUESTS = [
  {
    id: "case-010-sequencing-canal-to-reform",
    prompt:
      "Arrange these developments in the order in which each one made the next possible — not simply the order the dates fall in.",
    items: [
      {
        id: "farms-grow-for-market",
        label:
          "Farm households along the line shift from growing mainly for their own use to growing wheat for a distant market, and begin buying goods they once made",
        position: 1,
      },
      {
        id: "immigration-and-crowding",
        label:
          "Irish and German immigrants arrive in numbers to dig the enlargement and take the new wage work, and crowd into boardinghouses in the quarters nearest the water",
        position: 3,
      },
      {
        id: "towns-and-workshops",
        label:
          "Towns, workshops and mills grow up at the canal's locks and basins, drawing wage workers who are paid by the day or by the piece",
        position: 2,
      },
      {
        id: "canal-cuts-freight",
        label:
          "The canal opens and freight costs between the western interior and New York City fall by more than ninety percent",
        position: 0,
      },
      {
        id: "reform-and-its-opponents",
        label:
          "Revival preaching and organized reform movements — temperance, abolition, common schools — take hold in the same towns, and meet organized opposition from residents who see their trade or their peace threatened",
        position: 4,
      },
    ],
    explanation:
      "The chain runs from a transport cost to a social conflict. Cheap freight makes commercial farming rational; commercial farming needs milling, cooperage, storage and shipping, which makes towns; towns need labour, which draws immigration; and the crowded, cash-paid, rapidly-changing communities that result are exactly where the Second Great Awakening's revivals and the reform societies that followed them found their audience — along with the neighbours who wanted no part of either. This is why Period 4's economic and reform stories cannot be taught as separate units.",
    skillCategory: "Causation",
  },
];

export const UNIT_04_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-010-evidence-record-sourcing",
    prompt:
      "Match each Canal Crossroads record to the historical-thinking skill it best demonstrates, then explain what the toll receipt and the boardinghouse register reveal when read against each other.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "sourcing-situation", label: "Sourcing" },
      { id: "comparison", label: "Comparison" },
      { id: "contextualization", label: "Contextualization" },
    ],
    sources: [
      {
        id: "canal-toll-receipt",
        label: "Clearance and Toll Receipt, Boat Mary Ann",
        attribution: "Collector's office, Erie Canal, May 1845",
        excerpt:
          "Laden at Buffalo with wheat, flour, and staves. Weight of cargo, sixty-three tons. Bound east for Albany, thence New York by river. Toll assessed on wheat at the rate per ton per mile now in force, distance three hundred and sixty-three miles.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "canal-time-book",
        label: "Time Book and Rules, Canal Street Workshop",
        attribution: "Workshop agent's office, 1845",
        excerpt:
          "First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room. The gate will be closed at the ringing of the second bell.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "canal-reform-notices",
        label: "The Reform Square Notice Board",
        attribution: "Four separate hands, posted the same week, 1845",
        excerpt:
          "CITIZENS, TAKE NOTICE. — The above meeting is the work of fanatics and incendiaries… Gentlemen of property and standing are requested to attend and put a stop to it.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "canal-job-book",
        label: "Job-Work Order Book, Market Street Printing Office",
        attribution: "The office's journeyman printer, 1845",
        excerpt:
          "Meeting House committee, pledge cards for total abstinence, three hundred… Keeper, towpath house, handbill in answer to the above, one hundred, cash in hand.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "canal-house-register",
        label: "Register and Reckoning, Canal-Side Boardinghouse",
        attribution: "The house's keeper, November 1845",
        excerpt:
          "Beds in the house, six. Names entered this night, fourteen… when the boats stop there is no money in this town until April, and the house must carry them.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
    ],
    reflectionPrompt:
      "The toll receipt and the boardinghouse register describe the same canal in the same year. Explain what each one measures that the other cannot, and what a Chronicler would get wrong about this town by reading only one of them.",
    rubric: {
      skillCategories: [
        "Causation",
        "Continuity and Change",
        "Sourcing",
        "Comparison",
        "Contextualization",
      ],
      pointsTotal: 6,
      description:
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that names something each of the two records measures which the other cannot.",
    },
  },
];

export const UNIT_04_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-010-hipp-notice-board",
    prompt:
      "Analyze the anti-abolition warning from the Reform Square board using HIPP reasoning. For each dimension below, choose the option that explains how or why it shapes the notice's argument — not the option that merely names the correct answer.",
    document: {
      text: "CITIZENS, TAKE NOTICE. — The above meeting is the work of fanatics and incendiaries whose designs will dissolve the Union and ruin the trade of this town. Gentlemen of property and standing are requested to attend and put a stop to it.",
      attribution:
        "Handbill posted in answer to an antislavery meeting notice, an Erie Canal town, 1845 — a composite reconstructed from the anti-abolition postings of the period",
    },
    hippPrompts: [
      {
        id: "notice-audience",
        dimension: "Intended audience",
        argument:
          "The notice does not address the general public or the abolitionists; it addresses 'gentlemen of property and standing,' which tells a reader who its author expected to act and what kind of authority he expected them to carry.",
        options: [
          {
            id: "audience-explained",
            text: "By calling specifically on propertied men rather than on a crowd, the author signals that he expects respectable townsmen — merchants, lawyers, men with businesses and reputations — to break up the meeting, which suggests Northern anti-abolition action drew on established local authority rather than only on disorderly mobs.",
            correct: true,
          },
          {
            id: "audience-named-only",
            text: "The notice is addressed to gentlemen of property and standing.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "audience-wrong-abolitionists",
            text: "The notice is written to persuade the abolitionists themselves to reconsider their position on immediate emancipation.",
            correct: false,
          },
          {
            id: "audience-wrong-south",
            text: "The notice is addressed to enslavers in the Southern states, asking them to send representatives north.",
            correct: false,
          },
        ],
      },
      {
        id: "notice-purpose",
        dimension: "Purpose",
        argument:
          "The notice pairs a constitutional alarm — that abolition will 'dissolve the Union' — with a local commercial one — that it will 'ruin the trade of this town,' which is a different and more immediate argument aimed at people whose livelihoods ran through Southern markets.",
        options: [
          {
            id: "purpose-explained",
            text: "Yoking disunion to lost trade lets the author recruit men who have no particular view on slavery but do have goods moving south, turning a moral controversy into a threat to their business — which is why commercial ties to the South are part of explaining Northern opposition to abolition.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "The notice's purpose is to stop the antislavery meeting from taking place.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-neutral",
            text: "The notice's purpose is to inform readers impartially that two meetings have been scheduled on the same evening.",
            correct: false,
          },
          {
            id: "purpose-wrong-gradual",
            text: "The notice argues for gradual rather than immediate emancipation as a compromise position.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 1.11's mission — the Bank War as a causal chain. See this file's header for why this is a
// sequencing quest and not a fifth evidence-organizing sort.
export const UNIT_04_ARCHIVE_SEQUENCING_QUESTS = [
  {
    id: "case-011-mission-bank-war-chronology",
    prompt:
      "Arrange the Bank War in the order in which each step made the next one possible. The dates are given; the reasoning the question wants is why one step follows from the one before it.",
    items: [
      {
        id: "deposits-removed-1833",
        label:
          "Re-elected, Jackson orders federal deposits withdrawn from the Bank and placed in state 'pet' banks, and removes two Treasury secretaries who refuse (1833)",
        position: 3,
      },
      {
        id: "charter-expires-1836",
        label:
          "The charter expires with no national bank to replace it, while the Specie Circular requires payment for public land in hard money (1836)",
        position: 4,
      },
      {
        id: "veto-1832",
        label:
          "Bank president Nicholas Biddle seeks an early recharter, and Jackson vetoes the bill, arguing that the Bank serves 'the rich and powerful' and that the president may judge a law's constitutionality for himself (1832)",
        position: 2,
      },
      {
        id: "bank-chartered-1816",
        label:
          "Congress charters the Second Bank of the United States for twenty years (1816), giving one federally chartered institution unusual influence over credit and the currency",
        position: 0,
      },
      {
        id: "jackson-elected-1828",
        label:
          "Andrew Jackson is elected on a wave of expanded white male suffrage and a claim to speak for the people against entrenched privilege (1828)",
        position: 1,
      },
      {
        id: "panic-1837",
        label:
          "Credit contracts sharply, banks suspend specie payments, and the Panic of 1837 opens a depression that lasts into the 1840s (1837)",
        position: 5,
      },
    ],
    explanation:
      "Each step is the condition of the next. The 1816 charter creates the target; the 1828 election gives a president who has built a coalition against exactly that kind of concentrated privilege; Biddle's early-recharter gamble hands Jackson the veto as a campaign issue rather than a defeat; the 1832 mandate lets him move the deposits, and firing two Treasury secretaries to do it is what turned the fight into a constitutional argument about executive power — which is where the Whig Party comes from. Removal plus expiration plus the Specie Circular then leaves the credit system without a national regulator at the moment it is asked to absorb a land boom. Historians disagree about how much of the Panic of 1837 to lay at Jackson's door — British credit conditions and the price of cotton matter too — but the chronology is what makes the argument possible either way.",
    skillCategory: "Causation",
  },
];

// Case 1.12's mission — the Removal Message, on the hipp contract. The first mission in the game to
// use this type; see this file's header.
export const UNIT_04_ARCHIVE_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-012-mission-removal-message-hipp",
    prompt:
      "Analyze Jackson's account of Indian removal using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes the argument — not the one that merely names the correct answer.",
    document: {
      text: "It gives me pleasure to announce to Congress that the benevolent policy of the Government, steadily pursued for nearly thirty years, in relation to the removal of the Indians beyond the white settlements is approaching to a happy consummation… It will separate the Indians from immediate contact with settlements of whites; free them from the power of the States; enable them to pursue happiness in their own way and under their own rude institutions… Doubtless it will be painful to leave the graves of their fathers; but what do they more than our ancestors did or than our children are now doing?",
      attribution:
        "Andrew Jackson, Second Annual Message to Congress, December 6, 1830, delivered five months after the Indian Removal Act became law",
    },
    // Two dimensions, not four, and the schema enforces that: the point of tagging is to pick the
    // ones a document actually makes arguable. For this message that is Point of view and Purpose,
    // both readable from the words on the page. Historical situation matters enormously here — the
    // message comes after the Removal Act and two years before Worcester v. Georgia, which the
    // executive declined to enforce — but a student cannot derive that from the text, so it belongs
    // in the case's framing and in the point-of-view explanation below rather than as a fourth tag.
    hippPrompts: [
      {
        id: "removal-point-of-view",
        dimension: "Point of view",
        argument:
          "Jackson describes Cherokee government and law as 'rude institutions' and removal as freeing them 'from the power of the States' — a framing that treats the Cherokee Nation as a dependent people to be managed rather than as a government with treaty standing.",
        options: [
          {
            id: "pov-explained",
            text: "Calling Cherokee institutions 'rude' and presenting removal as protection converts a nation that held ratified treaties with the United States into a ward to be relocated for its own good — precisely the standing the Cherokee contested, having adopted a written constitution, a supreme court and a printing press by 1830, and which the Supreme Court sustained in Worcester v. Georgia two years later, in a ruling the executive declined to enforce.",
            correct: true,
          },
          {
            id: "pov-named-only",
            text: "Jackson is the President of the United States and supports the removal policy.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "pov-wrong-neutral",
            text: "Jackson writes as a neutral observer with no stake in whether removal is carried out.",
            correct: false,
          },
          {
            id: "pov-wrong-sovereignty",
            text: "Jackson describes the Cherokee as a fully sovereign foreign nation whose treaties bind the United States absolutely.",
            correct: false,
          },
        ],
      },
      {
        id: "removal-purpose",
        dimension: "Purpose",
        argument:
          "The closing comparison — 'what do they more than our ancestors did or than our children are now doing?' — recasts forced removal as the ordinary westward moving that white Americans undertook voluntarily.",
        options: [
          {
            id: "purpose-explained",
            text: "By likening removal to the migration white settlers chose for themselves, Jackson makes a coerced expulsion sound like a shared national experience, which lets a congressional audience approve it without confronting the difference between leaving a home and being made to leave one.",
            correct: true,
          },
          {
            id: "purpose-named-only",
            text: "Jackson's purpose is to report on the progress of the removal policy to Congress.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "purpose-wrong-halt",
            text: "Jackson's purpose is to persuade Congress to halt removal until the Supreme Court has ruled on the Cherokee Nation's status.",
            correct: false,
          },
          {
            id: "purpose-wrong-compensation",
            text: "Jackson's purpose is to request funds to compensate the Cherokee for lands already taken by the State of Georgia.",
            correct: false,
          },
        ],
      },
    ],
  },
];

export const UNIT_04_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-04-archive-market-revolution-saq",
    stimulus:
      "“First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room. Breakfast bell, 7.00; return, 7.30. Dinner, 12.30; return, 1.05. Evening bell at 7.00. — RULES. The gate will be closed at the ringing of the second bell, and no operative admitted after it without leave of the agent. All persons entering the employ of this establishment engage to remain not less than one year. Any operative leaving without the agent’s regular discharge shall not be given a certificate of honourable dismissal.” — Posted time table and rules of an American textile workshop, 1845",
    prompts: [
      "A. Identify one way this document shows that the organization of work was changing in the period 1800–1848.",
      "B. Explain one reason why employers in this period sought to govern the working day by bells and written rules rather than by the task to be completed.",
      "C. Explain one way that workers in this period responded to changes in the organization of work like those described in the document.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_04_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-04-archive-democracy-and-reform-dbq",
    prompt:
      "Evaluate the extent to which economic change in the period 1815 to 1848 shaped the reform movements of those years.",
    documents: [
      {
        id: "doc-clay-american-system",
        label: "Document 1",
        attribution: "Henry Clay, speech in Congress supporting the American System",
        date: "1824",
        excerpt:
          "The sole object of the tariff is to tax the produce of foreign industry with the view of promoting American industry… Can we not, ought we not, to buy of our own countrymen, and thus create a home market? A genuine American System, embracing protection, internal improvements, and a national bank, would knit the sections of this country together by ties of mutual interest.",
      },
      {
        id: "doc-toll-receipt",
        label: "Document 2",
        attribution:
          "Clearance and toll receipt of an Erie Canal freight boat (composite reconstructed from the standard form of such papers)",
        date: "May 1845",
        excerpt:
          "Laden at Buffalo with wheat, flour, and staves. Weight of cargo, sixty-three tons. Bound east for Albany, thence New York by river. Toll assessed on wheat at the rate per ton per mile now in force, distance three hundred and sixty-three miles; toll paid in full at this office.",
      },
      {
        id: "doc-jackson-bank-veto",
        label: "Document 3",
        attribution:
          "Andrew Jackson, veto message on the recharter of the Bank of the United States",
        date: "July 10, 1832",
        excerpt:
          "It is to be regretted that the rich and powerful too often bend the acts of government to their selfish purposes… when the laws undertake to add to these natural and just advantages artificial distinctions, to grant titles, gratuities, and exclusive privileges, to make the rich richer and the potent more powerful, the humble members of society — the farmers, mechanics, and laborers — who have neither the time nor the means of securing like favors to themselves, have a right to complain of the injustice of their Government.",
      },
      {
        id: "doc-finney-revival",
        label: "Document 4",
        attribution: "Charles Grandison Finney, on the conduct of revivals",
        date: "1835",
        excerpt:
          "A revival is not a miracle, or dependent on a miracle in any sense. It is a purely philosophical result of the right use of the constituted means… The church must take right ground in regard to politics, to slavery, to temperance, and to every question of duty. Christians must do their duty to the country as a part of their duty to God.",
      },
      {
        id: "doc-mill-time-table",
        label: "Document 5",
        attribution:
          "Posted time table and rules of an American textile workshop (composite reconstructed from the printed mill time tables of the 1840s)",
        date: "1845",
        excerpt:
          "First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room… The gate will be closed at the ringing of the second bell, and no operative admitted after it without leave of the agent. All persons entering the employ of this establishment engage to remain not less than one year.",
      },
      {
        id: "doc-temperance-pledge",
        label: "Document 6",
        attribution:
          "Total abstinence pledge of the kind circulated by American temperance societies",
        date: "1840s",
        excerpt:
          "We, the undersigned, do agree that we will not use intoxicating liquors as a beverage, nor traffic in them; that we will not provide them as an article of entertainment, nor for persons in our employment; and that in all suitable ways we will discountenance their use throughout the community.",
      },
      {
        id: "doc-seneca-falls",
        label: "Document 7",
        attribution:
          "Declaration of Sentiments, adopted at the Woman's Rights Convention, Seneca Falls, New York",
        date: "July 1848",
        excerpt:
          "We hold these truths to be self-evident: that all men and women are created equal… He has monopolized nearly all the profitable employments, and from those she is permitted to follow, she receives but a scanty remuneration… He has taken from her all right in property, even to the wages she earns.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that economic change created the conditions and the grievances reform addressed AND that religious revival and political ideology were independent causes that economic change alone does not explain.",
  },
];
