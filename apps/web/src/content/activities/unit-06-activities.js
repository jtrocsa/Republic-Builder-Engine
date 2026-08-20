// Case 6.01's three activities, keyed by the source id each one opens from.
//
// Cottonwood Junction runs slate C — INTERVIEW, ASSEMBLY, TRACE — which is Philadelphia's slate
// three units later, and legal for the same reason Richmond's repeat of the Caribbean's was: the
// engine list is not the axis. `THE-MAP-PROGRAM.md` §2's right-hand column is, and this unit's
// interview asks **who is entitled to be here, and on whose paper**. Riverbend asks how one
// arrangement looks from eight positions inside it, Philadelphia what a public position is made of,
// Richmond what testimony costs when the government is writing it down. None of those is this.
//
// **The three records are one transaction seen from three desks**, which the map program fixed
// before the map existed. A survey turns a sentence in a treaty into a line on the ground. A receipt
// sells a hundred and sixty acres of what that line describes. A pay sheet prices the labour that
// puts rails across it. Every one of the three is lawful, competent and reviewable, and the finding
// is that not one of them required anybody to decide anything.
//
// **The register rule from Unit 5 binds every word about Joseph Kahegah and Willow Pahonka**, and
// it is stricter here than anywhere. They are named, they speak first, they say what is being done
// to them and what they intend, and neither is explained by anybody else on this map. They are in
// the middle of being removed rather than already gone. Nobody outside the village narrates them.
//
// The chain is gated: `railhead-survey-field-book` requires `railhead-land-office-receipt`, because
// the trace's third leg is the land office selling from a plat and the receipt is what a player
// reads that leg with. Same shape as Riverbend's letter, Canal Crossroads' time book and Richmond's
// price board — and it decides which mission can be last, which is what `arcClose` is authored
// against: the receipt can never be the ending, so the payroll and the survey both carry one.
//
// **Two of this interview's eight speakers stand indoors**, which is new. Elias Fenn and Ezra Holt
// are in the land office, and that costs a player nothing they were not already paying: the receipt
// itself is anchored to Fenn, so the door has to be opened before the interview exists at all.
// `fieldNpcById()` resolves across every surface of the map, which is why a briefing may name them;
// `tests/unit/activity-content.test.js` was reading the outdoor roster alone and was widened to
// match the runtime in this phase, rather than have the content bend to a narrower test.

// What Cottonwood Junction's three records turn out to be about, said once. Same const-rather-than-
// three-copies reason as Units 3 and 5.
const RAILHEAD_ARC =
  "Cottonwood Junction's three records are one transaction seen from three desks, and not one of the three desks is where it was decided. A survey turns a sentence in a treaty into a line a man can stand on, finds the line already somewhere else, and can do nothing about it but report both. A receipt sells a hundred and sixty acres of the ground that line describes, for cash, to the highest bidder, and credits the money to a people who are a hundred and sixty miles south of it before the patent issues. A pay sheet prices the labour that puts rails across it at a dollar seventy-five a day and hands a man sixteen dollars and forty-seven cents in a paper he cannot spend. Every step is lawful, competent and reviewable, and every one of them was performed by somebody whose office ended before the question did. The only reason you can say the names Willow Pahonka and Joseph Kahegah at all is that you went and asked.";

// ---- M6.A — "On Whose Paper" (INTERVIEW, railhead-land-office-receipt) ---------------------------
//
// The receipt is a slip saying a hundred and sixty acres have been paid for and that the money is to
// be credited to the tribe whose reserve it was. Both halves are true. The tribe left the agency on
// the fourth of June and the auction is advertised for ground they are walking off. Nothing on the
// slip is false and nothing on it is a decision, which is why the mission cannot be played inside
// the land office and is not meant to be.
//
// Eight speakers, four questions, exactly eight useful answers — one per person, which is also the
// bar (0052 §3: one number, not two). Two useful answers per question, so no question is dead. Every
// speaker answers three of four, so everybody has a question that fires their `fallback`.
const ON_WHOSE_PAPER = {
  kind: "interview",
  id: "case-016-interview-on-whose-paper",
  title: "On Whose Paper",
  variant: "Ask Who the Paper Is For",
  missionQuestion:
    "One slip sells a hundred and sixty acres and credits the money to a people who are leaving under compulsion as it is signed — so what entitles anyone here to be standing on this ground, and whose paper says so?",
  thinkingMove:
    "Reading a document against the people it is about. A form records a transaction between two parties, and the fastest way to find the third one is to go and stand in front of them.",
  briefing: {
    speaker: "land-office-register",
    line: "Receipt number fourteen twelve. Take it — the purchaser has his copy and this is the office's, and it is the only evidence of title anybody has until the patent is delivered. I will answer anything you ask about how it was written, because I wrote it. What I cannot tell you is one word about the account the money is credited to, and I have already said I would rather you took that as a limit than as an excuse. So put your questions to the whole town rather than the half of it that keeps records.",
  },
  debrief: {
    speaker: "kanza-woman",
    line: "You wrote it as I said it. Willow Pahonka. Now it is in two places instead of one, and only one of them is a government's.",
    established:
      "The receipt records a real transaction, correctly. Somebody paid cash at public auction for a hundred and sixty acres under the act of 8 May 1872, the receiver wrote the slip, and the proceeds less expenses go to the credit of the Kansas tribe in the Treasury. That clause is not a lie and the register is not a liar. What the form has no field for is where the credited party is on the day of the sale, whether anybody acting for them was present, or what they said about it — and every one of those is answerable, because eight people in this town answered them for you. The entitlement of everybody standing on this ground is a piece of paper. For seven of them it is a title, a lease, a contract or a pass. For the eighth it is a roll.",
    remains:
      "The account itself. Nobody in the district land office has seen the Kaw trust fund, nobody could say what is drawn against it, and the receipt promises only that the credit will be made. What the tribe eventually received against these sales is a question for the Treasury's books and the agency's, and it is not answerable from anything on this street.",
  },
  openQuestions: [
    "What the Kanza were actually told about the appraisal, and by whom. Councils were held and protests recorded, but the surviving account of which figures reached the headmen is thin and comes mostly from the agency that had an interest in the answer.",
    "How much of the trust-fund proceeds reached the tribe. Sales were made, expenses were charged against them, and the accounting ran for decades — historians disagree about how much of the shortfall was fraud and how much was fees.",
  ],
  codexFiling: {
    summary:
      "A land-office receipt that sells a reserve at auction and credits the money to the people being removed from it. Every clause is lawful; the tribe is a hundred and sixty miles south by the time the patent issues.",
    tags: ["Whose account is this", "What the record leaves out", "Who is permitted to speak"],
    seeAlso: ["case-013-interview-what-the-government-writes-down"],
  },
  historicalRecord: {
    documented: [
      "The act of 8 May 1872 providing for the appraisement and sale of the Kaw trust lands and diminished reserve, its one-year settler purchase window, its 160-acre cap, and its cash auction of everything unoccupied.",
      "The crediting of the proceeds, less expenses, to the tribe's account in the Treasury.",
      "The removal of 533 Kanza from the Council Grove agency on 4 June 1873, over Chief Allegawaho's protests in council, in writing, and in Washington.",
      "The pressure from railroad and town-site interests behind the removal bill.",
      "Two separate land systems on one Kansas street: a railroad land grant sold on credit by a company agent, and a federal district land office selling public and trust land for cash.",
      "The Texas cattle trade's retreat westward ahead of quarantine lines drawn against Texas fever, and the short life of any one railhead town.",
      "Railroad grading crews drawn from Union and Confederate veterans and from recent immigration, paid in time checks against a company store.",
    ],
    reconstructed: [
      "The receipt itself, a composite modelled on the General Land Office's printed receiver's-receipt forms and the terms of the 1872 act — its own citation says so.",
      "All eight people you spoke to. They are composites drawn from what the records establish about a Kansas railhead in 1873, not individuals anybody named.",
    ],
    fiction: ["Chronotravel, the Chronicle Institute, and a record secured in the field."],
    debated: [
      "Whether the trust-land sales are best read as a legal mechanism that worked as designed, or as one whose design was the dispossession. The statute, the appraisal and the auction were all real and all followed; historians weigh that against who wrote the bill.",
    ],
  },
  intro:
    "One slip of paper sells a hundred and sixty acres, for cash, to the highest bidder, and credits the money to the Kansas tribe. The tribe left the agency on Wednesday. Put four questions to this town and find out what a person here has to hold in order to be allowed to stand where they are standing.",
  howItWorks: {
    steps: [
      "You may put any of the four questions to any person on this map, indoors or out. Think about what each of them has on paper before you choose.",
      "Most answers will send you somewhere else. When somebody gives you something worth keeping, press Add to Field Notebook.",
      "Eight people, eight accounts — one from each, and no two of them the same. That is the whole mission.",
    ],
    note: "Two of the eight are in the land office with the receipt. The rest are on the street, at the camp, in the pens, out on the claim and across the line at the village.",
  },
  terms: [
    {
      term: "trust lands",
      definition:
        "Land a tribe ceded to the United States to be sold on their behalf, the proceeds credited to their account in the Treasury. It is not public domain and it cannot be homesteaded — it is sold, for cash, and the money is supposed to come back.",
    },
    {
      term: "diminished reserve",
      definition:
        "What is left of a reservation after a treaty has taken part of it. The Kanza reserve was cut twice before the whole of it was sold in 1873.",
    },
    {
      term: "appraisal",
      definition:
        "The valuation a federal commission set on each tract before it was offered. It fixes the floor price at the auction, which is why knowing it before it is published is worth money to a buyer.",
    },
    {
      term: "patent",
      definition:
        "The document that finally conveys title from the United States to a purchaser, issued long after the sale. Until it arrives the receiver's receipt is all the buyer has, which is why the form says so in capitals.",
    },
  ],
  questions: [
    { id: "entitled", label: "What is it that says you may be standing here?" },
    { id: "money", label: "Where does the money go, and whose name is on it?" },
    { id: "before", label: "Who was on this ground before, and what became of their claim?" },
    { id: "next", label: "Who will be standing here when you are not?" },
  ],
  groups: [
    {
      id: "paper",
      label: "People whose business is the paper",
      note: "They issue it, buy it or sell it. Three men, three different instruments, one street — and each of them can tell you exactly where his own authority stops.",
    },
    {
      id: "ground",
      label: "People standing on the ground it describes",
      note: "A buyer at the sale, two people being removed from it, a drover crossing it and a man grading it. Five answers the land office has no field for.",
    },
  ],
  speakers: [
    {
      id: "land-office-register",
      name: "Elias Fenn",
      role: "Register, United States land office",
      group: "paper",
      fallback:
        "He squares the receipt book against the counter rail and waits for a question he can answer.",
      answers: {
        money: {
          text: "Read the two sentences and you have it. Cash from the purchaser to the receiver, and the proceeds of the sale, less the expenses thereof, to the credit of the said tribe. Both of those happen. I have made the entry four hundred times this summer. Now ask me the next thing and I will give you the honest answer: no, I have not seen that account. I could not tell you its balance, I could not tell you what is charged against it as expenses, and there is no line on this form where I would find out. My office ends at the receipt. The money goes somewhere I am not permitted to look.",
          useful: true,
          lead: "The account is real and nobody in this office has ever seen it. Go and find somebody on the other end of it.",
        },
        entitled: {
          text: "This does, until the patent comes. The form says as much in capitals — preserve this receipt, it is his only evidence of title. That is not a courtesy. It is a warning.",
        },
        next: {
          text: "The patentee, and whoever he sells to after him. That is what a patent is for, and it is the one thing on this counter I do not decide.",
        },
      },
    },
    {
      id: "land-buyer-agent",
      name: "Ezra Holt",
      role: "Buying at the appraisal for an eastern house",
      group: "paper",
      fallback:
        "He runs a finger down a folded list of section numbers and lets the question go past him.",
      answers: {
        money: {
          text: "Not a dollar of it is mine and that is the part worth writing down. I am agent for a house in Boston that has never seen Kansas and does not intend to, and I am paid a commission on what I take, which is why I take eleven and not one. Every bid public, cash, at or above the appraisal, one hundred and sixty acres to a tract, exactly as the act requires. What the act did not say is that a man may bid on eleven tracts on eleven separate slips, and so I did, and four other men in that room did the same on Tuesday. The cap is on the tract. It was never on the buyer.",
          useful: true,
          lead: "Eleven quarters on eleven slips, and the cap was never on the man. Go and ask somebody who bought one to live on.",
        },
        entitled: {
          text: "A receipt, the same as anybody. Mine is on a house's account rather than my own, and the paper does not care whose money paid it. Nothing on the form asks.",
        },
        next: {
          text: "The settler your newspapers keep writing about. In the autumn, at my figure. I am not embarrassed by that and I would rather you did not pretend to be.",
        },
      },
    },
    {
      id: "railroad-land-agent",
      name: "Hollis Meade",
      role: "Railroad land agent",
      group: "paper",
      fallback: "He taps the plat roll under his arm and looks past you toward the depot.",
      answers: {
        entitled: {
          text: "Depends entirely which office you walked out of, and this is the thing everybody off the cars gets wrong. There are two land offices on Front Street, they are not the same office, and they are not selling the same ground. Mine sells the company's grant — alternate sections, given to the road by Congress to get the line built, sold by the section, on time if your credit is good. The government's is up the walk with the flag on it, and this summer it is selling the Kaw reserve, at auction, cash only, because trust land cannot be filed on. So: a contract with a railroad, or a receipt from the United States. Two entitlements, two counters, forty feet apart.",
          useful: true,
          lead: "Two land offices on one street, selling two different kinds of paper. Go and stand at the other counter.",
        },
        money: {
          text: "To the company, on time, at seven per cent. We are not in a hurry — a settler on our sections is freight for twenty years, and freight is the whole reason the grant was given.",
        },
        next: {
          text: "Whoever finishes paying. About a third do not, and the section comes back to us improved, which I will admit is not the worst outcome the company can picture.",
        },
      },
    },
    {
      id: "homesteader-woman",
      name: "Marta Lindqvist",
      role: "Homesteader",
      group: "ground",
      fallback: "She straightens up from the row, shades her eyes, and goes back to it.",
      answers: {
        before: {
          text: "The Kaw were. I will not be delicate about it, because nobody has been delicate with them. We came from Sweden by way of Illinois and we bought this quarter at the sale — bought it, cash, because trust land was not open to filing, so whatever the paper in town calls us we are not homesteaders. The agent told me it was appraised and offered lawfully and I do not doubt one word of it. And I broke sod in June into furrows that were already there, which is how I know somebody planted this ground before I did. Both of those are true at once and I am not going to hold only the comfortable one.",
          useful: true,
          lead: "She is farming furrows somebody else broke. Go across the line and find whoever broke them.",
        },
        entitled: {
          text: "A receipt with our name on it and our money under it. I am told a patent follows. I have not seen a patent and neither has anybody on this creek.",
        },
        next: {
          text: "My children, if the corn holds and the note holds. That is a longer sentence than anybody in that town would give you and it is the honest length of it.",
        },
      },
    },
    {
      id: "kanza-man",
      name: "Joseph Kahegah",
      role: "Kanza headman",
      group: "ground",
      fallback:
        "He watches the wagons being counted at the edge of the village and says nothing to you.",
      answers: {
        entitled: {
          text: "Ask that question of me and listen to how it sounds. Treaties. Eighteen twenty-five, eighteen forty-six, eighteen fifty-nine — each one smaller, each one signed, each one called the last. Our right to be here is written on more paper than any man in that town has ever held, and every sheet of it was made by the same government that is moving us on Wednesday. That is the answer and it is not a complaint. We said no in council. We said no in writing. Allegawaho went to Washington to say it in the room. The bill passed anyway, and the wagons are counted, and the paper that entitles us is the paper that ends us. Do not write that we agreed.",
          useful: true,
          lead: "Their right to be here is on more paper than anyone in town holds, and the same government wrote all of it. Ask what the roll says.",
        },
        before: {
          text: "We were. For as long as anyone has counted, and before the counting. Look at the stone houses on the rise if you want to know how that was managed.",
        },
        next: {
          text: "Strangers, and quickly. The land is advertised already. Ask the man who prints the advertisement what he thinks he is selling.",
        },
      },
    },
    {
      id: "kanza-woman",
      name: "Willow Pahonka",
      role: "Kanza woman",
      group: "ground",
      fallback: "She works down the row without looking up, and the hoe does not miss its stroke.",
      answers: {
        before: {
          text: "This corn was. I put it in, and I am hoeing it in June because it is mine until the day it is not, and I will not spend my last week standing still so a clerk can write down that we had already stopped. Here is what you asked for and here is what it costs to give it. The man came through and made the roll before the wagons came. He set me down as the wife of the man written above me. He did not ask my name and he had no column to put it in. There is no line on any paper of theirs about what was on this ground before them, because they made the paper afterwards. I have a name. It is Willow Pahonka. Write that one.",
          useful: true,
        },
        entitled: {
          text: "Nothing they would accept. I am on a roll, by age and degree of blood, under another person's name. That is the whole of my paper.",
        },
        next: {
          text: "A woman with a hoe, most likely, in this same row. I hope she gets a better summer out of it than I have had.",
        },
      },
    },
    {
      id: "texas-drover",
      name: "Cordell Yates",
      role: "Texas drover",
      group: "ground",
      fallback: "He counts a bunch through the gate and holds up a hand until they are past.",
      answers: {
        next: {
          text: "Nobody, and I mean that about the whole street. I am here on sufferance and the sufferance has a line drawn on it — the quarantine line, against the fever my Texas stock carries and does not take. Every legislature draws it a little further west and every season the pens follow it. Abilene had this trade and lost it. Newton had it and lost it. The Junction has it now and will lose it, and when it goes this town will wonder where its money went and blame the wrong thing. I am not entitled to be here. I am tolerated here until a line moves, and I am paid to know exactly where that line is.",
          useful: true,
          lead: "He is here until a line moves, and he knows where it is. Go and ask somebody else who has to move when the work does.",
        },
        entitled: {
          text: "A bill of sale in Bosque County and a contract in Kansas City. Neither of them says one word about Kansas. I cross this ground because nobody has yet stopped me on it.",
        },
        money: {
          text: "On what walks into that chute, not on what left Texas. Three hundred head short of what I started with, and the shortage is mine and not the buyer's.",
        },
      },
    },
    {
      id: "track-grader",
      name: "Padraic Byrne",
      role: "Track grader",
      group: "ground",
      fallback:
        "He shifts the shovel to the other shoulder and waits to see whether you have a better question.",
      answers: {
        next: {
          text: "Nobody in this camp, and that is the arrangement rather than the luck of it. We are entitled to be here exactly as long as the grade is here, and the grade moves west forty miles a month. Half of us came out of the army and the other half came off a boat, and the company knows precisely what that difference is worth and prices it. When the section closes we go with it or we forfeit the balance we have already earned, and that is on the sheet, at the bottom, in one line. Nobody who works this ground stays on it. The men who will still be here in five years are the ones who never picked anything up.",
          useful: true,
          lead: "He is here until the section closes, and leaving early costs him what he has already earned. Go and read the sheet.",
        },
        entitled: {
          text: "A time check I cannot spend yet and a bunk in a boarding car. That is the whole of my title to this county and it expires at the quarter.",
        },
        money: {
          text: "A dollar seventy-five the day, and I have not had a dollar seventy-five in my hand since March. Board off it, blankets off it, the shovel off it.",
        },
      },
    },
  ],
  requires: { useful: 8, label: "Accounts secured" },
  lockedNote:
    "Eight people on this map, and each one holds an answer to one of these four that nobody else can give. Find the rest before you file.",
  closer: {
    prompt:
      "Your notebook is above, in two panels: people whose business is the paper, and people standing on the ground it describes. Reading what you actually collected — what does this receipt record?",
    skillCategory: "Contextualization",
    options: [
      {
        id: "absent-party",
        text: "A lawful sale, correctly recorded, conducted in the absence of the party the money is credited to",
        correct: true,
        why: "Right, and every part of it came from a different person. The register showed you the mechanism and its limit in one answer — cash comes in, the proceeds go to the credit of the tribe, and he has never seen that account and has no line on the form that would let him. The buyer's agent showed you that the cap was on the tract and never on the man. And the headman told you the sale was refused in council, in writing and in Washington, and carried anyway. Nothing here was forged and nothing was hidden. The party being credited was a hundred and sixty miles south of the auction, and the form has no field that would have noticed.",
      },
      {
        id: "theft",
        text: "A theft dressed up as a sale",
        correct: false,
        why: "It is the reading the evidence most tempts you into, and it costs you the finding. A theft is a thing somebody does, which means it can be pinned on a man and stopped by catching him — and you spent the afternoon failing to find that man. The register writes what the statute tells him to write. The agent bids at the appraisal, in public, for cash. The buyer on the creek paid her own money and told you plainly whose furrows she is planting. Calling this a theft lets every one of them off, because not one of them stole anything. What you are looking at is worse and much harder to argue with: a procedure that produces the outcome of a theft without ever requiring anybody to commit one.",
      },
      {
        id: "settlement",
        text: "The opening of the West to ordinary settlers",
        correct: false,
        why: "That is what the Clarion says, and it is the one claim on this street your own notebook refutes. Trust land could not be filed on, so there was no homesteading here at all — it went at auction, for cash, to whoever had the cash. One man took eleven quarters in an afternoon on a Boston house's account and told you he will sell them on in the autumn at his own figure. The settler in the story arrives later and buys from him. She is real, she is out on the creek, and she is not who this receipt was written for.",
      },
      {
        id: "speculation",
        text: "A speculators' scheme the law failed to stop",
        correct: false,
        why: "Half of that is documented and the other half has the law facing the wrong way. Railroad and town-site interests did push the removal bill, and the buyer's agent is doing exactly what you would expect of him. But the law did not fail to stop him — he showed you that it never tried. The hundred-and-sixty-acre limit is a limit on a tract, the cash auction is a cash auction by design, and both of those are in the statute rather than around it. A scheme is something that gets past the rules. This one got its outcome from the rules.",
      },
    ],
  },
};

// ---- M6.B — "Whistle to Whistle" (ASSEMBLY, railhead-construction-payroll) -----------------------
//
// Richmond's assembly sorts three classes of men by where the money lands. This one sorts one man's
// month, and its two boards are the record's own two prompts: what kind of transaction is each of
// these charges, and which of them was he in a position to refuse?
//
// **A slot takes exactly one fragment** — the schema enforces it, and it is what makes an assembly a
// reconstruction rather than a sort. That is why board one is five kinds of charge and not three
// buckets: the six deduction lines really are five different relationships (a service, a sale, a
// deposit, a credit account and a levy) and the doctor and the hospital fund are one levy between
// them. Discovering that a wall of deductions has five different mechanisms in it is the board.
//
// The arithmetic behind it: 12.00 + 4.50 + 2.25 + 9.80 + 0.23 + 0.25 is 29.03 against a gross of
// 45.50, leaving 16.47 — about thirty-six cents on the dollar of the advertised rate, before the
// store discounts the check at a figure the sheet does not print.
//
// Each board's two distractors are the two things a reader reaches for that are not on the axis at
// all. On board one they are the advertised rate (what the charges come out of, not one of them) and
// the store's discount (not on the sheet in any form). On board two they are the two refusals nobody
// ever offered him: bargaining over a posted rate, and combining with the rest of the section —
// which is real, is historical, and is priced by the forfeiture clause rather than forbidden by it.
const WHISTLE_TO_WHISTLE = {
  kind: "assembly",
  id: "case-016-assembly-whistle-to-whistle",
  title: "Whistle to Whistle",
  variant: "Rebuild a Month",
  missionQuestion:
    "The rate is printed at the top of this sheet and the money is at the bottom, and they are not the same number — so what happens to a wage in between, and which part of it could the man who earned it have refused?",
  thinkingMove:
    "Following money through a document rather than reading its headline. An advertised rate and a paid balance are two different figures, and everything between them was somebody's decision.",
  briefing: {
    speaker: "track-grader",
    line: "There it is on the board by the cook car — Section Four, and my month on it. A dollar seventy-five the day is what the notice in Kansas City said and it is what is printed at the top, so nobody has lied to me yet. Twenty-nine dollars and three cents came off it before I saw a cent, and I could tell you every line of that from memory. What I could not tell you is what kind of thing each of them is, because they are set down in one block as if they were all the same. Take them apart. And then do the harder thing, because I have never had a straight answer to it: go through the six and tell me which of them I could actually have said no to.",
  },
  debrief: {
    speaker: "texas-drover",
    line: "So he is paid on a number somebody else settled and in a paper somebody else prices. You and I have just described the same country from two ends of it.",
    established:
      "The six deductions are five different transactions and only one of them can be declined. Board is a service really provided at a price nobody can shop; blankets are a sale made without an offer; the tools are a deposit that comes back; the store account is credit at the only counter in reach; the doctor and the hospital fund are a levy owed by every man every month whether or not he is ever treated. All five fall due to the same company that set the rate, so the wage is spent before it is handed over and it is spent to the payer. Twenty-six days at a dollar seventy-five earns forty-five fifty; twenty-nine dollars and three cents comes off it; sixteen forty-seven is left, and it is not money — it is a promise payable at the quarter, or cash today at the store's own figure. Nothing here is unlawful. The advertised rate is a real number that describes almost nothing.",
    remains:
      "What the store's discount actually was. The sheet says the check may be cashed there at the rate current there and prints no number, and it is the one figure on the page that decides what his month was finally worth. It is also the only figure the company was never obliged to publish.",
  },
  arcClose: {
    speaker: "track-grader",
    line: "A survey, a receipt, and this. Somebody measured the ground, somebody sold it, and somebody has to move the dirt — and not one of the three sheets has a line for what any of us wanted.",
    established: RAILHEAD_ARC,
  },
  openQuestions: [
    "What the men on Section 4 did about it. Grading crews struck over pay, boarding and store charges repeatedly in these years, and a company pay sheet is the last place any of that would appear.",
    "How much the Panic of September 1873 changed the discount on a time check. Contemporaries say it worsened sharply when eastern credit closed; the surviving figures are anecdotal and come mostly from men complaining about them.",
  ],
  codexFiling: {
    summary:
      "One month on a grading section: $45.50 earned, $29.03 charged back to the company that set the rate, $16.47 paid in a time check the company store discounts at a figure it does not print.",
    tags: ["Who does the work", "What a price records", "Whose account is this"],
    seeAlso: ["case-013-assembly-three-sorts-of-men"],
  },
  historicalRecord: {
    documented: [
      "Railroad construction crews boarded in company boarding cars alongside the grade, at a weekly charge deducted from wages.",
      "Company-store order books, and outfit and tools charged on issue against a man's account.",
      "Compulsory hospital funds and a doctor's levy assessed as a fixed percentage of wages, deducted whether or not a man was treated.",
      "Payment in time checks redeemable at the company office at the close of a quarter, and their discounting for cash at the company store at a rate the store set.",
      "Forfeiture clauses under which a man leaving before a section was completed lost his unpaid balance.",
      "Grading crews on the Kansas roads drawn from Union and Confederate veterans and from recent Irish and German immigration.",
      "The failure of Jay Cooke & Company on 18 September 1873 and the depression that followed it, which fell hardest on exactly this kind of paper.",
    ],
    reconstructed: [
      "The pay sheet itself, a composite modelled on the form of railroad construction pay sheets and time checks — its own citation says so.",
      "D. Padraic Byrne's particular month, and the particular figures in each of the six charges.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a pay sheet posted by a cook car in 1873.",
    ],
    debated: [
      "How much of the deduction system was extraction and how much was the genuine cost of feeding, housing and doctoring a crew a hundred miles from a town. Both are in the record, and historians weigh the balance differently.",
    ],
  },
  intro:
    "A dollar seventy-five the day, whistle to whistle, dinner not counted — and twenty-nine dollars and three cents of the month gone before he is handed anything. Take the deductions apart and say what kind of transaction each one really is, and then say which of them he was ever in a position to decline.",
  howItWorks: {
    steps: [
      "Click a piece in the tray, then the column you think it belongs in. Dragging works too.",
      "Two pieces on each board belong in no column at all. Decide which, and be ready to say what made them look like they fitted.",
      "Finish the first board and a second opens: which of the charges he could actually have refused.",
    ],
    note: "Read each line for what the company gets out of it rather than for what it costs him. Twenty-six days at the rate is forty-five dollars fifty; the six charges come to twenty-nine dollars and three cents; the balance is sixteen forty-seven, in paper, at the quarter.",
  },
  terms: [
    {
      term: "time check",
      definition:
        "A company's written promise to pay a wage at a later date, here the close of the quarter. It is not money. It can be held until then or sold for cash to whoever will take it, at their price.",
    },
    {
      term: "boarding car",
      definition:
        "A railway car fitted out as a bunkhouse and kitchen, moved along the grade with the work. Board in it is charged by the week and deducted, and on a section forty miles from a town there is nowhere else to eat.",
    },
    {
      term: "order book",
      definition:
        "The company store's credit ledger. A man draws goods against his wages before payday, and the account comes off the sheet at the end of the month before he is handed anything.",
    },
    {
      term: "forfeiture",
      definition:
        "The clause under which a man who leaves before the section is finished loses the balance he has already earned. It is one line at the foot of the sheet and it is what holds all the rest of it together.",
    },
  ],
  boards: [
    {
      id: "charges",
      kind: "label",
      label: "Six charges, five different things",
      note: "Twenty-nine dollars and three cents comes off this month, and it reads as one wall of money. It is not. Sort each charge by what kind of transaction it actually is — and two pieces in the tray are not charges at all.",
      slots: [
        { id: "service", label: "A service genuinely provided, priced by the provider" },
        { id: "sale", label: "Goods sold to him outright" },
        { id: "deposit", label: "A charge that comes back off the account" },
        { id: "credit", label: "Goods drawn before payday, against the wage" },
        { id: "levy", label: "A rate on the wage itself, owed whether it is used or not" },
      ],
      fragments: [
        {
          id: "board",
          label: "Board at the company boarding car, three dollars the week — twelve dollars",
          belongs: "service",
          misread:
            "The largest single charge, a quarter of the gross, and the least outrageous line on the sheet — which is worth saying plainly. A crew working forty miles from a town has to be fed, and feeding it costs money. What makes it worth marking anyway is that the man cannot decline it and eat somewhere else, and that the three dollars is set by the same office that set the dollar seventy-five. A fair price and a price nobody can shop are two different things.",
        },
        {
          id: "outfit",
          label: "Blankets and a slicker, issued and charged — four dollars fifty",
          belongs: "sale",
          hints: [
            "It was issued to him. Was it lent to him?",
            "Read the tools line beside it. One of the two comes back off the account and one does not.",
          ],
          misread:
            "Issued, charged, and no clause anywhere about returning it — so this is a sale, made without being offered, to a man who could not have arrived without blankets. Compare it with the shovel and pick immediately below, which are charged on issue and credited on return in good order, and the difference is the whole design of the outfit column. The company sells him the bedding and lends him the tools, and it is the tools it wants back.",
        },
        {
          id: "tools",
          label:
            "Shovel and pick, charged on issue and credited on return in good order — two dollars twenty-five",
          belongs: "deposit",
          misread:
            "The only line on this sheet that can go back to zero, which makes it the only charge here with an exit written into it. It is still real money standing against his month in July, because the credit comes when the tools do. Hold on to this one — the second board turns on it, and the reason it is refundable is not generosity. The company wants its shovels.",
        },
        {
          id: "store",
          label: "Store account, order book No. 3 — nine dollars eighty",
          belongs: "credit",
          misread:
            "Goods drawn before payday, at prices the same company set, from the only counter within reach of the grade — and this is the line that makes the whole arrangement circular rather than merely expensive. The wage is spent before it is paid, and it is spent back to the payer. Contemporaries called the system truck and legislated against it on both sides of the Atlantic for exactly this reason.",
        },
        {
          id: "levies",
          label:
            "The doctor at one half of one per cent, and the hospital fund — forty-eight cents",
          belongs: "levy",
          hints: [
            "Forty-eight cents is nothing. Ask what makes it worth a printed line on the form anyway.",
            "Was he sick this month? Does the sheet ask?",
          ],
          misread:
            "The smallest charges on the sheet and the most instructive. A half of one per cent is a rate rather than a bill, which means it falls on every man every month whether or not he ever sees a surgeon — and the surgeon is the company's. Forty-eight cents from one man is nothing. Forty-eight cents from every man on the division, every month, is a hospital paid for by the people who might need it and owned by the people whose work might put them in it.",
        },
        {
          id: "rate",
          label: "The rate allowed, a dollar and seventy-five cents the day",
          belongs: null,
          hints: [
            "This is the number everybody remembers off the sheet. Is it a charge?",
            "Read the top line of the sheet and the deduction block underneath it. Which one is this?",
          ],
          misread:
            "It is not a charge, which is why it fits nowhere — it is the thing all six charges come out of, and it is the only figure on this sheet a man was ever shown before he took the work. That is worth noticing rather than dismissing. A dollar seventy-five a day was a good rate in 1873, better than a farm hand's, and it is the reason men came from the army and off a boat to take it. It is also almost the only number on this page that tells you nothing about what he was paid.",
        },
        {
          id: "discount",
          label: "Whatever the store keeps for cashing his time check today",
          belongs: null,
          hints: [
            "Look for the figure on the sheet before you place it. Is there one?",
            "The sheet says the check may be discounted for cash at the store at the rate current there. What is that rate?",
          ],
          misread:
            "It fits nowhere because it is not on the sheet. Every other figure here is exact to the cent; the one that decides what a month of this man's life is finally worth is given as the rate current there, and the store sets it daily and prints it nowhere. That is not an omission and it is not sloppy bookkeeping. A rate that is never published is a rate nobody can be held to, and it is the last thing that happens to this wage.",
        },
      ],
    },
    {
      id: "refusal",
      kind: "label",
      label: "Which of them could he have refused?",
      note: "Byrne's own question, and the answer is interesting because it is not all of them and it is not none. Four pieces here are things a man on this section could be told; two are things nobody offered him.",
      opensAfter: "charges",
      slots: [
        { id: "outright", label: "He could decline this one outright, and be no worse off" },
        { id: "nowhere", label: "He could decline it in principle, with nowhere else to go" },
        { id: "no-line", label: "There is no line on the form to decline it" },
        { id: "holds", label: "Not a charge at all — it is what makes the rest of them stick" },
      ],
      fragments: [
        {
          id: "tools2",
          label: "The shovel and the pick",
          belongs: "outright",
          misread:
            "The one honest yes on this board, and it is worth two dollars and twenty-five cents. The charge is credited on return in good order, so a man who brings the company's tools back pays nothing for them at all. It is a real option, it is the smallest of the six charges, and the company wrote it because the company wants its shovels returned. That is what a genuine choice on this sheet looks like: one that costs him nothing and gets the company something.",
        },
        {
          id: "board2",
          label: "Board at the company boarding car",
          belongs: "nowhere",
          hints: [
            "Nothing on the sheet obliges him to eat there. What does?",
            "Where is the nearest place to buy a meal from a grading section forty miles out?",
          ],
          misread:
            "There is no clause obliging him to board with the company, and that is exactly why it belongs here rather than in the next column. The compulsion is geographic: the crew moves with the grade, the grade is forty miles from a town, and the boarding car is the only kitchen inside a day's walk. A choice that exists on paper and nowhere on the ground is the most common kind on this sheet, and the sheet is not what is making it — which is precisely what makes it hard to argue with.",
        },
        {
          id: "form",
          label: "Being paid in money instead of a time check",
          belongs: "no-line",
          hints: [
            "Look for the words that describe how the balance is paid.",
            "The same sentence that names the time check adds one more clause. Read it.",
          ],
          misread:
            "The sheet settles this twice and neither clause is negotiable: the balance is payable in a time check at the company's office at the close of the quarter, and no advance of wages will be made. There is no election, no form, and nobody to ask. This is the difference between a company that charges a man a great deal and a company that also decides what his wage is made of — and the second one is the more consequential power.",
        },
        {
          id: "forfeit",
          label: "The unpaid balance a man loses if he leaves before the section is finished",
          belongs: "holds",
          hints: [
            "Is this one of the six deductions? Look at where it sits on the sheet.",
            "Ask what every choice on this board costs him once this clause is true.",
          ],
          misread:
            "Not a charge, which is why it has a column of its own — and it is the strongest line on the page. Men leaving before the completion of the section forfeit the unpaid balance. Every option above collapses the moment the alternative to accepting it is losing a month you have already worked, and the man knows the figure exactly, because it is printed at the foot of this sheet. A wage held back is not merely deferred pay. It is a deposit against his leaving.",
        },
        {
          id: "bargain",
          label: "The rate itself, if he had bargained harder in March",
          belongs: null,
          hints: [
            "Look at how the rate is worded on the sheet. Is it presented as something that was agreed?",
            "What is the word allowed doing in the line rate allowed, one dollar and seventy-five cents the day?",
          ],
          misread:
            "It fits nowhere because it was never put to him. The line reads rate allowed, which is a rate handed down rather than settled, and it was posted in Kansas City before he got on the train. A posted rate is what a company says instead of bargaining, and a man who arrives at a section camp having spent his fare is not in a position to open the subject.",
        },
        {
          id: "union",
          label: "Combining with the rest of Section 4 to refuse the store",
          belongs: null,
          hints: [
            "This is a real thing men on this grade did. Is it on this sheet?",
            "Look at the last line of the sheet and ask what it costs each man who walks.",
          ],
          misread:
            "It fits nowhere on this board and it is not a fantasy — grading crews struck over boarding, store charges and unpaid time checks repeatedly in these years, and sometimes won. What the sheet contributes is the price of trying: every man who walks off before the section closes forfeits the balance he has already earned, individually, whatever the rest of the camp does. A company pay sheet is the last place collective action would ever appear, and the clause that makes it expensive is right there at the foot of it.",
        },
      ],
    },
  ],
  closer: {
    prompt:
      "The month is rebuilt and the charges are tested. Your reading goes into the record — what is this pay sheet evidence of?",
    skillCategory: "Economic Systems",
    options: [
      {
        id: "one-company",
        text: "A wage that never leaves the company that paid it — employer, landlord, outfitter, storekeeper, surgeon and bank in one, and lawfully",
        correct: true,
        why: "Right, and the force of it is that no line on this sheet had to be bent. Board, outfit, store, doctor and hospital all fall due to the same office that set the dollar seventy-five, so two thirds of the wage is spent before it is handed over and is spent to the payer. What is left is not money but a promise, redeemable at that office at the quarter or at that store today, at a figure the store does not print. Every step is a legal contract freely entered into, and the last line of the sheet is what makes leaving it cost a month.",
      },
      {
        id: "theft",
        text: "That the company was cheating its men",
        correct: false,
        why: "You went through all six charges looking for the cheat and did not find one. Board really was provided, the blankets really were issued, the surgeon really existed, the tools really are credited back. Nothing here is fraud and nothing here was hidden — it is printed on the sheet, in the open, on a form the company had made up in quantity. Reading it as cheating makes it a story about a bad employer, when what you actually reconstructed is an arrangement that produced this outcome with everybody behaving lawfully.",
      },
      {
        id: "poverty",
        text: "That railroad labour was badly paid",
        correct: false,
        why: "A dollar seventy-five a day was not a bad rate in 1873 — it is better than a farm hand's and it is why men came from Ireland and from the army to take it. That is exactly what makes the sheet worth reading. The rate is genuinely decent and the man receives about thirty-six cents in the dollar of it, in paper, at a discount he cannot see. The interesting fact is not the wage. It is the distance between the wage and the payment.",
      },
      {
        id: "panic",
        text: "That the Panic of 1873 had already reached this camp",
        correct: false,
        why: "It had not — this sheet is July and Jay Cooke's house does not fail until the eighteenth of September. What the Panic did was make an existing arrangement bite harder: when eastern credit closed, time checks were discounted further and a month's work was worth whatever the store said. The mechanism was already here in full, in a boom summer, on a sheet printed in quantity. Dating it to the crash gets the causation backwards.",
      },
    ],
  },
};

// ---- M6.C — "Where the Line Is" (TRACE, railhead-survey-field-book) ------------------------------
//
// The map's spine, and the one record where the honest finding is that nobody lied. A treaty
// describes a boundary in words. A deputy surveyor turns the words into a run line with stone
// corners. The line goes on a plat, the plat goes on record, and from that moment the office can
// sell, patent and tax from it. Fourteen years later a second deputy runs the boundary as the treaty
// actually describes it, finds the marked line thirty-three chains and sixty links away, and does
// the only thing his instructions allow: he reports both.
//
// The support axis is where the mission is won. Leg three — the office selling from the plat — is
// the largest thing in the chain and this field book contains none of it. The player knows it
// because they are carrying the receipt, which is a different document, which is why
// `requiresSourceId` gates this record on that one. Getting leg three right means saying "true, and
// not from this page," which is the whole distinction the second question exists for.
//
// `fraud` is the standing distractor and is the answer to no leg. It is what everybody reaches for
// on a boundary that moved, and the deputy's own note refuses it: he ran the treaty line, marked it,
// and reported both, in a book that is signed and returned to an office that will read it.
const WHERE_THE_LINE_IS = {
  kind: "trace",
  id: "case-016-trace-where-the-line-is",
  title: "Where the Line Is",
  variant: "Follow a Boundary",
  missionQuestion:
    "Two competent surveyors ran one boundary fourteen years apart and put it four tenths of a mile from itself — so which of the two lines governed the ground in between, and what made it the one that governed?",
  thinkingMove:
    "Telling what a document establishes from what you know from elsewhere. A record can be the best evidence in the world for one link in a chain and no evidence at all for the next one.",
  briefing: {
    speaker: "deputy-surveyor",
    line: "You have the receipt, so you have seen what this office can do with a description. Now look at where the description comes from. I am closing corners in township eighteen south and the boundary I am running is not where the plat of record says it is — not by a little, by thirty-three chains and sixty links. I have run the treaty line, I have marked it, and I have written down both, because that is what the instructions require of me and because it is the only honest thing left to do about it. Follow it back from the treaty and tell me at each step what this book can actually prove.",
  },
  debrief: {
    speaker: "homesteader-woman",
    line: "So the furrows I am planting were inside somebody's reserve for fourteen years and outside it on the only map anyone ever looked at. I would rather know it than not.",
    established:
      "One boundary existed in two incompatible legal forms at the same time. The treaty describes it in words; the plat of record draws it thirty-three chains and sixty links to the south — about two fifths of a mile, over the width of a township. The plat is the form the district land office can act on, so the plat is what tracts were described from, sold from, patented from and taxed from, and the treaty description sat in Washington doing nothing. The 1873 deputy could establish the discrepancy and could not resolve it: he ran the treaty line, marked it with stone and bearing trees, reported both, and returned the ground between them as unsurveyed — which means it now has no legal description at all.",
    remains:
      "Who is on that strip and what happens to them. The field book returns the tracts as unsurveyed and stops there. Patents already issued from the 1859 plat, taxes already assessed by the county, and whatever the Kanza were told about either line are three separate records in three separate offices, and not one of them is in your hands.",
  },
  arcClose: {
    speaker: "deputy-surveyor",
    line: "A line, a receipt and a pay sheet. Three men doing three jobs properly, and look what the three of them add up to.",
    established: RAILHEAD_ARC,
  },
  anomaly: {
    noticed:
      "The variation is entered at the head of the book at 11° 30' east, in the deputy's own hand, and every bearing in it is reduced from that figure correctly. Against the same corner, in the margin, a second hand has written a second variation — smaller by three degrees and some minutes, ruled the way the altered entry in the Riverbend wharf book was ruled — with a year set beside it. The year is 1934.",
    note: "Magnetic variation moves, slowly and unevenly, which is exactly why a retracement survey sixty years on has to know what it was when the corners were set. A later surveyor's note in a bound field book is the most ordinary thing that can happen to one and there are thousands of them. That is not what is strange. What is strange is that this book is in your hands in June of 1873, that the figure is right for a year that has not happened, and that the hand is one you have seen before in a wharf book in Virginia. It corrects nothing. It agrees with the deputy, in advance, about a number he had no way to know. File the record as it stands and flag the leaf.",
  },
  openQuestions: [
    "What was done about the strip. Congress resolved conflicts of this kind by private act, by confirmation of existing patents, or by leaving them to the courts, and which of the three happened here is not recoverable from a field book.",
    "Whether the 1859 deputy knew. Contract surveying was paid by the mile and fraudulent returns were a real and prosecuted problem in this period, but an honest error of thirty-three chains over rough ground is at least as likely and the notes do not settle it.",
  ],
  codexFiling: {
    summary:
      "A boundary in two legal forms at once: described in a treaty, drawn thirty-three chains and sixty links away on the plat of record, and sold from the plat. The 1873 deputy could report the discrepancy and could not resolve it.",
    tags: ["What a paper permits", "What the record leaves out", "Whose account is this"],
    seeAlso: ["case-004-trace-one-hogshead", "case-016-interview-on-whose-paper"],
  },
  historicalRecord: {
    documented: [
      "The Public Land Survey System: townships and ranges from a principal meridian, random and corrected lines run by compass and chain, corners marked with stone and witnessed by bearing trees, and field notes and plats returned to the Surveyor General.",
      "The chain of 66 feet and the link of 7.92 inches, and the requirement that a deputy record magnetic variation and reduce his bearings from it.",
      "That no tract could be sold, patented or taxed until it had been surveyed and platted, so the plat of record was the operative document rather than the treaty text.",
      "Deputy surveyors' contract obligation to report discrepancies with previous surveys rather than reconcile them.",
      "Reservation boundaries in dispute between treaty descriptions and returned surveys, and the resulting patents issued over ground a treaty placed inside a reserve.",
      "The 1846 and 1859 treaties reducing the Kanza to a diminished reserve, and the 1872 act putting the whole of it into the market.",
    ],
    reconstructed: [
      "The field book itself, a composite modelled on the form of General Land Office deputy surveyors' notes — its own citation says so.",
      "The particular discrepancy of thirty-three chains and sixty links, and the four legs as separate stages. In life the platting, the selling and the resurvey overlapped for years.",
    ],
    fiction: [
      "Chronotravel, the Institute, and a Chronicler reading a bound field book on a section line in 1873.",
    ],
    debated: [
      "How much of nineteenth-century dispossession ran through incompetent or fraudulent surveying as against competent surveying of terms that were themselves coerced. Both are documented; historians differ on which did more work.",
    ],
  },
  intro:
    "A boundary is a sentence in a treaty until somebody walks it with a compass and a chain. Follow this one from the treaty text to the ground and back, and at every step ask the harder question — can this field book prove that, or do you only know it from somewhere else?",
  howItWorks: {
    steps: [
      "The boundary moves through four legs, in order. Each says what changes and whose hands it passes through.",
      "Every leg asks twice: what happens here, and how far this book carries it. The second question opens once the first is right.",
      "Then keep three of the four entries. Three is all you get, so keep the ones your conclusion will rest on.",
    ],
    note: "One of the answers offered is the answer to no leg at all. It is the one everybody reaches for when a boundary turns out to be in the wrong place, and the deputy's own note is what rules it out.",
  },
  notebook: {
    capacity: 3,
    prompt:
      "Four legs entered, three slots. The one you leave out is not a mistake — it is the part of this story the field book cannot speak to, however certain you are of it.",
    emptyNote: "Enter a leg correctly and it becomes available to keep.",
  },
  terms: [
    {
      term: "chain",
      definition:
        "The surveyor's unit of length: 66 feet, divided into 100 links. Thirty-three chains and sixty links is 2,217 feet — about two fifths of a mile.",
    },
    {
      term: "variation",
      definition:
        "The difference between magnetic north and true north at a given place and date. A deputy records it at the head of his book and reduces every bearing from it, and it drifts over the years, which is why a resurvey has to know the old figure.",
    },
    {
      term: "plat of record",
      definition:
        "The official drawing filed in the district land office showing a township's sections and their corners. It is what tracts are described from and sold from, which makes it the operative document whatever any other paper says.",
    },
    {
      term: "returned as unsurveyed",
      definition:
        "A deputy's way of saying ground has no legal description he is willing to certify. Until it is resurveyed and platted it cannot be lawfully sold, patented or taxed — whatever is already standing on it.",
    },
  ],
  subject: {
    label: "The north boundary of the diminished Kanza reserve",
    note: "Described in a treaty, drawn on a plat, marked on the ground — in two places, thirty-three chains and sixty links apart.",
  },
  nodes: [
    { id: "treaty", label: "The treaty text, in Washington" },
    { id: "field", label: "A deputy's field book, 1859" },
    { id: "plat", label: "The plat of record, in the district land office" },
    { id: "patent", label: "Receipts, patents and the county's tax roll" },
    { id: "ground", label: "The section line, re-run this season" },
  ],
  effects: [
    {
      id: "description-becomes-line",
      label: "A sentence becomes a measured line with stones in it",
    },
    {
      id: "line-becomes-authority",
      label: "A drawing in an office becomes the only version anybody consults",
    },
    {
      id: "authority-becomes-title",
      label: "Ground is sold, patented and taxed from that version",
    },
    {
      id: "discrepancy-reported-not-resolved",
      label: "The disagreement is found, written down, and left standing",
    },
    { id: "fraud", label: "Somebody moved the boundary on purpose" },
  ],
  supportLevels: [
    { id: "established", label: "This field book states it" },
    { id: "inferred", label: "Reasonable from this field book, not stated" },
    { id: "not-shown", label: "Not shown by this field book" },
  ],
  supportPrompt: "And how far does this book itself actually carry that?",
  legs: [
    {
      id: "running",
      from: "treaty",
      to: "field",
      label: "A description becomes a line somebody has to walk",
      transforms:
        "The boundary exists as course and distance in a treaty. A deputy under contract to the Surveyor General runs it on the ground with compass and chain, sets a stone at the corner, witnesses it with two bearing trees, and enters the whole of it in a bound book.",
      actor:
        "A contract surveyor, paid by the mile, working from a written description of ground he has never seen.",
      effect: "description-becomes-line",
      support: "inferred",
      why: "You are watching this exact operation being performed on the page in front of you — the variation, the random line, the sandstone twenty by eight by six, the burr oak at thirty-one links — and the deputy names his predecessor as the deputy under the previous contract. That the 1859 line was produced the same way is a sound inference from a book that is doing it. It is not a statement: this book contains none of the 1859 notes, and calling it established is exactly the slip the second question exists to catch. The reason it matters is that both lines are honest work by the same method, which is what rules out the easy answer later on.",
    },
    {
      id: "platting",
      from: "field",
      to: "plat",
      label: "The line is drawn, filed, and becomes the office's copy",
      transforms:
        "The returned notes are platted, and the plat is filed in the district land office. From that moment the office has a version of the boundary it can point to, describe from, and act on — and it has only the one.",
      actor:
        "The Surveyor General's draughtsman, and the register who takes the plat onto the record.",
      effect: "line-becomes-authority",
      support: "established",
      why: "The deputy's note says it in so many words: the 1859 line is shown on the plat of record in this office. That single phrase is the hinge of the whole chain, and it is on the page. A treaty description cannot be pointed at across a counter, cannot be drawn on, and cannot have a tract cut out of it; a plat can do all three. The moment a survey is platted and filed it stops being one man's account of the ground and becomes the ground, as far as the office is concerned — and there is no procedure by which the treaty text catches up.",
    },
    {
      id: "selling",
      from: "plat",
      to: "patent",
      label: "The office sells from the copy",
      transforms:
        "Tracts described from the plat are appraised, advertised, struck to the highest bidder, receipted for cash and patented in due course, and the county assesses taxes from the same descriptions. Fourteen years of transactions accumulate on ground whose boundary is in the wrong place.",
      actor:
        "The register, the receiver, the purchasers, and the county assessor — none of whom is looking at a treaty.",
      effect: "authority-becomes-title",
      support: "not-shown",
      why: "Both halves, and they point opposite ways. This is the largest thing in the chain and this book contains not one word of it: a field book records measurements, not sales, and the deputy has no reason to write down what the office did with his predecessor's plat. You know it anyway — you are carrying a receiver's receipt for a hundred and sixty acres described exactly this way, which is a different document from a different desk. That is the distinction worth taking out of this mission. Being certain of something and being able to prove it from the page in your hand are two conditions, and a Chronicler who lets one document take credit for what another one shows has stopped keeping a record and started telling a story.",
    },
    {
      id: "reporting",
      from: "patent",
      to: "ground",
      label: "A second deputy runs the treaty line and finds it somewhere else",
      transforms:
        "In 1873 a deputy runs the boundary as the treaty describes it, marks it, and finds the 1859 line thirty-three chains and sixty links to the south. He reports both, and returns the tracts lying between them as unsurveyed — which strips them of any legal description at all.",
      actor:
        "The deputy, and the printed instructions that oblige him to report a discrepancy and forbid him to settle it.",
      effect: "discrepancy-reported-not-resolved",
      support: "established",
      why: "It is the last paragraph of the book and it is why the book exists. Read what he actually does: he runs the treaty line, he marks it, he reports both, and he returns the ground between as unsurveyed. Every one of those is an act of competence, and not one of them fixes anything — a deputy has no power to void a patent, refund a purchaser or move a county line, and his instructions do not pretend otherwise. This is the shape of the whole map in one paragraph. The system's own honest procedure, working correctly, can identify what happened and can do precisely nothing about it, and the tracts between the lines are now ground that two governments describe and neither can sell.",
    },
  ],
  closer: {
    prompt:
      "Four legs entered. Your reading goes into the record — what is this field book evidence of?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "two-forms",
        text: "That one boundary existed in two incompatible legal forms at once, and the form the office could sell from is the one that governed",
        correct: true,
        requiresEvidence: ["platting", "reporting"],
        unsupportedNote:
          "This is the reading the book will bear, and right now you are not carrying it. The platting and the reporting are where this argument lives — they are the two legs the field book itself accounts for. Go back and keep the entries your conclusion actually rests on.",
        why: "Right, and you built it out of the two legs this page can carry. The deputy's note says the 1859 line is on the plat of record in this office; his own run says the treaty puts it thirty-three chains and sixty links north of that. The office never chose between them, because there was never a moment when the choice was put — a treaty description is not something a register can sell a quarter-section out of and a plat is, and that difference did all the work for fourteen years. What you have is not a boundary that moved. It is a boundary that was two things, of which only one was usable.",
      },
      {
        id: "fraud",
        text: "That the 1859 survey was falsified",
        correct: false,
        why: "You declined that answer on all four legs and the deputy is the reason. He is running the same country with the same instruments and reporting against a colleague in a book he has to sign and return, and what he reports is a difference rather than an accusation. Fraudulent contract surveys were real and were prosecuted, so it is a fair thing to test — but nothing in these notes distinguishes a fraud from thirty-three chains of honest error over rough ground, and the finding is much worse if nobody cheated. A fraud can be prosecuted. This cannot.",
      },
      {
        id: "crude",
        text: "That the rectangular survey was too crude to fix a boundary",
        correct: false,
        why: "Read what is actually in your hands. A stone twenty inches by eight by six, marked with six notches, witnessed by a burr oak fourteen inches through bearing north forty-two west at thirty-one links and an elm at twenty-four — that corner can be recovered in a century, and corners set by this method routinely are. The system is precise enough to find its own disagreement to the link, which is how you know about it at all. The failure is not in the instrument. It is that the office had one plat and no procedure for a second opinion.",
      },
      {
        id: "clerical",
        text: "That the United States took the ground between the lines by an honest clerical error",
        correct: false,
        why: "Half right and it lets the machinery off in the same move the sale did. Nobody in the chain committed a wrong: the 1859 deputy ran a line, the draughtsman platted it, the register sold from the plat, the buyers paid, the county assessed. Calling the result an error implies somebody would have corrected it had they noticed — and this deputy noticed, wrote it down in the plainest language available to him, and the tracts are still sold. An error is something a system fixes. This is what the system did instead.",
      },
    ],
  },
};

export const UNIT_06_ACTIVITIES = {
  "railhead-land-office-receipt": ON_WHOSE_PAPER,
  "railhead-construction-payroll": WHISTLE_TO_WHISTLE,
  "railhead-survey-field-book": WHERE_THE_LINE_IS,
};
