// Case 8.01's three activities, keyed by the source id each one opens from.
//
// Fairmeadow runs slate B — INTERVIEW, TRACE, DISCREPANCY — which `THE-MAP-PROGRAM.md` §2 fixed
// before any of this existed, and which is Riverbend's slate and deliberately not Ellis Island's:
// the table's rule is that no unit repeats its neighbour's three, and Unit 7 is slate A. The engine
// list is only half of it. The right-hand column of that table is the binding half, and this unit's
// interview asks **what a neighbour will say on the record.**
//
// None of the other seven is that question. Riverbend asks how one arrangement looks from eight
// positions inside it; Philadelphia what a public position is made of; Richmond what testimony costs
// when the government is writing it down; Cottonwood Junction what entitles a person to be standing
// here and on whose paper; Ellis Island what the official question fails to ask. Every one of those
// is asked of somebody the record is thin about, or asked against a record that is wrong.
//
// **Here the record is complete and everybody is telling the truth.** That is the difficulty this
// unit exists to teach. The deed says exactly what it says. The appraisal's eight features are the
// real eight and its arithmetic is sound. The file jacket is a conscientious officer's file and its
// memorandum is a decent man writing down that he told the applicant the truth. Nobody on this map
// is lying and nothing on this map is hidden. The question is what any of them would put in writing,
// because **the whole mechanism runs on the difference between what is known and what is recorded**
// — and unlike every unit before it, that difference here is not concealment. It is a form design.
//
// ## The three records are one decision, followed backwards
//
// A deed states a rule that has been unenforceable for nine years. An appraisal prices a
// neighbourhood without using the word the rule is about. A file jacket refuses a man in a sentence
// that names no person. Read forwards they are three documents about three different things; read
// backwards they are one sentence being written three times, each time in a vocabulary further from
// the thing it means, until the last version has no one in it at all.
//
// The order is enforced. `suburb-neighborhood-appraisal` requires `suburb-covenant-deed`, and
// `suburb-underwriting-checklist` — a reader record, behind the lending office's door — requires the
// appraisal. That is the game's first **three-link chain** and it exists for two reasons: the
// appraisal's own prompt asks the player to read the deed's sixth restriction again, and a
// DISCREPANCY's evidence column is minted from an INTERVIEW's logged answers as
// `asked:<npc>:<question>` tokens, so without the gate the audit could open reading "You did not
// gather this" all the way down. Same shape as Riverbend's letter, Canal Crossroads' time book,
// Richmond's requisition, Cottonwood Junction's receipt and Ellis Island's manifest.
//
// It also decides which mission can be last. The deed can never be, so `arcClose` is authored on the
// loan file and on the appraisal, against the same shared const — the arc has to mean the same thing
// whichever door the player leaves by.
//
// ## Two of the eight speakers are indoors, and one of them is behind the counter
//
// `fieldNpcById()` resolves across every surface, so an interior NPC is legal as a speaker, a
// briefing and a debrief — decision log `0071` §4 for the test that was widened to allow it. Six of
// this interview's eight stand on the street and two are behind doors: the developer's sales agent
// in the model house and the association's counter clerk in the lending office. That split is the
// map stating its own shape, the same way Ellis Island's three-indoors did. **Everything on this map
// that decides anything happens in one of those two rooms**, and the interview has to be able to
// reach into both or it is asking its question of the people who were not consulted either.

// What Fairmeadow's three records turn out to be about, said once. Same const-rather-than-three-
// copies reason as Units 3, 5, 6 and 7.
const FAIRMEADOW_ARC =
  "Fairmeadow's three records are one sentence written three times, each time further from what it means. A deed prints a rule about people sixth on a list about fences and garages, and keeps printing it nine years after the Supreme Court took away the only way to make anybody obey it — because a covenant does not need a judge when it has a recorder's index, a title search, an association and a lender. An appraisal never uses the word at all: it credits a tract for restrictions of long term uniformly observed, gives one side of a road forty years of remaining economic life and the other fifteen, and arrives at the same map the word would have drawn, in language nobody can object to because nothing in it is a claim about anybody. A file jacket then refuses a man with nine years at one plant, clean credit and a federal guaranty, in a sentence with no person in it — the property offered does not meet the association's requirements as security — and closes. Every step is lawful. Every person is competent and most of them are decent. The only place the thing is said in words is a clause a lawyer left on a form out of habit, and the only reason anyone can still read it is that nobody bothered to take it off.";

// ---- M8.A — "The Sixth Item" (INTERVIEW, suburb-covenant-deed) -----------------------------------
//
// The clause is sixth, between the height of a fence and the date the list renews itself, in the
// same flat conveyancer's register as the rest. A student who expects the racial covenant to be set
// apart — different language, different place on the page — reads straight past it, which is how it
// was meant to be read. The mission is finding out who is still enforcing something no court will.
//
// Eight speakers, four questions, exactly eight useful answers — one per person, which is also the
// bar (`0052` §3: one number, not two). Two useful answers per question, so no question is dead, and
// every speaker answers two or three of four so everybody has a question that fires their fallback.
//
// The cast splits four and four again, and this split is the mission: **four people who could be
// asked to say it and would not, and four who were never asked at all.** Neither half is concealing
// anything. The first half has nowhere to put it and the second half has no standing to.
const THE_SIXTH_ITEM = {
  kind: "interview",
  id: "case-022-interview-the-sixth-item",
  title: "The Sixth Item",
  variant: "What Is Said And What Is Written",
  intro:
    "Six restrictions run with this lot. Five are about the property — the height of a fence, the cost of a house, what trade you may not carry on. The sixth is about the people, and the Supreme Court made it unenforceable in 1948. It is still printed here, on a deed recorded in 1953, and it is still working. Put four questions to eight people and find out who is doing the enforcing.",
  missionQuestion:
    "The sixth restriction has been unenforceable for nine years. Who is still enforcing it, and with what?",
  thinkingMove:
    "Separating what people know from what they will put in writing — and noticing that the second list is what survives.",
  briefing: {
    speaker: "suburb-householder",
    line: "It is in a tin box in the kitchen with the fire policy, and I have got it out twice in four years: once at settlement and once this afternoon for you. Read the sixth one. My husband says it cannot mean anything now and I expect he is right, and I would still like somebody to tell me who takes it off.",
  },
  howItWorks: {
    steps: [
      "Walk up to anybody on this map — the street, the model house, the lending office — and put any of the four questions to them.",
      "Most answers are ordinary and not worth carrying. One person in eight has the thing you came for; log that one.",
      "When all eight are logged, keep three for the Codex and file what the deed can support.",
    ],
    note: "Nobody here is lying to you and nobody is hiding anything. The mission is the gap between what a person knows and what they would put their name to.",
  },
  terms: [
    {
      term: "Restrictive covenant",
      definition:
        "A condition written into a deed that binds every future owner of the land, not just the person who signed it. It runs with the land, which is why it outlives everybody who agreed to it.",
    },
    {
      term: "Shelley v. Kraemer (1948)",
      definition:
        "The Supreme Court held that a court enforcing a racial covenant is state action and therefore barred by the Fourteenth Amendment. It did not make the covenants unlawful to write, record or obey — only unenforceable by a judge.",
    },
    {
      term: "Property owners' association",
      definition:
        "A body of the lot owners in a subdivision, usually created by the same deed that carries the restrictions, and empowered to see that they are kept.",
    },
    {
      term: "Title search",
      definition:
        "The examination a buyer's insurer makes of every recorded instrument affecting a lot. It reads the covenants whether anybody intends to enforce them or not.",
    },
  ],
  questions: [
    {
      id: "in-force",
      label: "Is the sixth restriction still in force?",
      note: "Not whether a court would enforce it — whether it is operating.",
    },
    {
      id: "on-the-record",
      label: "Would you put that in writing, with your name on it?",
      note: "The unit's own question. Ask it after something has been said out loud.",
    },
    {
      id: "the-line",
      label: "What is on the other side of the expressway?",
      note: "Two miles of borough, and every document on this map has an opinion about it.",
    },
    {
      id: "who-asked",
      label: "Who was asked before any of this was settled?",
      note: "Somebody advertised, somebody voted, somebody signed. Find out who was in the room.",
    },
  ],
  groups: [
    { id: "fairmeadow", label: "Fairmeadow", note: "The subdivision, two summers old." },
    {
      id: "borough",
      label: "The borough",
      note: "Across the right-of-way, and sixty years older.",
    },
    {
      id: "trade",
      label: "The people who handle the paper",
      note: "The office, the counter and the township.",
    },
  ],
  speakers: [
    {
      id: "suburb-householder",
      name: "Eileen Fahy",
      role: "First section, settled 1953",
      group: "fairmeadow",
      fallback:
        "I could not tell you. I have lived here four years and I have never had a reason to find out.",
      answers: {
        "in-force": {
          useful: true,
          text: "In force how? Nobody has ever knocked on my door about it. There is no meeting where it comes up and I have never heard a neighbour say it out loud in four years — not once, and I would have remembered. And then I got the deed out of the tin box for you and there it is in the middle of a list I signed. Here is what I keep turning over. I did not agree to it, exactly. I agreed to buy a house, and the man read out that there were restrictions, and I thought he meant the fence. It has been sitting in my kitchen since March of 1953 doing whatever it does, and I have never in my life been asked about it by anybody until this afternoon.",
          lead: "She has never been asked. Ask the township clerk who is asked, and when.",
        },
        "the-line": {
          text: "Broad Street, and a very good bakery. We used to go over for it before the road works started.",
        },
        "who-asked": {
          text: "Asked? We answered an advertisement in the paper and drove out on a Sunday. There was nothing to be asked about.",
        },
      },
    },
    {
      id: "suburb-sales-agent",
      name: "Vince Kearsley",
      role: "Sales office, Fairmeadow",
      group: "trade",
      fallback:
        "That is the association's end of it, not mine. I sell houses and I take applications.",
      answers: {
        "in-force": {
          useful: true,
          text: "Enforced by who, is the thing. Nobody comes out and enforces it. I have never turned anybody away and I would not know how — my job is to take the application and send it up the road. But you asked if it is in force and I will give you the honest answer, which is that it does not need anybody. It is on the recorded plan, so the title company reads it on every single sale in this section and reports it, and once it is reported the lender has read it too. That is four hundred and six lots, every time one of them changes hands, without one person having to decide anything. I have not had to think about it since 1953 and neither has anybody else out here, and that is not the same as it being gone.",
          lead: "The title company and the lender both read it. Ask at the counter who reads it there.",
        },
        "on-the-record": {
          text: "I would put the price in writing and I do, it is on the sheet. Anything past that goes to the association.",
        },
        "who-asked": {
          text: "The buyers get asked plenty. Name, income, employer, how long. It is all on the application.",
        },
      },
    },
    {
      id: "suburb-committee-man",
      name: "Ray Bocelli",
      role: "Citizens' committee, Fairmeadow",
      group: "fairmeadow",
      fallback: "You would want the township for that. I only speak for the committee.",
      answers: {
        "on-the-record": {
          useful: true,
          text: "In writing. Now that is a fair question and I will answer it straight, because I have written the handbills and I know exactly what goes on one. What I would put in writing is property values, the school, keeping the character of the section, and standing behind our neighbours. I have written all four of those and I will write them again tomorrow. What I would not put in writing is the sentence you are trying to get me to say, and I have never once said it at a meeting either, and neither has anybody else — because you do not have to. Every man in that room knows what the handbill means. It has never been explained to anybody. That is the difference between a thing that is agreed and a thing that is written, and I would say the agreed one is stronger.",
          lead: "The handbill says one thing and means another. Ask the veteran what he was told in words.",
        },
        "in-force": {
          text: "Legally? I am told not. Practically, this is a settled section of people who understand each other.",
        },
        "the-line": {
          text: "Older housing, older people. Nothing against them. It is simply a different sort of place.",
        },
      },
    },
    {
      id: "suburb-veteran",
      name: "Curtis Ledbetter",
      role: "Applicant, file 4,118",
      group: "borough",
      fallback:
        "I could not say. Nobody has ever explained that part of it to me and I have stopped asking.",
      answers: {
        "on-the-record": {
          useful: true,
          text: "You have put your finger on it. The officer up there told me to my face — the objection is to the location, not to you — and I believe he meant it kindly, and I have thought about that sentence every day since. Then the letter came, and the letter says the property offered does not meet the association's requirements as security. Read that again. There is no person in that sentence. Not me, not him, not anybody. Nine years at the one plant, credit clean, the guaranty sitting there unused, and the piece of paper I have got says a house I never owned was not good enough. What am I supposed to appeal? You cannot argue with a sentence that is not about you.",
          lead: "What he was told and what he was sent are two different documents. The file jacket has both.",
        },
        "who-asked": {
          text: "I was asked everything. Employer, income, discharge, nine years of it. All of it verified. None of it mattered.",
        },
        "in-force": {
          text: "I have not read the deed. I never got that far — you do not see the deed until settlement.",
        },
      },
    },
    {
      id: "suburb-appraiser",
      name: "Howard Renfrew",
      role: "Fee appraiser, under contract",
      group: "trade",
      fallback:
        "That is outside a valuation. I am paid for a rating of location and I do not go past the eight features.",
      answers: {
        "the-line": {
          useful: true,
          text: "A right-of-way, and I rated it as a barrier — Feature Two, protection from adverse influences, and it carries the heaviest weight of the eight. What I mean by barrier is that the two sides do not mix, and the reason I can write that is that no through street connects them. Now you are going to tell me you walked across, and I know you did, because the old township road is still on the ground out there. It comes out when they open the road. I rate the property as it will be, not as it is on a Tuesday — that is what an estimate of remaining economic life is — and I will tell you plainly that a boundary I have priced into four hundred lots does not exist yet. That is not a mistake in the report. It is what the report is for.",
          lead: "He rated a boundary that is not there yet. The valuation report will say so in its own words.",
        },
        "in-force": {
          text: "Recorded restrictions of long term, uniformly observed. That is the phrase, and it is Feature Two.",
        },
        "who-asked": {
          text: "The lender orders the report and the lender reads it. Nobody else is a party to it, including the applicant.",
        },
      },
    },
    {
      id: "suburb-borough-woman",
      name: "Verna Pilch",
      role: "Broad Street, thirty-one years",
      group: "borough",
      fallback:
        "You would have to ask over there. Nobody from over there has ever asked me anything.",
      answers: {
        "the-line": {
          useful: true,
          text: "A road with no cars on it, and past that, us. I have been in that house thirty-one years. New roof in 1951, new furnace two winters ago, my husband painted the whole of the front the summer before he died and I have kept it up since. Now somebody has been out here with a clipboard — I watched him from the window, he did not knock — and I am told the figure for this side is fifteen years. Fifteen years of remaining life on a house I have just re-roofed. Nobody measured anything. He looked at the street. And the bank reads his number and not my roof, and that is why young couples over here cannot get the terms the new section gets, and that is why the street looks the way he says it looks.",
          lead: "Fifteen years, and nobody knocked. The valuation report has that number on it.",
        },
        "on-the-record": {
          text: "I have said it to anybody who would listen, and I would sign it. Nobody has ever asked me to.",
        },
        "who-asked": {
          text: "Not one person. Not about the road, not about the ordinance, not about any of it.",
        },
      },
    },
    {
      id: "suburb-township-clerk",
      name: "Margaret Kohl",
      role: "Township secretary",
      group: "trade",
      fallback:
        "The township has no authority over that whatever. It is a private agreement between the parties.",
      answers: {
        "who-asked": {
          useful: true,
          text: "Everybody was asked, and I can show you exactly how. Ordinance 118 was advertised in the legal notices of the county paper on two successive weeks, which is what the statute requires, in six-point type on the page with the sheriff's sales. The public hearing was held on a Tuesday morning at ten. Three people came, and two of them were the developer's engineer and his attorney. It was adopted that evening, unanimously. Every step of that is correct and I did it myself, and I have thought since about what advertised means. It means published. It does not mean read. The people it affects most are two miles away in another municipality and they do not take our legal notices, and there is nothing in the statute that says they should.",
          lead: "Advertised is not the same as read. The borough was not in the room.",
        },
        "in-force": {
          text: "A private covenant is not the township's business. We enforce the zoning ordinance and nothing else.",
        },
        "the-line": {
          text: "The right-of-way is the municipal boundary as well, since 1954. That is the only part I can speak to.",
        },
      },
    },
    {
      id: "suburb-counter-clerk",
      name: "Arlene Petrofsky",
      role: "Counter clerk, building & loan",
      group: "trade",
      fallback:
        "That is the committee's, and I am not on the committee. I take them in and I send them out.",
      answers: {
        "who-asked": {
          useful: true,
          text: "Everyone who walks up to this counter is asked the same eleven things and I have asked them a thousand times. Name, employer, income, how long, what you have saved, what you owe. Then it goes out to the appraiser and comes back with a rating, and Tuesday morning the committee sits. Here is the part nobody notices. Not one of those eleven questions is about the neighbourhood, and the neighbourhood is what decides it — so the man standing here answers everything he is asked, perfectly, and is refused on the only question he was never given a chance to answer. And I hand him the letter. It says the property offered. He always reads it twice.",
          lead: "Eleven questions, none of them the one that decides. The routing sheet in the file shows the order.",
        },
        "on-the-record": {
          text: "I write down what I am told and I initial it. What I think about it is not a field on the form.",
        },
        "in-force": {
          text: "The title report lists every recorded restriction. It goes in the jacket. I do not read them.",
        },
      },
    },
  ],
  requires: {
    useful: 8,
    label: "Eight people, eight things worth writing down. Find all eight.",
  },
  notebook: {
    capacity: 3,
    prompt:
      "Eight accounts, three slots. The five you leave out are not wrong — they are the ones your conclusion will not have to name.",
    emptyNote: "Log an answer worth keeping and it becomes available here.",
  },
  lockedNote:
    "Somebody on this map is still holding the thing you came for. Eight people, eight answers.",
  anomaly: {
    noticed:
      "The recorded plan of lots is endorsed at the foot with the recorder's book and page, and beneath that, in pencil, in a ruled hand, a second reference: a book number four digits long, and the year 1972. The county recorder's books ran to three digits in 1953 and reached four in 1968. The pencil is not the attorney's and it is not the recorder's, and the figures are ruled the way the altered entry in the Riverbend wharf book was ruled.",
    note: "A pencilled cross-reference on a recorded plan is the most ordinary marginal note in a title office — somebody searching this lot later, noting where else it appears, and leaving the note for the next searcher. That accounts for the hand, the pencil and the placement. What it does not account for is that the note is on the recorder's own file copy and predates the book it points at by fifteen years. Nineteen seventy-two is not a guess: it is the year this section's covenants come up for their automatic ten-year renewal for the second time, and the year a majority of the then owners could vote them out. Somebody has gone to the one document that fixes that date and written down where the answer will be filed. File the record as it stands and flag the pencil.",
  },
  debrief: {
    speaker: "suburb-householder",
    line: "So it is not that nobody enforces it. It is that everybody does, a little, without ever having to decide to. I think I would rather it were somebody I could go and see.",
    established:
      "The sixth restriction is unenforceable in any court and fully operative in every office. Shelley v. Kraemer barred a judge from making anybody obey a racial covenant; it left the clause lawful to write, lawful to record and lawful to keep, and the eight accounts you gathered show what kept it running without one. It is on the recorded plan, so a title company reports it on every sale in the section and a lender reads it in the report. It is credited on a valuation under Feature 2 as a recorded restriction of long term, uniformly observed. It is understood at an association meeting without ever being said aloud, and written up as property values and the character of the section. And it renews itself automatically unless a majority of owners votes it out, which requires somebody to call the vote. Nobody in the chain has to agree with it, and nobody in the chain is asked.",
    remains:
      "One deed and eight conversations on one afternoon. Whether Fairmeadow's clause was ever the reason a specific application was refused cannot be settled from this page — the refusal names a property, not a person, and that is the point of it. Nor can this deed tell you how the sixth restriction got onto the form: whether the developer asked for it, the attorney supplied it as boilerplate, or the lender's own manual recommended it. The three are not the same and the deed reads identically under all three.",
  },
  openQuestions: [
    "The clause renews itself in 1980 unless a majority of the four hundred and six owners votes it out. Who would have to call that vote, and what would it cost them locally to be the one who did?",
    "Every person you asked could describe the mechanism accurately and none of them thought of themselves as part of it. Is that a failure of the people or a property of the design?",
  ],
  historicalRecord: {
    documented: [
      "Shelley v. Kraemer, 334 U.S. 1 (1948) held that judicial enforcement of a racially restrictive covenant is state action barred by the Fourteenth Amendment; Barrows v. Jackson, 346 U.S. 249 (1953) closed the damages route.",
      "Racial occupancy clauses continued to be drafted, recorded and reported on title after 1948, and the FHA's own 1938 Underwriting Manual had recommended model covenant language at §980(3)(g).",
      "Subdivision restrictions of this period conventionally carried automatic renewal clauses and a domestic-servant exception, and were enforced socially by property owners' associations rather than by litigation.",
      "Township zoning amendments were adopted after advertisement in a newspaper of general circulation and a public hearing, with no requirement to notify residents of an adjoining municipality.",
    ],
    reconstructed: [
      "Eileen Fahy, Vince Kearsley, Ray Bocelli, Curtis Ledbetter, Howard Renfrew, Verna Pilch, Margaret Kohl and Arlene Petrofsky are composite people, and Fairmeadow is a composite subdivision in the Delaware Valley.",
      "The deed itself is a composite of standard mid-century restriction language rather than a transcription of a surviving instrument.",
    ],
    fiction: [
      "A Chronicler walking a subdivision in August 1957 putting four questions to eight people, and everybody answering.",
      "The pencilled cross-reference on the recorded plan, and the hand that ruled it.",
    ],
    debated: [
      "Historians agree that covenants continued to operate after 1948 and disagree about the weight to give each mechanism — the title industry, the lender, the association, the broker — in different metropolitan areas.",
    ],
  },
  codexFiling: {
    summary:
      "A 1953 deed carrying six restrictions, the sixth of which is about people; unenforceable since 1948 and operating through the recorder's index, the title search, the lender and the association.",
    tags: ["Whose account is this", "What the record leaves out", "Who is permitted to speak"],
  },
  closer: {
    prompt:
      "Eight accounts and one deed. Your reading goes into the record — what keeps the sixth restriction working?",
    skillCategory: "Contextualization",
    options: [
      {
        id: "routine",
        text: "A chain of ordinary offices that each read it and none of them decide it",
        correct: true,
        why: "Right, and the word doing the work is *decide*. Follow it: the clause is on the recorded plan, so the title company reports it on every sale without forming a view; the lender reads the title report and credits Feature 2 for restrictions of long term uniformly observed, without forming a view; the association understands what its own handbill means without writing it; and it renews itself in 1980 unless somebody calls a vote. Five accounts you gathered say some version of *it is not my end of it* and all five are telling the truth. A rule that needed somebody to enforce it lost its enforcer in 1948. This one lost nothing, because it never had one.",
      },
      {
        id: "struck-down",
        text: "Nothing — the Supreme Court voided these clauses in 1948 and this one is a dead letter on an old form",
        correct: false,
        why: "This is the reading the case is most often given and it is the wrong half of the holding. Shelley barred a *court* from enforcing a covenant; Chief Justice Vinson was explicit that voluntary adherence to the terms is not state action and remains untouched. The clause stayed lawful to write, to record and to obey. That is why an attorney was still printing it in 1953, why the title company still reports it, and why the appraisal on this map can credit it. A dead letter does not appear in a valuation four years later as a protection worth rating.",
      },
      {
        id: "the-committee",
        text: "The citizens' committee, which polices the section on behalf of the owners",
        correct: false,
        why: "The committee is the most visible thing on this map and the least load-bearing, which is worth noticing rather than dismissing. It writes handbills, it holds meetings, and its own chairman told you he has never once said the sentence out loud and has never had to. But the association cannot read a title report, cannot rate a location, and cannot decline a loan. Every consequence in this case ran through an office nobody in Fairmeadow attends. If the committee dissolved tomorrow the mechanism would not notice.",
      },
      {
        id: "the-lender",
        text: "The building & loan, which refuses anyone the covenant excludes",
        correct: false,
        why: "Closer, and still not it — the association is the last link, not the whole chain, and treating it as the whole chain gets the history wrong in a way that matters. The lender does not read the sixth restriction and act on it; the counter clerk told you she does not read the restrictions at all. What it reads is a rating, and the rating is produced by a fee contractor from a form that never names a person. Naming the lender as the enforcer puts an intention where the design has a procedure, which is the thing the file jacket and the valuation on this map exist to show you.",
      },
    ],
  },
};

// ---- M8.B — "Step Five" (TRACE, suburb-gi-bill-loan-file) ----------------------------------------
//
// The jacket is already a route: seven numbered steps, filed in the order they happened, with dates.
// The mission is walking it and saying what changes at each step — and the thing that changes at
// step five is the subject. Up to that point the file is about a man. After it, it is about a place.
//
// The standing distractor is `applicant-at-fault`, which is the answer to no leg and is the reading
// the whole mission exists to refuse. `not-established` is the second: the honest answer for a leg
// this jacket cannot carry, and the scored move is knowing which those are.
const STEP_FIVE = {
  kind: "trace",
  id: "case-022-trace-step-five",
  title: "Step Five",
  variant: "One Application, Seven Steps",
  intro:
    "A manila jacket with seven sheets in it, read in the order they were filed. Application 4,118: a veteran with an unused entitlement, nine years at one plant, clean credit and a payment ratio of twenty-one per cent. Follow it from the counter to the letter and say what changes at each step, and how far this jacket carries what you say.",
  missionQuestion:
    "Steps one to four all clear. At which step does the application actually fail, and what changes there?",
  thinkingMove:
    "Following one document through a procedure and naming the step where the subject of it changes.",
  briefing: {
    speaker: "suburb-veteran",
    line: "They sent it back to me with the letter, which they did not have to do. Seven sheets and every one of them says yes until you get to the fifth. Take it. I have read it enough times.",
  },
  howItWorks: {
    steps: [
      "Walk the file from the counter to the closed jacket, one step at a time.",
      "At each step, say what the step does to the application — and how far this jacket actually carries that.",
      "Two of the readings offered are things this file cannot establish. Saying so is the scored move.",
    ],
    note: "Every step in this file is ordinary practice and none of it is unlawful. That is what makes it worth following.",
  },
  terms: [
    {
      term: "Certificate of eligibility",
      definition:
        "The Veterans Administration's document confirming a veteran's entitlement to a guaranteed loan. It proves the guaranty is available; it does not oblige anyone to lend.",
    },
    {
      term: "Loan guaranty (Title III)",
      definition:
        "Under the Servicemen's Readjustment Act of 1944 the government guaranteed a portion of a loan made by a private lender. It lent no money itself, so an entitlement was worth exactly as much as some bank's willingness to write the loan.",
    },
    {
      term: "Payment-to-income ratio",
      definition:
        "The proposed monthly payment as a percentage of verified income. Twenty-one per cent was comfortably inside every lender's limit in 1957.",
    },
    {
      term: "Rating of location",
      definition:
        "The appraiser's weighted grade for the neighbourhood, not the house. No property may be rated higher than its location, and no strength in the applicant may be substituted for a deficiency in it.",
    },
  ],
  subject: {
    label: "Application No. 4,118 for a guaranteed home loan, June to August 1957",
    note: "ROUTING AND ACTION. Applicant a veteran, honourable discharge, certificate of eligibility attached, entitlement unused.",
  },
  nodes: [
    { id: "counter", label: "The counter, 11 June" },
    { id: "verification", label: "The credit bureau and the employer" },
    { id: "arithmetic", label: "The association's own arithmetic" },
    { id: "appraisal", label: "A fee appraiser, on the property, 20 June" },
    { id: "committee", label: "The loan committee, Tuesday 15 July" },
    { id: "letter", label: "A letter, 16 July" },
    { id: "closed", label: "The jacket, closed 2 August" },
  ],
  effects: [
    { id: "entitlement-priced", label: "A federal entitlement becomes a private decision" },
    { id: "applicant-cleared", label: "The applicant clears every test he is given" },
    {
      id: "subject-changes",
      label: "The file stops being about a man and starts being about a place",
    },
    { id: "location-substituted", label: "The location's grade overrides everything under it" },
    { id: "reason-emptied", label: "A reason becomes a sentence with no person in it" },
    { id: "record-closed", label: "The refusal leaves nothing that can be appealed" },
    {
      id: "applicant-at-fault",
      label: "Something in the applicant's own file caused the refusal",
    },
    { id: "not-established", label: "This jacket does not establish it" },
  ],
  supportLevels: [
    { id: "stated", label: "The jacket states it" },
    { id: "inferred", label: "Reasonable from the jacket, not stated" },
    { id: "not-shown", label: "Not shown by this jacket" },
  ],
  supportPrompt: "And how far does this file jacket actually carry that?",
  ledgerPrompt: "What does this step do to the application?",
  legs: [
    {
      id: "taken",
      from: "counter",
      to: "verification",
      label: "An entitlement is handed across a counter",
      transforms:
        "The certificate of eligibility is attached to the application and the entitlement recorded as unused. The file then goes out for a credit report and a verification of employment.",
      actor: "Arlene Petrofsky, at the counter, and the association's mortgage department.",
      effect: "entitlement-priced",
      support: "not-shown",
      why: "Both halves, and they point opposite ways — the same shape as the first leg of Riverbend's hogshead. It is true that the entitlement becomes a private decision here, and it is the single most important fact about the whole programme: Title III of the Servicemen's Readjustment Act guaranteed a portion of a loan made by a private lender and lent nothing itself, so a veteran's entitlement was worth precisely what some bank was willing to write. Curtis Ledbetter told you the consequence in one sentence — the guaranty sitting there unused. And this jacket cannot establish it. What is on the page is a certificate attached and an application taken, which is what the page would look like in a world where the guaranty compelled the loan. You know this from the statute. You cannot prove it from the file, and holding both of those at once is the job.",
    },
    {
      id: "verified",
      from: "verification",
      to: "arithmetic",
      label: "Everything asked about the man comes back clean",
      transforms:
        "Credit report returned 17 June, rated satisfactory, no derogatory information, two accounts paid as agreed. Verification of employment returned 19 June: nine years' continuous service, four thousand eight hundred and sixty dollars, prospects steady.",
      actor: "A credit bureau, and a foreman at the plant signing a form.",
      effect: "applicant-cleared",
      support: "stated",
      why: "The jacket says so in its own numbers and this is the leg to be exact about, because everything later depends on it. Two tests, both external to the association, both returned inside a week, both clean. Nine years' continuous service in 1957 is a long time at one employer. There is no ambiguity here to be resolved later and no derogatory line for a committee to weigh. Whatever happens at step six, it does not happen because of anything on these two sheets — and knowing that with certainty is what makes the rest of the file readable.",
    },
    {
      id: "computed",
      from: "arithmetic",
      to: "appraisal",
      label: "The association finishes with the man and orders a report on the ground",
      transforms:
        "Ratio of proposed monthly payment to verified income computed at 21 per centum, within the association's limits. Appraisal then ordered, 20 June, upon the property described.",
      actor: "The association's mortgage department.",
      effect: "subject-changes",
      support: "stated",
      why: "This is the hinge and the jacket is explicit about it: *appraisal ordered upon the property described*. Up to this line every sheet in the file is about Curtis Ledbetter — his discharge, his credit, his employer, his income, his arithmetic — and every one of them says yes. From this line on, not one sheet is about him. The subject of the file changes here, in a routine instruction nobody would look at twice, and the change is not a decision anybody made. It is the order the form is filled in.",
    },
    {
      id: "rated",
      from: "appraisal",
      to: "committee",
      label: "A grade for the neighbourhood arrives and outranks everything under it",
      transforms:
        "Report returned 8 July; location rating and remarks noted and filed herewith. The file goes to committee carrying a First Grade tract, a Fourth Grade borough, and a note that loans in that section are not recommended for the maximum term or the maximum ratio.",
      actor: "Howard Renfrew, fee appraiser, paid per report and never present.",
      effect: "location-substituted",
      support: "inferred",
      why: "Reasonable and not stated, which is a distinction worth keeping. What the jacket states is a sequence: appraisal filed, then declined. It does not contain the sentence *the rating caused the refusal* — a routing sheet never contains that sentence. What lets you read it is two things the jacket does hold. The mortgage officer's memorandum says the objection is to the location and not to the applicant. And the checklist on his desk says the rule outright: no property may be rated higher than its location, and no strength under Part Four may be substituted for a deficiency under Part Three. Ledbetter's nine years are Part Four. They cannot reach.",
    },
    {
      id: "declined",
      from: "committee",
      to: "letter",
      label: "The refusal is written in a sentence with nobody in it",
      transforms:
        "Submitted to the committee 15 July. ACTION: DECLINED. Reason to be stated to the applicant: that the property offered does not meet the association's requirements as security. Applicant advised by letter 16 July.",
      actor: "The loan committee, Tuesday morning, and the officer who signs the letter.",
      effect: "reason-emptied",
      support: "inferred",
      why: "The words are on the page; that they are empty is your reading, and it is defensible. Look at what the sentence contains: a property, a set of requirements, and a standard. It contains no applicant, no ground he could dispute and no fact he could correct. Ledbetter put it better than any analysis will — *you cannot argue with a sentence that is not about you.* Note also what precedes it. The officer told him the truth to his face and then signed a letter that does not say it, and the memorandum records both. That is not a man being sly; it is a man doing exactly what the procedure requires and knowing what it costs.",
    },
    {
      id: "filed",
      from: "letter",
      to: "closed",
      label: "The jacket closes and the guaranty is never called upon",
      transforms:
        "Guaranty not called upon. File closed 2 August. Memorandum, mortgage officer to file: nothing further is required to be stated to an applicant and nothing further has been.",
      actor: "The mortgage officer, filing.",
      effect: "record-closed",
      support: "not-shown",
      why: "The reading is right and this jacket is the wrong place to prove it from, which is the second time this file has done that to you. What is on the page is that the file closed and the guaranty went uncalled. Whether Ledbetter had any route of appeal is not on it: a mutual association's committee is answerable to its members, the Veterans Administration guaranteed loans rather than granting them, and neither the letter nor the memorandum names an authority he could take it to. That is an argument from what is absent, and an argument from absence is weaker than the four legs above it. Say it, and say that you are saying it from silence.",
    },
  ],
  notebook: {
    capacity: 3,
    prompt:
      "Six legs, three slots. Keep the ones your conclusion has to stand on — including, if it belongs there, one the jacket cannot carry.",
    emptyNote: "Log a leg and it becomes available here.",
  },
  lockedNote: "The jacket has seven sheets in it and you have not read them all.",
  debrief: {
    speaker: "suburb-veteran",
    line: "Step five. I worked that out myself about a week after, sitting in the car. It does not help, but it is better than not knowing.",
    established:
      "The application failed at step five, and step five is not a decision. Steps one to four test the applicant and he passes all four: entitlement real and unused, credit clean, nine years' employment verified, payment ratio at twenty-one per cent. Step five orders a report on the property, and from that line the file is no longer about him. What comes back is a grade for a neighbourhood produced by a fee contractor who never met him, and the rule the lender underwrites by forbids any strength in the applicant from making up a deficiency in the location. Step six converts that into a sentence with no person in it, and step seven closes the file. Every step is ordinary, lawful and correctly recorded.",
    remains:
      "One jacket establishes the mechanism precisely and establishes nothing at all about the applicant — which is why it is read beside the appraisal rather than alone. Whether Curtis Ledbetter's application would have been approved on an identical property inside the tract cannot be answered from this file, because no such application is in it. The pattern across thousands of jackets is the finding; any single one of them, including this one, is a mechanism with a man attached.",
  },
  openQuestions: [
    "The memorandum says the officer told the applicant the truth in those words and that nothing further was required to be stated. If a lender had been required to state the actual ground of refusal in writing, which of the seven steps would have had to change?",
    "This file records no illegality at any step. What kind of evidence would establish a violation — and does the absence of one here tell you about the association, or about what the law required in 1957?",
  ],
  historicalRecord: {
    documented: [
      "The Servicemen's Readjustment Act of 1944, Title III, guaranteed a portion of loans made by private lenders rather than lending directly, so approval rested with the lender.",
      "The Veterans Administration relied on FHA appraisal practice, including the rating of location and the rule that no property may be rated higher than its location.",
      "Lenders were under no obligation in 1957 to state the substantive ground of a refusal to an applicant.",
      "The pattern of denial to Black veterans with valid entitlements is documented across the programme; see Ira Katznelson, When Affirmative Action Was White (2005).",
    ],
    reconstructed: [
      "Application 4,118 is a composite of the routing and committee-action sheets savings-and-loan mortgage departments kept, not a transcription of a surviving file.",
      "Curtis Ledbetter, Arlene Petrofsky, Howard Renfrew and the mortgage officer are composite people.",
    ],
    fiction: [
      "A Chronicler being handed a lender's file jacket by the applicant himself, on a street, in 1957.",
    ],
  },
  codexFiling: {
    summary:
      "A lender's file jacket on a guaranteed-loan application: four steps testing the applicant, all clear, and a refusal produced at the fifth by a grade for the ground he wanted to build on.",
    tags: ["What a paper permits", "Who does the work", "What a price records"],
    seeAlso: ["case-022-discrepancy-first-grade-fourth-grade"],
  },
  arcClose: {
    speaker: "suburb-veteran",
    line: "A deed, a valuation and my own file. Somebody should have to read those three together before they are allowed to tell me it was nothing personal.",
    established: FAIRMEADOW_ARC,
  },
  closer: {
    prompt:
      "Seven steps followed. Your reading goes into the record — what does this jacket establish?",
    skillCategory: "Causation",
    options: [
      {
        id: "mechanism",
        text: "A lawful procedure that transfers the decision from the applicant to the ground, at a step nobody makes a decision at",
        correct: true,
        why: "Right, and the phrase to hold onto is *at a step nobody makes a decision at*. Step five is a clerk ordering a standard report. It is the least deliberate line in the file and it is where the case is settled, because it changes what the file is about. Everything before it tests a man and clears him; everything after it grades a place. The committee that declines is applying a rule it did not write to a number it did not produce, and the officer who signs the letter tells the applicant the truth to his face and then writes a sentence with nobody in it. No step is unlawful and no step is a lie. The mechanism is the finding.",
      },
      {
        id: "prejudice",
        text: "A committee that refused the applicant and used the property as cover",
        correct: false,
        why: "This is the natural reading and the file will not carry it, which is the harder and more useful outcome. The committee never saw a reason to weigh: it received a First Grade tract, a Fourth Grade borough, a note against maximum terms in that section, and a rule forbidding any strength in Part Four from reaching a deficiency in Part Three. The memorandum, written to the file by a man with no audience, records the objection as the location and says he told the applicant so. A committee constructing cover does not preserve the sentence that would convict it. What this jacket shows is worse than a hostile committee, because a hostile committee can be replaced.",
      },
      {
        id: "guaranty-failed",
        text: "The Veterans Administration refused the guaranty",
        correct: false,
        why: "It did not, and the file says so in three places: the certificate of eligibility is attached, the entitlement is recorded as unused, and step seven reads *guaranty not called upon*. That is the structure of Title III and the reason this case is possible. The government guaranteed a portion of a loan a private lender chose to make; it never lent and it never approved. The entitlement was real, available and worth nothing here, because there was nobody it could be presented to who was obliged to accept it.",
      },
      {
        id: "insufficient",
        text: "Not enough — one jacket cannot show why any particular application was refused",
        correct: false,
        why: "Half right, and it is the half worth arguing with. You are correct that one file cannot establish anything about the applicant, and the debrief says so. But that is not what you were asked. This jacket carries a dated sequence, an explicit routing instruction, a rating filed at a named step and a memorandum stating the ground — which is enough to establish the *mechanism* precisely, and the mechanism is a historical claim in its own right. Refusing to conclude anything from a document that documents its own procedure is not caution; it is declining to read.",
      },
    ],
  },
};

// ---- M8.C — "First Grade, Fourth Grade" (DISCREPANCY, suburb-neighborhood-appraisal) -------------
//
// The audit that the deed's interview pays for. Five lines from a valuation, checked against eight
// accounts gathered on the same afternoon — and the finding is not that the appraiser lied. He did
// not. Two of the five lines are exactly true, one is contradicted by ground the player has walked
// across, and the other two are the interesting kind: a correct form of words standing in for a word
// the form may no longer use, and a consequence offered as a cause.
//
// `gapRequiredFor` is a **list** — contradicted and complicated both demand a reason — the same
// shape Canal Crossroads used first, and for the same reason: on this record a line that is accurate
// and still not telling you what it appears to is the case the engine was built for.
const FIRST_GRADE_FOURTH_GRADE = {
  kind: "discrepancy",
  id: "case-022-discrepancy-first-grade-fourth-grade",
  title: "First Grade, Fourth Grade",
  variant: "Eight Features, One Absent Word",
  intro:
    "A fee appraiser's rating of location, May 1957. Eight features, each graded and weighted, and no property may be rated higher than its location. Nothing on this sheet is false and one word is missing from all of it. Audit five of its lines against what the eight people you asked actually told you.",
  missionQuestion:
    "The word that would explain this rating is not on the form. How does the form get to the same answer without it?",
  thinkingMove:
    "Auditing a document that is accurate line by line and still not saying what it is doing.",
  briefing: {
    speaker: "suburb-appraiser",
    line: "You can read it, I am not going to stop you — the lender has it and so does the file. Every figure on there I can stand behind. Read Feature Two twice, and then tell me which word you were expecting to find.",
  },
  howItWorks: {
    steps: [
      "Take each line of the valuation and say what the eight accounts you gathered do to it.",
      "Where a line is contradicted or complicated, say why — the sheet is accurate, so the reason is never that somebody lied.",
      "Then file what this rating is.",
    ],
    note: "Two of the five lines are supported by everything you found. Marking them so is part of the audit, not a concession.",
  },
  terms: [
    {
      term: "Rating of location",
      definition:
        "Eight weighted features producing one grade for the neighbourhood. Feature 2, protection from adverse influences, carried the heaviest weight of the eight.",
    },
    {
      term: "Remaining economic life",
      definition:
        "The appraiser's estimate of how many years the improvements will keep producing value. It sets the maximum term of a loan, which is why a low figure closes off long mortgages in a whole section.",
    },
    {
      term: "Adverse influence",
      definition:
        "In FHA underwriting, anything expected to reduce a neighbourhood's desirability. Until 1947 the agency's own manual named the entry of other racial groups as one; the language was removed, the feature was not.",
    },
    {
      term: "Fee appraiser",
      definition:
        "An independent contractor paid per report, engaged by the lender. He is not the lender's employee and the applicant is not a party to his report.",
    },
  ],
  record: {
    label: "Valuation Report and Rating of Location, Fairmeadow and Vicinity",
    attribution: "A fee appraiser under contract to the insuring agency, May 1957",
    context:
      "The eight-line sheet a lender reads before it reads the application. Feature 2 — protection from adverse influences — carries the heaviest weight of the eight, and until 1947 the agency's own Underwriting Manual said what it meant: a neighbourhood keeps its value where properties continue to be occupied by the same social and racial classes, and a recorded racial covenant was listed among the protections an appraiser should look for. That sentence was taken out between 1947 and 1950. The features, the weights and the resulting map were not changed.",
    text: [
      "RATING OF LOCATION. — Feature 1, Relative Marketability. Feature 2, Protection from Adverse Influences. Feature 3, Freedom from Special Hazards. Feature 4, Adequacy of Civic, Social and Commercial Centers. Feature 5, Adequacy of Transportation. Feature 6, Sufficiency of Utilities and Conveniences. Feature 7, Level of Taxes and Special Assessments. Feature 8, Appeal. Each feature is graded and weighted; the weighted total is the location rating, and no property may be rated higher than its location.",
      "REMARKS ON FEATURE 2. The tract is protected by recorded restrictions of long term, uniformly observed, and by an active property owners' association. Occupancy throughout is homogeneous and the economic background of the occupants is uniform and stable.",
      "The new expressway right-of-way lies between the subject and the older borough to the east, where occupancy is mixed, improvements average sixty years of age, and the trend of the past decade indicates a declining standard of maintenance; the right-of-way affords an effective barrier and no through street connects the two.",
      "REMARKS ON FEATURE 1. Demand is strong and turnover rapid; resale within the tract has been at or above original price in every instance examined.",
      "ESTIMATED REMAINING ECONOMIC LIFE OF IMPROVEMENTS: subject tract, 40 years; borough east of the right-of-way, 15 years. — LOCATION RATING: subject tract, First Grade. Borough east of right-of-way, Fourth Grade; loans in that section are not recommended for the maximum term or the maximum ratio.",
    ],
  },
  verdicts: [
    { id: "supported", label: "Supported by what you gathered" },
    { id: "complicated", label: "Complicated by what you gathered" },
    { id: "contradicted", label: "Contradicted by what you gathered" },
    { id: "cannot-tell", label: "Not enough to say" },
  ],
  verdictPrompt:
    "For each line of the valuation, decide what the eight accounts you gathered on this map actually do to it.",
  gapRequiredFor: ["contradicted", "complicated"],
  gapPrompt: "Why does the line differ from what you gathered?",
  gapKinds: [
    { id: "never-looked", label: "Nobody went and looked" },
    { id: "no-field", label: "The form has no line that could hold it" },
    { id: "formula", label: "A correct form of words for a thing the form may no longer name" },
    { id: "consequence", label: "The result of the rule, offered as the reason for it" },
    { id: "not-yet", label: "Written as a fact about something that has not happened" },
    { id: "undetermined", label: "Not enough evidence to determine why" },
  ],
  claims: [
    {
      id: "restrictions",
      text: "The tract is protected by recorded restrictions of long term, uniformly observed, and by an active property owners' association.",
      verdict: "complicated",
      gap: "formula",
      why: "Every word of it is true and it is the most consequential line on the sheet. The restrictions are recorded, they are of long term — automatic ten-year renewals until at least 1980 — and they are uniformly observed, which the sales agent explained precisely: the title company reports them on every one of four hundred and six lots without a single person deciding anything. The association is active; its chairman writes the handbills. What the line does not do is say which restriction. There are six, five of them about fences, garages and the cost of a house, and one about people. Until 1947 the agency's own manual named a recorded racial covenant among the protections Feature 2 should look for; the sentence was removed and the feature kept its weight. This is what the feature says now. Note the date as well: Fairmeadow's covenants were recorded in 1953, three years after the agency stopped insuring property carrying a covenant recorded after February 1950 — and the line is safe from that rule precisely because it does not recite them.",
    },
    {
      id: "no-through-street",
      text: "The right-of-way affords an effective barrier and no through street connects the two.",
      verdict: "contradicted",
      gap: "not-yet",
      why: "You walked across it. The old township road crosses the expressway at grade, is on the ground today, and is the only reason the two halves of this map are one place — and the appraiser will tell you so himself if you ask, without a flicker of embarrassment. His answer is the finding: *it comes out when they open the road, and I rate the property as it will be.* So the line is not an error and it is not a lie. It is a fact about 1959 written in the present tense in May 1957, priced into four hundred lots and a borough's loan terms, and acted on by a committee fourteen months before it becomes true. The road foreman knows the crossing comes out. The people on the far side of it have not been told, and the rating has already been applied to them.",
    },
    {
      id: "homogeneous",
      text: "Occupancy throughout is homogeneous and the economic background of the occupants is uniform and stable.",
      verdict: "complicated",
      gap: "consequence",
      why: "Accurate as a description and upside down as an explanation, which is the hardest of the five to mark and the one most worth getting right. The tract is homogeneous. It is homogeneous *because* of the sixth restriction, the title report, the association and the lender — that is the chain the eight of them described to you between them. The rating then credits the tract for being that way, and the credit produces First Grade, and First Grade produces the loans, and the loans produce the next four hundred lots. The line offers as the ground of the rating the thing the rating is manufacturing. Nothing about it is a false statement; a student who marks it supported has read the words correctly and missed the direction the causation runs.",
    },
    {
      id: "resale",
      text: "Demand is strong and turnover rapid; resale within the tract has been at or above original price in every instance examined.",
      verdict: "supported",
      gap: null,
      why: "Supported, and mark it so — an audit that finds everything wrong is not an audit. The sales agent's account of Sunday traffic and ninety-day delivery is consistent with it, and nothing you gathered anywhere on this map contradicts it. It is worth noticing what kind of statement this is compared with the rest of the sheet: it is a count of completed transactions, examined and reported, the one line here that could be checked by anybody with access to the same deed books. That is why it is the safest line on the page and also the least interesting one.",
    },
    {
      id: "fifteen-years",
      text: "Estimated remaining economic life of improvements: subject tract, 40 years; borough east of the right-of-way, 15 years.",
      verdict: "contradicted",
      gap: "never-looked",
      why: "The single most expensive number on the sheet and there is no measurement behind it. Verna Pilch watched him from the window and he did not knock: a new roof in 1951, a furnace two winters ago, the front repainted the summer before her husband died and kept up since — none of which is on the form and none of which was looked at. Fifteen years is not an assessment of any building. It is a prediction about the people, entered as a figure, and it does the work of the whole sheet, because remaining economic life sets the maximum loan term. Say fifteen and you have closed off thirty-year mortgages in a section of sixty-year-old houses that will therefore not be maintained, which will in due course make the figure correct. It is the only line on this page that manufactures its own evidence.",
    },
  ],
  observed: [
    {
      id: "never-asked",
      text: "“It has been sitting in my kitchen since March of 1953 doing whatever it does, and I have never in my life been asked about it by anybody.”",
      from: "Eileen Fahy, first section",
      requires: "asked:suburb-householder:in-force",
    },
    {
      id: "title-reads-it",
      text: "“It is on the recorded plan, so the title company reads it on every single sale in this section and reports it, and once it is reported the lender has read it too. Four hundred and six lots.”",
      from: "Vince Kearsley, sales office",
      requires: "asked:suburb-sales-agent:in-force",
    },
    {
      id: "never-written",
      text: "“What I would put in writing is property values, the school, the character of the section. Every man in that room knows what the handbill means. It has never been explained to anybody.”",
      from: "Ray Bocelli, citizens' committee",
      requires: "asked:suburb-committee-man:on-the-record",
    },
    {
      id: "no-person-in-it",
      text: "“The letter says the property offered does not meet the association's requirements as security. There is no person in that sentence.”",
      from: "Curtis Ledbetter, applicant",
      requires: "asked:suburb-veteran:on-the-record",
    },
    {
      id: "not-there-yet",
      text: "“It comes out when they open the road. I rate the property as it will be, not as it is on a Tuesday. A boundary I have priced into four hundred lots does not exist yet.”",
      from: "Howard Renfrew, fee appraiser",
      requires: "asked:suburb-appraiser:the-line",
    },
    {
      id: "did-not-knock",
      text: "“New roof in 1951, new furnace two winters ago. He did not knock. Fifteen years of remaining life on a house I have just re-roofed.”",
      from: "Verna Pilch, Broad Street",
      requires: "asked:suburb-borough-woman:the-line",
    },
    {
      id: "advertised",
      text: "“Advertised means published. It does not mean read. The people it affects most are two miles away in another municipality and they do not take our legal notices.”",
      from: "Margaret Kohl, township secretary",
      requires: "asked:suburb-township-clerk:who-asked",
    },
    {
      id: "eleven-questions",
      text: "“Not one of those eleven questions is about the neighbourhood, and the neighbourhood is what decides it.”",
      from: "Arlene Petrofsky, counter clerk",
      requires: "asked:suburb-counter-clerk:who-asked",
    },
  ],
  debrief: {
    speaker: "suburb-appraiser",
    line: "You were looking for the word and it is not there. It has not been there since before I qualified. I was taught these eight features and I grade them honestly, and I could not tell you what I would put on Feature Two instead.",
    established:
      "The rating is accurate in every line and produces the same map the removed sentence would have produced. Feature 2 credits the tract for recorded restrictions of long term uniformly observed without saying which of the six, and is safe from the agency's own post-1950 covenant rule precisely because it does not recite them. The barrier it relies on is a road that has not opened, written in the present tense fourteen months early. The homogeneity it credits is the product of the mechanism it is rating. And the fifteen-year figure that closes off long mortgages across the borough rests on no inspection of any building — the appraiser did not knock — and will make itself true. Two of the five lines are exactly right, which is what makes the other three difficult to argue with.",
    remains:
      "One valuation of one tract by one contractor. Whether this appraiser would have graded the borough differently had he gone inside a house cannot be settled from the report, and neither can the question of how much of the figure came from his own judgement and how much from the form's weights, which are not shown. What a single report cannot show at all is the pattern: the map of graded neighbourhoods that these reports built city by city is the finding, and no one sheet contains it.",
  },
  openQuestions: [
    "The explicit sentence was removed from the manual in 1947 and the categories were kept. If a rule's language is deleted and its output is unchanged, what has been reformed?",
    "The fifteen-year figure predicts decline and helps cause it. What evidence would tell a historian which share of the borough's later condition was measurement and which was consequence?",
  ],
  historicalRecord: {
    documented: [
      "The FHA rated location on eight weighted features, with protection from adverse influences carrying the heaviest weight, and held that no property may be rated higher than its location.",
      'The 1938 Underwriting Manual required that properties "continue to be occupied by the same social and racial classes" (§937) and recommended model covenant language (§980(3)(g)); the explicit language was removed between 1947 and 1950 while the categories remained.',
      "From 15 February 1950 the agency would not insure property subject to a racial covenant recorded after that date.",
      "Estimated remaining economic life governed the maximum mortgage term, so a low figure withdrew long-term credit from a whole section.",
    ],
    reconstructed: [
      "The valuation report is a composite of the standard fee-appraisal form and rating framework, not a transcription of a surviving report.",
      "Howard Renfrew, Verna Pilch and the rest of the map's cast are composite people; Fairmeadow and its borough are composite places.",
    ],
    fiction: [
      "A Chronicler reading a lender's valuation over the appraiser's shoulder on a public street, and the appraiser explaining himself.",
    ],
    debated: [
      "The relative weight of federal appraisal practice against private discrimination in producing postwar residential segregation is actively argued; Rothstein assigns more to public policy than Jackson does.",
    ],
  },
  codexFiling: {
    summary:
      "A 1957 rating of location: eight weighted features, two lines exactly true, a barrier that has not been built, a homogeneity the rating manufactures, and a fifteen-year figure nobody measured.",
    tags: ["What a price records", "Written to persuade", "What the record leaves out"],
    seeAlso: ["case-022-trace-step-five"],
  },
  arcClose: {
    speaker: "suburb-appraiser",
    line: "The deed, the file and this. I have never had all three put in front of me at once and I do not think I was meant to.",
    established: FAIRMEADOW_ARC,
  },
  closer: {
    prompt:
      "Five lines audited against eight accounts. Your reading goes into the record — what is this valuation?",
    skillCategory: "Sourcing",
    options: [
      {
        id: "vocabulary",
        text: "An accurate rating that reaches the answer the removed word would have reached, in language nothing on the form can object to",
        correct: true,
        why: "Right, and the audit is what earns it: two lines exactly supported, one contradicted by ground you walked across, and two accurate statements doing work their accuracy conceals. Feature 2 credits a restriction without naming which. The barrier is a road that has not opened. Homogeneity is credited as a cause when it is the mechanism's product. And the fifteen-year figure — the only number that actually moves money, because it sets the loan term — rests on a man who did not knock. Nothing here is false, so nothing here can be corrected. That is what replaced the sentence the manual deleted in 1947, and why deleting it changed the map not at all.",
      },
      {
        id: "fraudulent",
        text: "A dishonest report written to justify a decision already taken",
        correct: false,
        why: "You went looking for the dishonesty and did not find it, which is the useful outcome rather than a wasted afternoon. Two of the five lines are exactly right and one of them — resale at or above original price in every instance examined — is checkable by anybody. The appraiser answers a direct question about the crossing without hesitating and tells you plainly that he rates property as it will be. He is a fee contractor paid per report who applies eight published categories the way he was taught them. A report written to justify a conclusion does not volunteer that its central barrier does not exist yet.",
      },
      {
        id: "neutral",
        text: "A professional valuation of physical conditions, which happens to record a real difference between two neighbourhoods",
        correct: false,
        why: "The difference is real and this is not a valuation of physical conditions, which the fifteen-year line settles on its own. Remaining economic life is an estimate of how long buildings will keep producing value, and it was arrived at without entering, inspecting or knocking on a single one of them — against a house with a four-year-old roof and a two-year-old furnace. Feature 2 is not a physical category either; it is protection from adverse influences, and what it credits here is a set of recorded restrictions and an active association. Read the eight features again and count how many are about the ground.",
      },
      {
        id: "cannot-say",
        text: "Not enough — one appraiser's report cannot show what the rating system was doing",
        correct: false,
        why: "The caution is right about scale and wrong about this document. One report cannot show the map that thousands of them built, and the debrief says exactly that. But you were not asked about the system; you were asked what this valuation is, and this valuation contains its own workings: the eight named features, the remarks under two of them, the two economic-life figures and the two grades. A document that shows its arithmetic can be audited, and you have audited it against eight accounts gathered the same afternoon. Declining to conclude from a record that documents its own method is not caution.",
      },
    ],
  },
};

export const UNIT_08_ACTIVITIES = {
  "suburb-covenant-deed": THE_SIXTH_ITEM,
  "suburb-gi-bill-loan-file": STEP_FIVE,
  "suburb-neighborhood-appraisal": FIRST_GRADE_FOURTH_GRADE,
};
