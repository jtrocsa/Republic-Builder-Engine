// Unit 8 (Period 8: 1945-1980) campaign content — "Grounds for Refusal."
//
// Structural mirror of unit-07-campaign.js. Three cases: one Chronotravel destination with a
// walkable map (case-022, a new subdivision outside Philadelphia in August 1957), and two
// missions.
//
// ## The unit is one refusal seen three times
//
// `THE-MAP-PROGRAM.md` §5 fixes what the field case's interview asks — **what a neighbour will
// say on the record** — and the two missions move that question to two other counters. A lender
// refuses a loan and the grounds are written down in a form that never says what they are. A
// loyalty board refuses employment and the grounds are not written down at all, because the
// accuser is not named. A registrar refuses a ballot and the grounds are a test he sets, gives and
// grades himself — and that is the one of the three that a statute eventually took away from him.
//
// So the arc is not three defeats. It is a refusal getting harder to see and then, once, being
// answered in its own medium: the Voting Rights Act's coverage formula is a piece of arithmetic
// written to do what a decade of case-by-case litigation could not. A student who reads Period 8
// as rights being granted will miss that every one of these decisions was made on paper by
// somebody with a form in front of them, and that the successful remedy was also a form.
//
// The two missions' topics are an authoring choice rather than a briefed one — the map program
// briefs only the field case for Units 6-9. They were chosen to reach the two key concepts the
// suburb does not (8.1's domestic Cold War, and 8.2's federal answer to disfranchisement) and
// because the unit's own question needs an ending. Vietnam, the Great Society, the movements and
// the conservative response are carried by the two Archive Challenges rather than by a third case,
// which is what those are for.
//
// ## The place is composite and the mechanism is not
//
// Fairmeadow is invented, in the way Riverbend, Canal Crossroads and Cottonwood Junction are
// invented and Ellis Island is not. Two reasons, and the second is the binding one.
//
// There was no single subdivision that had the appraisal, the covenant, the lending office and the
// model house all in one walkable corridor, so a composite is the only honest way to put them on
// one map. And the interview asks eight neighbours what they will say on the record, which means
// **eight invented people saying things about a real named town would be an accusation against a
// real address.** Every mechanism below is documented — the rating categories, the covenant's
// standard form, the crediting of a federal guaranty through a private decision, the minimum-lot
// amendment — and every citation says which real instrument it is reconstructed from.
//
// **August 1957 is load-bearing, and it is load-bearing because of what was happening elsewhere.**
// On 13 August 1957 William and Daisy Myers moved into a house in Levittown, Pennsylvania, and
// crowds gathered outside it nightly for weeks until the state attorney general obtained an
// injunction. On 9 September the Civil Rights Act of 1957 was signed. On 24 September the 101st
// Airborne escorted nine students into Central High School in Little Rock. The map's month is the
// month in which the same question was being asked at a school door, in Congress, and on a street
// where nobody was breaking any law at all — which is the reason the suburb is the case and the
// school is not.
//
// ## The word is not on any of these forms, and that is the finding
//
// The 1938 Underwriting Manual said it outright: a neighbourhood keeps its value when properties
// "continue to be occupied by the same social and racial classes", and the manual recommended a
// recorded covenant to make sure of it. That language came out of the manual between 1947 and
// 1950, and the ratings it produced did not change. So the appraisal on this map is a form with
// eight neutral-sounding features on it that arrives at the answer the old form arrived at, and the
// audit a player runs against it cannot work by finding a slur. It has to work by reading a rating.
//
// That is deliberately harder than the other six maps' central findings, and it is the reason
// `THE-MAP-PROGRAM.md` §5 calls this the strongest documentary-form map in the program.
//
// ## Every `activityRoute` here is `null`, and that is a stage rather than a decision
//
// Units 3-7 all shipped their content one phase before their maps, for the reason the unit registry
// records: `activeFieldMap()` falls back to Unit 1's Caribbean for a unit it has no map for, so
// registering a field case early does not error — it lands the player on the wrong continent.
// `THE-MAP-PROGRAM.md` §2 gives this map **slate B — `interview` · `discrepancy` · `trace`**, read
// off that table's own row rather than off a prose summary, which is the mistake `0081` §5 records
// Unit 7 making and paying a rebuild for. §5 names the three records the slate lands on: the deed
// with the covenant, the neighbourhood appraisal and the guaranteed-loan file, which are the first,
// second and third entries below. The remaining four — the model house's terms sheet, the
// underwriting checklist, the township's zoning amendment and the citizens' committee handbill —
// will stay `null` and open in `sourceReader()`, exactly as the non-mission records on the other
// six maps do. A route may only name an engine once an activity is authored for that record,
// because `validate:content` cross-checks the two and fails if a route has nothing behind it.

export const UNIT_08 = {
  id: "unit-08",
  title: "Grounds for Refusal",
  period: "Period 8 · 1945–1980",
  description:
    "How a country that had just won a war and was about to build the largest middle class in its history decided, counter by counter and form by form, who the new prosperity was for — insuring the mortgages that built the suburbs on a rating system that priced a neighbourhood by who lived in it, screening five million of its own employees for a loyalty no one could define, and leaving the vote in the hands of registrars who set their own tests — until a movement forced the federal government to answer a paper exclusion with a paper remedy.",
  centralQuestion:
    "Between 1945 and 1980 Americans were refused houses, jobs and ballots by people who never had to say why. Where were those refusals actually written down — and what did it take to make one of them answerable?",
  // Two unit-level Archive Challenges, the pair Units 3 through 7 carry: the SAQ works from a
  // single stimulus, the DBQ from seven documents. Both are reached from the Archive Terminal in
  // the Archive Room, never from a case — see the Mission vs. Archive Challenge split in CLAUDE.md.
  archiveChallenges: [
    { questType: "saq", questId: "unit-08-archive-suburban-boundary-saq" },
    { questType: "dbq", questId: "unit-08-archive-federal-hand-dbq" },
  ],
  cases: [
    {
      id: "case-022",
      shortTitle: "Fairmeadow",
      title: "The Sixth Restriction",
      date: "1957",
      // A composite subdivision in the Delaware Valley outside Philadelphia — see this file's
      // header for why this map is invented where Ellis Island was not.
      mapPosition: { lat: 40.15, lon: -74.86 },
      location: "Fairmeadow, Pennsylvania · August 1957",
      question:
        "Every restriction on this deed is about the property — the height of a fence, the cost of a house, the trade you may not carry on. The sixth one is about the people, and the Supreme Court made it unenforceable nine years ago. So why is it still printed here, and how is it still working?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk a subdivision two weeks old and a borough two hundred years old, either side of a new expressway — the model house with its terms sheet, the lending office with its checklist, the township notice board and the street where a handbill is going door to door — and recover seven records that between them show how a federal guarantee, a private appraisal and a clause nobody could enforce added up to a decision nobody had to sign.",
      // KC 8.2 (the civil rights movement and the legal order it was arguing with) and 8.3
      // (postwar economic growth, suburbanization and internal migration). Themes: MIG (who moved
      // where, and who could not), WXT (mortgage credit as the instrument), PCE (a decision made
      // by people answerable to no one in the room).
      ced: { period: 8, keyConcepts: ["8.2", "8.3"], themes: ["MIG", "WXT", "PCE"] },
    },
    {
      id: "case-023",
      shortTitle: "Reasonable Grounds",
      title: "Reasonable Grounds",
      date: "1947–1954",
      // The Senate chamber, where the loyalty program was first answered from inside the party
      // that was profiting by it.
      mapPosition: { lat: 38.8899, lon: -77.0091 },
      location: "The United States Senate · 1 June 1950",
      question:
        "A federal loyalty board could refuse you employment where 'reasonable grounds exist for belief' that you were disloyal — without naming your accuser, disclosing the charge in full, or letting you cross-examine anyone. Read the first speech in the Senate that said so out loud, and work out what it is actually doing.",
      mechanic: "Source Analysis",
      // A non-map mission. HIPP on one document, because the loyalty program's problem is a
      // sourcing problem: the case against a person was made of statements nobody would sign, and
      // the only way to teach that is with a document whose author, audience and purpose can all
      // be established exactly — which is the opposite kind of document, and the point.
      route: "mission",
      summary:
        "Analyse Margaret Chase Smith's Declaration of Conscience — delivered fifteen weeks after Wheeling, by a first-term Republican senator, against her own party's most effective weapon — and explain how her situation, her audience and her position shape every line of it.",
      archiveChallenge: {
        questType: "hipp",
        questId: "case-023-mission-declaration-of-conscience-hipp",
      },
      // KC 8.1 (the Cold War at home, and the domestic politics it produced). Themes: PCE, NAT
      // (what being American was said to require), WOR (the foreign threat that licensed it).
      ced: { period: 8, keyConcepts: ["8.1"], themes: ["PCE", "NAT", "WOR"] },
    },
    {
      id: "case-024",
      shortTitle: "The Formula",
      title: "The Formula",
      date: "1965",
      // Selma, where the registration figures that the formula was built to describe were made.
      mapPosition: { lat: 32.4074, lon: -87.0211 },
      location: "Selma, Alabama, and the Capitol · 1965",
      question:
        "The Voting Rights Act's coverage formula names no race and no state. It names two measurements. Work out why two measurements did what ten years of lawsuits could not.",
      mechanic: "Evidence Reading",
      // A non-map mission. One stimulus-based multiple-choice question, the shape case-009 and
      // case-018 established, because the intellectual work here is reading a statute as an
      // instrument rather than as a declaration — and the whole difficulty is contained in four
      // lines of §4(b).
      route: "mission",
      summary:
        "Read the two conditions in Section 4(b) and the prior-approval requirement in Section 5, and explain how a statute that mentions nobody reached exactly the places Congress meant it to reach.",
      archiveChallenge: {
        questType: "mcq",
        questId: "case-024-mission-coverage-formula",
      },
      // KC 8.2 (the civil rights movement and the federal response to it). Themes: PCE (who holds
      // the power to decide who votes), NAT (citizenship that had been formal and not actual).
      ced: { period: 8, keyConcepts: ["8.2"], themes: ["PCE", "NAT"] },
    },
  ],
};

// Record Reconstruction lanes for case-022. Three, and like Units 4 through 7's they are arguments
// rather than topics. Every record on this map is part of one arrangement for deciding who gets a
// house, and the arrangement has three faces: it offers something, it prices something, and it
// says it exists to protect somebody. Asking a student which face a given form is showing is a
// sourcing exercise disguised as a sort — and it is the sort that makes the terms sheet and the
// zoning amendment legible as evidence rather than as background.
export const CASE_022_LANES = [
  { id: "what-is-being-promised", label: "What is being promised" },
  { id: "what-is-being-priced", label: "What is being priced" },
  { id: "who-is-being-protected", label: "Who is being protected" },
];

export const CASE_022_SOURCES = [
  {
    id: "suburb-covenant-deed",
    type: "Reconstructed record · Deed of conveyance, with the building and use restrictions endorsed on it",
    title: "Deed, Lot 214, Section F",
    creator: "The developer's conveyancing attorney, recorded in the county recorder's office",
    date: "March 1953",
    record: "The folded deed a family keeps in a drawer, and the six restrictions printed on it",
    visual: "context",
    activityRoute: null,
    excerpt:
      "THIS INDENTURE, made the ninth day of March, one thousand nine hundred and fifty-three… GRANTS AND CONVEYS unto the said Grantees, their heirs and assigns, ALL THAT CERTAIN lot or piece of ground situate in the Township aforesaid, known and designated as Lot No. 214 in Section F upon the plan of lots entitled FAIRMEADOW, recorded in the office for the recording of deeds in and for the said County… UNDER AND SUBJECT, nevertheless, to the following restrictions and covenants, which shall run with the land: FIRST. No building shall be erected upon any lot other than one detached single-family dwelling not exceeding two stories in height, with a private garage for not more than two cars. SECOND. No structure of a temporary character, trailer, basement, tent, shack or barn shall be used on any lot at any time as a residence. THIRD. No noxious or offensive trade or activity shall be carried on upon any lot, nor shall anything be done thereon which may be or become an annoyance or nuisance to the neighborhood. FOURTH. No fence, wall or hedge exceeding four feet in height shall be erected or maintained forward of the front building line. FIFTH. No dwelling shall be permitted upon any lot at a cost of less than nine thousand dollars, exclusive of the lot. SIXTH. No persons of any race other than the Caucasian race shall use or occupy any building or any lot, except that this covenant shall not prevent occupancy by domestic servants of a different race domiciled with an owner or tenant. THESE COVENANTS are to run with the land and shall be binding upon all parties and all persons claiming under them until the first day of January, nineteen hundred and eighty, at which time the said covenants shall be automatically extended for successive periods of ten years unless by a vote of a majority of the then owners of the lots it is agreed to change the same in whole or in part.",
    prompt:
      "Read the sixth restriction in the place it actually sits — sixth, after the height of a fence and before the date the whole list renews itself. Then say what the Supreme Court did to this clause in 1948, and why a lawyer was still printing it on a deed in 1953.",
    feedback:
      "Institute Context: in Shelley v. Kraemer (1948) the Supreme Court held that a racially restrictive covenant is a private agreement the Fourteenth Amendment does not reach — but that a state court enforcing one is state action, and therefore barred. Chief Justice Vinson was explicit about the half he was leaving alone: \"So long as the purposes of those agreements are effectuated by voluntary adherence to their terms, it would appear clear that there has been no action by the State.\" So the clause was not struck out of anything. It remained lawful to write, lawful to record and lawful to obey; only a judge was forbidden to make anybody obey it. Barrows v. Jackson (1953) closed the damages route as well. What kept the clause operating after that was not the courts. It was the recorder's index, the title company's search, the broker who would not show the house, the association that called on you, and — see the appraisal and the checklist on this map — a lender reading a rating built on the presence of exactly this kind of restriction. Note also which restriction it is. A student who expects to find the racial clause set apart, in different language, or at the top, will read straight past it: it is the sixth item on a list about fences and garages, in the same flat conveyancer's register, and that is how it was meant to be read.",
    citation:
      'Composite record reconstructed for Chronicle from the standard form of mid-century subdivision restrictions — including the domestic-servant exception and the automatic-renewal clause, both conventional in deeds of this period — and from the model covenant language the Federal Housing Administration\'s own Underwriting Manual recommended in 1938 (§980(3)(g), "prohibition of the occupancy of properties except by the race for which they are intended"). It is not a transcription of a single surviving deed. The legal position follows Shelley v. Kraemer, 334 U.S. 1 (1948) and Barrows v. Jackson, 346 U.S. 249 (1953); the continued operation of recorded covenants after both follows Richard Rothstein, The Color of Law (New York: Liveright, 2017), and Kenneth T. Jackson, Crabgrass Frontier (New York: Oxford University Press, 1985).',
    externalUrl: "https://supreme.justia.com/cases/federal/us/334/1/",
    reconstruction: "who-is-being-protected",
  },
  {
    id: "suburb-neighborhood-appraisal",
    type: "Reconstructed record · Valuation report and rating of location, prepared for mortgage insurance",
    title: "Valuation Report, Fairmeadow and Vicinity",
    creator: "A fee appraiser under contract to the insuring agency",
    date: "May 1957",
    record: "The eight-line rating sheet a lender reads before it reads the application",
    visual: "context",
    activityRoute: null,
    // Gated behind the deed for the reason Unit 7's board minute is gated behind the manifest: the
    // audit's evidence column is minted from the interview's logged answers, and the interview
    // opens from the deed. Without the gate the audit can open with nothing in its column.
    requiresSourceId: "suburb-covenant-deed",
    excerpt:
      "RATING OF LOCATION. — Feature 1, Relative Marketability. Feature 2, Protection from Adverse Influences. Feature 3, Freedom from Special Hazards. Feature 4, Adequacy of Civic, Social and Commercial Centers. Feature 5, Adequacy of Transportation. Feature 6, Sufficiency of Utilities and Conveniences. Feature 7, Level of Taxes and Special Assessments. Feature 8, Appeal. Each feature is graded and weighted; the weighted total is the location rating, and no property may be rated higher than its location. — REMARKS ON FEATURE 2. The tract is protected by recorded restrictions of long term, uniformly observed, and by an active property owners' association. Occupancy throughout is homogeneous and the economic background of the occupants is uniform and stable. The new expressway right-of-way lies between the subject and the older borough to the east, where occupancy is mixed, improvements average sixty years of age, and the trend of the past decade indicates a declining standard of maintenance; the right-of-way affords an effective barrier and no through street connects the two. — REMARKS ON FEATURE 1. Demand is strong and turnover rapid; resale within the tract has been at or above original price in every instance examined. — ESTIMATED REMAINING ECONOMIC LIFE OF IMPROVEMENTS: subject tract, 40 years; borough east of the right-of-way, 15 years. — LOCATION RATING: subject tract, First Grade. Borough east of right-of-way, Fourth Grade; loans in that section are not recommended for the maximum term or the maximum ratio.",
    prompt:
      "Read all eight features and both sets of remarks, and then name the word that does not appear anywhere on this form. Say how the form gets to the same answer that word would have got to — and name the one line that gives the covenant a price.",
    feedback:
      'Institute Context: the eight features are the real rating categories, and Feature 2 carried the heaviest weight of the eight. In the 1938 Underwriting Manual the agency said what Feature 2 meant in so many words — a neighbourhood keeps its value only where properties "continue to be occupied by the same social and racial classes", and the manual listed a recorded racial covenant among the protections an appraiser should look for. That language was taken out between 1947 and 1950, and after 15 February 1950 the agency would not insure a property carrying a covenant recorded after that date. The categories, the weights and the resulting map did not change. What replaced the explicit sentence was this vocabulary: homogeneous occupancy, uniform economic background, a natural or artificial barrier, an estimated remaining economic life. Two of those lines are doing the work here. "Recorded restrictions of long term, uniformly observed" is Feature 2 crediting the tract for the sixth restriction on the deed — a restriction recorded in 1953, which is three years after the agency\'s own rule says it should not be relied upon. And the difference between forty years of economic life and fifteen is not a measurement of any building; it is a prediction about who will be living there, entered as a number, carried into the loan term and the loan ratio, and never argued with because nothing on the form invites an argument.',
    citation:
      'Composite record reconstructed for Chronicle from the Federal Housing Administration\'s rating-of-location framework and the standard fee-appraisal report form of the period; it is not a transcription of a single surviving valuation. The eight rated features and the pre-eminence of "protection from adverse influences" follow the FHA Underwriting Manual (Washington: Government Printing Office, 1938), Part II; the quoted 1938 standard is §937 and the recommended covenant §980(3)(g). The February 1950 covenant policy, the removal of the explicit language and the persistence of the ratings follow Kenneth T. Jackson, Crabgrass Frontier (1985), ch. 11, and Richard Rothstein, The Color of Law (2017), ch. 4.',
    externalUrl: "https://dsl.richmond.edu/panorama/redlining/",
    reconstruction: "what-is-being-priced",
  },
  {
    id: "suburb-gi-bill-loan-file",
    type: "Reconstructed record · Lender's file jacket on an application for a guaranteed home loan",
    title: "Application File 4,118 — Guaranteed Loan",
    creator:
      "The mortgage department of the savings and loan association carrying the developer's construction financing",
    date: "June–August 1957",
    record: "A manila jacket with seven sheets in it, read in the order they were filed",
    visual: "context",
    activityRoute: null,
    excerpt:
      "ROUTING AND ACTION — APPLICATION No. 4,118. 1. Application taken at the counter, 11 June. Applicant a veteran, honourable discharge, certificate of eligibility attached, entitlement unused. 2. Credit report ordered 11 June; returned 17 June, rated satisfactory, no derogatory information, two accounts paid as agreed. 3. Verification of employment returned 19 June: nine years' continuous service, four thousand eight hundred and sixty dollars per annum, prospects reported steady. 4. Ratio of proposed monthly payment to verified income computed at 21 per centum; within the association's limits. 5. Appraisal ordered 20 June upon the property described; report returned 8 July; location rating and remarks noted and filed herewith. 6. Submitted to the committee 15 July. ACTION: DECLINED. Reason to be stated to the applicant: that the property offered does not meet the association's requirements as security. 7. Applicant advised by letter 16 July. Guaranty not called upon. File closed 2 August. — MEMORANDUM, mortgage officer to file: the guaranty was available and the credit is good. The objection is to the location and not to the applicant, and I have said so to him in those words. Nothing further is required to be stated to an applicant and nothing further has been.",
    prompt:
      "Follow the seven numbered steps in order and say at which one the application actually failed. Then read the memorandum twice — once for what it admits, and once for what it is careful not to have written down.",
    feedback:
      "Institute Context: the Servicemen's Readjustment Act of 1944 did not lend anybody money. It guaranteed a portion of a loan made by a private lender, which meant that a veteran's entitlement was worth exactly as much as some bank's willingness to write the loan — and the bank did not have to say why it would not. Steps one to four here all clear: the entitlement is real, the credit is clean, the income is verified, the payment ratio is comfortable. The application dies at step five, on somebody else's appraisal of somebody else's neighbourhood, and step six converts that into a sentence with no content in it. Two things are worth holding onto. The first is that this file records no illegality whatever — every step is ordinary practice and the memorandum is a conscientious officer covering his file. The second is what a historian can and cannot conclude from one jacket: this document establishes the mechanism precisely and establishes nothing at all about the applicant. That is why it is read next to the appraisal rather than on its own, and why the pattern across thousands of such files — traced by Ira Katznelson in When Affirmative Action Was White — is the finding rather than any single one of them.",
    citation:
      "Composite record reconstructed for Chronicle from the routing and committee-action sheets of savings-and-loan mortgage departments and from the Veterans Administration's Title III loan-guaranty procedure; it is not a transcription of a single surviving file. The guaranty structure follows the Servicemen's Readjustment Act of 1944, Title III; the reliance of the VA on FHA appraisal practice and the pattern of local denial to Black veterans follows Ira Katznelson, When Affirmative Action Was White (New York: Norton, 2005), and Richard Rothstein, The Color of Law (2017), ch. 9.",
    externalUrl: "https://www.archives.gov/milestone-documents/servicemens-readjustment-act",
    reconstruction: "what-is-being-promised",
  },
  {
    id: "suburb-model-home-terms-sheet",
    type: "Reconstructed record · Builder's price and terms sheet, handed out at the model house",
    title: "Terms Sheet, The Fairmeadow Rancher",
    creator: "The sales office of the developer",
    date: "1957",
    record: "A single printed sheet from a stack on a card table in the model house",
    visual: "context",
    activityRoute: null,
    excerpt:
      "THE FAIRMEADOW RANCHER. Three bedrooms, one bath, one thousand square feet on a concrete slab. Automatic washing machine, electric range and refrigerator included in the price. Landscaping and seeded lawn included. Storm windows and screens included. — PRICE, ELEVEN THOUSAND NINE HUNDRED AND NINETY DOLLARS. — TO VETERANS: NOTHING DOWN. Ten dollars with your application. Ninety dollars at settlement, which covers your closing costs. Thereafter SEVENTY-NINE DOLLARS AND FIFTY CENTS A MONTH, thirty years, and that figure includes your principal, your interest, your township and school taxes and your fire insurance. — TO OTHERS: ten per centum down, thirty years, eighty-six dollars and twenty cents a month on the same inclusive basis. — Delivery in ninety days from the signing of the agreement. — Sales office open Sunday. Bring the family. Walk through the house. You will not have to imagine anything.",
    prompt:
      'This sheet is addressed to two kinds of buyer and names one of them by what he did in the war. Say who is being invited, in what order — and then say what the words "nothing down" are actually describing, given that the developer is not the party lending the money.',
    feedback:
      "Institute Context: the terms are the product. A mass-production builder could not sell eleven thousand dollars' worth of house to a family with no savings unless somebody would lend the whole price on a thirty-year amortising note, and nobody would do that before the federal government began insuring and guaranteeing such loans in the 1930s and 1940s. \"Nothing down\" is not a discount the builder is giving; it is the veteran's federal entitlement, quoted back to him as a sales feature. That is why the sheet names veterans first and separately, and why the second line costs seven dollars a month more. Read the inclusions too: appliances, lawn, storm windows and screens all folded into the mortgage, so that a family financed its refrigerator over thirty years at the mortgage rate. What the sheet does not mention is the only step that could stop any of it, which is on the file jacket at the lending office — the sentence saying the property offered does not meet the association's requirements as security. A student comparing this sheet with that jacket has the whole map in two documents.",
    citation:
      "Composite record reconstructed for Chronicle from the published price and terms advertising of large postwar subdivision builders, whose sheets characteristically quoted an all-inclusive monthly figure and offered no-down-payment terms to veterans; it is not a transcription of a single surviving advertisement. Prices and monthly figures are set within the documented range for Delaware Valley subdivisions of the middle 1950s. The financing structure follows the National Housing Act as amended and the Servicemen's Readjustment Act of 1944, Title III; the marketing follows Kenneth T. Jackson, Crabgrass Frontier (1985), ch. 13.",
    externalUrl: "https://www.loc.gov/collections/national-screening-room/?q=suburbs",
    reconstruction: "what-is-being-promised",
  },
  {
    id: "suburb-underwriting-checklist",
    type: "Reconstructed record · Mortgage department's underwriting checklist, compiled from the insuring agency's current manual",
    title: "Underwriting Checklist, Section 203(b)",
    creator: "The association's mortgage officer",
    date: "Revised 1957",
    record: "A clipped-together checklist kept on the mortgage officer's desk, not in any file",
    visual: "context",
    activityRoute: null,
    excerpt:
      "PART THREE — THE LOCATION. 3(a) Is the neighbourhood established, or in course of development, or in course of change? State which and give the evidence. 3(b) What is the present and probable future use of the surrounding land? Note any use likely to become adverse. 3(c) Is the neighbourhood protected from adverse influences? Consider: recorded restrictions and their unexpired term; zoning and its likely stability; natural or artificial barriers, including watercourses, park land and limited-access highway right-of-way; the presence and activity of a property owners' association. 3(d) Is occupancy homogeneous as to economic background, and is that condition likely to continue? 3(e) State the estimated remaining economic life of improvements in the neighbourhood, and give the reason for the estimate. — NOTE APPENDED TO 3(c) UPON THE LAST REVISION: restrictions purporting to limit occupancy on the basis of race, colour or creed which were recorded on or after the fifteenth day of February, nineteen hundred and fifty, are not acceptable, are not to be given weight in the rating, and are not to be recited in the report. This note does not alter the treatment of any other restriction. — PART FOUR — THE APPLICANT. 4(a) Credit. 4(b) Income and its stability. 4(c) Ratio of payment to income. NOTE: no property may be rated higher than its location, and no strength under Part Four may be substituted for a deficiency under Part Three.",
    prompt:
      "Two lines on this checklist contradict each other in practice. Find the note appended to 3(c), then find the sentence at the end of Part Four, and then read the appraisal's remarks on Feature 2 again. Say precisely what the appraiser did that this checklist forbids — and say why nothing in this office would have caught it.",
    feedback:
      "Institute Context: the note is real policy. In December 1949 the insuring agency announced that from 15 February 1950 it would not insure a mortgage on property subject to a racial covenant recorded after that date, and language of that kind duly appeared in lenders' checklists. Fairmeadow's plan of lots and its deeds were recorded in 1952 and 1953. The appraisal on this map nevertheless credits the tract under Feature 2 for \"recorded restrictions of long term, uniformly observed\" without reciting them — which satisfies the last clause of the note while relying on exactly what the note forbids relying on. That is not a conspiracy and it did not need to be one: the appraiser was a fee contractor paid per report, the note governs what may be written rather than what may be thought, and no one in the chain had any incentive to ask which restrictions were meant. Hold on to the last sentence of Part Four as well. It is the mechanism the whole map turns on — the applicant's own creditworthiness cannot outweigh the location, so a man with clean credit and a federal guaranty is refused for something he was never asked about and could not have changed.",
    citation:
      "Composite record reconstructed for Chronicle from Federal Housing Administration underwriting practice under Section 203(b) of the National Housing Act and from the location-analysis sections lenders derived from the agency's manual; it is not a transcription of a single surviving checklist. The February 1950 covenant policy follows the agency's announcement of December 1949; the persistence of location-based rating after it follows Kenneth T. Jackson, Crabgrass Frontier (1985), ch. 11, and Richard Rothstein, The Color of Law (2017), ch. 4.",
    externalUrl: "https://www.huduser.gov/portal/casestudies/study-051415.html",
    reconstruction: "what-is-being-priced",
  },
  {
    id: "suburb-zoning-amendment",
    type: "Reconstructed record · Amendment to a township zoning ordinance, as advertised before adoption",
    title: "Ordinance No. 118, Amending the Zoning Ordinance",
    creator: "The board of supervisors of the township, published in the county legal advertiser",
    date: "April 1957",
    record: "A legal notice in small type, pinned to the board outside the township building",
    visual: "context",
    activityRoute: null,
    excerpt:
      "NOTICE IS HEREBY GIVEN that the Board of Supervisors will consider for adoption an ordinance amending the Zoning Ordinance of the Township, in order to lessen congestion in the streets, to prevent the overcrowding of land, to avoid undue concentration of population, to conserve the value of buildings, and to preserve the character of the Township. — SECTION 1. In the district designated Residence A, the minimum lot area required for any dwelling is increased from seven thousand five hundred square feet to forty thousand square feet, and the minimum lot width at the building line from sixty feet to one hundred and fifty feet. — SECTION 2. In the said district the minimum enclosed floor area of any dwelling, exclusive of garage, porch and basement, shall be not less than one thousand two hundred square feet upon one floor. — SECTION 3. No lot in the said district shall contain more than one dwelling, and no dwelling shall be occupied by more than one family. Dwellings designed or converted for occupancy by two or more families are prohibited in every residential district of the Township. — SECTION 4. Land now in agricultural use is placed in the district designated Residence A. — SECTION 5. Nothing herein shall apply to any dwelling lawfully erected before the effective date hereof. — Copies of the proposed ordinance are on file at the office of the Township Secretary and may be examined by any interested party during business hours.",
    prompt:
      "Nothing in this notice is about people; every line is about land. Work out what a forty-thousand-square-foot minimum does to the price of the cheapest house that can lawfully be built here — and then say what it does that the sixth restriction on the deed can no longer do.",
    feedback:
      'Institute Context: the preamble is not the township\'s own writing. "Lessen congestion in the streets", "prevent the overcrowding of land", "conserve the value of buildings" and "preserve the character" come almost word for word from the Standard State Zoning Enabling Act of 1926, the model law nearly every state adopted, and they have been the lawful purposes of zoning since Euclid v. Ambler (1926). What is new here is the arithmetic. A minimum lot of forty thousand square feet is a little under an acre; multiply the land cost by five and a half, add a floor-area minimum that rules out the small house, forbid the two-family conversion that lets a family share a mortgage, and the cheapest lawful dwelling in Residence A is priced past most of the people the sixth restriction on the deed used to exclude — without naming any of them, and therefore without needing a court\'s permission. This is the successor instrument, and it is the one that outlived everything else on this map. Note Section 5 as well: existing houses are exempt, so the ordinance costs no current voter anything, which is why such amendments passed easily and were rarely challenged by anyone with standing.',
    citation:
      "Composite record reconstructed for Chronicle from the form of township zoning amendments advertised in county legal newspapers in the middle 1950s; it is not a transcription of a single surviving ordinance. The quoted purposes follow the Standard State Zoning Enabling Act (Washington: Government Printing Office, 1926), §1 and §3, upheld in Village of Euclid v. Ambler Realty Co., 272 U.S. 365 (1926). The use of minimum lot area, minimum floor area and prohibition of multi-family conversion as exclusionary devices in postwar suburbs follows Kenneth T. Jackson, Crabgrass Frontier (1985), and Richard Rothstein, The Color of Law (2017), ch. 3.",
    externalUrl: "https://supreme.justia.com/cases/federal/us/272/365/",
    reconstruction: "who-is-being-protected",
  },
  {
    id: "suburb-citizens-committee-handbill",
    type: "Reconstructed record · Mimeographed handbill circulated door to door",
    title: "To Our Neighbours in Fairmeadow",
    creator: "A committee of residents of the tract, unsigned but for the committee's name",
    date: "August 1957",
    record: "A purple mimeographed sheet, folded once, pushed through the letter slots of a street",
    visual: "letter",
    activityRoute: null,
    excerpt:
      "TO OUR NEIGHBOURS IN FAIRMEADOW. A family has bought the house at the corner of Ash Lane and moved into it. They bought it in the ordinary way, from the owner who was selling it, at the price he asked, and their deed is exactly as good as yours is. — There have now been four nights of it. Most of the people standing in that road do not live on this street and a good many of them do not live in this development. The state police have been out twice. A window has gone in. Somebody has been playing a radio at that house from a car until two in the morning, and on Tuesday somebody burned something on the lot behind it. — We are asking you to come to a meeting at the Fire Company hall on Thursday at eight o'clock. We are not asking you to agree with us about anything at all except this one thing: that what is being done at the corner of Ash Lane is being done in the name of this street, and it will be reported in the newspapers as this street, whether you come on Thursday or stay at home. Every one of us has a mortgage. So have they. — THE FAIRMEADOW CITIZENS COMMITTEE. Please pass this on to the next house. We have no money for postage.",
    prompt:
      "Work out who wrote this and who it is aimed at — and note that it is not aimed at the people standing in the road. Then say what argument it chooses to make to its neighbours, and what argument it deliberately does not make.",
    feedback:
      'Institute Context: this is the one record on the map with a voice, and it is worth reading for what it declines to say. It does not argue that segregation is wrong; it argues that the crowd is mostly outsiders, that the family bought the house lawfully, and that silence will be read as agreement — three claims aimed squarely at neighbours who want the trouble to stop more than they want to take a side. Read "every one of us has a mortgage; so have they" as the argument it is: a claim of common interest made in the only currency this development has. Committees of exactly this kind were real. When William and Daisy Myers moved into Levittown, Pennsylvania on 13 August 1957, crowds gathered outside their house nightly, a rock came through a window, a cross was burned on adjoining ground and a neighbouring family who supported them had KKK painted on their house; a Levittown Betterment Committee organised to buy the Myers out, and a Citizens Committee for Levittown organised to support them. The Pennsylvania attorney general obtained an injunction at the end of that month. Nobody in that story was breaking a housing law, because there was no housing law in Pennsylvania to break until 1961 — which is exactly why the response had to be a handbill and an injunction rather than a complaint.',
    citation:
      "Composite record reconstructed for Chronicle from the mimeographed neighbourhood handbills of the period; it is not a transcription of a single surviving sheet, and the street, the committee and the family are invented. The events it describes follow the documented case of William and Daisy Myers in Levittown, Pennsylvania, from 13 August 1957, including the nightly crowds, the broken window, the burning cross, the rival Levittown Betterment Committee and Citizens Committee for Levittown, and the injunction obtained by Attorney General Thomas D. McBride; see Daisy D. Myers, Sticks 'n Stones: The Myers Family in Levittown (York, Pa.: York County Heritage Trust, 2005), and David Kushner, Levittown (New York: Walker, 2009). Pennsylvania's Human Relations Act was not extended to housing until 1961.",
    externalUrl: "https://www.phmc.pa.gov/Preservation/About/Pages/Historical-Markers.aspx",
    reconstruction: "who-is-being-protected",
  },
];
