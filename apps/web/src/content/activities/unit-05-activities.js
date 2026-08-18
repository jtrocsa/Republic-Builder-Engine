// Case 5.01's three activities, keyed by the source id each one opens from.
//
// Richmond runs slate A — INTERVIEW, ASSEMBLY, DISCREPANCY — which is the Caribbean's slate, four
// units later. What keeps that legal is the question axis rather than the engine list
// (THE-MAP-PROGRAM.md §2): Unit 1's interview puts four topics to seven people to get breadth, and
// this one asks what testimony costs when the government is writing it down. Same mechanic, opposite
// pressure — there, talking to a Chronicler is free; here, every person you stop is being
// administered on paper by a state that is currently losing a war.
//
// **The register rule from UNIT5_FIELD_NPCS binds every word of this file**, and it is not a style
// preference. Enslaved and impressed people are named, speak in the first person, say plainly what
// is being done to them and what they intend to do about it. Nobody here is scenery, no Confederate
// speaker is the most sympathetic voice on the map, and the officials are ordinary — which is the
// point rather than a softening.
//
// The chain is gated: `richmond-price-board` requires `richmond-impressment-order`, so the audit's
// evidence column is a transcript of what this particular player actually asked. That also decides
// which mission can be last — the price board or the payroll, never the requisition — which is what
// `arcClose` is authored against, and what tests/unit/activity-content.test.js derives rather than
// hard-codes.
//
// Token format for `requires` is `asked:<npc id>:<question id>`, built by main.js's
// interviewTokens() from the interview's *logged* answers. Hearing something is not carrying it.
// Every speaker id below is a real NPC id in UNIT5_FIELD_NPCS — the outdoor roster; the counting
// room's and the hospital ward's people are on `.interiors` and cannot brief or debrief a mission.

// What Richmond's three records turn out to be about, said once. See the header on Unit 3's file for
// why this is a const rather than three copies.
const RICHMOND_ARC =
  "Richmond's three records are one state's paperwork about people it has decided are quantities. A requisition moves men by the fifth of a district and names not one of them, because the money and the compensation both go to somebody else. A payroll stands three classes of men at the same furnace and settles the wages of two of those classes on people who are a hundred miles away. And a price board records what a dollar had become, beside three notices that are all consequences of it. In every one of the three the person doing the work is the unit of account rather than the subject — and the only reason you can say the names Peter Gowrie and Charlotte Vaughan at all is that you went and asked. That is the one thing the archive of this city cannot do for you.";

// ---- M5.A — "What the Government Writes Down" (INTERVIEW, richmond-impressment-order) ------------
//
// The requisition is the most useful document on this map for one reason: it promises to pay
// somebody every month and to compensate somebody if a person dies, and both times the somebody is
// the owner. The people it moves are counted, aged, valued and delivered, and the page does not
// contain a single one of their names. It was not designed to.
//
// So the mission is the obvious consequence. If you want the names you have to go and get them,
// which is what the rest of this city is for — and the interview is built so that the two panels of
// the notebook are that argument on screen: four people who write something down, three people who
// are written down.
//
// Seven speakers, four questions, exactly seven useful answers — one per person, which is also the
// completion bar (0052 §3: one number, not two). Three answers per speaker out of four questions, so
// everybody has a question that fires their `fallback`.
const WHAT_THE_GOVERNMENT_WRITES_DOWN = {
  kind: "interview",
  id: "case-013-interview-what-the-government-writes-down",
  title: "What the Government Writes Down",
  variant: "Whose Account Do You File?",
  missionQuestion:
    "This requisition moves five hundred people and names none of them. What does this government put on paper about a person — and what does it cost to be the person it is writing about?",
  thinkingMove:
    "Reading an administrative record for its silences. What a form has no field for is a decision somebody made, not an oversight.",
  briefing: {
    speaker: "confederate-official",
    line: "Section Six, and there is the form. One page. I answer the owners' letters all morning — they write to say we return their people sick, and to claim on the ones who do not come back at all. Read it and tell me what you notice, and then go and put the same questions to somebody outside this building, because I will not be able to tell you what is not on it.",
  },
  debrief: {
    speaker: "richmond-dock-laborer",
    line: "You wrote my name down. Nobody has done that since February, and the paper that brought me here did not do it either.",
    established:
      "This government writes down what it takes, and what it takes is people — entered as a number against an owner's name, aged, valued, and delivered to a place by a date. The money goes to the owner every month; if the person dies, the compensation goes to the owner too, on a value sworn at delivery. The form has no field for the person's name because a name is not what the transaction is between. Everything you now know about who these people actually are, you got by standing in front of them and asking.",
    remains:
      "Almost every name. You have three — a dock labourer taken off the Nottoway in February, a seamstress hired out to the Clothing Bureau, a barber who pays every year to prove he is free. Thirty-one hands went to Tredegar under requisition this month alone and the surviving paper names none of them, which is what a Chronicler is for and also what a Chronicler cannot fix.",
  },
  openQuestions: [
    "What happened to the people delivered under these requisitions. Owners' compensation claims survive in numbers because owners filed them; the sixty-day terms, the extensions and the deaths are recorded as sums against a value sworn at delivery.",
    "How far impressment turned enslaved Virginians against the Confederacy as against simply against their own condition. Contemporaries on both sides asserted the first confidently and the evidence is mostly filtered through people with a reason to say it.",
  ],
  codexFiling: {
    summary:
      "A requisition that moves people by the fifth of a district, pays the hire to the owner, compensates the owner if they die, and has no field for a name. Everything else in this mission was got by asking.",
    tags: ["Whose account is this", "Who is permitted to speak", "Counting people"],
    seeAlso: ["case-007-interview-a-public-position"],
  },
  historicalRecord: {
    documented: [
      "The Confederate impressment acts of 26 March 1863 and 17 February 1864, and Virginia's own requisitioning of enslaved labour from 1862.",
      "The form's real provisions: district quotas set as a fraction of an owner's liable men, sixty-day terms, government rations and medical attendance, hire paid to the owner, and compensation on a value sworn at delivery.",
      "The furious resistance of Virginia slaveholders to impressment — lawsuits, petitions, hidden men, and newspaper columns about tyranny — from a government founded on states' rights and property in people.",
      "The registration of free Black Virginians, renewed and paid for periodically, and the requirement to carry proof of free status.",
      "Hiring out, the arrangement most enslaved people in wartime Richmond lived under, with wages paid to the owner.",
      "Richmond's population roughly tripling during the war, and the refugee families it could not house.",
      "Women's relief committees, the free-market days, and the ladies' associations that sewed for the hospitals.",
    ],
    reconstructed: [
      "The requisition itself, a composite modelled on the printed forms served under the impressment acts — its own citation says so.",
      "All seven people you spoke to. They are composites drawn from what the records establish about wartime Richmond, not individuals anyone named.",
    ],
    fiction: ["Chronotravel, the Chronicle Institute, and a record secured in the field."],
    debated: [
      "How much impressment contributed to the Confederacy's defeat as against its war effort. It supplied enormous quantities of labour and it also turned a founding constituency against the central government, and historians weigh the two differently.",
    ],
  },
  intro:
    "One page moves five hundred people sixty days at a time, pays their owners monthly, compensates their owners if they die, and does not have a line for a name. Put four questions to this city and find out what it costs to be the thing a government is counting.",
  howItWorks: {
    steps: [
      "You may ask any question to any person. Consider what this government already has on paper about them.",
      "Most people will send you elsewhere. When someone gives you something worth keeping, press Add to Field Notebook.",
      "Seven people, seven accounts — one from each. That is the whole mission.",
    ],
    note: "What goes in your Field Notebook is what you carry to the market price board, which is the only other record on this map that is about everybody at once. A question you never asked is a line of it you have no way to read.",
  },
  terms: [
    {
      term: "impressment",
      definition:
        "A government taking property for public use, paying the owner. Applied to people, it means the Confederate state requisitioning enslaved men from their enslavers for fixed terms — over those enslavers' objections, and frequently over their lawsuits.",
    },
    {
      term: "hired out",
      definition:
        "An enslaved person rented by their owner to somebody else, usually by the year. The person works; the money goes to the owner; the two may live a hundred miles apart. It is how most enslaved people in wartime Richmond lived.",
    },
    {
      term: "register papers",
      definition:
        "The certificate a free Black Virginian carried to prove they were free — renewed periodically, paid for each time, and demanded by any patrol that cared to ask.",
    },
    {
      term: "the free market",
      definition:
        "A relief distribution, not a market at all. Committees of women gave food to soldiers' families on a ward visitor's certificate, which is charity administered by paperwork.",
    },
  ],
  questions: [
    { id: "written", label: "What does this government already have written down about you?" },
    { id: "kept", label: "What does it take, and what do you manage to keep?" },
    { id: "say", label: "What can be said out loud in this city, and to whom?" },
    { id: "after", label: "What do you expect when this is over?" },
  ],
  groups: [
    {
      id: "writing",
      label: "People who write something down",
      note: "A requisition, a pass, a price, a relief list. Four records, and not one of them is about the person keeping it.",
    },
    {
      id: "written",
      label: "People something is written down about",
      note: "Three lives administered on paper that somebody else holds. Each of them keeps something back, and each of them told you what.",
    },
  ],
  speakers: [
    {
      id: "confederate-official",
      name: "Josiah Ruffin",
      role: "Clerk, Engineer Bureau, War Department",
      group: "writing",
      fallback: "He turns over the next letter in the pile and begins reading it.",
      answers: {
        written: {
          text: "About you? Nothing, and I would not have the time. About the hands: a number against an owner's name, the county, ages between eighteen and fifty, and a value sworn at delivery. Sixty days from delivery. The hire is paid to the owner every month and if a hand dies the compensation goes to the owner too, on the sworn value and not otherwise. That is the whole of the form. No, there is no line for a name — the transaction is between this Bureau and the man who owns him, and a name is not a term of it. I have never been asked that before and I notice I answered it quickly.",
          useful: true,
          lead: "He has never been asked for a name and the form has no room for one. Go and get some.",
        },
        say: {
          text: "A great deal, in writing, and all of it about compensation. The owners are the ones who write to me. Ask a man who has been delivered under one of these what he may say.",
        },
        after: {
          text: "I shall be at a desk somewhere, I expect. That is not the interesting question and you know it is not.",
        },
      },
    },
    {
      id: "confederate-private",
      name: "Tom Sackett",
      role: "Private, provost guard",
      group: "writing",
      fallback: "He shifts his weight off the bad leg and looks down the road.",
      answers: {
        written: {
          text: "My name is on a muster roll that has not been paid since summer. That is the whole of my paperwork and it is worth less than the paper.",
        },
        kept: {
          text: "Nothing they have not already taken. I cannot march any more, which is why I am standing here looking at other men's passes.",
        },
        say: {
          text: "Here is what nobody writes down. I look at passes all day. Everybody's pass is in order — they are good passes, properly endorsed — and half the men carrying them are going somewhere they have no business going, and I let them by. Mostly. I have not been paid since the summer and what they would pay me in would not buy the shoes I am standing in. A system that runs on paper runs on somebody caring about the paper, and I will tell you plainly that at this gate that is a thinner thing than the Bureau imagines.",
          useful: true,
        },
      },
    },
    {
      id: "richmond-shopkeeper",
      name: "Amos Deane",
      role: "Grocer, the Second Market",
      group: "writing",
      fallback: "He wipes the chalk off his fingers and waits on a customer behind you.",
      answers: {
        kept: {
          text: "I chalk the price twice a day and I have stopped rubbing out the old one, and that is deliberate — people want to see it, and I want them to see it. Flour was forty dollars a barrel in '61 and a hundred and twenty-five in January and it is two hundred and fifty now. My customers are not poorer than they were. The money is. What I have kept is the old figures standing on the board underneath, which is the only honest thing on this street and costs me nothing but chalk.",
          useful: true,
          lead: "The old figures are still on his board. Go and read the whole board, and the notices beside it.",
        },
        written: {
          text: "A licence, and a list of what I may not sell above the schedule, which nobody enforces. Ask the committee ladies what a list is worth here.",
        },
        say: {
          text: "The price. After that I am careful, like everybody. There was a crowd in this market in '63 and the President came out to it, and people remember.",
        },
      },
    },
    {
      id: "richmond-relief-society-woman",
      name: "Sarah Whitlock",
      role: "Relief society organiser",
      group: "writing",
      fallback: "She goes back to the bundle she is tying and lets the question pass.",
      answers: {
        written: {
          text: "Lists. Who called, what was given, and the ward visitor's certificate against each name. It is more paperwork than charity and I did not design it.",
        },
        say: {
          text: "More than you would think, and I will tell you why. Before this war a lady of this city did not appear in public on business. Now four hundred came to our door last week and we had bread for two hundred, and I have stood in a room of officials and said so out loud, and they listened because they need us to go on doing it. What I may not say is that the fund buys whatever the speculators have left by the time it reaches us. So I say it to you. There is going to be an argument about all of this when the men come home, and I intend to be in it.",
          useful: true,
        },
        after: {
          text: "Hungrier, before it is better. Ask the woman in the churchyard what she expects — she came up from Fredericksburg with what three people could carry.",
        },
      },
    },
    {
      id: "richmond-dock-laborer",
      name: "Peter Gowrie",
      role: "Impressed labourer, Richmond Dock",
      group: "written",
      fallback: "He sets down the crate, looks at you steadily, and picks it up again.",
      answers: {
        written: {
          text: "A number on a paper served on a man in Southampton County, and a pass in my hat that says which streets and what hour. Not my name. The pass does not have it either.",
        },
        kept: {
          text: "The counting. They cannot take that and they do not know I am doing it.",
        },
        after: {
          text: "I will tell you exactly, and you may write it down. They took me off the Nottoway in February — sixty days, the order said, and it is August. I move government freight off the canal boats to the depot and back down again, and every day I count the boats going west and how heavy they ride. I know what the guns to the east mean as well as any man on this dock, and I know they are nearer than they were in June. When this city goes I do not intend to be moved anywhere with it. That is what I expect, and it is not what the Bureau expects, and only one of us is watching the river.",
          useful: true,
        },
      },
    },
    {
      id: "richmond-seamstress",
      name: "Charlotte Vaughan",
      role: "Seamstress, Clothing Bureau",
      group: "written",
      fallback: "She counts the cut pieces again and does not look up.",
      answers: {
        written: {
          text: "My name, at the Bureau, against fourteen shirts and the cloth counted out and counted back. And in her book, as a hire, by the year.",
        },
        kept: {
          text: "Ask it properly and I will answer it properly. The wages for my week are paid to the woman who owns me — I am hired to the Bureau, and the money never comes near me. Fourteen shirts, the cloth counted out to me in the morning and counted back at night. What is mine is the sewing I do after dark, for whoever pays, because nobody has yet thought to ask whether I do any. I am keeping every dollar of it in a place I will not tell you. I do not intend to be in this city when this is finished, and a woman who intends that needs money of her own before she needs anything else.",
          useful: true,
        },
        after: {
          text: "Elsewhere. I have thought about it more carefully than you have and I am not going to describe it to a stranger in the street.",
        },
      },
    },
    {
      id: "richmond-free-black-barber",
      name: "Wilson Carter",
      role: "Barber, Broad Street",
      group: "written",
      fallback: "He strops the razor twice and lets the silence sit between you.",
      answers: {
        written: {
          text: "More about me than about any free white man on this street, and here is the shape of it. I have kept this chair eleven years and I own it outright, and I carry register papers in my coat to prove I am free — renewed every year, and paid for every year, and the fee does not go down for having paid it eleven times. The patrol may stop me on Broad Street after nine and ask what business a free man has walking. Understand what that means: my freedom is a document, it expires, and I rent it annually from the people who would otherwise own me.",
          useful: true,
        },
        kept: {
          text: "The chair. It is mine outright, which is more than most men in this city can say of anything, and it is the reason I am still here.",
        },
        say: {
          text: "In this shop, a good deal. On Broad Street after nine, nothing at all. The difference between those two is the whole of what the word free means here.",
        },
      },
    },
  ],
  requires: { useful: 7, label: "Accounts secured" },
  lockedNote:
    "Everyone in this city is holding one thing the requisition has no line for. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: people who write something down, and people something is written down about. Reading what you actually collected — what does this government's paperwork record?",
    skillCategory: "Comparison",
    options: [
      {
        id: "transaction",
        text: "A transaction between the state and an owner, in which the person taken is the unit being counted",
        correct: true,
        why: "Right, and the clerk showed you the mechanism without meaning to. The hire is paid monthly to the owner. The compensation for a death is paid to the owner, on a value sworn at delivery, and not otherwise. There is no field for a name because a name is not a term of the contract — and he answered that quickly enough to notice he had. Everything you now know about who these people are came from standing in front of them: a man counting boats, a woman keeping night wages in a place she will not name, a barber who rents his freedom by the year.",
      },
      {
        id: "suffering",
        text: "The suffering of a city under siege",
        correct: false,
        why: "There is plenty of it and it is not what this paperwork records. Read what you actually collected: a form with quotas and sworn values, a pass listing streets and hours, register papers renewed annually for a fee. These are instruments of administration, and they were being drawn up with the same care in 1862 when the city was full and fed. Suffering is the context. The document is a system.",
      },
      {
        id: "collapse",
        text: "A government losing control of its own economy",
        correct: false,
        why: "Half true and pointed the wrong way. The currency is failing — the grocer's board is the proof and he left the old figures up so you could see it. But this requisition is a central state successfully reaching past its own founding principle to seize property from furious owners, five hundred at a time, and getting them delivered. The private at the gate is the only evidence you found of the machinery slipping, and he is one man with a bad leg.",
      },
      {
        id: "breaking",
        text: "That slavery was already breaking down under the pressure of the war",
        correct: false,
        why: "The strain is real and you documented it — a seamstress keeping wages nobody thought to ask about, a labourer counting boats and knowing what the guns mean, a trade that has stopped selling and started renting because the river is shut. But this record is the opposite motion. A government founded on property in people has built a machine to take that property from its owners and put it to work, and the owners' objection is answered by an enrolling officer. What broke slavery in this city was the people you interviewed and an army coming up the river, not the filing giving way.",
      },
    ],
  },
};

// ---- M5.B — "Three Sorts of Men" (ASSEMBLY, richmond-tredegar-payroll) ---------------------------
//
// Boyle says it standing at the gate: three sorts of men on the books, all at the same furnace, and
// the payroll lists them together, "which is the only place in Virginia we are set down as equals."
// The mission is to test that sentence, which is generous and not quite true, and to find the two
// places where the page equalises and the one where it does not.
//
// Board two carries the deeper finding and its two distractors are both things a reader brings with
// them. The first is that the enslaved men are the unskilled ones — Tredegar's hired workers included
// skilled puddlers, rollers and moulders, and the works could not have run without them. The second
// is that this is a wartime expedient: Joseph Anderson had been hiring enslaved ironworkers since the
// 1840s and used them against his white mechanics when they struck over it in 1847, fourteen years
// before the war. What the war added is the third class, not the second.
const THREE_SORTS_OF_MEN = {
  kind: "assembly",
  id: "case-013-assembly-three-sorts-of-men",
  title: "Three Sorts of Men",
  variant: "Reconstruct a Payroll",
  missionQuestion:
    "Three classes of men stand at one furnace and the payroll lists them together. Follow the money in each column: who earns it, whose hand does it reach, and what does the page equalise that the yard does not?",
  thinkingMove:
    "Following money through a document rather than reading its labels. Who is named and who is paid are two different columns, and the gap between them is the argument.",
  briefing: {
    speaker: "tredegar-ironworker",
    line: "The roll is on the gate. Three sorts of men and we all stand at the same furnace — mechanics on wages, men hired by the year with the money going to their owners, and men the Bureau sent who are paid nothing and cannot walk out. It lists the three of us together, which I have always thought was the only place in Virginia we are set down as equals. Work it through and tell me whether I have been kidding myself.",
  },
  debrief: {
    speaker: "slave-trade-clerk",
    line: "We do not sell people to the Confederacy any more. We rent them to it. It is the same ledger and I rule the same columns, and the commission is two and a half per centum either way.",
    established:
      "The page equalises exactly two things and they are real: the work and the rations. Three classes of men do the same job at the same furnace and eat the same food, and the company's own accountant has set them on one sheet in one hand because for the purpose of getting guns made that is what they were. What it does not equalise is where the money lands and whether a man may leave — and the second of those is not in a column at all. It is a line at the bottom about passes.",
    remains:
      "Sixty-three names in the second class and thirty-one in the third, and the roll gives you the owner and the county for the second and only a requisition number for the third. What any of those ninety-four men thought about standing at that furnace is not on the page, and the only ones you can ask are the ones still in this city.",
  },
  arcClose: {
    speaker: "tredegar-ironworker",
    line: "A requisition, this roll, and the board in the market. I am on one of them by name and the other two are about me anyway.",
    established: RICHMOND_ARC,
  },
  openQuestions: [
    "What the men in the second class knew about their own hire. Some were told the figure and some were not, and where an enslaved worker negotiated overwork pay directly with the company the arrangement is rarely written down.",
    "How much of Tredegar's output the third class made possible. The works' own correspondence argues constantly for more impressed hands, which tells you the labour mattered and not how much of the iron it accounts for.",
  ],
  codexFiling: {
    summary:
      "Three classes at one furnace: paid to themselves, paid to an owner, paid nothing. The page equalises the work and the rations, and the line about passes is where it stops.",
    tags: ["Who does the work", "What a paper permits", "Counting people"],
    seeAlso: ["case-010-discrepancy-the-bell-and-the-book"],
  },
  historicalRecord: {
    documented: [
      "Tredegar Iron Works, the largest ironworks in the South, which cast roughly half of all Confederate-manufactured artillery — on the order of eleven hundred guns.",
      "Joseph R. Anderson's purchase and hiring of enslaved ironworkers from the 1840s, and their use against his white mechanics, who struck over it in 1847 and lost.",
      "Skilled enslaved puddlers, rollers and moulders at Tredegar, without whom the works could not have operated.",
      "Roughly half the wartime workforce being Black, hired by the year or delivered under Engineer Bureau requisition.",
      "Payment of part of a white mechanic's wage in flour and meal at government rates, a response to the depreciation of Confederate currency rather than a benefit.",
      "Hiring by the year with the wage settled on the owner, the ordinary condition of enslaved industrial labour in Virginia.",
      "Pass requirements restricting hired and impressed hands from leaving the works' yard.",
    ],
    reconstructed: [
      "The pay roll you are rebuilding. It is a composite modelled on the form of Tredegar's wartime rolls, not a transcription of a surviving document — its own citation says so.",
      "D. Boyle, and the particular counts in each of the three classes.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a roll posted at a gate in 1864.",
    ],
    debated: [
      "How much bargaining power skilled enslaved industrial workers actually held. Overwork payments, negotiated tasks and the constant threat of being sold all appear in the records, and historians read the balance between them differently.",
    ],
  },
  intro:
    "Three classes of men, one furnace, one sheet of paper. Sort the columns by where the money actually lands, then say what this page makes equal and what it quietly does not.",
  howItWorks: {
    steps: [
      "Click a piece in the tray, then the column you think it belongs in. Dragging works too.",
      "Two of the pieces belong in no column. Both are things that look like the third class and are not.",
      "Finish the columns and a second board opens: what this page equalises, and what it does not.",
    ],
    note: "Read the roll for who the money is paid to rather than for who earned it. Those are different columns on this sheet and that is the whole design of it.",
  },
  terms: [
    {
      term: "puddler",
      definition:
        "A skilled ironworker who stirs molten pig iron to burn off carbon. It is furnace work at the top of the trade, learned over years, and the second and third classes on this roll contain men who can do it.",
    },
    {
      term: "hired by the year",
      definition:
        "An enslaved person rented to an employer for a twelve-month term, the wage settled on the owner — quarterly, on the owner's order. The man works in Richmond; the money goes to a county a hundred miles off.",
    },
    {
      term: "requisition",
      definition:
        "The Engineer Bureau's order taking men from their owners for a fixed term of public work. The owner is paid; the man is not.",
    },
    {
      term: "wages in kind",
      definition:
        "Part of a wage paid in goods rather than money — here, flour and meal at government rates. It is evidence about the currency, not about generosity.",
    },
  ],
  boards: [
    {
      id: "columns",
      kind: "label",
      // Short labels on purpose. A fragment renders as a pill in a tray, and the argument goes in
      // `misread`, which has a paragraph to make it in.
      label: "Who earns it, and whose hand it reaches",
      note: "Three columns off the roll, sorted by where the money lands rather than by who did the work. Two of the pieces in the tray belong in no column at all — decide which, and be ready to say what made them look like they fitted.",
      slots: [
        { id: "wages", label: "Paid a wage, drawn by the man who earned it" },
        { id: "hire", label: "Paid a wage, drawn by somebody else" },
        { id: "nothing", label: "Paid nothing, and may not leave" },
      ],
      fragments: [
        {
          id: "mechanic",
          label: "A puddler on the company's books, free, half his wage in flour and meal",
          belongs: "wages",
          misread:
            "Class First, and worth reading past the word free. He draws his own wage and half of it arrives as flour and meal at government rates, charged against his month's account — which is not the company being kind. Confederate paper was depreciating fast enough that food was the more reliable payment, and a man taking half his wage in meal is telling you what the currency is worth.",
        },
        {
          id: "hired",
          label: "A man hired by the year, the owner and county set against his name",
          belongs: "hire",
          misread:
            "Class Second, and the largest of the three — sixty-three names. The work is done in Richmond and the hire is settled quarterly on an owner's order, often in a county a hundred miles away. This is the ordinary condition of enslaved industrial labour in Virginia rather than a wartime measure, and the roll's own bookkeeping states it: the hire is payable to the owner and not to the hand.",
        },
        {
          id: "impressed",
          label: "A man delivered under the Engineer Bureau's requisition",
          belongs: "nothing",
          misread:
            "Class Third, and the one the war made. No wages payable at these works — the government pays his owner under the requisition, and the roll says so by saying nothing at all in the money column. Thirty-one names, entered by term of service rather than by rate, and none of them can leave the yard.",
        },
        {
          id: "apprentice",
          label: "An apprentice, unpaid until he is out of his time",
          belongs: null,
          hints: [
            "He is unpaid and he cannot simply walk out either. Ask what else is true of him that is not true of the third column.",
            "His term ends on a date he knows. Does anything else on this board?",
          ],
          misread:
            "An apprentice is unpaid and bound, and there the resemblance stops. His term ends on a date he knows, at the end of it he holds a trade and his own labour, and it was entered into by his family on his behalf. Not one of those three is true of Class Third — whose term was sixty days in March and it is August. The comparison is the one every reader reaches for, and testing it is more useful than avoiding it.",
        },
        {
          id: "substitute",
          label: "A conscript who has paid another man to serve in his place",
          belongs: null,
          hints: [
            "Substitution is real and it is on this map. Ask which document it belongs to.",
            "This is about the army rather than the ironworks. Nothing on this roll is a soldier.",
          ],
          misread:
            "Substitution is real, legal, and advertised in this city — there is a notice for it on the market board. It belongs to conscription rather than to this payroll, and it is worth holding beside the third column for one reason: a man with money could buy his way out of the army, and no man in Class Third could buy his way off this gate. That is the same economy answering two people very differently.",
        },
      ],
    },
    {
      id: "equal",
      kind: "label",
      label: "What the page equalises",
      note: "Boyle says this roll is the only place in Virginia the three of them are set down as equals. Test it. Two of the pieces here are assumptions a reader brings with them rather than anything this document supports.",
      opensAfter: "columns",
      slots: [
        { id: "same", label: "Genuinely the same for all three classes" },
        { id: "looks-same", label: "The same on the page, and not the same in fact" },
        { id: "absent", label: "Not in any column — you have to read the last line for it" },
      ],
      fragments: [
        {
          id: "rations",
          label: "Rations issued at the works to all three classes alike",
          belongs: "same",
          hints: [
            "Find the phrase on the roll that says the same thing about all three at once.",
            "It is the only sentence on the sheet that uses the word alike.",
          ],
          misread:
            "The roll says it in one word — alike — and it is the strongest evidence for Boyle's sentence. Three classes of men eat the same food at the same works because the company needs all three of them at the furnace. It is worth sitting with rather than dismissing: a document that treats men as one workforce for the purpose of feeding them is telling you something true about what the work was.",
        },
        {
          id: "furnace",
          label: "The work itself, and the skill it takes",
          belongs: "looks-same",
          hints: [
            "The work is genuinely identical. Ask whether the page shows you that, or whether you know it from somewhere else.",
            "Class First is headed 'mechanics and skilled hands'. What are the other two headed?",
          ],
          misread:
            "The work is identical — that is Boyle's whole point and he is standing at the furnace when he makes it. What the page does is name only the first class as skilled hands and enter the other two by owner and by requisition, so a reader who trusts the headings comes away believing the skill sits in Class First. It does not. This is a document producing a false impression through its column headings while every figure in it is accurate.",
        },
        {
          id: "leaving",
          label: "Whether a man may walk off the job",
          belongs: "absent",
          hints: [
            "This is the largest difference between the three classes. Which column is it in?",
            "It is not in a column. Read the last sentence on the roll.",
          ],
          misread:
            "It is in no column at all — it is one line under the accounts, about passes, and it is the whole difference between the three classes. A payroll is a document about money, so the thing that most separates these men had to be added as a note. When a record's most consequential fact is a postscript, that is a fact about the record's purpose rather than about the fact.",
        },
        {
          id: "unskilled",
          label: "That the second and third classes are unskilled labour",
          belongs: null,
          hints: [
            "Before you place this, ask what this works actually makes and who has to be able to make it.",
            "The ironworks cast roughly half the Confederacy's artillery. Who is stirring the furnaces?",
          ],
          misread:
            "Tredegar's hired and impressed hands included skilled puddlers, rollers and moulders, and the works could not have operated without them — which is why the company argued so hard for more of them and fought to keep its hired men off the impressment lists. Assuming the enslaved man is the labourer and the free man is the craftsman is a guess, and it is the guess the roll's own headings are set up to encourage.",
        },
        {
          id: "wartime",
          label: "That this arrangement is something the war produced",
          belongs: null,
          hints: [
            "One of the three classes is new. Are the other two?",
            "Ask when this works started hiring enslaved ironworkers — and what happened when its white mechanics objected.",
          ],
          misread:
            "The third class is what the war produced. The second is not: Joseph Anderson had been buying and hiring enslaved ironworkers since the 1840s, in part deliberately, to weaken his white mechanics' bargaining position — they struck over it in 1847 and lost, fourteen years before the war. Reading the whole sheet as an emergency lets the ordinary arrangement underneath it disappear, and the ordinary arrangement is the bigger fact.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "The columns are sorted and the page is tested. Your reading goes into the record — what does this pay roll prove that no speech in this city could?",
    skillCategory: "Economic Systems",
    options: [
      {
        id: "one-workforce",
        text: "That the Confederate war economy ran on one workforce paid three different ways, and its own accountant wrote it down that way",
        correct: true,
        why: "Right, and the force of it is that nobody was arguing. This is a pay clerk doing his job: three classes on one sheet in one hand, rations alike, because for the purpose of getting guns made that is what they were. A speech would be an opinion about the war economy. This is the war economy's own bookkeeping, kept by somebody with no interest in what a Chronicler would make of it — which is exactly why it can carry a claim that no speech could.",
      },
      {
        id: "equals",
        text: "That the three classes were treated as equals at this works",
        correct: false,
        why: "Boyle asked you to test that and you did. Two things are genuinely equal — the work and the rations — and both matter. But the money column separates them completely, the headings credit the skill to one class only, and the line about passes at the bottom means two of the three men cannot leave the yard. A document that equalises what a company needs equalised is not a document about equality.",
      },
      {
        id: "desperate",
        text: "That the South was desperate enough by 1864 to put enslaved men in a factory",
        correct: false,
        why: "You placed the piece that refuses this and it is the most important correction on the board. Class Second is not a wartime measure — Anderson had been hiring enslaved ironworkers since the 1840s and used them to break his white mechanics' strike in 1847. Industrial slavery in Virginia is ordinary, not an emergency, and reading it as desperation makes the fourteen years before the war disappear.",
      },
      {
        id: "wages",
        text: "That wages at Tredegar were failing to keep up with prices",
        correct: false,
        why: "True, and it is one detail rather than the finding. Half a mechanic's wage arrives as flour and meal, which tells you what Confederate paper was worth — and you can read the rest of that story off the grocer's board in the market. It is Class First's problem. The other ninety-four men on this sheet have a different one, and it is not a wage that has fallen behind.",
      },
    ],
  },
};

// ---- M5.C — "Two Hundred and Fifty Dollars" (DISCREPANCY, richmond-price-board) ------------------
//
// The audit that decides whether a student has understood the single most common mistake made about
// this economy. The flour line reads 40 — 125 — 250 and every reader's first thought is that flour
// became six times harder to get. Most of that movement is the currency. A price is a ratio and
// either side of it can move, and deciding which requires a price in something that is not
// Confederate paper — which this board does not give you.
//
// The coffee line is why the mission works. "COFFEE — none" is a supply fact with no currency in it
// at all, sitting on the same board, which is what makes the flour line arguable rather than simply
// wrong. An audit that found everything false would teach a student to distrust documents; this one
// has two lines its evidence supports outright and one it cannot settle either way.
//
// The evidence column is a transcript of what this player asked, because Richmond has an interview
// and the price board is gated behind it. Seven entries key off the seven useful answers the
// interview requires, so an audit reached by the normal route is always workable; two more key off
// flat answers nobody has to ask for, which is what keeps the cause and effect real.
const TWO_HUNDRED_AND_FIFTY_DOLLARS = {
  kind: "discrepancy",
  id: "case-013-discrepancy-two-hundred-and-fifty-dollars",
  title: "Two Hundred and Fifty Dollars",
  variant: "One Board Against What You Gathered",
  missionQuestion:
    "Flour went from forty dollars a barrel to two hundred and fifty. Did flour get scarce, or did money get weak — and what would you need to know to say?",
  thinkingMove:
    "Reading a price as a ratio. A number that moved tells you something moved; which side of the ratio it was is a separate question and usually the interesting one.",
  briefing: {
    speaker: "richmond-shopkeeper",
    line: "I stopped rubbing out the old figures a year ago. Forty, a hundred and twenty-five, two hundred and fifty, all three standing on the same line where anybody can see them. Read the whole board and the papers pasted beside it, because the other three went up the same week and they are not four separate pieces of news.",
  },
  debrief: {
    speaker: "richmond-relief-society-woman",
    line: "So you have read the board the way we read it. The four notices are one notice, and the last one is a list of men who did the arithmetic before you did.",
    established:
      "Most of the movement in that flour line is the currency and not the flour, and the board proves it against itself: coffee has no price at all, because coffee is a supply problem and the blockade settled it. A price is a ratio and this board shows one side of it. The other three notices are the consequences — a relief distribution administered by certificate, a legal market in getting out of the army, and a list of men who went home to families that could not eat.",
    remains:
      "How much of the flour line is flour. To separate them you would need a price in something that is not Confederate paper — gold, or barter, or a wage in the same money moving at the same time — and nothing chalked or pasted on this board gives you one.",
  },
  // Richmond's one anomaly, and a map gets exactly one (Phase 77, decision log `0060`). Archival
  // rather than fantastical, and deliberately not a third correction in a strange hand: what is
  // wrong with this notice is a subtraction. Every innocent explanation is available — a family
  // paying, a clerk amending, a man come back — and each of them would have left the erasure
  // showing or the endorsement corrected.
  anomaly: {
    noticed:
      "One name has come off the desertion list. Not struck through and not chalked over — washed out of the paste-up, with the names below it moved up to close the gap, so the paper is clean where it was. The provost's endorsement beneath the list certifies twenty-two names. There are twenty-one.",
    note: "A family paying to have a name taken down, a clerk correcting an entry made in error, a man come back to his command: any of the three would account for a name leaving a list, and any of the three would have left the strike showing or the endorsement amended. Somebody closed the gap and did not think about the count underneath it, which is what a person does when they are removing a name rather than correcting a record. File the record as it stands and flag the notice. Whatever else is true, this board is now the only place that name was ever written.",
  },
  arcClose: {
    speaker: "richmond-relief-society-woman",
    line: "A requisition, a pay roll and a price board. Three sheets of paper about this whole city, and between them they do not name one person who is not either owed money or absent without leave.",
    established: RICHMOND_ARC,
  },
  openQuestions: [
    "What a substitute actually cost in 1864. The advertisement says only that the arrangement is advantageous, and the surviving figures are scattered and inflating too fast to compare month to month.",
    "How many of the men on that list went home for hunger as against for anything else. The provost's paperwork records the absence and never the reason, and letters home from soldiers' families say what the army's records cannot.",
  ],
  codexFiling: {
    summary:
      "Flour at forty, then a hundred and twenty-five, then two hundred and fifty — mostly the currency, and the coffee line on the same board proves the distinction. The other three notices are what followed.",
    tags: ["Written to persuade", "What a price records", "Whose account is this"],
    seeAlso: ["case-010-trace-under-ten-dollars"],
  },
  historicalRecord: {
    documented: [
      "The depreciation of the Confederate dollar to a small fraction of its 1861 value, which accounts for most of the nominal rise in Richmond prices.",
      "Richmond's population roughly tripling during the war, and a food supply arriving over a rail network being taken apart by the fighting.",
      "The blockade's effect on imported goods, coffee among the first to disappear entirely.",
      "The Richmond bread riot of 2 April 1863, in which several hundred women — led by Mary Jackson, a huckster in this market — marched on the shops and took bread, and Jefferson Davis addressed the crowd himself.",
      "The free markets and ladies' relief committees that followed, distributing to soldiers' families on a ward visitor's certificate.",
      "The Confederate conscription acts' exemption and substitution provisions, and the phrase 'a rich man's war and a poor man's fight' they produced.",
      "Rising desertion in the Confederate armies from 1863, and the correspondence from soldiers' families that is its clearest documented cause.",
    ],
    reconstructed: [
      "The board and the three notices beside it, a composite modelled on the market reports and posted notices of Richmond's wartime newspapers — its own citation says so.",
      "The particular figures on the flour and bacon lines, and the twenty-one names.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a market board in August 1864 — including the washed-out name the record flag describes.",
    ],
    debated: [
      "How far the bread riot and the relief committees represent organised political action by poor white women as against spontaneous hunger. The best recent work argues strongly for the first and the sources are read both ways.",
    ],
  },
  intro:
    "Three figures on one line, and the grocer left the old two standing so you could see them move. Read the whole board — the prices and the three papers pasted beside them — against what this city told you.",
  howItWorks: {
    steps: [
      "Read the board first. All of it — the lines below are lifted straight off it.",
      "For each line, say what your evidence does to it: supports it, complicates it, contradicts it, or is not enough to settle it. Two of these your evidence backs outright.",
      "Land on complicated or contradicted and a second question opens: why does it differ? A figure can be wrong, and it can be exactly right about the wrong thing.",
    ],
    note: "The right-hand column holds only what you added to your Field Notebook at the requisition. Where it says you did not gather something, that is a line of this board you have no way to read.",
  },
  terms: [
    {
      term: "depreciation",
      definition:
        "Money losing value against goods. When it happens fast, every price rises at once — which is what a board with three figures on one line is showing you.",
    },
    {
      term: "the free market",
      definition:
        "A relief distribution rather than a market: food given to soldiers' families on a ward visitor's certificate, by a committee of women, while the supply lasts.",
    },
    {
      term: "substitute",
      definition:
        "A man paid to serve in a conscript's place, which the conscription acts permitted. What it cost decided who could use it, and that is the part the advertisement does not print.",
    },
    {
      term: "Complicated by the evidence",
      definition:
        "The line is not wrong, and it is not the whole of it. What you gathered adds something the line leaves out — often what the line is for.",
    },
    {
      term: "Not enough evidence",
      definition:
        "Nothing you gathered settles it either way. This is a finding, not a failure — say so rather than guessing.",
    },
  ],
  record: {
    label: "The Second Market Price Board",
    attribution: "Chalked and posted in the same week, Richmond, August 1864",
    context:
      "A grocer's board at one of Richmond's public markets, with the week's notices pasted beside it. The grocer chalks twice a day and has stopped wiping the old figures off, so each line carries its own history: the 1861 price, the January price, and today's. The three papers next to it went up the same week and were put there by three different hands — a committee of women, somebody who wants out of the army, and the provost marshal. The city they were posted in has roughly tripled in population, is fed over a railway network the fighting is dismantling, and pays for everything in a currency that is failing.",
    text: [
      "“[chalked, three figures to a line, the two older ones left standing] FLOUR, the barrel — 40 — 125 — 250. BACON, the pound — 1.25 — 6 — 11. SALT, the pound — 1.50. WOOD, the cord — 30. COFFEE — none.",
      "[pasted] FREE MARKET. The ladies' committee will distribute on Wednesday morning to the families of soldiers in the service, upon the certificate of the ward visitor, while the supply holds out.",
      "[pasted] A SUBSTITUTE WANTED. A sound man not liable to conscription may hear of an advantageous arrangement by applying within.",
      "[pasted] ABSENT WITHOUT LEAVE. The following men of this city have failed to report to their commands and are to be arrested wherever found, the reward as by the regulation: [twenty-one names].”",
    ],
  },
  verdictPrompt:
    "For each line, decide what the evidence you gathered at the requisition actually does to it.",
  verdicts: [
    { id: "supported", label: "Supported by the evidence" },
    { id: "complicated", label: "Complicated by the evidence" },
    { id: "contradicted", label: "Contradicted by the evidence" },
    { id: "cannot-tell", label: "Not enough evidence" },
  ],
  gapRequiredFor: ["contradicted", "complicated"],
  // The same five reasons the other three audits use, with Canal Crossroads' cleaner ids. A student
  // who learned this vocabulary at a chart table is not relearning it in a market.
  gapKinds: [
    { id: "mistake", label: "Mistake" },
    { id: "perspective", label: "Different perspective" },
    { id: "design", label: "Deliberate framing" },
    { id: "incomplete", label: "Incomplete information" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  gapPrompt: "Why does the board differ from what you gathered?",
  lockedNote: "Settle every line of the board before you file.",
  claims: [
    {
      id: "flour",
      text: "FLOUR, the barrel — 40 — 125 — 250. Read straight down, the line says flour has become six times harder to come by.",
      verdict: "contradicted",
      gap: "incomplete",
      why: "The figures are exact and the reading is wrong, and the grocer told you why without using the word. His customers are not poorer than they were — the money is. A price is a ratio between a good and a currency, and either side of it can move; here the currency is failing fast enough that almost every number on this board would have risen with no change in supply at all. What the board cannot do is show you which side moved, because every figure on it is in the same failing money. That is incomplete information rather than a mistake: nobody chalked anything untrue.",
    },
    {
      id: "coffee",
      text: "COFFEE — none.",
      verdict: "supported",
      gap: null,
      why: "This line has no currency in it at all, and that is why it is the most useful thing on the board. Coffee is imported, the blockade stopped it, and there is no price because there is nothing to price — no amount of money buys it. A board carrying a currency problem and a supply problem side by side is telling you the two are different, which is exactly what makes the flour line arguable and this line not. Keep this one: it is the control.",
    },
    {
      id: "free-market",
      text: "FREE MARKET. The ladies' committee will distribute on Wednesday morning to the families of soldiers in the service, upon the certificate of the ward visitor, while the supply holds out.",
      verdict: "complicated",
      gap: "design",
      why: "Entirely true and doing more than it says. Read the conditions rather than the offer: families of soldiers in the service, on a ward visitor's certificate, while the supply lasts. Relief administered by certificate is relief that can be withheld, and the qualifying condition is a household's relationship to the war rather than its hunger. Nor is it spontaneous. Free markets in this form exist partly because several hundred women marched on the shops of this city in April 1863 and took bread, and the President came out and spoke to the crowd. The organiser told you what it is worth now: four hundred came and there was bread for two hundred.",
    },
    {
      id: "substitute",
      text: "A SUBSTITUTE WANTED. A sound man not liable to conscription may hear of an advantageous arrangement by applying within.",
      verdict: "cannot-tell",
      gap: null,
      why: "The practice is real, legal and advertised without embarrassment, and what this notice will not tell you is the only thing that decides who it is for: what the arrangement costs. Nothing you gathered gives you a figure, and prices in this currency cannot be compared month to month anyway. That exemption and substitution favoured the wealthy is documented at length elsewhere; this notice on its own establishes that a market in getting out of the army existed and could be advertised on a public board. Saying exactly that, and no more, is the finding.",
    },
    {
      id: "deserters",
      text: "ABSENT WITHOUT LEAVE. The following men of this city have failed to report to their commands and are to be arrested wherever found.",
      verdict: "complicated",
      gap: "perspective",
      why: "The men are absent and the list is accurate; the provost has no reason to invent names. What a provost's notice cannot say is why, and the answer is three notices up the same board. Rising desertion in these years tracks the letters soldiers were getting from home more closely than it tracks anything on a battlefield, and at two hundred and fifty dollars a barrel a family on a private's pay could not eat. The army calls that desertion. A wife holding a ward visitor's certificate and no supply calls it something else. Both descriptions fit the same act, which is what makes this position rather than fact.",
    },
  ],
  observed: [
    {
      id: "chalk",
      text: "“My customers are not poorer than they were. The money is.” The old figures are left standing under the new ones on purpose.",
      from: "Amos Deane, grocer",
      requires: "asked:richmond-shopkeeper:kept",
    },
    {
      id: "requisition",
      text: "The Bureau's form pays the hire to the owner monthly, compensates the owner on a sworn value if a hand dies, and has no line for a name.",
      from: "Josiah Ruffin, Engineer Bureau",
      requires: "asked:confederate-official:written",
    },
    {
      id: "relief",
      text: "Four hundred came to the door last week and there was bread for two hundred. The fund buys whatever the speculators have left by the time it reaches the committee.",
      from: "Sarah Whitlock, relief society",
      requires: "asked:richmond-relief-society-woman:say",
    },
    {
      id: "passes",
      text: "Every pass at the gate is in order and half the men carrying them are going somewhere they have no business going, and the guard lets them by. He has not been paid since the summer.",
      from: "Tom Sackett, provost guard",
      requires: "asked:confederate-private:say",
    },
    {
      id: "register",
      text: "A free man's papers are renewed and paid for every year, and the fee does not fall for having paid it eleven times. Freedom in this city is a document that expires.",
      from: "Wilson Carter, barber",
      requires: "asked:richmond-free-black-barber:written",
    },
    {
      id: "night-work",
      text: "The wages for her week at the Bureau are paid to the woman who owns her. What is hers is the sewing she does after dark, because nobody has thought to ask whether she does any.",
      from: "Charlotte Vaughan, seamstress",
      requires: "asked:richmond-seamstress:kept",
    },
    {
      id: "boats",
      text: "Sixty days, the order said, and it is August. He counts the boats going west and how heavy they ride, and the guns to the east are nearer than they were in June.",
      from: "Peter Gowrie, impressed labourer",
      requires: "asked:richmond-dock-laborer:after",
    },
    // The two below key off flat answers nobody is required to ask for. A thorough player audits this
    // board holding two things a hurried one does not, and the column says so either way.
    {
      id: "crowd",
      text: "“There was a crowd in this market in '63 and the President came out to it, and people remember.”",
      from: "Amos Deane, grocer",
      requires: "asked:richmond-shopkeeper:say",
    },
    {
      id: "muster",
      text: "A provost private's own name is on a muster roll that has not been paid since the summer, and he says it is worth less than the paper.",
      from: "Tom Sackett, provost guard",
      requires: "asked:confederate-private:written",
    },
  ],
  closer: {
    prompt: "Your reading goes into the record. What should it say this board is evidence of?",
    skillCategory: "Causation",
    options: [
      {
        id: "currency",
        text: "A currency failing, and the three things a city does about it",
        correct: true,
        why: "Right, and you proved it off the board rather than assuming it. The coffee line is the control: no price at all, because that is a supply problem the blockade settled, and it sits on the same sheet as a flour line that has moved six times in a currency losing value all the way down. Then read the other three as consequences rather than as news — relief given by certificate, a legal market in leaving the army, and a list of men who went home. Four notices, one week, one cause.",
      },
      {
        id: "scarcity",
        text: "That Richmond was running out of food",
        correct: false,
        why: "It was short of food and that is not what these figures measure. You marked the flour line contradicted for exactly this reason: every number on the board is in the same failing money, so it cannot separate a scarce good from a weak dollar — and the one line that is purely about supply, coffee, does not carry a price at all. To make the scarcity argument you would need a price in something other than Confederate paper, and nothing here gives you one.",
      },
      {
        id: "morale",
        text: "That the city's will to fight was collapsing",
        correct: false,
        why: "There is a desertion list on the board, so it is a fair thing to reach for. But you marked that line complicated rather than settled, and the reason was the notice three up: men went home to families that could not eat at these prices. That is an arithmetic problem before it is a morale one, and reading it as a failure of will skips the cause the same board is printing directly above it.",
      },
      {
        id: "speculation",
        text: "That speculators were driving prices up",
        correct: false,
        why: "Contemporaries said it constantly, the relief organiser said it to you, and it is the period's own favourite explanation — which is a reason to test it rather than to adopt it. Speculation moves particular goods at particular moments; it does not move flour, bacon, salt and wood all at once and in the same proportion, and it cannot explain a line with no price on it at all. What does explain all of that is on the other side of every ratio on this board.",
      },
    ],
  },
};

export const UNIT_05_ACTIVITIES = {
  "richmond-impressment-order": WHAT_THE_GOVERNMENT_WRITES_DOWN,
  "richmond-tredegar-payroll": THREE_SORTS_OF_MEN,
  "richmond-price-board": TWO_HUNDRED_AND_FIFTY_DOLLARS,
};
