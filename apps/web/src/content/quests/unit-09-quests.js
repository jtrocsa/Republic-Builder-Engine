// Unit 9 (Period 9: 1980-present) quest content, structural mirror of unit-08-quests.js and built
// against the seven real CASE_025_SOURCES in apps/web/src/content/unit-09-campaign.js.
//
// ## Why the two missions are the types they are
//
// The ledger across Units 1-8 is five `sequencing`, five `evidence-organizing`, three `hipp` and
// three `mcq`. Unit 8 spent both of its missions on the two thin types, so this unit spends both on
// the thick ones — which balances the ledger at six and six and, more to the point, is what the
// content wanted.
//
// **case-026 is `sequencing`, and the choice is an argument about causation.** The conservative turn
// is the part of Period 9 students most reliably get backwards, because it is usually taught as a
// biography: a president was elected and things changed. The seven items below are in the order in
// which each made the next possible, and reading them in that order produces the finding — that the
// coalition which won in 1980 was assembled over sixteen years, mostly outside the Republican party,
// by people organising over school textbooks, a proposed tax rule, a property-tax ballot measure and
// a church mailing list. The two conventions that frame it were held in July of 1964 and July of
// 1980, sixteen years to the month.
//
// **case-027 is `evidence-organizing`, and it is the only mission in the game whose subject is the
// evidence base itself.** Every explanation of why the Cold War ended was published before anybody
// outside the Soviet system could check one, and then the archives opened. So the mission does not
// ask a student to answer the question; it asks what each surviving record can and cannot establish,
// which is the unit's own question put to the largest closed archive of the twentieth century. Rule
// 4 of the variety rule caps a mission at one extended written response, and the reflection is it.
//
// ## Where the rest of Period 9 went
//
// Not into a third case. The Archive Challenges carry it: the SAQ works from Reagan's signing
// statement on the Immigration Reform and Control Act and reaches migration and demographic change,
// and the DBQ's seven documents run from the first inaugural of 1981 to the Troubled Asset Relief
// Program of 2008 on the size of the federal government, with a surveillance statute sitting in the
// middle of them. Its complexity clause is about the gap between the rhetoric and the ledger.
//
// ## No investigation quests, same as Units 4 through 8
//
// A source's optional Investigation Challenge gate (source.schema.js's investigationMode /
// investigationQuestId) is left null on all seven records, for the reason Unit 5 recorded: every one
// is a composite reconstructed from a documentary form rather than one surviving item, and a
// pre-reveal "predict this source's point of view" exercise fits a named author's speech far better
// than a deed, a finding aid or a retention schedule. The fields exist and default to null.

export const UNIT_09_MCQ_QUESTS = [
  {
    id: "case-025-mcq-two-locks-comparison",
    prompt:
      "The memorandum released to the historian carries a deletion marked “1,908 characters — (b)(5)” at the place in the record where it was made. Paragraph 3 of the deed of gift closes Series 7 “except upon the written permission of the Donor or the Donor's designee, which permission may be granted or withheld at the Donor's sole discretion and without statement of reason.” Which comparison of the two restrictions is best supported by the records on this map?",
    choices: [
      "The statutory withholding is the weaker of the two: it must name a numbered exemption, state how much was taken and where, answer an administrative appeal within a fixed period, and submit to a judge who may read the withheld material in chambers — while the private restriction needs no reason, has no expiry, no appeal and no forum, and binds the donor's successors and assigns",
      "The deed is the weaker of the two, because a private agreement cannot bind a public university and the Library may open Series 7 whenever it judges the research value to outweigh the donor's wishes",
      "The two are equivalent in strength, because both the exemption and the deed derive their force from the Freedom of Information Act and both are enforced in the same way",
      "The statutory withholding is the stronger of the two, because a court will uphold an agency's assertion of the deliberative-process privilege whenever the agency asserts it",
    ],
    answer: 0,
    explanation:
      "Read what each instrument has to do. The Freedom of Information Act's exemptions are numbered; since 1986 an agency has had to indicate how much it removed, and since the 1996 electronic-records amendments it has had to indicate the amount and the exemption at the place in the record where the deletion was made; the requester has thirty days to appeal administratively; and since the 1974 amendments a district court may inspect the withheld material in camera. Every one of those is a place where somebody must justify a decision. Paragraph 3 has none of them, and it is not an oversight — a deed of gift is a contract, the Library took title subject to it, and paragraph 5 binds successors and assigns, which is why the clause outlived the corporation that signed it. The second option gets the law backwards. The fourth mistakes a privilege that is frequently litigated and often narrowed for one that is absolute. The finding of this whole map is in the first option: the lock that has to explain itself is the one you can fight, and it is not the strongest lock in the building.",
    skillCategory: "Comparison",
  },
  {
    id: "case-025-mcq-exemption-four-sourcing",
    prompt:
      "On released page 0417 the Committee's own first-year and third-year employment projections are blacked out under Exemption 4, 5 U.S.C. § 552(b)(4), while the Committee's mimeographed summary of the same study circulated freely in the valley in 1980. What does the redaction most directly establish?",
    choices: [
      "That Exemption 4 protects commercial or financial information “obtained from a person,” so those figures are withheld on behalf of the party that supplied them — the Committee itself — which makes the deletion evidence about who submitted the numbers rather than about what the agency thought of them",
      "That the agency had examined the projections and found them unreliable, and withheld them to avoid publishing figures it did not endorse",
      "That the projections had been classified in the interest of national defense, which is why the agency could not release them even years later",
      "That the Committee, when it later gave its own papers to the university, asked that the projections be kept out of the public file",
    ],
    answer: 0,
    explanation:
      "Exemption 4 is the exemption most often misread, because students assume every deletion protects the government. It does not: the words in the statute are “obtained from a person,” and the person here is the applicant. So the agency is withholding the Committee's numbers to protect the Committee's commercial position, in a file about an application the Committee lost, with the result that a citizen reading the government's copy in 1998 cannot see figures the Committee itself had printed and handed round parish halls eighteen years earlier. That absurdity is exactly what makes the deletion good evidence — of the submitter's identity and of the routine, unthinking operation of a categorical rule — and it is why the mission that rebuilds this page has to be gated behind the Committee's own summary. The second and third options attribute a judgment to the agency that nothing on the page supports; the fourth invents a request, and a deed of gift executed by one party cannot govern a federal agency's processing of another party's file.",
    skillCategory: "Sourcing",
  },
  {
    id: "case-025-mcq-two-editions-causation",
    prompt:
      "The plant manager's remark that the corporation “would of course entertain any serious offer” appears in a clipping of the home edition in Box 3 and is absent from the page image every researcher now uses. Which account best explains why?",
    choices: [
      "Page one was reset between editions and the paragraph dropped for an advertisement; the publisher supplied its own file copy — the final — to the filming service; the bound originals were not retained once the film existed; and the digital file was scanned from that film. Four ordinary decisions, none of them about this sentence",
      "The corporation asked the newspaper to remove the quotation before the final edition went to press, which is why it survives only where the Committee happened to clip it",
      "The scan was made at too coarse a resolution to render the paragraph, so the text is present on the film but illegible in the digital file",
      "A member of the library staff removed the frame from the film to spare the corporation embarrassment during the negotiation of the deed of gift",
    ],
    answer: 0,
    explanation:
      "The evidence for the first option is on the record itself: two edition slugs, a target frame reading “file copy supplied by the publisher — originals not retained,” and a 1997 scanning log that names the film as its source. The evidence for the second and fourth is nothing at all, and both are the kind of explanation a student reaches for because it supplies an author — somebody wanted this gone. The finding of the mission is that nobody did, and that this is the more troubling answer rather than the more comforting one: a restriction can be argued with because a party imposed it, and a chain of reasonable operational choices cannot be argued with by anybody. The third option is worth eliminating carefully, because it is nearly true of something else on the same record — the scanning log does note that halftone areas were illegible at that setting, so the photograph really is lost to resolution. The paragraph is not: it was never on the film, because it was never in the edition that was filmed.",
    skillCategory: "Causation",
  },
  {
    id: "case-025-mcq-retention-continuity",
    prompt:
      "Item 4.19 of the 1991 retention schedule declares that “electronic mail is a means of transmission and is not a record series,” to be printed and filed if it constitutes a record and otherwise retained at the account holder's discretion. Which statement best traces what a rule of this kind led to?",
    choices: [
      "It was a common institutional position in the 1990s and it is a principal reason so little of that decade's actual decision-making survives — even though the federal courts had already held, of federal agencies, that electronic mail carries information a printout does not and cannot simply be erased, and even though state public-records law, litigation holds and later schedules eventually brought institutional mail into the record by a different route",
      "It had no effect, because the Freedom of Information Act already applied to state universities and required every message to be preserved",
      "It mattered little in practice, because in 1991 and for most of the decade after it electronic mail carried only social and trivial traffic",
      "It was void when adopted, because Armstrong v. Executive Office of the President had already made such schedules unlawful for every public body in the United States",
    ],
    answer: 0,
    explanation:
      "Three of these are traps about jurisdiction and one is a trap about the past. The Freedom of Information Act reaches federal agencies; a state university's records are governed by that state's public-records act and its own schedule, which is why the second option fails and why Armstrong v. Executive Office of the President (D.C. Cir. 1993) — which held that the White House could not treat email backup tapes as disposable, because the electronic record carries transmission and receipt data the printout does not — did not automatically strike down a schedule like this one. It did, though, mark the direction of travel, which is what makes this item historically interesting rather than merely administrative. The third option is the trap about the past: by the middle of the decade a great deal of ordinary institutional decision-making had moved into a medium the institution had classified as not a record, and the consequence is a hole in the archive of the 1990s that no restriction and no redaction had anything to do with.",
    skillCategory: "Continuity and Change",
  },
];

export const UNIT_09_SEQUENCING_QUESTS = [
  {
    id: "case-025-sequencing-how-a-company-becomes-a-collection",
    prompt:
      "Arrange these steps in the order in which each one made the next possible — the passage of one corporation's paper from an office filing cabinet to a researcher who is not allowed to read it.",
    // **Authored out of order on purpose**, and enforced by
    // tests/unit/sequencing-quest-order.test.js: renderSequencingQuest() lays items out in this
    // array's order and never shuffles, so a list written 0,1,2,3,4,5,6 opens already solved and
    // grades a student correct for touching nothing. Keep each item's `position` right and its
    // place in this array wrong.
    items: [
      {
        id: "finding-aid-published",
        label:
          "The finding aid is printed and shelved in the reading room, and for the first time it becomes possible to know exactly what a closed series contains without being permitted to open it",
        position: 5,
      },
      {
        id: "capital-request-filed",
        label:
          "A capital appropriation request for the works is written in the Office of the President and filed with the minutes of the Executive Committee, because the company's own practice keeps board papers together",
        position: 0,
      },
      {
        id: "researcher-writes-to-nobody",
        label:
          "A researcher reads the entry for Series 7, writes to the donor's designee for the permission the deed requires, and is told the Library holds no address for one",
        position: 6,
      },
      {
        id: "deed-negotiated",
        label:
          "A librarian who has been asking for a decade is told the building is to be cleared, and takes the collection on terms — a seventy-five-year closure on personnel files and a donor's-permission closure on the president's office, as the price of the other thirteen hundred feet",
        position: 3,
      },
      {
        id: "manufacturing-ends",
        label:
          "Manufacturing at the last of the four works ends and the corporation is wound down, at which point the files stop being business records anybody needs and become somebody's problem",
        position: 1,
      },
      {
        id: "processing-and-arrangement",
        label:
          "The collection is accessioned and an archivist spends a year arranging fourteen hundred and eighty feet into eight series and describing what is in each of them, including the two that nobody may open",
        position: 4,
      },
      {
        id: "merger-inherits-the-paper",
        label:
          "The corporation is bought and merged into a holding company, which inherits sixteen rooms of paper along with the trademarks and has no operating reason whatever to keep any of it",
        position: 2,
      },
    ],
    explanation:
      "The chain has one hinge and it is not where students expect. Steps one and two are unremarkable: papers are filed the way the office files them, and a company that stops manufacturing stops needing them. The hinge is step three — the successor inherits the paper and has no reason to keep it — because at that moment the entire history of a valley is one clearance decision away from a skip, and the only person in the world with a reason to prevent that has no money and no standing. What she has is a contract to offer, and the terms of that contract are why Series 6 and Series 7 are closed. Read the order that way and the closure stops being a villain's act and becomes a price: the librarian could have refused the terms and had nothing. Steps five and six are the archive doing its job properly and the job producing a strange result — description is what makes a restriction visible and arguable, so the finding aid is simultaneously the most useful document in the building and the one that tells a researcher precisely what she is not going to be allowed to see. The last step is the clause outliving both parties to it. Nobody wrote a rule saying the record of this decision should be unreachable; a company was merged, an address went stale, and paragraph 5 bound the successors and assigns.",
    skillCategory: "Causation",
  },
];

export const UNIT_09_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-025-evidence-custody-sourcing",
    prompt:
      "Match each record recovered in and around the Whitmore Library to the historical-thinking skill it best demonstrates, then explain what the deed of gift and the agency's letter reveal when they are read against each other. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "campus-deed-of-gift",
        label: "Deed of Gift, the Vance Steel Corporation Records",
        attribution:
          "Counsel for the successor company and the University Librarian, executed 14 June 1994",
        excerpt:
          "Series 7, comprising the files of the Office of the President and of the Executive Committee for the years 1974 to 1982, shall be closed to research use except upon the written permission of the Donor or the Donor's designee, which permission may be granted or withheld at the Donor's sole discretion and without statement of reason.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "campus-two-editions",
        label: "The Sentinel for 26 September 1979, Twice",
        attribution:
          "The composing room of the Furnace Bend Sentinel, 1979; the filming service, 1974-1981; the library's scanning station, 1997",
        excerpt:
          "HOME EDITION… the corporation “would of course entertain any serious offer.” — FINAL EDITION. Same headline, same take, one paragraph shorter. The paragraph containing those words is not present. — FILE COPY SUPPLIED BY THE PUBLISHER. ORIGINALS NOT RETAINED.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "campus-foia-response",
        label: "Response to Request No. 97-0412",
        attribution:
          "The Freedom of Information Officer of the Economic Development Administration, 12 February 1998",
        excerpt:
          "Employment in the first full year of operation is projected at [DELETED — 5 characters — (b)(4)]… [DELETED — 1,908 characters — (b)(5)] The staff is accordingly unable to recommend approval upon the record as presented.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "campus-gate-notice",
        label: "Notice Posted at No. 2 Gate",
        attribution:
          "The office of the Plant Manager, Furnace Bend Works, Vance Steel Corporation, 25 September 1979",
        excerpt:
          "The Corporation regrets the necessity of this action, which is required by conditions in the industry over which it has no control. — Posted by order of the Plant Manager.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "campus-finding-aid",
        label: "Finding Aid, the Vance Steel Corporation Records",
        attribution: "The processing archivist, Valley Collections, compiled 1995, revised 1996",
        excerpt:
          "SERIES 7. Office of the President and Executive Committee, 1974-1982. 62 linear feet. CLOSED… Contents include correspondence, minutes of the Board and of the Executive Committee, capital appropriation requests, and studies relating to the future of the Furnace Bend, Riverton and Palmer Street works. — NOTE. The Library is unable to forward requests to the donor and holds no current address for the donor's designee.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "campus-records-schedule",
        label: "General Records Retention Schedule, Item 4.19",
        attribution:
          "The University Records Officer, adopted by the Board of Trustees 1991, in force 1998",
        excerpt:
          "Electronic mail is a means of transmission and is not a record series. Messages constituting records of the University shall be printed and filed in the appropriate series above; all other messages are retained at the discretion of the account holder.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
    ],
    reflectionPrompt:
      "The deed of gift and the agency's letter both shut something. Explain what each one lets a historian establish that the other cannot, and what somebody holding only one of them would conclude wrongly about who controls the history of this valley.",
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
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what the deed of gift and the FOIA response each establish and identifies what a historian holding only one of them would get wrong.",
    },
    explanation:
      "The two instruments are the same act performed by two kinds of body, and neither is sufficient. The agency's letter establishes the machinery of a public refusal exactly: which categories were used, how much was taken out, where, on whose signature, and what the requester may do about it — and it establishes almost nothing about the reasoning, because the reasoning is the part behind the (b)(5). The deed establishes the reasoning perfectly and nothing else: paragraph 3 tells you precisely what the donor wanted and precisely how much discretion it kept, and it tells you not one word about what is in Series 7 or why any particular sheet is worth closing. A historian holding only the letter would conclude that the state is the thing standing between a citizen and the record, which is the conventional answer and is wrong here by a wide margin. A historian holding only the deed would conclude that a corporation bought the silence, which is also wrong: the corporation gave the collection away and the alternative to the clause was a skip. Put the two together with the finding aid and the newspaper and the actual answer appears — that access to this valley's history is decided by a contract nobody voted on, a schedule nobody read, and a scanning setting, and that the only one of those with an appeals procedure is the one everybody blames.",
  },
];

export const UNIT_09_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-025-hipp-community-ownership-proposal",
    prompt:
      "Analyze the Committee's feasibility summary using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes what the document says — not the one that merely names the correct answer.",
    document: {
      text: "THE PROPOSAL IN BRIEF. That the Furnace Bend Works be acquired from the Corporation and operated by a company chartered in this State, the stock of which is to be held one third by the employees through a trust, one third by a community corporation whose directors are elected by the parishes, unions and townships of the valley, and one third by the lending institutions… THE ARGUMENT. It is not disputed that the works as presently equipped cannot earn a return. It is disputed that this is a fact about the valley rather than a fact about twenty years of capital being taken out of these mills and placed in other industries by a corporation which is under no obligation to explain itself and has not. The Committee does not ask for a gift. It asks the Government to lend its credit to an industrial investment, which the Government does continually, and to say plainly, if it will not, upon what principle it chooses the industries whose credit it lends.",
      attribution:
        "Twenty-six mimeographed pages of a two-hundred-page feasibility study, circulated by the Valley Community Steel Committee, January 1980 (composite reconstructed from the community-ownership proposals of the late 1970s and from the campaign of the Ecumenical Coalition of the Mahoning Valley, 1977-1980)",
    },
    hippPrompts: [
      {
        id: "proposal-audience",
        dimension: "Intended audience",
        argument:
          "It is a summary of a two-hundred-page technical study, run off on a mimeograph, and it puts the ownership structure and the capital figure in four short paragraphs and then spends its length on a question of principle addressed to a government that is not in the room.",
        options: [
          {
            id: "proposal-audience-explained",
            text: "It is written past the agency to the valley. A federal application is a bound submission that no parishioner ever sees; this is the version handed round parish halls and union locals, which is why the engineering is compressed to what a lay reader can repeat and the argument about principle is given the space — the people being recruited have to be able to answer a sceptical neighbour who says this is a handout, and that sentence is the answer they are being given.",
            correct: true,
          },
          {
            id: "proposal-audience-named-only",
            text: "The intended audience is residents of the valley and the churches and unions circulating the summary.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "proposal-audience-wrong-agency",
            text: "The intended audience is the federal officers who will assess the application, which is why the Committee sets out the ownership structure and the capital requirement before anything else.",
            correct: false,
          },
          {
            id: "proposal-audience-wrong-corporation",
            text: "The intended audience is the Corporation's board, whom the Committee is trying to persuade to accept the offer rather than clear the site.",
            correct: false,
          },
        ],
      },
      {
        id: "proposal-purpose",
        dimension: "Purpose",
        argument:
          "It asks for a loan guarantee it must know is unlikely, and it ends by demanding that the Government state the principle on which it selects the industries whose credit it lends.",
        options: [
          {
            id: "proposal-purpose-explained",
            text: "It has two purposes doing different work, and the second survives the failure of the first. One is practical — raise the local share and secure the guarantee. The other is to put a question on the record in terms an agency can refuse but cannot answer privately, which is why the last sentence is drafted for quotation. The refusal, when it came, answered the request and kept the reasoning behind a deliberative-process exemption, which is precisely the outcome that sentence was written to make visible.",
            correct: true,
          },
          {
            id: "proposal-purpose-named-only",
            text: "The purpose is to obtain a federal guarantee of three hundred million dollars toward the purchase and modernisation of the works.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "proposal-purpose-wrong-litigation",
            text: "The purpose is to build a documentary record for the lawsuit the Committee intends to bring against the Corporation to prevent the closing.",
            correct: false,
          },
          {
            id: "proposal-purpose-wrong-blame",
            text: "The purpose is to establish that the Corporation acted unlawfully in withdrawing capital from the works over the preceding twenty years.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 9.02's mission — the conservative turn as a chain rather than a biography. See this file's
// header for why the type is the argument.
export const UNIT_09_ARCHIVE_SEQUENCING_QUESTS = [
  {
    id: "case-026-mission-how-a-majority-was-built",
    prompt:
      "Arrange these developments in the order in which each one made the next possible — the sixteen years between the convention a movement lost and the convention it won.",
    // Authored out of order, per tests/unit/sequencing-quest-order.test.js. See the note on
    // UNIT_09_SEQUENCING_QUESTS above.
    items: [
      {
        id: "proposition-thirteen",
        label:
          "California voters cut property taxes by more than half and require two thirds of the legislature to raise a state tax, and within two years more than a dozen states put limits of their own on the ballot",
        position: 3,
      },
      {
        id: "cow-palace",
        label:
          "Four years of county-level organising delivers the Republican nomination to Barry Goldwater against his party's own establishment, and in November he carries six states and loses forty-four",
        position: 0,
      },
      {
        id: "first-year",
        label:
          "The top marginal rate of income tax is cut from seventy per cent to fifty, and in August eleven thousand striking air-traffic controllers are dismissed and barred from federal employment",
        position: 6,
      },
      {
        id: "lists-and-institutions",
        label:
          "The defeated campaign's donor names are copied out by hand and become the seed of a direct-mail operation, and a set of new institutions is founded to supply arguments rather than candidates",
        position: 1,
      },
      {
        id: "detroit",
        label:
          "Sixteen years to the month after the first convention, the same coalition nominates Ronald Reagan; in November he carries forty-four states and the Republicans take the Senate for the first time since 1954",
        position: 5,
      },
      {
        id: "family-and-school",
        label:
          "A politics organised around the family and the school forms outside the party — a campaign that halts the Equal Rights Amendment three states short, a county textbook protest, and a proposed federal tax rule on religious schools that produces a mail campaign of a size the agency had never seen",
        position: 2,
      },
      {
        id: "inflation-and-the-moral-majority",
        label:
          "Inflation passes eleven per cent, a second oil shock hits the pumps, and a new organisation begins registering voters through congregations",
        position: 4,
      },
    ],
    explanation:
      "The two conventions are the frame and the date is the point: the Cow Palace in July 1964 and Detroit in July 1980, sixteen years to the month, and the second is not a recovery from the first — it is what the first was for. Read the order and the causation runs the way students almost never draw it. The 1964 defeat was catastrophic at the top of the ticket and left intact the thing that mattered, which was a network of people who now knew how to take over a county committee; the donor list copied out of the campaign's records became a direct-mail industry that could raise money and mobilise voters without a newspaper, a network or a party. Then the movement grew a base it had not had, and it grew it outside politics: over the Equal Rights Amendment, over textbooks in a West Virginia county, and — the one most often left out and the most consequential — over a 1978 proposal to condition the tax exemption of private religious schools, which brought hundreds of thousands of people into national politics who had never been in it. The tax revolt of 1978 supplied the economic half and, crucially, the proof that a majority existed: Proposition 13 passed in a state with a Democratic legislature. By 1979 inflation and a second oil shock made the incumbent's position untenable and an organisation existed to turn congregations into registrations. So the 1980 result is the last item in a chain, not the first item in a story, and the first year of the administration is the chain's payoff rather than its cause — a tax act that enacted the 1978 argument, and a strike broken in a way that told every employer in the country what had changed.",
    skillCategory: "Causation",
  },
];

// Case 9.03's mission — the end of the Cold War read as an evidence problem. See this file's header
// for why this is the one mission in the game whose subject is the evidence base itself.
export const UNIT_09_ARCHIVE_EVIDENCE_QUESTS = [
  {
    id: "case-027-mission-what-the-opening-changed",
    prompt:
      "Match each record of the last decade of the Cold War to the historical-thinking skill it best demonstrates, then explain what an American speech and the Soviet president's resignation address each establish that the other cannot. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "evil-empire-address",
        label: "Address to the National Association of Evangelicals",
        attribution: "Ronald Reagan, Orlando, Florida, 8 March 1983",
        excerpt:
          "I urge you to beware the temptation of pride — the temptation of blithely declaring yourselves above it all and label both sides equally at fault, to ignore the facts of history and the aggressive impulses of an evil empire, to simply call the arms race a giant misunderstanding and thereby remove yourself from the struggle between right and wrong and good and evil.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "inf-treaty",
        label: "Treaty on Intermediate-Range Nuclear Forces",
        attribution:
          "The United States and the Union of Soviet Socialist Republics, signed at Washington, 8 December 1987",
        excerpt:
          "Each Party shall eliminate its intermediate-range and shorter-range missiles, not have such systems thereafter, and carry out the other obligations set forth in this Treaty… Each Party shall have the right to conduct on-site inspections in accordance with the Protocol on Inspection.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "gorbachev-united-nations",
        label: "Address to the United Nations General Assembly",
        attribution: "Mikhail Gorbachev, New York, 7 December 1988",
        excerpt:
          "Freedom of choice is a universal principle. There should be no exceptions… The Soviet Union has taken a decision to reduce its armed forces. In the next two years their numerical strength will be reduced by five hundred thousand men.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "sinatra-doctrine",
        label: "Foreign ministry briefing on Eastern Europe",
        attribution:
          "Gennadi Gerasimov, spokesman for the Soviet Ministry of Foreign Affairs, on American television, 25 October 1989",
        excerpt:
          "You know the Frank Sinatra song, “I Did It My Way”? Hungary and Poland are doing it their way. We now have the Frank Sinatra doctrine.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "bush-new-world-order",
        label: "Address to a joint session of Congress",
        attribution: "George H. W. Bush, Washington, 11 September 1990",
        excerpt:
          "Out of these troubled times… a new world order can emerge: a new era, freer from the threat of terror, stronger in the pursuit of justice, and more secure in the quest for peace. An era in which the nations of the world, East and West, North and South, can prosper and live in harmony.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "gorbachev-resignation",
        label: "Television address on resigning the presidency of the USSR",
        attribution: "Mikhail Gorbachev, Moscow, 25 December 1991",
        excerpt:
          "The old system collapsed before the new one had time to begin working… Society was suffocating in the vice of the command-bureaucratic system. Doomed to serve ideology and bear the terrible burden of the arms race, it was strained to the utmost.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
    ],
    reflectionPrompt:
      "The 1983 address and the 1991 resignation describe the same decade from opposite ends of it. Explain what each one can establish that the other cannot, and say what a historian holding only the American documents would get wrong.",
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
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what the 1983 address and the 1991 resignation each establish and identifies what a historian working only from American sources would conclude wrongly.",
    },
    explanation:
      "Take the matches first, because each turns on what the document is rather than on what it is about. The 1983 address is a speech to a religious convention by a president who needs that audience, in a year of a nuclear-freeze movement he is arguing against — so it is superb evidence of how the confrontation was being explained to Americans and poor evidence of what was being decided in Washington, which is a sourcing judgment. The 1987 treaty is the first agreement to abolish an entire class of weapons and the first to admit inspectors onto the other side's soil, so what it demonstrates is a change in kind. Bush's 1990 address is the same skill from the far end: a claim, made in the middle of a crisis, about what the world had just become. The 1988 United Nations speech is causation, and the reason is the second half of the excerpt — a unilateral cut of half a million men is not rhetoric, it is a decision with consequences that the states of Eastern Europe read within the year. Gerasimov's joke is comparison and nothing else: it is only intelligible against the Brezhnev Doctrine of 1968, and its whole content is that the earlier rule no longer applies. And the resignation address is contextualization, because it is the one document here that describes the system rather than the confrontation. Now the reflection. American documents can establish American intentions, American public argument and the American record of what was said in negotiation, and no quantity of them can establish what the Soviet leadership believed its own economy could bear — which is the question every explanation of the ending turns on. That is why the archives mattered. When Soviet and East European collections opened after 1991, historians could for the first time test claims that had been argued for a decade from one side's paper only, and much of what came out complicated both of the confident answers: neither that American pressure simply forced a collapse, nor that the collapse was purely internal and would have come anyway. A historian working only from the American side would systematically mistake the effect for the cause, because on that side of the paper every Soviet concession looks like a response.",
  },
];

export const UNIT_09_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-09-archive-a-country-of-arrivals-saq",
    stimulus:
      "“The Immigration Reform and Control Act of 1986 is the most comprehensive reform of our immigration laws since 1952… Future generations of Americans will be thankful for our efforts to humanely regain control of our borders and thereby preserve the value of one of the most sacred possessions of our people: American citizenship.” — Ronald Reagan, statement on signing the Immigration Reform and Control Act, 6 November 1986",
    prompts: [
      "A. Identify one cause of the increase in immigration to the United States in the period after 1965.",
      "B. Explain one way that immigration changed American society, economy or politics in the period 1980–2010.",
      "C. Explain one way that Americans sought to restrict or regulate immigration in the same period.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_09_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-09-archive-the-size-of-government-dbq",
    prompt:
      "Evaluate the extent to which the role of the federal government in American life changed in the period from 1980 to 2010.",
    documents: [
      {
        id: "doc-reagan-first-inaugural",
        label: "Document 1",
        attribution: "Ronald Reagan, first inaugural address",
        date: "January 20, 1981",
        excerpt:
          "In this present crisis, government is not the solution to our problem; government is the problem… It is my intention to curb the size and influence of the Federal establishment and to demand recognition of the distinction between the powers granted to the Federal Government and those reserved to the States or to the people.",
      },
      {
        id: "doc-patco",
        label: "Document 2",
        attribution:
          "Ronald Reagan, remarks on the air traffic controllers' strike, the White House Rose Garden",
        date: "August 3, 1981",
        excerpt:
          "Let me make one thing plain. I respect the right of workers in the private sector to strike… But we cannot compare labor-management relations in the private sector with government. Government cannot close down the assembly line. It has to provide without interruption the protective services which are government's reason for being. It is for this reason that I must tell those who fail to report for duty this morning they are in violation of the law, and if they do not report for work within 48 hours, they have forfeited their jobs and will be terminated.",
      },
      {
        id: "doc-contract-with-america",
        label: "Document 3",
        attribution:
          "“Contract with America,” signed by more than three hundred Republican candidates for the House of Representatives",
        date: "September 27, 1994",
        excerpt:
          "This year's election offers the chance, after four decades of one-party control, to bring to the House a new majority that will transform the way Congress works… On the first day of the 104th Congress, the new Republican majority will immediately pass the following major reforms, aimed at restoring the faith and trust of the American people in their government… THE FISCAL RESPONSIBILITY ACT: A balanced budget/tax limitation amendment and a legislative line-item veto… THE PERSONAL RESPONSIBILITY ACT: Discourage illegitimacy and teen pregnancy by prohibiting welfare to minor mothers… cut spending for welfare programs, and enact a tough two-years-and-out provision with work requirements.",
      },
      {
        id: "doc-era-of-big-government",
        label: "Document 4",
        attribution: "William J. Clinton, State of the Union address",
        date: "January 23, 1996",
        excerpt:
          "We know big government does not have all the answers. We know there's not a program for every problem… The era of big government is over. But we cannot go back to the time when our citizens were left to fend for themselves. Instead, we must go forward as one America, one nation working together to meet the challenges we face together. Self-reliance and teamwork are not opposing virtues; we must have both.",
      },
      {
        id: "doc-prworea",
        label: "Document 5",
        attribution:
          "Personal Responsibility and Work Opportunity Reconciliation Act, Title I, replacing Aid to Families with Dependent Children with Temporary Assistance for Needy Families",
        date: "August 22, 1996",
        excerpt:
          "No individual or family shall be entitled to any assistance under any State program funded under this part… A State to which a grant is made under section 403 shall not use any part of the grant to provide assistance to a family that includes an adult who has received assistance under any State program funded under this part for 60 months, whether or not consecutive, after the date the State program funded under this part commences.",
      },
      {
        id: "doc-patriot-act-215",
        label: "Document 6",
        attribution:
          "Uniting and Strengthening America by Providing Appropriate Tools Required to Intercept and Obstruct Terrorism (USA PATRIOT) Act, section 215",
        date: "October 26, 2001",
        excerpt:
          "The Director of the Federal Bureau of Investigation or a designee… may make an application for an order requiring the production of any tangible things (including books, records, papers, documents, and other items) for an investigation to protect against international terrorism or clandestine intelligence activities… No person shall disclose to any other person (other than those persons necessary to produce the tangible things under this section) that the Federal Bureau of Investigation has sought or obtained tangible things under this section.",
      },
      {
        id: "doc-tarp",
        label: "Document 7",
        attribution:
          "Emergency Economic Stabilization Act of 2008, establishing the Troubled Asset Relief Program",
        date: "October 3, 2008",
        excerpt:
          "The Secretary is authorized to establish the Troubled Asset Relief Program (or “TARP”) to purchase, and to make and fund commitments to purchase, troubled assets from any financial institution, on such terms and conditions as are determined by the Secretary… The Secretary's authority to purchase troubled assets under this Act shall be limited to $700,000,000,000 outstanding at any one time.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that the period's dominant political argument was for a smaller federal government (Documents 1, 3, 4 and 5, and the fact that a Democratic president signed the welfare bill) AND that the federal government's actual reach grew in registers the argument rarely named: a security and surveillance authority that could compel the production of a citizen's records and forbid the holder to mention it (Document 6), an incarcerated population that multiplied several times over under federal and state sentencing law, defense and entitlement spending that kept federal outlays at roughly a fifth of national income throughout, and the largest single federal intervention in the private economy since the Second World War arriving from a Republican administration in its final months (Document 7) — so that a student tracking only the rhetoric would conclude the state contracted, while a student tracking the ledger and the statute book would find it had chiefly changed what it was for.",
  },
];
