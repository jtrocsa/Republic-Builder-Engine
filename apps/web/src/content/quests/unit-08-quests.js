// Unit 8 (Period 8: 1945-1980) quest content, structural mirror of unit-07-quests.js and built
// against the seven real CASE_022_SOURCES in apps/web/src/content/unit-08-campaign.js.
//
// ## Why the two missions are the types they are
//
// The ledger across Units 1-7 is five `sequencing`, five `evidence-organizing`, two `hipp` and two
// `mcq`. Unit 6 was the first unit to spend both of its missions on the two thin types, and this is
// the second, for the same reason and with the same effect: it costs nothing the content wanted.
//
// **case-023 is `hipp`, and the choice is the case's whole argument.** The federal loyalty program
// refused people employment on the strength of statements nobody would sign — the standard was that
// "reasonable grounds exist for belief" that a person was disloyal, the accuser was not produced,
// and the charge frequently reached the employee as a paraphrase. A student cannot analyse the
// point of view of an anonymous informant, which is exactly the problem the period had. So the
// mission puts a document with the opposite property in front of them: a speech whose author,
// audience, situation and interest can all be established to the sentence, delivered against that
// machinery by somebody with everything to lose by delivering it. HIPP is not decoration here. It
// is the skill whose absence the case is about.
//
// **case-024 is `mcq`, one stimulus question, the shape case-009, case-018 and case-024 share.**
// The Voting Rights Act's coverage formula is four lines of statute and the entire difficulty of
// the case is contained in them. Reading it correctly means reading a law as an instrument rather
// than as a declaration — noticing that a statute which names no race and no State reached the
// jurisdictions Congress intended, and asking how a piece of arithmetic managed what a decade of
// case-by-case litigation had not. That is one question with one right answer and three wrong ones
// that students actually give, which is what an MCQ is for.
//
// ## Where Vietnam, the Great Society and the movements went
//
// Not into a third case. The Archive Challenges carry them: the DBQ's seven documents run from
// Executive Order 9981 to Milliken v. Bradley and take in Shelley, Brown, the Southern Manifesto,
// Johnson at Howard University and the Kerner Commission, and its complexity clause is about the
// federal government appearing on both sides of the same ledger. A unit gets three cases and this
// one spends them on a subdivision, a Senate floor and a formula.
//
// ## No investigation quests, same as Units 4 through 7
//
// A source's optional Investigation Challenge gate (source.schema.js's investigationMode /
// investigationQuestId) is left null on all seven records, for the reason Unit 5 recorded: every
// one is a composite reconstructed from a documentary form rather than one surviving item, and a
// pre-reveal "predict this source's point of view" exercise fits a named author's speech far better
// than an administrative form. The fields exist and default to null.

export const UNIT_08_MCQ_QUESTS = [
  {
    id: "case-022-mcq-covenant-causation",
    prompt:
      "The sixth restriction on the deed was made judicially unenforceable in 1948. The deed carrying it was recorded in 1953, and the 1957 valuation report credits the tract under Feature 2 for “recorded restrictions of long term, uniformly observed.” What does that combination most directly reveal about how the clause went on working?",
    choices: [
      "Shelley v. Kraemer barred a court from enforcing the covenant but left it lawful to write, record and obey, so it kept operating through every party who never needed a court — the recorder's index, the title search, the broker, the owners' association, and a lender whose appraiser rated a neighborhood higher for having one",
      "The clause was struck from every deed containing it, so any that remained were clerical survivals with no effect on anybody's conduct",
      "The clause remained fully enforceable in state courts, because Shelley bound only the federal courts and left state property law untouched",
      "Congress restored the enforceability of covenants recorded before 1949 in the Housing Act of that year, which is why a 1953 deed could still carry one",
    ],
    answer: 0,
    explanation:
      "Read what Shelley actually held. Chief Justice Vinson wrote that the agreements “standing alone” violate nothing, because the Fourteenth Amendment reaches state action and a private promise is not state action — “so long as the purposes of those agreements are effectuated by voluntary adherence to their terms.” What the Court forbade was a judge making anybody keep the promise, and Barrows v. Jackson (1953) later closed the damages route as well. Neither case removed a word from a single deed, and neither reached anyone who was willing to comply without being made to. That is the answer to the question this map asks: after 1948 the clause needed no enforcement, because a title company that reported it, a broker who would not show the house, an association that called on you and an appraiser who scored the tract for it were together more effective than any injunction. The Housing Act of 1949 did nothing of the kind, and Shelley was a decision about the Fourteenth Amendment binding state courts — which is what state courts are.",
    skillCategory: "Causation",
  },
  {
    id: "case-022-mcq-appraisal-sourcing",
    prompt:
      "The valuation report grades eight features, never mentions race, and assigns the new tract a first-grade location and forty years of remaining economic life while assigning the borough across the highway a fourth-grade location and fifteen. What should a historian conclude about this document as evidence?",
    choices: [
      "It is strong evidence of how the lending decision was made and weak evidence of what either neighborhood was actually like — “remaining economic life” is a forecast about who is expected to live somewhere, written into the report as though it were a measurement of the buildings",
      "Because the report never mentions race, it is evidence that the mortgage system of 1957 was race-neutral in its rules whatever individual lenders may have done",
      "Because the appraiser was a fee contractor paid for each report, the document is unreliable and cannot support any conclusion about anything",
      "It is a straightforward physical survey, so the difference between forty years and fifteen is evidence about construction quality on the two sides of the highway",
    ],
    answer: 0,
    explanation:
      "This is a question about what a document is for. A valuation report exists to tell a lender how long a security is good for, so every number on it is a prediction, and the prediction that decides the rating is about occupancy rather than about masonry. The borough's houses are older, but a sixty-year-old house is not fifteen years from worthless, and the report gives no structural reason for the figure — it gives “occupancy is mixed” and “the trend of the past decade,” which are statements about people. The second option mistakes silence for neutrality: the agency's 1938 manual said outright that a neighborhood held its value when properties “continue to be occupied by the same social and racial classes,” that sentence came out between 1947 and 1950, and the ratings it had produced did not change. The third option throws away good evidence — a fee appraiser writing to a standard form is precisely what makes this document representative rather than idiosyncratic.",
    skillCategory: "Sourcing",
  },
  {
    id: "case-022-mcq-loan-file-contextualization",
    prompt:
      "File 4,118 records a veteran with an unused entitlement, a clean credit report, nine years' verified employment and a payment ratio of twenty-one per cent — and a committee action declining the application because “the property offered does not meet the association's requirements as security.” Which context is most necessary to interpret what happened?",
    choices: [
      "That the Servicemen's Readjustment Act guaranteed part of a loan a private lender chose to make rather than lending anything itself, so the entitlement was worth exactly as much as some bank's willingness to write the loan — and the bank was not required to state a reason to anybody",
      "That the Veterans Administration set nationwide underwriting rules binding on private lenders, so the committee's decision must have followed a federal standard it had no discretion over",
      "That mortgage credit was unusually scarce in 1957, so applications of every kind were being declined at a high rate that year",
      "That the housing title of the GI Bill expired in 1956, so the entitlement recorded on this file was no longer available to be used",
    ],
    answer: 0,
    explanation:
      "The benefit was real and the delivery was private. Title III of the 1944 act guaranteed a portion of a home loan against default; it did not appropriate a mortgage, and a veteran holding a certificate of eligibility still had to find a lender. That is why steps one through four of this file all clear and the application dies at step five, on an appraisal of the neighborhood rather than of the man, and why step six converts that into a sentence with no content in it. The second option inverts the arrangement — the VA leaned on the insuring agency's appraisal practice rather than dictating to lenders, and the committee had all the discretion in the world. The third is not the case, and would not explain a file whose every credit line is satisfactory. The fourth is simply wrong: the loan guaranty ran for years and was repeatedly extended. What one jacket establishes is the mechanism; the pattern across thousands of them is the finding, and that pattern is Ira Katznelson's subject in When Affirmative Action Was White.",
    skillCategory: "Contextualization",
  },
  {
    id: "case-022-mcq-zoning-continuity",
    prompt:
      "In April 1957 the township raised the minimum lot in its Residence A district from 7,500 square feet to 40,000, set a minimum enclosed floor area of 1,200 square feet, prohibited two-family conversions and exempted every dwelling already built. Which statement best traces what amendments of this kind led to over the following two decades?",
    choices: [
      "Large-lot and floor-area minimums became the durable successor to the covenant — neutral on their face, squarely within the purposes zoning had been held to serve since 1926, and costing no existing resident anything — so exclusion outlived the fair-housing legislation of the 1960s and had to be fought in the 1970s on the ground of regional housing need rather than of race",
      "The amendment was void the day it passed, because Euclid v. Ambler had already held minimum lot area requirements unconstitutional",
      "Such amendments were superseded by the Fair Housing Act of 1968, which prohibited municipalities from setting minimum lot area requirements",
      "They had little practical effect, because federal highway construction opened so much land outside the cities that lot minimums could not raise prices",
    ],
    answer: 0,
    explanation:
      "Euclid v. Ambler (1926) upheld zoning rather than limiting it, and the preamble quoted on this notice is the Standard State Zoning Enabling Act's own language, so the amendment is not merely lawful but conventional. That is what made it durable. The Fair Housing Act of 1968 reached discrimination in the sale, rental and financing of housing; it did not reach a township's density rules, and Village of Arlington Heights v. Metropolitan Housing Development Corp. (1977) then held that a zoning decision violates equal protection only on proof of discriminatory purpose, which a facially neutral acreage minimum rarely supplies. The successful challenges came from a different direction: Southern Burlington County NAACP v. Mount Laurel (New Jersey, 1975) held that a developing municipality may not zone so as to exclude low- and moderate-income households from its fair share of regional need — an argument about housing supply, not about race, made because the argument about race could not be won against this instrument. And the fourth option has the economics backwards: multiplying the required land by more than five is a price floor, and the highway is what made the expensive land worth buying.",
    skillCategory: "Continuity and Change",
  },
];

export const UNIT_08_SEQUENCING_QUESTS = [
  {
    id: "case-022-sequencing-how-a-subdivision-happens",
    prompt:
      "Arrange these developments in the order in which each one made the next possible — not simply the order the dates fall in.",
    // **Authored out of order on purpose**, and enforced by
    // tests/unit/sequencing-quest-order.test.js: renderSequencingQuest() lays items out in this
    // array's order and never shuffles, so a list written 0,1,2,3,4,5 opens already solved and
    // grades a student correct for touching nothing. Keep each item's `position` right and its
    // place in this array wrong.
    items: [
      {
        id: "restrictions-recorded-and-rated",
        label:
          "The plan of lots is recorded with restrictions that run with the land, and the insuring agency's rating system credits the tract for having them",
        position: 3,
      },
      {
        id: "federal-insurance-and-a-rating-system",
        label:
          "The federal government begins insuring long-term mortgages and writes an underwriting manual that rates a neighborhood's future by who is expected to be living in it",
        position: 0,
      },
      {
        id: "the-borough-is-marked-down",
        label:
          "Families who cannot buy in the new tract remain in the older borough, whose remaining economic life the same rating system now estimates at fifteen years — so lending there tightens on the strength of a forecast that helped bring it about",
        position: 5,
      },
      {
        id: "savings-and-an-entitlement",
        label:
          "Wartime saving and a veterans' loan guaranty put millions of families in a position to buy a house on terms that nobody could have obtained in 1935",
        position: 1,
      },
      {
        id: "the-expressway",
        label:
          "A federal highway act pays most of the cost of a limited-access expressway that puts the tract within commuting distance of the city and separates it from the borough beside it",
        position: 4,
      },
      {
        id: "farmland-and-mass-production",
        label:
          "A builder assembles farmland outside the city and applies mass-production methods to house construction, bringing the price of a new house within reach of a factory wage",
        position: 2,
      },
    ],
    explanation:
      "The chain runs from an underwriting standard to a self-fulfilling forecast, and every step is somebody acting rationally on the step before. Federal mortgage insurance is what made a thirty-year amortizing loan on a small down payment ordinary; without it there is no mass suburb to build, and the manual that came with it graded neighborhoods on expected occupancy from the beginning. Wartime savings and the veterans' guaranty supplied the buyers. Mass production supplied a house they could afford. Recording restrictions was how a developer promised the insuring agency that the tract would stay the way it was rated — which is why the covenant and the appraisal are one transaction rather than two. The highway is the step students most often place too early: it does not create the demand, it converts cheap farmland into commutable land and, incidentally, into a “natural or artificial barrier” the rating form was already asking about. And the last step is the one that turns a set of decisions into a pattern, because the borough is marked down for a decline that the previous four steps are busy producing.",
    skillCategory: "Causation",
  },
];

export const UNIT_08_EVIDENCE_ORGANIZING_QUESTS = [
  {
    id: "case-022-evidence-instrument-sourcing",
    prompt:
      "Match each Fairmeadow record to the historical-thinking skill it best demonstrates, then explain what the valuation report and the loan file reveal when they are read against each other. More than one record may belong under the same skill.",
    slots: [
      { id: "causation", label: "Causation" },
      { id: "comparison", label: "Comparison" },
      { id: "continuity-and-change", label: "Continuity and Change" },
      { id: "contextualization", label: "Contextualization" },
      { id: "sourcing-situation", label: "Sourcing" },
    ],
    sources: [
      {
        id: "suburb-covenant-deed",
        label: "Deed, Lot 214, Section F",
        attribution: "The developer's conveyancing attorney, March 1953",
        excerpt:
          "FOURTH. No fence, wall or hedge exceeding four feet in height… FIFTH. No dwelling… at a cost of less than nine thousand dollars… SIXTH. No persons of any race other than the Caucasian race shall use or occupy any building or any lot… THESE COVENANTS are to run with the land… until the first day of January, nineteen hundred and eighty, at which time the said covenants shall be automatically extended for successive periods of ten years.",
        skillCategory: "Continuity and Change",
        correctSlotId: "continuity-and-change",
      },
      {
        id: "suburb-neighborhood-appraisal",
        label: "Valuation Report, Fairmeadow and Vicinity",
        attribution: "A fee appraiser under contract to the insuring agency, May 1957",
        excerpt:
          "REMARKS ON FEATURE 2. The tract is protected by recorded restrictions of long term, uniformly observed… Occupancy throughout is homogeneous and the economic background of the occupants is uniform and stable… ESTIMATED REMAINING ECONOMIC LIFE: subject tract, 40 years; borough east of the right-of-way, 15 years.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
      {
        id: "suburb-gi-bill-loan-file",
        label: "Application File 4,118 — Guaranteed Loan",
        attribution: "The mortgage department of the savings and loan association, July 1957",
        excerpt:
          "5. Appraisal ordered 20 June upon the property described; report returned 8 July; location rating and remarks noted… 6. Submitted to the committee 15 July. ACTION: DECLINED… MEMORANDUM: the guaranty was available and the credit is good. The objection is to the location and not to the applicant.",
        skillCategory: "Causation",
        correctSlotId: "causation",
      },
      {
        id: "suburb-model-home-terms-sheet",
        label: "Terms Sheet, The Fairmeadow Rancher",
        attribution: "The sales office of the developer, 1957",
        excerpt:
          "TO VETERANS: NOTHING DOWN. Ten dollars with your application. Ninety dollars at settlement… Thereafter SEVENTY-NINE DOLLARS AND FIFTY CENTS A MONTH, thirty years, and that figure includes your principal, your interest, your township and school taxes and your fire insurance. — TO OTHERS: ten per centum down.",
        skillCategory: "Contextualization",
        correctSlotId: "contextualization",
      },
      {
        id: "suburb-zoning-amendment",
        label: "Ordinance No. 118, Amending the Zoning Ordinance",
        attribution: "The board of supervisors of the township, April 1957",
        excerpt:
          "…in order to lessen congestion in the streets, to prevent the overcrowding of land… the minimum lot area required for any dwelling is increased from seven thousand five hundred square feet to forty thousand square feet… Dwellings designed or converted for occupancy by two or more families are prohibited… Nothing herein shall apply to any dwelling lawfully erected before the effective date hereof.",
        skillCategory: "Comparison",
        correctSlotId: "comparison",
      },
      {
        id: "suburb-citizens-committee-handbill",
        label: "To Our Neighbours in Fairmeadow",
        attribution: "A committee of residents, August 1957",
        excerpt:
          "They bought it in the ordinary way, from the owner who was selling it, at the price he asked, and their deed is exactly as good as yours is… Most of the people standing in that road do not live on this street… what is being done at the corner of Ash Lane is being done in the name of this street… Every one of us has a mortgage. So have they.",
        skillCategory: "Sourcing",
        correctSlotId: "sourcing-situation",
      },
    ],
    reflectionPrompt:
      "The valuation report and the loan file were written eight weeks apart about the same property. Explain what each one can establish that the other cannot, and what a historian holding only one of them would get wrong.",
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
        "Earn 1 point per record correctly matched to the historical-thinking skill it best demonstrates, and 1 point for a reflection that distinguishes what the valuation report and the loan file each establish and identifies what a historian holding only one of them would conclude wrongly.",
    },
    explanation:
      "The report and the file are one decision seen from two desks, and neither is sufficient. The valuation report establishes the standard exactly — the eight rated features, the weight carried by protection from adverse influences, the forty years against fifteen — and it can tell you nothing about any person, because no applicant appears on it. The loan file establishes the consequence exactly — a veteran with an entitlement, clean credit and a comfortable ratio, declined at step five with no reason on the record — and it cannot tell you why, because the reason is on somebody else's form. A historian with only the report would describe a professional rating system and could honestly report that it never mentions race. A historian with only the file would describe one bank's decision and could honestly report that no rule was broken. Put them together and the rating is the decision, which is the finding neither document states and both support. That is also why the handbill sits under Sourcing beside the report rather than under any of the others: it is the only record here written by somebody who knew it would be read, and knowing that is what a sourcing question is.",
  },
];

export const UNIT_08_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-022-hipp-citizens-committee-handbill",
    prompt:
      "Analyze the Fairmeadow handbill using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes what the sheet says — not the one that merely names the correct answer.",
    document: {
      text: "TO OUR NEIGHBOURS IN FAIRMEADOW. A family has bought the house at the corner of Ash Lane and moved into it. They bought it in the ordinary way, from the owner who was selling it, at the price he asked, and their deed is exactly as good as yours is. There have now been four nights of it. Most of the people standing in that road do not live on this street and a good many of them do not live in this development… We are asking you to come to a meeting at the Fire Company hall on Thursday at eight o'clock. We are not asking you to agree with us about anything at all except this one thing: that what is being done at the corner of Ash Lane is being done in the name of this street, and it will be reported in the newspapers as this street, whether you come on Thursday or stay at home. Every one of us has a mortgage. So have they. — THE FAIRMEADOW CITIZENS COMMITTEE. Please pass this on to the next house. We have no money for postage.",
      attribution:
        "Mimeographed handbill of the Fairmeadow Citizens Committee, August 1957 (composite reconstructed from the form of neighborhood handbills and from the documented case of William and Daisy Myers in Levittown, Pennsylvania, from 13 August 1957)",
    },
    hippPrompts: [
      {
        id: "handbill-audience",
        dimension: "Intended audience",
        argument:
          "It is addressed to “our neighbours,” it insists that most of the people in the road do not live here, and it closes by asking the reader to hand it to the next house because the committee cannot afford postage.",
        options: [
          {
            id: "handbill-audience-explained",
            text: "It is written past the crowd to the neighbours watching from indoors — people the committee takes to be uneasy rather than hostile — which is why it argues that the trouble is being made by outsiders, why it asks for attendance rather than for agreement, and why it travels hand to hand down one street: a mailed circular would have gone to the whole township, and this sheet is meant to reach the doorsteps of the people whose silence is being counted.",
            correct: true,
          },
          {
            id: "handbill-audience-named-only",
            text: "The intended audience is the residents of the Fairmeadow development.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "handbill-audience-wrong-crowd",
            text: "The intended audience is the crowd standing outside the house, whom the committee is trying to shame into going home.",
            correct: false,
          },
          {
            id: "handbill-audience-wrong-authorities",
            text: "The intended audience is the state police and the county authorities, whom the committee is asking to intervene at the corner of Ash Lane.",
            correct: false,
          },
        ],
      },
      {
        id: "handbill-purpose",
        dimension: "Purpose",
        argument:
          "It never says that segregation is wrong. It says the family bought lawfully, that the crowd is largely from elsewhere, that the street will be named in the papers either way, and that “every one of us has a mortgage; so have they.”",
        options: [
          {
            id: "handbill-purpose-explained",
            text: "The sheet is trying to get undecided neighbours into a hall on Thursday, not to win an argument about race, so it selects only the claims a reluctant neighbour can accept without having to change his mind — and it rests on property and reputation because those are the interests a two-year-old development actually holds in common. What reads as timidity is a calculation about what will get somebody out of the house.",
            correct: true,
          },
          {
            id: "handbill-purpose-named-only",
            text: "The purpose is to invite neighbours to a meeting at the Fire Company hall on Thursday evening.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "handbill-purpose-wrong-record",
            text: "The purpose is to preserve a record of the four nights for the use of investigators, which is why it lists the broken window, the radio and the burning.",
            correct: false,
          },
          {
            id: "handbill-purpose-wrong-developer",
            text: "The purpose is to press the developer into buying the house back from the family so that the disturbance will end.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 8.02's mission — the loyalty program read through the one document in it whose author,
// audience and interest can all be established. See this file's header for why that is the point
// rather than a convenience.
export const UNIT_08_ARCHIVE_SOURCE_ANALYSIS_QUESTS = [
  {
    id: "case-023-mission-declaration-of-conscience-hipp",
    prompt:
      "Analyze Senator Smith's Declaration of Conscience using HIPP reasoning. For each dimension, choose the option that explains how or why it shapes the speech — not the one that merely names the correct answer.",
    document: {
      text: "Mr. President, I would like to speak briefly and simply about a serious national condition… I speak as a Republican. I speak as a woman. I speak as a United States Senator. I speak as an American… I think that it is high time that we remembered that we have sworn to uphold and defend the Constitution. I think that it is high time that we remembered that the Constitution, as amended, speaks not only of the freedom of speech but also of trial by jury instead of trial by accusation… Those of us who shout the loudest about Americanism in making character assassinations are all too frequently those who, by our own words and acts, ignore some of the basic principles of Americanism — the right to criticize; the right to hold unpopular beliefs; the right to protest; the right of independent thought… The record of the present Democratic administration has provided us with sufficient campaign issues without the necessity of resorting to political smears… I don't want to see the Republican Party ride to political victory on the Four Horsemen of Calumny — Fear, Ignorance, Bigotry, and Smear.",
      attribution:
        "Margaret Chase Smith, “Declaration of Conscience,” delivered in the United States Senate, June 1, 1950; six other Republican senators joined the statement",
    },
    hippPrompts: [
      {
        id: "smith-situation",
        dimension: "Historical situation",
        argument:
          "She speaks fifteen weeks after a junior senator of her own party told an audience in Wheeling, West Virginia that he held a list of Communists in the State Department — and at a moment when the accusations were costing the Democratic administration a great deal and her own party nothing.",
        options: [
          {
            id: "smith-situation-explained",
            text: "The speech is made inside the party that was profiting from the tactic, by a first-term member with no seniority to shelter behind, which is why it spends as many lines affirming Republican opposition to the administration as it does condemning the method — and why seven senators in total signed it. The same words from a Democrat would have been ordinary partisanship; from her they had to be paid for, and the price is visible in the structure of the argument.",
            correct: true,
          },
          {
            id: "smith-situation-named-only",
            text: "Senator Smith delivered the speech in 1950, during the early years of the Cold War.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "smith-situation-wrong-after-censure",
            text: "She was speaking after the Senate had censured the senator from Wisconsin, at a point when opposing him carried little political risk.",
            correct: false,
          },
          {
            id: "smith-situation-wrong-opposition",
            text: "She was speaking as a member of the opposition party, which is what left her free to attack the administration's critics without cost.",
            correct: false,
          },
        ],
      },
      {
        id: "smith-point-of-view",
        dimension: "Point of view",
        argument:
          "She names four positions in order — Republican, woman, Senator, American — before saying anything else, and she is careful to state that the Democratic administration has already given her party campaign issues enough.",
        options: [
          {
            id: "smith-pov-explained",
            text: "The four-part self-identification is the argument's frame rather than a flourish: each is a claim to standing that accusation-politics could otherwise turn against her, and by declaring the partisan interest first she makes it much harder to dismiss what follows as disloyalty to her own side. The speech is built to survive the exact tactic it describes, which is why it concedes the political ground before it takes the moral ground.",
            correct: true,
          },
          {
            id: "smith-pov-named-only",
            text: "Smith's point of view is that of a Republican senator from Maine.",
            identificationOnly: true,
            correct: false,
          },
          {
            id: "smith-pov-wrong-neutral",
            text: "She writes as a neutral observer with no partisan stake in the outcome, which is what gives the speech its authority.",
            correct: false,
          },
          {
            id: "smith-pov-wrong-ally",
            text: "She writes as an ally of the senator from Wisconsin who disagrees only with his choice of targets, not with his method.",
            correct: false,
          },
        ],
      },
    ],
  },
];

// Case 8.03's mission — a statute read as an instrument. See this file's header for why the whole
// case is one question.
export const UNIT_08_ARCHIVE_MCQ_QUESTS = [
  {
    id: "case-024-mission-coverage-formula",
    relatedSource: {
      label: "Two sections of one statute",
      attribution: "Voting Rights Act of 1965, §4(b) and §5, signed August 6, 1965",
      excerpt:
        "§4(b): “The provisions of subsection (a) shall apply in any State or in any political subdivision of a State which (1) the Attorney General determines maintained on November 1, 1964, any test or device, and with respect to which (2) the Director of the Census determines that less than 50 per centum of the persons of voting age residing therein were registered on November 1, 1964, or that less than 50 per centum of such persons voted in the presidential election of November 1964.” · §5: “Whenever a State or political subdivision [so covered] shall enact or seek to administer any voting qualification or prerequisite to voting, or standard, practice, or procedure with respect to voting different from that in force or effect on November 1, 1964, such State or subdivision may institute an action in the United States District Court for the District of Columbia for a declaratory judgment that such qualification, prerequisite, standard, practice, or procedure does not have the purpose and will not have the effect of denying or abridging the right to vote on account of race or color, and unless and until the court enters such judgment no person shall be denied the right to vote for failure to comply with such qualification, prerequisite, standard, practice, or procedure.”",
    },
    prompt:
      "Section 4(b) names no race, no organization and no State. It names two conditions. Which statement best explains how a formula made of two measurements reached exactly the jurisdictions Congress intended — and did what a decade of case-by-case litigation had not?",
    choices: [
      "Congress picked two conditions whose combination described the places where tests were being used to exclude Black voters — a test or device in force on 1 November 1964, and registration or turnout below half — so the tests were suspended automatically wherever both held, and §5 then required federal approval before any new voting rule could take effect, which is what stopped a struck-down device from being replaced faster than a court could reach it",
      "The formula applied nationwide, and the Southern states fell under it only because their turnout happened to be below the national average in that particular election",
      "The Act gave the Attorney General discretion to name the covered States, and he exercised it by selecting the Deep South",
      "The Act listed the covered States in a schedule printed at the end of it, which is why the Supreme Court upheld it as a valid exercise of Congress's power to enforce the Fifteenth Amendment",
    ],
    answer: 0,
    explanation:
      "The formula is the argument. The Civil Rights Acts of 1957, 1960 and 1964 all gave the Justice Department power to sue registrars, and the suits worked — one county at a time, over years, after which the county could adopt a fresh requirement and the Department could start again. Section 4(b) replaced litigation with a trigger: two facts anybody could look up, chosen because their combination picked out the jurisdictions where the tests were doing the work, so the tests fell without anyone having to prove intent county by county. Section 5 is the half students forget, and it is the half that made the first half stick, because a covered jurisdiction had to obtain approval in Washington before any new voting rule took effect at all. The Supreme Court upheld the scheme in South Carolina v. Katzenbach (1966), squarely on Congress's Fifteenth Amendment enforcement power, and no schedule of States was attached to anything. The measurements are also why the Act could be defended as general legislation rather than as a punishment aimed at named states. The results were immediate: Black registration in Mississippi rose from under seven per cent in 1964 to nearly sixty per cent by 1967. In Shelby County v. Holder (2013) the Court held that same coverage formula unconstitutional on the ground that it rested on decades-old data — a ruling about §4(b) specifically, which left §5 standing with nothing to apply to.",
    skillCategory: "Causation",
  },
];

export const UNIT_08_ARCHIVE_SAQ_QUESTS = [
  {
    id: "unit-08-archive-suburban-boundary-saq",
    stimulus:
      "“What white Americans have never fully understood — but what the Negro can never forget — is that white society is deeply implicated in the ghetto. White institutions created it, white institutions maintain it, and white society condones it… Our nation is moving toward two societies, one black, one white — separate and unequal.” — Report of the National Advisory Commission on Civil Disorders (the Kerner Commission), summary of report, 29 February 1968",
    prompts: [
      "A. Identify one way federal policy contributed to residential segregation in the United States in the period 1945–1980.",
      "B. Explain one way that suburban growth changed American society or politics in the same period.",
      "C. Explain one way that Americans challenged racial discrimination in housing or schooling between 1945 and 1980.",
    ],
    rubric:
      "SAQ practice rubric: 3 points total. Earn 1 point for each response that gives a historically defensible claim and supports it with accurate, relevant historical information.",
  },
];

export const UNIT_08_ARCHIVE_DBQ_QUESTS = [
  {
    id: "unit-08-archive-federal-hand-dbq",
    prompt:
      "Evaluate the extent to which federal action changed patterns of racial segregation in the United States in the period from 1945 to 1980.",
    documents: [
      {
        id: "doc-executive-order-9981",
        label: "Document 1",
        attribution: "Harry S. Truman, Executive Order 9981",
        date: "July 26, 1948",
        excerpt:
          "It is hereby declared to be the policy of the President that there shall be equality of treatment and opportunity for all persons in the armed services without regard to race, color, religion or national origin. This policy shall be put into effect as rapidly as possible, having due regard to the time required to effectuate any necessary changes without impairing efficiency or morale.",
      },
      {
        id: "doc-shelley-v-kraemer",
        label: "Document 2",
        attribution: "Chief Justice Fred Vinson, opinion of the Court in Shelley v. Kraemer",
        date: "May 3, 1948",
        excerpt:
          "We conclude, therefore, that the restrictive agreements standing alone cannot be regarded as a violation of any rights guaranteed to petitioners by the Fourteenth Amendment. So long as the purposes of those agreements are effectuated by voluntary adherence to their terms, it would appear clear that there has been no action by the State and the provisions of the Amendment have not been violated… But here there was more. These are cases in which the purposes of the agreements were secured only by judicial enforcement by state courts of the restrictive terms of the agreements.",
      },
      {
        id: "doc-brown-v-board",
        label: "Document 3",
        attribution:
          "Chief Justice Earl Warren, opinion of the Court in Brown v. Board of Education",
        date: "May 17, 1954",
        excerpt:
          "We come then to the question presented: Does segregation of children in public schools solely on the basis of race, even though the physical facilities and other 'tangible' factors may be equal, deprive the children of the minority group of equal educational opportunities? We believe that it does… We conclude that in the field of public education the doctrine of 'separate but equal' has no place. Separate educational facilities are inherently unequal.",
      },
      {
        id: "doc-southern-manifesto",
        label: "Document 4",
        attribution:
          "“Declaration of Constitutional Principles” (the Southern Manifesto), signed by 19 senators and 82 representatives and read into the Congressional Record",
        date: "March 12, 1956",
        excerpt:
          "We regard the decision of the Supreme Court in the school cases as a clear abuse of judicial power. It climaxes a trend in the Federal Judiciary undertaking to legislate, in derogation of the authority of Congress, and to encroach upon the reserved rights of the States and the people… We commend the motives of those States which have declared the intention to resist forced integration by any lawful means.",
      },
      {
        id: "doc-lbj-howard",
        label: "Document 5",
        attribution:
          "Lyndon B. Johnson, commencement address at Howard University, “To Fulfill These Rights”",
        date: "June 4, 1965",
        excerpt:
          "You do not wipe away the scars of centuries by saying: Now you are free to go where you want, and do as you desire, and choose the leaders you please. You do not take a person who, for years, has been hobbled by chains and liberate him, bring him up to the starting line of a race and then say, 'you are free to compete with all the others,' and still justly believe that you have been completely fair… We seek not just freedom but opportunity — not just legal equity but human ability; not just equality as a right and a theory, but equality as a fact and as a result.",
      },
      {
        id: "doc-kerner-commission",
        label: "Document 6",
        attribution: "Report of the National Advisory Commission on Civil Disorders",
        date: "February 29, 1968",
        excerpt:
          "Our nation is moving toward two societies, one black, one white — separate and unequal… What white Americans have never fully understood — but what the Negro can never forget — is that white society is deeply implicated in the ghetto. White institutions created it, white institutions maintain it, and white society condones it… Segregation and poverty have created in the racial ghetto a destructive environment totally unknown to most white Americans.",
      },
      {
        id: "doc-milliken-v-bradley",
        label: "Document 7",
        attribution: "Chief Justice Warren Burger, opinion of the Court in Milliken v. Bradley",
        date: "July 25, 1974",
        excerpt:
          "Boundary lines may be bridged where there has been a constitutional violation calling for interdistrict relief, but the notion that school district lines may be casually ignored or treated as a mere administrative convenience is contrary to the history of public education in this country… To approve the remedy ordered by the court would impose on the outlying districts, not shown to have committed any constitutional violation, a wholly impermissible remedy based on a standard not hinted at before.",
      },
    ],
    rubric:
      "DBQ practice rubric: 7 points total. 1 point for a defensible thesis that responds to the prompt; 1 point for contextualization beyond the documents; up to 2 points for using the content of at least 3-4 documents to support an argument (not just describing them); 1 point for at least one piece of specific outside evidence beyond the documents; 1 point for explaining how or why at least 2 documents' point of view, purpose, situation, or audience is relevant to the argument; 1 point for complexity — for example, showing both that federal action dismantled the legal basis of segregation (Documents 1, 2, 3 and 5) AND that the federal government was simultaneously financing the residential pattern that outlived every one of those remedies, through mortgage insurance and loan guaranties written on neighborhood ratings, so that by Document 7 the district line drawn around a suburb the government had helped underwrite was itself sufficient to defeat a desegregation order — a student tracking only the rulings and the statutes would miss that the most durable decisions were made in appraisals, deeds and zoning ordinances rather than in opinions.",
  },
];
