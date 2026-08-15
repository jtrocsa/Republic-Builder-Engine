// Case 4.01's three activities, keyed by the source id each one opens from.
//
// Canal Crossroads runs slate D — ASSEMBLY, DISCREPANCY, TRACE — and is **the map with no
// interview**, which THE-MAP-PROGRAM.md §2 calls "a real debt" rather than a free variety win. Rule
// 3 existed because Groups B, C and D can all be built without a single NPC becoming a person, and
// a unit that lets that happen has more variety and still plays like a worksheet with a map
// attached. Two things pay the debt here and both are deliberate:
//
//   * **The DISCREPANCY's evidence column is the town rather than a transcript.** On Units 1, 2 and
//     5 those entries are gated by `asked:<npc>:<question>` tokens, so two players audit the same
//     record holding different evidence. There is no interview here to mint a token, so every
//     observation below is `requires: null` — and each one is therefore held to a stricter standard:
//     it is either on the record's own page, or it is something a person on this map says to anybody
//     who walks up to them, or it is what the previous mission established. Nothing in that column
//     is evidence a player might not have.
//   * **The chain is gated.** `canal-time-book` carries `requiresSourceId: "canal-toll-receipt"`,
//     which is the second use of the field Phase 70 introduced. That is not sequencing for its own
//     sake: the audit's strongest observation is that a workshop on this street exists because a ton
//     of wheat now reaches New York for a tenth of the wagon rate, and a player who has not followed
//     the wheat has no business being handed that sentence.
//
// The gate also decides which mission can be last, which is what `arcClose` is authored against —
// the toll receipt always precedes the time book, so the ending is the time book or the notice board
// and never the receipt. Same shape as Riverbend, and pinned by tests/unit/activity-content.test.js,
// which derives it from `requiresSourceId` rather than from a hand-written list.
//
// Every speaker id below is a real NPC id in UNIT4_FIELD_NPCS — the *outdoor* roster. The print
// shop's and the boardinghouse's people are on `FIELD_MAPS["unit-04"].interiors`, not on `.npcs`,
// so they cannot brief or debrief a mission, and none of these three is played indoors.

// What Canal Crossroads' three records turn out to be about, said once. See the header on Unit 3's
// file for why this is a const rather than three copies.
const CANAL_ARC =
  "Canal Crossroads' three records are one economy explaining itself in three voices, and not one of them is the voice of anybody it is about. A toll paper prices a movement of goods so cheap that it changed what a farm was for. A time book prices an hour of a person's day and does not print the rate it is pricing it at. And a notice board carries four arguments about how people ought to live, every one of them set in type by the same press, for cash, in the same week. What connects the three is not the canal. It is that in this economy the paperwork is made by whoever can pay for it, and the people it is made about are mostly the people who cannot.";

// ---- M4.A — "Under Ten Dollars" (TRACE, canal-toll-receipt) --------------------------------------
//
// Riverbend traced a cask and asked what a wharf book could establish about the people who made it.
// Philadelphia traced an order and asked what a page can cause. This traces a cargo and asks a third
// thing: a saving this large accrued to somebody, so follow the load and work out to whom.
//
// The answer is not the grower, and that is the mission. The collapse in freight cost is the single
// clearest quantitative fact of the market revolution — a hundred dollars and three weeks to under
// ten and eight days — and a student's first instinct is that the farmer pocketed the difference. He
// did not. His own price fell with the transport cost, because a Genesee farm is now competing with
// every other farm that can also reach New York for ten dollars; what he gained was a market, and
// what he lost was the option of not being in one. `farmer-captures` sits in the palette on every
// leg and is the answer to none of them.
const UNDER_TEN_DOLLARS = {
  kind: "trace",
  id: "case-010-trace-under-ten-dollars",
  title: "Under Ten Dollars",
  variant: "Commodity Chain",
  missionQuestion:
    "Moving a ton of wheat to New York used to cost a hundred dollars and now costs under ten. Follow one load: where did that saving actually go, and how much of it can this paper prove?",
  thinkingMove:
    "Following a gain rather than a good. When a cost collapses, somebody keeps the difference, and the obvious candidate is usually not the one.",
  briefing: {
    speaker: "canal-boat-captain",
    line: "Sixty-three tons, Buffalo to Albany, and the clearance is here if you want figures rather than my word for it. Before the canal that load was a hundred dollars a ton and three weeks. I do it for under ten and I do it in eight days. Follow it the whole way and tell me who is better off by ninety dollars, because I can tell you it is not me and it is not the man who grew it.",
  },
  debrief: {
    speaker: "market-farmer",
    line: "So you have worked out what I worked out the hard way. I reckon the toll and the freight before I plant now, and I still grow wheat, because the alternative is growing what we eat and buying nothing.",
    established:
      "The saving went mostly past the man who grew the load and past the man who carried it. A grower who can now reach New York is competing with every other grower who can reach New York, so the price at the farm falls toward the price in the city minus the new, small freight — and the difference is captured by the buyer who eats cheaper bread and the merchant who moves more of it. What the farmer gained is a market. What he gave up is the option of not being in one, and a cash crop obliges him to buy the flour, cloth and tools he used to make.",
    remains:
      "What this particular load sold for. A clearance is issued at the start of a voyage: it records the lading, the distance and the toll, and it is not a sale. Nobody at this office will ever learn the price, and neither will the farmer for some weeks.",
  },
  openQuestions: [
    "How much of the fall in farm prices was the canal and how much was the enormous new acreage the canal made worth planting. Both are the same event from different ends, and the toll schedules cannot separate them.",
    "What the enlargement will do to all of this. They are widening the whole line — seventy feet at the surface, seven deep — and nobody on this towpath knows yet whether that means more wages or fewer.",
  ],
  // Canal Crossroads' one anomaly, and a map gets exactly one (Phase 77, decision log `0060`).
  // Deliberately not another altered figure: Riverbend's was a scraped correction and Philadelphia's
  // was a pencil collation, and a third alteration in a strange hand would turn a thing that happened
  // into a collectible. This one is not an alteration at all. Every ordinary explanation is available
  // and none of them accounts for the figure being *right*.
  anomaly: {
    noticed:
      "The toll is assessed against a published rate, and the rate endorsed on this clearance is the one that will be in force next season rather than this one. Everything else on the sheet is correct for the day it was issued — the tonnage, the distance, the master's declaration, the collector's stamp.",
    note: "A collector working from a draft schedule, a clerk copying the wrong column, a sheet made up later out of the office's own books: three ordinary explanations, and any one of them would do. What none of them accounts for is that the figure is not merely early. It is exactly right, to the fraction, for a schedule that has not been published. Somebody assessed this cargo against a rate that does not yet exist and did not make an error doing it. File the record as it stands and flag the page.",
  },
  codexFiling: {
    summary:
      "A ninety-percent collapse in freight cost, recorded by the office that took its cut of it. The saving went to the buyer and the merchant; what the grower got was a market he could no longer choose to stay out of.",
    tags: ["What the record leaves out", "What a price records", "Who pays for the voyage"],
    seeAlso: ["case-004-trace-one-hogshead"],
  },
  historicalRecord: {
    documented: [
      "The Erie Canal, opened in 1825: 363 miles from Buffalo to Albany, with 83 locks on the original line.",
      "The collapse in east–west freight costs — roughly a hundred dollars and three weeks per ton by wagon before the canal, under ten dollars and about eight days after it — which is the clearest single quantitative fact of the market revolution.",
      "New York State's toll system, assessed by commodity at a rate per ton per mile, and the clearance papers boats carried to prove payment.",
      "The shift of western New York and then the Old Northwest from mixed subsistence farming to wheat grown for a distant market, and the corresponding rise of store-bought goods in farm households.",
      "New York City's emergence as the dominant American port, and the enlargement of the canal begun in 1836 to seventy feet at the surface and seven feet deep.",
      "Mule teams towing at roughly four miles an hour, which is slower than a good road wagon — the canal's advantage is load, not speed.",
    ],
    reconstructed: [
      "The clearance you are reading. It is a composite modelled on the standard form of Erie Canal clearance and toll papers, not a transcription of a surviving document — its own citation says so.",
      "The Mary Ann, Elias Rood master, and the particular sixty-three tons this mission follows.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a toll paper at a lock in 1845 — including the endorsed rate the record flag describes.",
    ],
    debated: [
      "How much of the antebellum fall in farm prices to attribute to transport and how much to the new land brought into cultivation. Economic historians read the same series and weight the two differently.",
    ],
  },
  intro:
    "Sixty-three tons of wheat, flour and staves left Buffalo on this boat, and a toll was paid on every ton for every mile of it. Follow the load to New York and back, and enter what this paper actually supports at each step — and what it does not.",
  howItWorks: {
    steps: [
      "The load moves in four legs, in order. Each says what changes and whose hands it passes through.",
      "Every leg asks you twice: what happens here, and how far this clearance carries it. The second question only opens once the first is right.",
      "Then keep three of the four entries in your Field Notebook. Three is all you get, so keep the ones your conclusion will rest on.",
    ],
    note: "One of the answers offered is never right on any leg, and it is the one most people reach for first. A saving does not stay with whoever the saving is about.",
  },
  notebook: {
    capacity: 3,
    prompt:
      "Four legs entered, three slots. The one you leave out is not a mistake — it is the part of this trade the clearance cannot speak to.",
    emptyNote: "Enter a leg correctly and it becomes available to keep.",
  },
  terms: [
    {
      term: "clearance",
      definition:
        "The paper a boat carries to show it has been entered and its toll paid. It is issued at the start of a voyage, which is why it can tell you what left and never what it sold for.",
    },
    {
      term: "per ton per mile",
      definition:
        "How New York assessed canal tolls — by weight and by distance, at a published rate that differed by commodity. It is why the distance is written on the sheet in words.",
    },
    {
      term: "forwarding house",
      definition:
        "A Buffalo firm that took grain off the lake boats and wagons, graded and sacked it, and loaded it onto canal boats for a commission. Where a farm's crop stops being anybody's crop and becomes a quantity.",
    },
    {
      term: "the enlargement",
      definition:
        "The rebuilding of the canal to seventy feet wide and seven feet deep, begun in 1836 and still under way. It is why there is a labouring camp at this crossroads at all.",
    },
  ],
  subject: {
    label: "Sixty-three tons on the boat Mary Ann, May 1845",
    note: "Cleared at Buffalo with wheat, flour and staves; bound east for Albany, thence New York by river.",
  },
  nodes: [
    { id: "farm", label: "A Genesee County farm" },
    { id: "buffalo", label: "The Buffalo forwarding house" },
    { id: "line", label: "The line: 363 miles, 83 locks" },
    { id: "city", label: "New York, and the buyers" },
    { id: "store", label: "The crossroads store, next season" },
  ],
  // What happens on a leg — a question about the world, answered from everything the player knows.
  //
  // `farmer-captures` is the standing distractor and the answer to nothing. It is the intuitive
  // reading of a cost collapse — the man whose goods got cheaper to move keeps the difference — and
  // it is exactly what competition takes away from him.
  effects: [
    { id: "commodity", label: "A household's crop becomes a quantity somebody else grades" },
    { id: "state-toll", label: "The state takes its share, by weight and by distance" },
    { id: "price-elsewhere", label: "The price is set where the load lands, not where it grew" },
    {
      id: "cash-dependence",
      label: "A household that sells for cash must buy what it used to make",
    },
    { id: "farmer-captures", label: "The grower keeps what the cheaper carriage saves" },
  ],
  supportLevels: [
    { id: "established", label: "The clearance states it" },
    { id: "inferred", label: "Reasonable from the clearance, not stated" },
    { id: "not-shown", label: "Not shown by this clearance" },
  ],
  supportPrompt: "And how far does this toll paper actually carry that?",
  legs: [
    {
      id: "grading",
      from: "farm",
      to: "buffalo",
      label: "A farm's crop becomes a quantity",
      transforms:
        "Wheat is threshed, hauled to the lake or the turnpike, and delivered to a forwarding house, which grades it, sacks it, mixes it with everybody else's of the same grade, and enters it as tonnage.",
      actor: "The farm household, the teamster, and the forwarding merchant.",
      effect: "commodity",
      support: "not-shown",
      why: "Both halves. Something real happens on this leg and it is the quietest change in the whole chain: up to the forwarding house this is a particular family's wheat, and after it this is sixty-three tons of a grade. That is what makes a price at a distance possible, and it is also the moment the grower stops being able to argue about his own crop. And the page will not tell you any of it — the clearance opens at Buffalo, with the boat already laden and weighed. Establish this from the farmer standing on the lane, who can tell you what he plants and why. Do not establish it from a sheet that begins after his part is over.",
    },
    {
      id: "clearing",
      from: "buffalo",
      to: "line",
      label: "The load is declared, assessed and cleared",
      transforms:
        "The master declares the lading, the collector's office assesses toll on the wheat at the published rate per ton per mile over three hundred and sixty-three miles, takes payment in full, and endorses the clearance.",
      actor: "The boat's master and the collector's office.",
      effect: "state-toll",
      support: "established",
      why: "This one the paper simply is. The rate, the tonnage, the distance in words, the endorsement of payment — the whole document exists to prove that the state was paid before the boat moved. Notice what that makes it good for. A toll paper is an administrative record made for a purpose other than persuading anybody, which is exactly why its figures are less shaped by what its maker wanted a reader to conclude than a farmer's own account of his year would be.",
    },
    {
      id: "hauling",
      from: "line",
      to: "city",
      label: "One team moves what eighty horses could not",
      transforms:
        "Mules walk the towpath at four miles an hour, eight days and eighty-three locks to Albany, then down the Hudson. The load arrives into a market that sets its price that week, in a city the grower has never seen.",
      actor: "The mule driver, the lock keepers, and the New York grain buyers.",
      effect: "price-elsewhere",
      support: "inferred",
      why: "A good inference and not a line on the page. Read what the sheet does give you: sixty-three tons, three hundred and sixty-three miles, a toll small enough that it is a rounding error against what a wagon charged. A boat that is not fast — four miles an hour is slower than a road wagon — moving a load that would have taken forty wagons and eighty horses. What follows from that is a price that stops being local, because a grower in Genesee County is now selling into the same market as everyone else who can reach it. The clearance never says so. It shows you the scale, and the scale is the argument.",
    },
    {
      id: "returning",
      from: "city",
      to: "store",
      label: "The same water brings the household back what it stopped making",
      transforms:
        "The proceeds come home as cash and credit, and the boats come west loaded: flour milled elsewhere, cloth woven elsewhere, tools, crockery, a stove. A farm that grows one crop for sale buys the rest of its life at a store.",
      actor: "The storekeeper, and every household on the lane.",
      effect: "cash-dependence",
      support: "not-shown",
      why: "Real, enormous, and entirely absent from this page. A clearance issued eastbound at Buffalo has nothing to say about what came back — and the return half is where the change actually lands on a family. The farmer told you the shape of it himself: he grows wheat for New York and buys his flour back at the store, which his father would have called madness. That is a household reorganised around a price it does not set, and in a bad year it is the difference between a thin winter and a mortgage. You can prove it from the store's own shelves. You cannot prove it from this.",
    },
  ],
  closer: {
    prompt:
      "Four legs entered. Your reading goes into the record — what is a toll paper like this one evidence of?",
    skillCategory: "Economic Systems",
    options: [
      {
        id: "scale",
        text: "A movement of goods cheap enough to change what a farm is for — recorded by the office taking its cut of it",
        correct: true,
        // The two legs the page itself carries. Deliberately not three: with a capacity of three
        // that would leave exactly one legal notebook, and a forced answer is not a judgement.
        requiresEvidence: ["clearing", "hauling"],
        unsupportedNote:
          "This is the reading the clearance will bear, and right now you are not carrying it. The assessment and the haul are where this argument lives — the two legs the document itself accounts for. Go back and keep the entries your conclusion actually rests on.",
        why: "Right, and both halves matter. The scale is on the page: sixty-three tons, three hundred and sixty-three miles, a toll that is a rounding error against the wagon rate the captain quoted you. And the reason it is on the page at all is that a state was collecting on it — this is not a document anybody made to describe the market revolution, which is precisely why it is good evidence of it. What it cannot reach is the two ends: the farm before Buffalo, and the store after New York, which is where the change actually lands on a household.",
      },
      {
        id: "prosperity",
        text: "That the canal made the farms along it prosperous",
        correct: false,
        why: "You declined `the grower keeps what the cheaper carriage saves` on all four legs, and this is that answer wearing a coat. A grower who can reach New York is competing with every grower who can reach New York, so his own price falls toward the city price minus a now-tiny freight. He gained a market and lost the option of staying out of one — and he now buys the flour he used to grind. Prosperity is not the word the man on the lane used, and he is the one reckoning the toll before he plants.",
      },
      {
        id: "technology",
        text: "That better boats had made transport fast and cheap",
        correct: false,
        why: "Nothing in this chain is fast. A mule team walks at four miles an hour, slower than a good road wagon, and the trip takes eight days through eighty-three locks. What collapsed the cost is not speed and not machinery — it is that water carries weight. One team pulled a load that would have needed forty wagons and eighty horses, and the tonnage and the distance on this sheet are the whole of that argument.",
      },
      {
        id: "state-power",
        text: "That New York State controlled the western trade",
        correct: false,
        why: "The state takes a toll, which is one leg of four and the one thing this document was made to prove. Taking a share of a trade and directing it are different levers. What the load was worth, where it went and what came back the other way were settled in a market in New York that the collector's office at Buffalo has no window onto at all.",
      },
    ],
  },
};

// ---- M4.B — "The Bell and the Book" (DISCREPANCY, canal-time-book) ------------------------------
//
// One sheet doing three jobs — when to be in the room, what leaving early costs, and how the pay is
// reckoned — and the mission is that those three are on the same paper on purpose.
//
// The verdicts are deliberately spread across four of the five available, and `gapRequiredFor` is a
// **list** here rather than a single id: once "complicated by the evidence" exists beside
// "contradicted by the evidence", both are claims the record does not simply support, and both are
// worth asking why about. The schema has taken a list since the field was widened; Riverbend and the
// Caribbean both pass one string, so this is the first content to use the other form.
//
// The hardest claim is the last one, and it resolves to "not enough evidence" on purpose. Whether an
// operative who came down from a farm to earn her own money is in the same position as a boarder who
// has no farm to go back to is the question the whole of Period 4 labour history argues about, and
// a record that answered it would be lying. Lucy Bellamy says both true things about her own life in
// one breath — she will not pretend earning her own money is nothing, and she will not pretend the
// piece rate is honest — and the audit's job is to notice that this is not a contradiction.
const THE_BELL_AND_THE_BOOK = {
  kind: "discrepancy",
  id: "case-010-discrepancy-the-bell-and-the-book",
  title: "The Bell and the Book",
  variant: "One Sheet Against What You Can See",
  missionQuestion:
    "A time table, a set of rules and a wage account are printed on one sheet. What does each of them actually establish about the work — and which one cannot be checked at all?",
  thinkingMove:
    "Auditing a document against itself. When one page does three jobs, the parts you can verify tell you how much to trust the part you cannot.",
  briefing: {
    speaker: "textile-mill-worker",
    line: "That is the sheet, and I will not tell you what to think of it. The bell I can vouch for — you can hear it from the basin. The rules are posted where anybody can read them. The account at the bottom is mine, and I have never once been able to check it. Read the three of them together and tell me which is which.",
  },
  debrief: {
    speaker: "german-cooper",
    line: "I am paid for a barrel. She is paid for a fortnight, and the fortnight is not hers. That is the whole of the difference and it took me two years here to see it.",
    established:
      "The sheet is excellent evidence of what the workshop required and poor evidence of what it paid. The hours, the closed gate and the one-year engagement are all verifiable, and every one of them buys the same thing: a day measured by a clock somebody else owns rather than by a task somebody else can inspect. The account underneath them cannot be audited at all — the rate is off the page, board is taken before the balance is struck, and the fortnight closes with nothing recorded as changing hands.",
    remains:
      "Whether this was a bargain or a trap, which the record cannot settle and which the operative herself will not settle for you. She came down from a farm to earn her own money and says plainly that is not nothing; she also says the piece rate is not honest. Both are true, and a woman with a farm to go back to is not in the position of a boarder who has none.",
  },
  arcClose: {
    speaker: "textile-mill-worker",
    line: "A toll paper, my time book and the board in the square. Three things printed in this town this year, and I am the only person in any of them who is named — at the bottom, in an account I cannot check.",
    established: CANAL_ARC,
  },
  openQuestions: [
    "What the posted rate actually was. The account is reckoned 'as per posted list', the list is the agent's, and it is not on this sheet — which is the single most consequential absence in the record.",
    "Whether the honourable-discharge certificate had any force in a town this short of hands. Its power depends entirely on the next employer asking for it, and in a canal town every spring, many did not.",
  ],
  codexFiling: {
    summary:
      "Hours, gate and engagement are all verifiable and all buy the same thing: a day measured by a clock the worker does not own. The wage account on the same sheet cannot be audited, because the rate it uses is not printed on it.",
    tags: ["Who does the work", "What a paper permits", "What a price records"],
    seeAlso: ["case-004-discrepancy-nothing-to-be-gotten"],
  },
  historicalRecord: {
    documented: [
      "Printed mill time tables of the 1840s, of which the best known is the Time Table of the Lowell Mills — bell-governed hours beginning before daylight in winter and running past seven in the evening.",
      "The one-year engagement and the certificate of honourable discharge, standard provisions in New England and upstate textile employment.",
      "Board deducted at source from wages, so that a substantial part of a wage never reached the worker as money.",
      "Piece rates set by a posted list the employer controlled and could revise.",
      "The recruitment of unmarried native-born farm women to the mills, and their own high rate of return to the countryside.",
      "The Lowell turn-outs of 1834 and 1836 and the Female Labor Reform Association of 1845 — among the earliest organised labour protests in the United States, led by the same women.",
      "The shift from task-measured to time-measured work, one of the deepest changes of the period.",
    ],
    reconstructed: [
      "The sheet you are auditing. It is a composite modelled on the printed time tables and piece-rate accounts of the 1840s, not a transcription of a surviving document — its own citation says so.",
      "L. Bellamy, and the Canal Street workshop she weaves in.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler auditing a posted rules sheet in 1845.",
    ],
    debated: [
      "Whether mill work in this period is best read as an opportunity or an exploitation. The same operatives valued the independence and organised against the conditions, and historians who take one half as the story tend to have to explain the other half away.",
    ],
  },
  intro:
    "A time table, a list of rules and one operative's account, printed on the same sheet by the same office. Three of the things on it you can check against this town. One of them you cannot check at all — and working out which is the mission.",
  howItWorks: {
    steps: [
      "Read the sheet first. All of it — the lines below are lifted straight out of it.",
      "For each line, say what your evidence does to it: supports it, complicates it, contradicts it, or is not enough to settle it. It is not all one way.",
      "Land on complicated or contradicted and a second question opens: why does it differ? A sheet can be mistaken, and it can be exactly accurate and still not be telling you what it appears to.",
    ],
    note: "The right-hand column is not a transcript of anybody's answers. This map has no interview — what is in it is what is on the page, what this town says to anyone who walks it, and what the boat's clearance already established.",
  },
  terms: [
    {
      term: "operative",
      definition:
        "The period's own word for a factory worker, and worth noticing. It names a person by the machine they attend rather than by a trade they have learned.",
    },
    {
      term: "piece rate",
      definition:
        "Pay by output rather than by time — so much per piece woven. It sounds like the opposite of a bell-governed day, and on this sheet the two are stacked on top of each other.",
    },
    {
      term: "honourable discharge",
      definition:
        "A certificate saying an operative left with the agent's leave. Without it, the next mill in the district is entitled to ask why — which is the whole of its force, and depends on the next mill asking.",
    },
    {
      term: "Complicated by the evidence",
      definition:
        "The line is not wrong, and it is not the whole of it. What you can see adds something the line leaves out — often what the line is *for*.",
    },
    {
      term: "Not enough evidence",
      definition:
        "Nothing available settles it either way. This is a finding, not a failure — say so rather than guessing.",
    },
  ],
  record: {
    label: "Time Book and Rules, Canal Street Workshop",
    attribution: "Posted by the workshop agent's office, 1845",
    context:
      "This one sheet is nailed by the door of a small textile workshop a hundred yards off the basin. The top half is the bell schedule the whole street can hear. The middle is the establishment's rules, posted where anybody can read them, which is the point of posting them. The bottom is a fortnight of one weaver's account, entered by the agent's clerk in the same hand — the operative sees the total and not the arithmetic. The workshop exists because the canal put a New York market within eight days of this street; the operatives are mostly young women down from farms in the surrounding counties, who came to earn money of their own and who, in mills like this one across New England, staged some of the first organised labour protests in the country.",
    text: [
      "“TIME TABLE. — First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room. Breakfast bell, 7.00; return, 7.30. Dinner, 12.30; return, 1.05. Evening bell at 7.00.",
      "RULES. — The gate will be closed at the ringing of the second bell, and no operative admitted after it without leave of the agent.",
      "All persons entering the employ of this establishment engage to remain not less than one year. Any operative leaving without the agent's regular discharge shall not be given a certificate of honourable dismissal.",
      "ACCOUNT of L. BELLAMY, weaving: pieces this fortnight, sixty-one; rate allowed, as per posted list; board deducted, one dollar twenty-five the week; balance carried forward.”",
    ],
  },
  verdictPrompt:
    "For each line, decide what the evidence available to you actually does to it — the page itself, this town, and the clearance you already followed.",
  verdicts: [
    { id: "supported", label: "Supported by the evidence" },
    { id: "complicated", label: "Complicated by the evidence" },
    { id: "contradicted", label: "Contradicted by the evidence" },
    { id: "cannot-tell", label: "Not enough evidence" },
  ],
  // A list rather than a single id, and the first content anywhere to use that form. Once
  // "complicated" exists beside "contradicted", both are claims the record does not simply support
  // and both deserve the second question — a line that is accurate and still not telling you what it
  // appears to is exactly the case this engine was built for.
  gapRequiredFor: ["contradicted", "complicated"],
  // The same five reasons the Caribbean and Riverbend use, so a student who learned this vocabulary
  // at a chart table is not relearning it at a workshop door. Cleaner ids than Riverbend's, which
  // carried a pronoun from the letter it was written against; the labels are identical, and the
  // labels are what a student reads.
  gapKinds: [
    { id: "mistake", label: "Mistake" },
    { id: "perspective", label: "Different perspective" },
    { id: "design", label: "Deliberate framing" },
    { id: "incomplete", label: "Incomplete information" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  gapPrompt: "Why does the sheet differ from what you can see?",
  lockedNote: "Settle every line of the sheet before you file.",
  claims: [
    {
      id: "hours",
      text: "First bell, 4.30 morning. Second bell, 5.00, at which hour the operatives are to be in the room… Evening bell at 7.00.",
      verdict: "supported",
      gap: null,
      why: "Straightforwardly true, and you can hear it — the bell carries the length of the basin, and in November the first one rings well before daylight. The thing worth noticing is not the length. A farm day is long too, and the cooper across the way works until the barrels are done. What is new here is that a bell decides when the day ends rather than a task, which means the workshop is buying hours rather than work — and whoever owns the clock owns the difference.",
    },
    {
      id: "gate",
      text: "The gate will be closed at the ringing of the second bell, and no operative admitted after it without leave of the agent.",
      verdict: "complicated",
      gap: "design",
      why: "Accurate as posted, and it is not a housekeeping rule. A closed gate does not make anybody punctual — it converts four minutes into a lost day's pay, and it makes the agent's personal leave the thing an operative has to ask for. Read it beside the line underneath and the pattern is plain: each rule is written as an ordinary condition of work and each one moves a small amount of discretion from the operative to the agent. That is what makes it deliberate framing rather than a mistake.",
    },
    {
      id: "engagement",
      text: "All persons entering the employ of this establishment engage to remain not less than one year… shall not be given a certificate of honourable dismissal.",
      verdict: "complicated",
      gap: "incomplete",
      why: "The sentence sounds like a contract and it is nothing of the kind — no law compels a year, and nobody is going to be pursued for leaving. Its whole force is the certificate, and the certificate's whole force is the next employer asking for it. In a canal town short of hands every spring, that is a weaker instrument than the sentence sounds, which is why so many operatives went home after a season. The sheet cannot tell you how often it actually bound anyone, and that absence is why this is incomplete rather than deliberate.",
    },
    {
      id: "account",
      text: "Pieces this fortnight, sixty-one; rate allowed, as per posted list; board deducted, one dollar twenty-five the week; balance carried forward.",
      verdict: "contradicted",
      gap: "design",
      why: "This presents itself as an account of what she earned and it cannot function as one. The rate is not on the sheet — it is 'as per posted list', and the list is the agent's and can be revised. Board is taken before the balance is struck, so a substantial part of the wage never exists as money. And the fortnight closes carried forward, meaning nothing changed hands at all. Every other line on this page can be checked by anybody standing in the street; this line cannot be checked by the woman it is about. A record that publishes what it demands and withholds what it pays has made a choice about which half is anybody's business.",
    },
    {
      // Deliberately the same sentence as the claim above, isolated on one word. The line before
      // audits what the engagement can enforce; this audits the sheet's claim that there was an
      // agreement to enforce. Two different questions off one clause, and the second is the harder.
      id: "engage",
      text: "“All persons entering the employ… ENGAGE” — the sheet's own word for what an operative does on arriving, and its claim that this is an agreement between two parties.",
      verdict: "cannot-tell",
      gap: null,
      why: "Nothing on this page or in this town settles it, and the honest answer is to say so. The weaver came down from a Herkimer County farm to earn money of her own and will not pretend that is nothing; she also says the piece rate is not honest, and both of those are her own words about her own life. Whether a woman with a farm to go back to is freely agreeing in the way a boarder with none is agreeing is the question this whole period argues about, and a record that answered it would be telling you something it does not know. Marking this one is not a failure to decide. It is the finding.",
    },
  ],
  // Every entry is `requires: null`, because this map has no interview to mint a token. See the file
  // header: the price of that is that each of these must be something a player has by construction —
  // on the record's own page, said by somebody standing on the outdoor map, or established by the
  // clearance this mission is gated behind.
  observed: [
    {
      id: "bell-heard",
      text: "The workshop bell carries the length of the basin. In November the first one rings well before daylight.",
      requires: null,
    },
    {
      id: "posted-list",
      text: "The rate the account is reckoned at is not on the sheet. It is 'as per posted list', and the list belongs to the agent.",
      from: "The record itself",
      requires: null,
    },
    {
      id: "board-first",
      text: "Board is deducted at a dollar twenty-five the week before any balance is struck, so part of the wage never becomes money.",
      from: "The record itself",
      requires: null,
    },
    {
      id: "carried-forward",
      text: "The fortnight closes with a balance carried forward. Nothing is recorded as having changed hands.",
      from: "The record itself",
      requires: null,
    },
    {
      id: "her-own-money",
      text: "“I came down from a farm in Herkimer County to earn my own money, and I will not pretend that is nothing. I will not pretend the piece rate is honest either.”",
      from: "Lucy Bellamy, weaver",
      requires: null,
    },
    {
      id: "task-work",
      text: "The cooper up the lane is paid by the barrel and stops when the barrels are done. Every flour cask off this basin is something he made.",
      from: "Konrad Sturm, cooper",
      requires: null,
    },
    {
      id: "deduction",
      text: "On the enlargement the pay is seventy-five cents a day and the contractor takes back what he likes for the whiskey ration. Deduction at the source is not peculiar to the workshop.",
      from: "Patrick Meehan, canal labourer",
      requires: null,
    },
    {
      id: "market",
      text: "A ton of wheat now reaches New York for under ten dollars in about eight days. There is a workshop on this street because there is a market within eight days of it.",
      from: "The Mary Ann's clearance",
      requires: null,
    },
  ],
  closer: {
    prompt: "Your reading goes into the record. What should it say this sheet is evidence of?",
    skillCategory: "Continuity and Change",
    options: [
      {
        id: "time-bought",
        text: "An employer buying hours rather than work — and publishing what it required while withholding what it paid",
        correct: true,
        why: "Right, and you got there by checking rather than by suspecting. Three lines you were able to verify: the bell, the gate, the engagement. One you could not verify at all, and the reason you could not is that the rate it uses is not printed on the page it is printed on. That asymmetry is the finding. A sheet that posts its demands where the whole street can read them and keeps its arithmetic in the agent's book has told you exactly how much of this arrangement it considers anybody's business.",
      },
      {
        id: "exploitation",
        text: "That mill work was simply exploitation",
        correct: false,
        why: "You marked the last claim not-settled, and that was the right call — this answer is you unmarking it. The weaver came here to earn her own money and says so; women in mills like this one also ran the first organised labour protests in the country, which is not what people with no agency do. The account at the bottom of this sheet is indefensible and the arrangement as a whole is genuinely argued about, and collapsing the two throws away the distinction the verdicts exist to make.",
      },
      {
        id: "opportunity",
        text: "That the workshop offered farm women independence they could not get at home",
        correct: false,
        why: "It did, and that is half of it. She told you so herself and she told you the other half in the next sentence. An independence paid at a rate that is not published, out of which board is taken before any balance is struck, in a fortnight that closes with nothing changing hands, is a real independence with a question mark on it — and the question mark is on the page you just audited.",
      },
      {
        id: "hours",
        text: "That the working day in 1845 was extremely long",
        correct: false,
        why: "It was, and it is the least interesting thing on the sheet. The cooper up the lane works long hours too and nobody rings a bell at him; he stops when the barrels are done. What changed in this period is not the length of the day but who decides when it ends — and the three rules you verified are all mechanisms for moving that decision from one side of the gate to the other.",
      },
    ],
  },
};

// ---- M4.C — "Posted the Same Week" (ASSEMBLY, canal-reform-notices) -----------------------------
//
// Four notices on one board, and two of them are answers to the other two. Rebuilding the argument
// is the first board; the second is where the history actually is.
//
// The distractor that carries the mission is `rabble` on board two. Every student's model of
// anti-abolition violence is a mob of the poor and ignorant, and the record refuses it in its own
// words: the fourth notice asks *gentlemen of property and standing* to attend, which is the phrase
// Leonard Richards took for the title of the book that established who actually broke up these
// meetings. At Utica in October 1835 an antislavery state convention was dispersed by bankers,
// lawyers and a judge. Getting that backwards is not a small error — it is the difference between
// reform being resisted by ignorance and reform being resisted by interest.
//
// Board one's two distractors do the quieter half of the same job. A sheriff's sale notice and a
// canal company's timetable were posted the same week by the same press and take no side on
// anything, which is what stops a player reading every posting in a public place as a position in a
// debate — and the timetable, five hundred copies and the largest order of the week, is the reason
// the press was available to both sides at all.
const POSTED_THE_SAME_WEEK = {
  kind: "assembly",
  id: "case-010-assembly-posted-the-same-week",
  title: "Posted the Same Week",
  variant: "Reconstruct an Argument",
  missionQuestion:
    "Four notices went up on one board in one week, and two of them are answers. Who is arguing with whom — and whose interest is each of them actually defending?",
  thinkingMove:
    "Reading a public argument by its opposition. What a reform movement was up against tells you more about it than its own literature does.",
  briefing: {
    speaker: "abolitionist-lecturer",
    line: "Read the board behind me and read all of it. Both notices went up the same week, and the second one is not from a rabble — look at who it asks to attend. I have been stoned out of four towns on this line by men in good coats, and I would rather you understood that than pitied me.",
  },
  debrief: {
    speaker: "abolitionist-printer",
    line: "One press prints the party sheet and one prints ours, and we set type a hundred feet apart. He calls me a fanatic on Thursday and I answer him on Saturday. That is not a quarrel — that is the only argument a republic has.",
    established:
      "Reform in this period was not a consensus the country slowly arrived at. It was a fight, conducted in public, in print, by people who lived on the same street — and the opposition was organised, articulate, and frequently respectable. The fourth notice names its own constituency: gentlemen of property and standing, which is exactly who broke up the Utica convention in 1835. Cheap print made every one of these movements possible and was equally available to everyone who wanted to stop them, because it was a business rather than a cause.",
    remains:
      "Which side of this board the town actually took. A posting board records what was argued, not what was decided, and the meeting the third notice calls may have been held, broken up, or quietly abandoned. Nothing on the board says.",
  },
  arcClose: {
    speaker: "abolitionist-printer",
    line: "A toll paper, a time book and this board. Every one of them came off a press somebody paid for, and only one of the three was paid for by the people it is about.",
    established: CANAL_ARC,
  },
  openQuestions: [
    "Whether the tavern-keeper's objection persuaded anybody. Licensed sellers' published answers survive in numbers; what almost never survives is any record of a subscriber changing their mind.",
    "How much of the anti-abolition organising in northern towns was commercial interest and how much was a genuine fear for the Union. Contemporaries gave both reasons, often in the same sentence, and the notices do not separate them.",
  ],
  codexFiling: {
    summary:
      "Four notices, one board, one week — two of them answers. The opposition to reform was public, organised and respectable: the notice against the antislavery meeting asks gentlemen of property and standing to attend.",
    // "What a paper permits" is here because of the second notice, not the third: the keeper's
    // whole objection is that she paid for a licence, and a licence is a paper that permits.
    tags: [
      "Written to persuade",
      "How a text travels",
      "Whose account is this",
      "What a paper permits",
    ],
    seeAlso: ["case-007-assembly-the-words-as-they-reached-you"],
  },
  historicalRecord: {
    documented: [
      "The total-abstinence pledge circulated by the American Temperance Society and its successors from the 1830s, in substantially this form.",
      "Published objections by licensed sellers — often small proprietors, and often widows — to temperance campaigns aimed at their trade.",
      "Antislavery meeting notices, and the anti-abolition warnings printed in answer to them in northern towns.",
      "The breaking up of the New York State antislavery convention at Utica in October 1835 by a crowd organised and led by bankers, lawyers and a judge.",
      "The phrase 'gentlemen of property and standing', contemporary to that violence and taken by the historian Leonard Richards as the title of his study of it.",
      "The commercial ties between northern merchants and the southern cotton economy that gave many respectable northerners a direct interest in silencing abolitionists.",
      "The economics of a country printing office: job work rather than the newspaper paid the rent, which made cheap print available to whoever walked in with cash.",
      "The burned-over district of western New York, and the revival movement that fed both the temperance and antislavery campaigns.",
    ],
    reconstructed: [
      "The board itself, and these four particular notices posted in one week. Each is modelled on a real class of antebellum posting; the assembly of the four is Chronicle's framing.",
      "The two orders in the tray that belong to no argument, drawn from the ordinary job-work of a country printing office.",
    ],
    fiction: ["Chronotravel, the Institute, and a Chronicler reading a posting board in 1845."],
    debated: [
      "How far anti-abolition mobs represented general northern opinion as against an organised commercial minority. Richards's account has been extended and qualified since 1970 and the question is live.",
    ],
  },
  intro:
    "Four notices, one board, one week — and two of them were written to answer the other two. Rebuild the argument, then work out whose interest each notice is actually defending. One of those four answers is the one most people get backwards.",
  howItWorks: {
    steps: [
      "Click a notice in the tray, then the place on the board you think it belongs. Dragging works too.",
      "Two of the six take no side in anything. They were printed the same week by the same press, and putting them in an argument is the first mistake to make here.",
      "Finish the board and a second one opens: whose interest each of the four is defending.",
    ],
    note: "Read the wording of each notice for who it is addressed to. That is where the answer to the second board is, and it is not where anybody looks first.",
  },
  terms: [
    {
      term: "total abstinence",
      definition:
        "The stricter form of the temperance pledge: not moderation but no drinking at all, and no selling, serving or providing it to anyone in your employ.",
    },
    {
      term: "licensed house",
      definition:
        "A tavern or inn permitted by law to sell drink, having paid for the licence. The temperance campaign is asking a legal trade to be given up voluntarily, which is what the second notice is about.",
    },
    {
      term: "immediate abolition",
      definition:
        "The demand that slavery end now and without compensation to enslavers, as against gradual or colonisation schemes. It was a minority position in the North and it is what the third notice is calling a meeting to consider.",
    },
    {
      term: "gentlemen of property and standing",
      definition:
        "A contemporary phrase for the respectable, propertied men of a town. It is how the fourth notice describes the audience it wants, and it is what the men who broke up the Utica convention in 1835 actually were.",
    },
  ],
  boards: [
    {
      id: "argument",
      kind: "label",
      // Every label here is kept short on purpose — a fragment renders as a pill in a tray of six,
      // and a sentence in that space is a wall of type nobody reads. The argument goes in `misread`,
      // which has a paragraph to make it in.
      label: "Who is arguing with whom",
      note: "Two arguments, each with a notice that makes the demand and a notice posted in answer to it. Two of the six pieces are in neither argument — decide which, and be ready to say what they were doing on this board.",
      slots: [
        { id: "drink-demand", label: "Drink: the notice that makes the demand" },
        { id: "drink-answer", label: "Drink: the notice posted in answer" },
        { id: "slavery-demand", label: "Slavery: the notice that makes the demand" },
        { id: "slavery-answer", label: "Slavery: the notice posted in answer" },
      ],
      fragments: [
        {
          id: "pledge",
          label: "“We will not use intoxicating liquors as a beverage, nor traffic in them”",
          belongs: "drink-demand",
          misread:
            "The total-abstinence pledge, and it is the notice that opens the argument rather than the one that answers it. Read what it asks for: not moderation, but that signers stop drinking, stop selling, stop serving it to people in their employment, and discountenance its use throughout the community. That last clause is what makes it a demand on the whole town rather than a private resolution — and it is what the answer underneath it is answering.",
        },
        {
          id: "keeper",
          label: "“By what right would they take the bread out of a widow's mouth?”",
          belongs: "drink-answer",
          misread:
            "The keeper of a licensed house on the towpath, answering the pledge in print the same week. This is the ordinary shape of temperance's opposition and it is not a villain's: a small proprietor, often a widow, who has paid for a licence and keeps an orderly house, asking what she is proposed to live on instead. Reform is being resisted here by somebody with less money than the people proposing it, which is the reverse of the other argument on this board.",
        },
        {
          id: "antislavery",
          label: "“A meeting to consider the immediate abolition of slavery”",
          belongs: "slavery-demand",
          misread:
            "The antislavery meeting notice, and it is the demand rather than the answer — immediate abolition, and the condition of the free coloured people of this State, which was a minority position in the North and was understood as one. Everything about the wording is an invitation: a meeting, to consider, all friends of the cause invited. The notice that answers it is not an invitation.",
        },
        {
          id: "citizens",
          label: "“Gentlemen of property and standing are requested to attend”",
          belongs: "slavery-answer",
          misread:
            "The warning posted against the antislavery meeting, and the most important piece on this board. It calls the meeting the work of fanatics and incendiaries, and then it names the audience it wants: gentlemen of property and standing. That is not a call to a rabble. It is a request that the respectable men of the town come and put a stop to something — and it is the notice the second board is really about.",
        },
        {
          id: "sale",
          label: "“Notice of the sale of the goods of an insolvent”",
          belongs: null,
          hints: [
            "It was posted the same week, on the same board, by the same press. Does that make it part of an argument?",
            "Ask who this one is arguing with. Nobody has answered it and it is answering nobody.",
          ],
          misread:
            "A sheriff's sale, and it takes no side on anything. A public board is mostly business, and reading every posting on one as a position in a debate is how a historian invents a controversy that nobody in the town was having. It is worth a second look for a different reason, though — somebody in this place has gone broke, and a market economy is the thing that makes that a public notice rather than a private misfortune.",
        },
        {
          id: "schedule",
          label: "“Canal transportation company — freight and passage schedules”",
          belongs: null,
          hints: [
            "This one takes no side either. Ask instead what it was doing on the same press as the other five.",
            "Five hundred copies, cash. That is the largest order of the week, and it is the one nobody is arguing about.",
          ],
          misread:
            "Five hundred copies, paid in cash, and the largest single order the office took that week. It argues with nobody, and it is the reason the press exists — a country printing office lived on job work, not on its newspaper, and the schedules and sale bills and blanks are what paid for the type the other four notices were set in. That is the quiet fact underneath this whole board: cheap print made every reform movement of this period possible, and it was equally available to their opponents, because it was a business rather than a cause.",
        },
      ],
    },
    {
      id: "interest",
      kind: "label",
      label: "Whose interest each one defends",
      note: "The argument is rebuilt. Now say what each of the four notices is actually protecting — and notice that two of the pieces in this tray are things people assume about the opposition rather than things this board supports.",
      opensAfter: "argument",
      slots: [
        { id: "virtue", label: "A cause that believes the town will be better for it" },
        { id: "trade", label: "A person whose lawful living the cause would end" },
        { id: "conscience", label: "A cause arguing a national wrong in a local room" },
        { id: "property", label: "Men with commercial interests they would rather not have named" },
      ],
      fragments: [
        {
          id: "temperance-society",
          label: "The subscribers to the total-abstinence pledge",
          belongs: "virtue",
          hints: [
            "Start with what this one stands to gain materially. The answer is nothing.",
            "They are asking the town to be different, and the cost of it falls on somebody else.",
          ],
          misread:
            "They gain nothing material and they mean it — this district had been burnt over with revival, and a soul that is saved is not saved to sit still. Worth holding on to alongside the answer they got: sincerity is not the same as being right about who pays, and the person answering them in print is the one being asked to pay.",
        },
        {
          id: "the-keeper",
          label: "The keeper of the licensed house on the towpath",
          belongs: "trade",
          hints: [
            "This one has a licence, paid for, and a living that ends if the pledge succeeds.",
            "The temperance argument is about virtue. The answer to it is about rent.",
          ],
          misread:
            "A licence paid for, an orderly house, and a living that the pledge would simply end. She is not defending drink as a good — she is asking what she is proposed to live on, which the pledge does not say. This is the ordinary shape of the opposition to temperance and it is the one people find easiest to caricature.",
        },
        {
          id: "the-society",
          label: "The antislavery society calling the meeting",
          belongs: "conscience",
          hints: [
            "What does this group stand to gain in this town? Nothing, and rather less than nothing.",
            "The lecturer told you she has been stoned out of four towns on this line.",
          ],
          misread:
            "They gain nothing here and they lose a good deal — the lecturer has been driven out of four towns on this line already. Immediate abolition was a minority position in the North, argued in local rooms by people with no power in the places they were arguing, which is why the answer to it had to be organised rather than merely disagreeable.",
        },
        {
          id: "the-committee",
          label: "The committee of citizens requesting that it be stopped",
          belongs: "property",
          hints: [
            "Read the notice's own wording again. Who is it asking to attend, and what does that tell you about who wrote it?",
            "The notice says its concern is that this will ruin the trade of this town. Whose trade?",
          ],
          misread:
            "The notice names its own constituency — gentlemen of property and standing — and names its own reason: that the meeting will dissolve the Union and ruin the trade of this town. Northern merchants and lawyers had direct commercial ties to the southern cotton economy, and this is that interest organising itself, in print, over a signature it does not have to give.",
        },
        {
          id: "rabble",
          label: "A mob of the town's poor, hostile to reformers",
          belongs: null,
          hints: [
            "Before you place this, read the fourth notice's own words about who it wants in the room.",
            "It asks for gentlemen of property and standing. Does that describe a mob of the poor?",
          ],
          misread:
            "This is the piece almost everybody reaches for, and getting it wrong matters more than any other error on this board. The notice asks for gentlemen of property and standing, and that is what turned up: when an antislavery state convention met at Utica in October 1835, the crowd that broke it up was organised and led by bankers, lawyers and a judge. Anti-abolition violence in the North was frequently the work of respectable men with commercial reasons. Reading it as ignorance rather than as interest gets the whole period backwards, because ignorance can be educated and interest has to be defeated.",
        },
        {
          id: "outsiders",
          label: "Agitators who came in from out of town",
          belongs: null,
          hints: [
            "Check this one against the board you just rebuilt. How many of these four were written by people who live here?",
            "The lecturer travels. The society, the committee, the keeper and the subscribers do not.",
          ],
          misread:
            "It is what the fourth notice would like you to think — fanatics and incendiaries, arriving from elsewhere — and the board itself refuses it. All four of these were posted by people who live on these streets, which is the record's whole point: this argument was not something that happened to the town from outside. It was the town.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "The board is rebuilt and the interests are named. Your reading goes into the record — what is a posting board like this one evidence of?",
    skillCategory: "Social Movements",
    options: [
      {
        id: "contested",
        text: "Reform as a fight in public, with an organised and largely respectable opposition",
        correct: true,
        why: "Right, and the wording of the fourth notice is what proves it rather than anything you had to assume. It asks for gentlemen of property and standing, and that is who came: the Utica convention of 1835 was broken up by bankers, lawyers and a judge. Every one of these four notices was written by somebody living on these streets and set in type by the same press for cash — which is the other half of the finding. Cheap print made all of this possible and took no side in any of it.",
      },
      {
        id: "consensus",
        text: "A country gradually arriving at agreement about drink and slavery",
        correct: false,
        why: "Two of the four notices on this board exist only because somebody objected, in print, in the same week. That is not a country arriving at agreement — it is an argument in progress with the outcome unknown to everyone taking part. The gradual story is what gets told afterwards by whichever side won, and this board is what it looked like before anyone knew.",
      },
      {
        id: "ignorance",
        text: "Reformers ahead of their time, resisted by ignorance",
        correct: false,
        why: "You declined the mob of the poor and you were right to. The opposition here is literate, organised, printed, and describes itself as men of property and standing — and its stated objection is to the trade of the town, not to the reasoning. Interest is not ignorance, and confusing the two makes the period unintelligible: you cannot explain why abolition took a war if what stood against it was a failure to understand.",
      },
      {
        id: "print",
        text: "That newspapers drove the reform movements of this period",
        correct: false,
        why: "Close, and off by one. What you found is not a newspaper — it is job work: handbills, pledge cards, meeting notices, taken from whoever walked in with cash. The largest order on this board's press that week was a canal company's timetable. Print was the infrastructure every one of these movements ran on, and it was not a movement itself, which is exactly why both sides of both arguments could afford it.",
      },
    ],
  },
};

export const UNIT_04_ACTIVITIES = {
  "canal-toll-receipt": UNDER_TEN_DOLLARS,
  "canal-time-book": THE_BELL_AND_THE_BOOK,
  "canal-reform-notices": POSTED_THE_SAME_WEEK,
};
