// Unit 4 (Period 4: 1800–1848) campaign content — "Democracy, Markets, and Reform."
//
// Structural mirror of unit-03-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-010, the Canal Crossroads field), and two missions.
//
// ## What these five records are, and are not
//
// Every source in CASE_010_SOURCES is a **composite document reconstructed for Chronicle**, not a
// transcription of one surviving archival item — and each citation says so in its own first
// sentence. That is a deliberate departure from CASE_001/004/007_SOURCES, which are all real named
// documents, and it is the choice the plan for this unit called for.
//
// The reason is what a field map's records have to be. A Chronicler walks up to a boat captain and
// asks to see his papers; the record has to be *that captain's* toll receipt, on that boat, for that
// cargo. National canonical documents — the Bank Veto, the Declaration of Sentiments, Walker's
// Appeal — cannot do that job, because nobody on a towpath is carrying one. Those live in
// content/primary-source-library/unit-04-source-library.js and feed the missions and the Archive
// Challenges below, which is the division of labour this unit was designed around.
//
// So the rule these five are written to: **the form is documentary, the figures are real, and the
// citation names the scholarship the figures come from rather than implying an archive box.** A toll
// receipt's rates track the published toll schedules; a time book's bell hours track the 1845 Lowell
// time table; a boardinghouse register's crowding tracks what the canal-labour literature records.
// A student who checks any number here against the cited work will find it.
//
// ## The date is 1845, not "circa 1840"
//
// Fixed early and load-bearing on three records. Morse's telegraph line opened in May 1844, so a
// survey is contemporary rather than four years premature; the Erie's enlargement (1836–1862) is
// underway, which is why the town reads unfinished and why Hannah Voorhees expects her lock to be
// torn out; and the Second Bank is nine years dead, so the bank on Market Street is a
// state-chartered free bank under New York's 1838 Free Banking Act rather than a branch of
// anything. See docs/decision-log for the map that carries all three.

export const UNIT_04 = {
  id: "unit-04",
  title: "Democracy, Markets, and Reform",
  period: "Period 4 · 1800–1848",
  description:
    "How a transportation and market revolution remade where Americans worked, what they bought, and who they answered to — and how a widening white male electorate, a wave of religious revival, and organized reform movements each claimed to speak for a democratic people while disagreeing sharply about who that people included.",
  centralQuestion:
    "When a canal reached a place, who gained by it, who paid for it, and who was left arguing about what the change was for?",
  // Two unit-level Archive Challenges, the same pair Unit 3 carries: the SAQ works from a single
  // stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in the
  // Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-04-archive-market-revolution-saq" },
    { questType: "dbq", questId: "unit-04-archive-democracy-and-reform-dbq" },
  ],
  cases: [
    {
      id: "case-010",
      shortTitle: "Canal Crossroads",
      title: "The Canal Crossroads",
      date: "1845",
      // Upstate New York on the Erie line, between Syracuse and Rome — the stretch where the
      // canal's enlargement was actively under way in the 1840s. The town itself is fictional and
      // says so in its summary; the coordinates are real ground.
      mapPosition: { lat: 43.09, lon: -75.9 },
      location: "An Erie Canal town, upstate New York · 1845",
      question:
        "A canal town twenty years old: what did the market revolution give the people who lived in it, what did it take, and why could they not agree on what to do about either?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a canal boomtown that did not exist a generation earlier — the lock, the basin, the workshops, the immigrant quarter, the reform square and the farm edge — and recover five records that disagree with each other about what the canal was worth.",
      // KC 4.1 (the expansion of democracy and the rise of a market economy reshaping party
      // politics), 4.2 (innovations in technology, agriculture and commerce, and the migration
      // they drove), 4.3 (regional economic specialization and the reform movements that answered
      // it). Themes: WXT (the market revolution itself), SOC is not a CED code — the reform and
      // immigration half is carried by MIG and PCE.
      ced: { period: 4, keyConcepts: ["4.1", "4.2", "4.3"], themes: ["WXT", "MIG", "PCE"] },
    },
    {
      id: "case-011",
      shortTitle: "The Bank War",
      title: "The Bank War",
      date: "1816–1837",
      // Washington, D.C. — where the veto was written and the deposits removed.
      mapPosition: { lat: 38.9, lon: -77.04 },
      location: "Washington, D.C. · 1816–1837",
      question:
        "How did a fight over one bank's charter become a fight about what the presidency was for — and what did it leave behind in the towns that borrowed money?",
      mechanic: "Chronology Builder",
      // A non-map mission. Sequencing rather than a fifth evidence-organizing sort: what makes the
      // Bank War hard is not sorting claims into piles but seeing that each step *caused* the next,
      // and that the Panic of 1837 is the end of a chain rather than a separate disaster.
      route: "mission",
      summary:
        "Put the Bank War in the order in which each step made the next one possible — charter, election, veto, deposits, expiration, panic — and see why a fight over a bank charter ended as an argument about executive power.",
      archiveChallenge: {
        questType: "sequencing",
        questId: "case-011-mission-bank-war-chronology",
      },
      // KC 4.1 — the second party system forming around exactly this fight. Themes: PCE (what the
      // presidency may do) and WXT (credit, currency and who controls them).
      ced: { period: 4, keyConcepts: ["4.1"], themes: ["PCE", "WXT"] },
    },
    {
      id: "case-012",
      shortTitle: "The Removal Message",
      title: "The Removal Message",
      date: "1830–1838",
      // New Echota, Georgia — the Cherokee Nation's capital, where the 1835 treaty a minority
      // signed was made, and the ground the removal message was about.
      mapPosition: { lat: 34.55, lon: -84.92 },
      location: "New Echota, Cherokee Nation (Georgia) · 1830–1838",
      question:
        "Jackson told Congress removal was an act of mercy toward the people it removed. What is the argument actually doing, and what did the Cherokee Nation say back?",
      mechanic: "Source Analysis (HIPP)",
      route: "mission",
      summary:
        "Read Jackson's own justification of Indian removal against the Cherokee Nation's answer to it, and analyze the message's historical situation, point of view, purpose, and audience rather than only naming them.",
      archiveChallenge: {
        questType: "hipp",
        questId: "case-012-mission-removal-message-hipp",
      },
      // KC 4.1 (federal power and the limits the Court failed to enforce) and 4.3 (the movement of
      // peoples that removal forced). Themes: MIG (forced migration), PCE (federal power against a
      // Supreme Court ruling), NAT (who counts as a nation within a nation).
      ced: { period: 4, keyConcepts: ["4.1", "4.3"], themes: ["MIG", "PCE", "NAT"] },
    },
  ],
};

// Record Reconstruction lanes for case-010. Three, and they are arguments rather than topics: every
// record on this map can be read as a gain, a cost, or a fight about what to do — and which lane a
// student puts a record in is the interpretive move the case is asking for.
export const CASE_010_LANES = [
  { id: "what-the-canal-gave", label: "What the canal gave" },
  { id: "what-it-cost-to-work", label: "What it cost to work" },
  { id: "what-people-did-about-it", label: "What people did about it" },
];

export const CASE_010_SOURCES = [
  {
    id: "canal-toll-receipt",
    type: "Reconstructed record · canal clearance and toll receipt",
    title: "Clearance and Toll Receipt, Boat Mary Ann",
    creator: "Collector's office, Erie Canal",
    date: "May 1845",
    record: "Canal toll paper carried by a freight boat between Buffalo and the Hudson",
    visual: "context",
    activityRoute: "trace",
    excerpt:
      "CLEARANCE — Boat MARY ANN, Elias Rood, master. Laden at Buffalo with wheat, flour, and staves. Weight of cargo, sixty-three tons. Bound east for Albany, thence New York by river. Toll assessed on wheat at the rate per ton per mile now in force, distance three hundred and sixty-three miles; toll paid in full at this office and endorsed hereon. Boats to keep to the right in passing. No boat to remain in a lock chamber after the gates are opened. Master's declaration: the within is a true account of lading. — Collector's office, this day of May, 1845.",
    prompt:
      "Before the canal, moving a ton of wheat from Buffalo to New York City cost roughly a hundred dollars and took about three weeks. This boat does it for under ten dollars in about eight days. What changes in a farming region when that becomes true — and what does a toll receipt let you see that a farmer's own account of his year would not?",
    feedback:
      "Institute Context: the Erie Canal opened in 1825 and cut east–west freight costs by more than ninety percent within a generation, which is the single clearest quantitative fact of the market revolution. The consequences ran in both directions. Western New York and, soon, the Old Northwest could grow wheat for a New York market rather than for the family table; New York City became the country's dominant port; and farm families who had made most of what they used began buying it instead, and needed cash to do so. A toll paper is useful to a Chronicler precisely because it is not an argument — it is an administrative record made for a purpose other than persuading anyone, so its figures are less shaped by what its maker wanted a reader to conclude. What it cannot show you is what any of this felt like, or what a bad year did to a family now dependent on a price set a thousand miles away.",
    citation:
      "Composite record reconstructed for Chronicle from the standard form of Erie Canal clearance and toll papers; it is not a transcription of a single surviving document. Rates, distances, tonnage and the collapse in freight costs follow the published toll schedules and canal statistics summarized in Ronald E. Shaw, Erie Water West: A History of the Erie Canal, 1792–1854 (Lexington: University Press of Kentucky, 1966), and Carol Sheriff, The Artificial River: The Erie Canal and the Paradox of Progress, 1817–1862 (New York: Hill and Wang, 1996).",
    externalUrl: "https://www.britannica.com/topic/Erie-Canal",
    reconstruction: "what-the-canal-gave",
  },
  {
    id: "canal-time-book",
    type: "Reconstructed record · workshop time book and posted rules",
    title: "Time Book and Rules, Canal Street Workshop",
    creator: "Workshop agent's office",
    date: "1845",
    record: "Posted bell schedule and piece-rate account kept for a textile workshop's operatives",
    visual: "context",
    activityRoute: "discrepancy",
    // Second use of the field Phase 70 introduced, and it is not sequencing for its own sake: the
    // audit's strongest observation is that a workshop stands on this street because a ton of wheat
    // now reaches New York in eight days, and a player who has not followed the wheat has no
    // business being handed that sentence. It also decides which mission can be last, which is what
    // `arcClose` is authored against — see the header on unit-04-activities.js.
    requiresSourceId: "canal-toll-receipt",
    excerpt:
      "TIME TABLE. — First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room. Breakfast bell, 7.00; return, 7.30. Dinner, 12.30; return, 1.05. Evening bell at 7.00. — RULES. The gate will be closed at the ringing of the second bell, and no operative admitted after it without leave of the agent. All persons entering the employ of this establishment engage to remain not less than one year. Any operative leaving without the agent's regular discharge shall not be given a certificate of honourable dismissal. — ACCOUNT of L. BELLAMY, weaving: pieces this fortnight, sixty-one; rate allowed, as per posted list; board deducted, one dollar twenty-five the week; balance carried forward.",
    prompt:
      "This one sheet does three separate things: it tells an operative when to be in the room, what leaving early will cost her, and how her pay is calculated. Why would an employer want all three on the same piece of paper — and what does it tell you about how work was changing that a clock, rather than a task, now decides when the day ends?",
    feedback:
      "Institute Context: bell-governed hours, one-year engagements, and the honourable-discharge certificate are all real features of American textile work in the 1840s, printed on time tables that survive from Lowell and its imitators. The shift they record is one of the deepest in Period 4: work stops being measured by the task — a field ploughed, a barrel raised — and starts being measured by time bought from a worker, with the employer owning the clock. Board deducted at the source is equally significant, because it means a substantial part of a wage never reaches the worker as money at all. Note also who the operative is. New England and upstate mills recruited unmarried native-born farm women, who genuinely valued earning their own cash and also organized some of the earliest labour protests in the country — Lowell's turn-outs of 1834 and 1836 and the Female Labor Reform Association of 1845. Both things are true at once, which is why this record is hard to sort.",
    citation:
      "Composite record reconstructed for Chronicle from the printed mill time tables of the 1840s, of which the best known is the Time Table of the Lowell Mills (1853); the bell hours, one-year engagement and honourable-discharge provisions follow that documentary form. It is not a transcription of a single surviving document. Working conditions, piece rates, board deductions and the operatives' own organizing follow Thomas Dublin, Women at Work: The Transformation of Work and Community in Lowell, Massachusetts, 1826–1860 (New York: Columbia University Press, 1979).",
    externalUrl: "https://www.nps.gov/lowe/learn/historyculture/index.htm",
    reconstruction: "what-it-cost-to-work",
  },
  {
    id: "canal-reform-notices",
    type: "Reconstructed record · four notices posted on a public board",
    title: "The Reform Square Notice Board",
    creator: "Four separate hands, posted the same week",
    date: "1845",
    record: "Public posting board carrying notices that answer each other",
    visual: "context",
    activityRoute: "assembly",
    excerpt:
      "[1] TOTAL ABSTINENCE. — We, the undersigned, do agree that we will not use intoxicating liquors as a beverage, nor traffic in them; that we will not provide them as an article of entertainment, nor for persons in our employment; and that in all suitable ways we will discountenance their use throughout the community. Signatures received at the Meeting House, Thursday evening. — [2] TO THE PUBLIC. — The keeper of a licensed house on the towpath begs leave to ask the subscribers to the above by what right they would take the bread out of a widow's mouth in the name of her neighbours' virtue. I pay my licence. I keep an orderly house. Let those who would close it say plainly what they propose that I should live upon. — [3] ANTI-SLAVERY. — A meeting will be held to consider the immediate abolition of slavery throughout these United States, and the condition of the free coloured people of this State. All friends of the cause are invited. — [4] CITIZENS, TAKE NOTICE. — The above meeting is the work of fanatics and incendiaries whose designs will dissolve the Union and ruin the trade of this town. Gentlemen of property and standing are requested to attend and put a stop to it.",
    prompt:
      "Four notices, one board, one week. Two of them are answers to the other two. What does it change about your reading of the reform movements to see that each one was argued against at the time, in public, by people who lived in the same town — and who is the fourth notice actually addressed to?",
    feedback:
      "Institute Context: all four notice types are real. The temperance pledge follows the total-abstinence form the American Temperance Society and its successors circulated from the 1830s. The tavern-keeper's objection is the ordinary shape of the opposition: licensed sellers were not villains in their own account but small proprietors, often widows, being asked to give up a legal trade. The antislavery meeting notice and the warning against it are the most important pair on the board. In October 1835 an antislavery state convention at Utica, New York, was broken up by a mob — and the men who led it were not a rabble but bankers, lawyers and a judge, whom the historian Leonard Richards called 'gentlemen of property and standing.' Anti-abolition violence in the North was frequently organized by respectable men with commercial ties to the South. Reform in Period 4 was never a consensus the country slowly arrived at; it was a fight, and the fourth notice is written by the people who expected to win it.",
    citation:
      "Composite record reconstructed for Chronicle from four real classes of antebellum posting: the total-abstinence pledge circulated by the American Temperance Society and its successors from the 1830s; a licensed seller's published objection; an antislavery meeting notice; and an anti-abolition warning. It is not a transcription of a single surviving document. The anti-abolition notice's language and the social composition of the mobs that acted on it follow Leonard L. Richards, \"Gentlemen of Property and Standing\": Anti-Abolition Mobs in Jacksonian America (New York: Oxford University Press, 1970), which treats the Utica riot of October 1835 at length.",
    externalUrl: "https://www.britannica.com/topic/abolitionism",
    reconstruction: "what-people-did-about-it",
  },
  {
    id: "canal-job-book",
    type: "Reconstructed record · printer's job-work order book",
    title: "Job-Work Order Book, Market Street Printing Office",
    creator: "The office's journeyman printer",
    date: "1845",
    record: "Running account of paid printing jobs taken by a country newspaper office",
    visual: "context",
    activityRoute: null,
    excerpt:
      "ORDERS TAKEN AND WORK DONE. — Canal transportation company, freight and passage schedules, five hundred, cash. — Meeting House committee, pledge cards for total abstinence, three hundred, paid by subscription. — Keeper, towpath house, handbill in answer to the above, one hundred, cash in hand. — Sheriff's office, notice of sale of the goods of an insolvent, posted. — Anti-slavery society, notices of meeting, two hundred, credit to be settled. — Committee of citizens, handbill respecting the above meeting, two hundred, cash. — Store on Market Street, bill of new goods received by canal. — Estate advertisement, western lands, the same to be repeated three weeks.",
    prompt:
      "The same press printed the temperance pledge and the tavern-keeper's answer to it, the antislavery notice and the warning against it — in the same week, for money. What does that tell you about print in 1845 that neither the newspaper's editorials nor the notices themselves would tell you?",
    feedback:
      "Institute Context: a country printing office in this period was not primarily a newspaper. The paper was the office's public face and often its least profitable product; what paid the rent was job work — handbills, blanks, schedules, sale notices, cards — taken from whoever walked in with cash. That has a consequence students usually have to be shown rather than told. Cheap print was the infrastructure that made every reform movement of Period 4 possible, and it was equally available to their opponents, because it was a business rather than a cause. The order book also quietly measures the market revolution itself: a canal company's schedules, a store's list of goods arrived by water, an advertisement for western land, and a sheriff's sale of an insolvent's goods are four stages of the same economy in one week's work.",
    citation:
      "Composite record reconstructed for Chronicle from the ordinary job-work accounts of antebellum country printing offices; it is not a transcription of a single surviving document. The economics of the trade — job work rather than the newspaper as the office's income, and the printer as a commercial rather than partisan actor — follow Milton W. Hamilton, The Country Printer: New York State, 1785–1830 (New York: Columbia University Press, 1936), and Ronald J. Zboray, A Fictive People: Antebellum Economic Development and the American Reading Public (New York: Oxford University Press, 1993).",
    externalUrl: "https://www.britannica.com/topic/history-of-publishing",
    reconstruction: "what-people-did-about-it",
  },
  {
    id: "canal-house-register",
    type: "Reconstructed record · boardinghouse register and reckoning",
    title: "Register and Reckoning, Canal-Side Boardinghouse",
    creator: "The house's keeper",
    date: "November 1845",
    record: "Lodging register kept by a boardinghouse serving canal crews and labourers",
    visual: "context",
    activityRoute: null,
    excerpt:
      "REGISTER. — Beds in the house, six. Names entered this night, fourteen. Board and lodging, one dollar seventy-five the week, payable Saturday. Spirits and beer charged separate as taken. — P. Meehan, digger, on the enlargement; owing three weeks, contractor's order not yet paid. — J. Colligan, digger, the same. — T. Boyle, boatman, laid up till the ice goes out. — M. Dooley and husband, boat family, ashore for the winter; washing taken in against board. — Nine further names entered. — Memorandum: when the boats stop there is no money in this town until April, and the house must carry them or they must go on the road.",
    prompt:
      "Fourteen names against six beds, and a note that the house will have no income until April. Who is actually extending credit here, and what does that suggest about how a canal town's economy worked in the four months a year the water was frozen?",
    feedback:
      "Institute Context: canal boardinghouses were crowded to a degree that reads as exaggeration and is not — beds were shared and slept in shifts, which is why a register can carry more names than the house has beds. Two things in this record matter more than the crowding. First, the seasonal shutdown: the Erie froze from roughly December to April, so a workforce paid by the day had no work for a third of the year, and boardinghouse keepers carried unpaid board through the winter because the alternative was an empty house. The keeper, not a bank, is the lender of last resort in a canal town. Second, the women. Taking in washing against board was paid work performed almost entirely by women, recorded in nobody's wage book, and essential to whether a family survived the winter. When a Chronicler counts the labour that built and ran the canal, the register is where the uncounted half of it appears.",
    citation:
      "Composite record reconstructed for Chronicle from the ordinary form of an antebellum boardinghouse register and weekly reckoning; it is not a transcription of a single surviving document. Board rates, bed-sharing, contractors' orders in place of cash wages, and the winter shutdown follow Peter Way, Common Labour: Workers and the Digging of North American Canals, 1780–1860 (Cambridge: Cambridge University Press, 1993), and Carol Sheriff, The Artificial River: The Erie Canal and the Paradox of Progress, 1817–1862 (New York: Hill and Wang, 1996).",
    externalUrl: "https://www.eriecanalway.org/learn/history-culture",
    reconstruction: "what-it-cost-to-work",
  },
];
