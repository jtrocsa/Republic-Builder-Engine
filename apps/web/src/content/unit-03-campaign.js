/**
 * Unit 3 — Period 3: 1754–1800, "Revolution and Founding."
 *
 * Structural mirror of unit-02-campaign.js. Real, cited historical content
 * for case-007 ("The Common Cause") — the flagship field-route case covering
 * CED topics 3.1 through 3.6, from the post–Seven Years' War frontier crisis
 * through the Revolution's unevenly extended ideals — and case-008 ("The
 * Founding Debate"), a lightweight ledger-mechanic case (structurally
 * mirroring unit-01-campaign.js's EXCHANGE_RECORDS / case-002) covering the
 * Founding Era, 1783–1789: the Articles of Confederation's weaknesses, the
 * Constitutional Convention's compromises, the Federalist/Anti-Federalist
 * ratification debate, and the Bill of Rights. Case-009 remains an explicit
 * future phase and is deliberately not added here.
 *
 * This unit is also the vehicle for real "Comparison" content — the
 * SKILL_CATEGORIES taxonomy in
 * apps/web/src/quest-types/history/evidence-organizing-quest.js has had no
 * real Comparison-tagged content in a field-route case since Unit 2 shipped.
 * See unit-03-quests.js's UNIT_03_EVIDENCE_ORGANIZING_QUESTS for where that
 * gap is closed (Prince Hall's 1777 petition vs. Abigail Adams's 1776
 * letter, both invoking the Revolution's own rights language for groups it
 * did not extend those rights to).
 *
 * A note on source fidelity: two sources here (Pontiac's 1763 speech and
 * Patrick Henry's 1775 speech) are historically real, widely reprinted, and
 * commonly taught — but neither survives as a contemporaneous verbatim
 * transcript. Pontiac's speech survives only in translated/recorded form
 * through a contemporary French-language journal; Henry's speech survives
 * only through William Wirt's 1817 biography, reconstructed decades later
 * from witnesses' recollections. Rather than presenting either as pristine
 * verbatim quotation, both sources' `prompt`/`feedback` fields make that
 * transmission history an explicit part of the Chronicler's sourcing work —
 * see also this file's HIPP quest content in unit-03-quests.js.
 */

export const UNIT_03 = {
  id: "unit-03",
  title: "Revolution and Founding",
  period: "Period 3 · 1754–1800",
  description:
    "How a widening imperial crisis over land, taxation, and representation after the Seven Years' War escalated into armed revolution — and how the ideals colonists invoked to justify independence were claimed, extended, and denied unevenly among Indigenous nations, enslaved and free Black Americans, women, and Loyalists.",
  centralQuestion:
    "How did the ideals colonists used to justify revolution against Britain both inspire and fail to extend equally to the many peoples who lived through Period 3?",
  // Unit-level bonus Archive Challenge (Phase C of the Investigation/Archive
  // Challenge plan's catalog-expansion pass) — not tied to relocating any
  // single case's activity screen; reachable from the Archive Terminal's
  // archiveChallengesScreen(). Completing it, alongside every case, is
  // required for unit completion (see main.js's unitReadyForReview()).
  archiveChallenges: [
    {
      questType: "evidence-organizing",
      questId: "unit-03-archive-appeal-form-comparison",
    },
  ],
  cases: [
    {
      id: "case-007",
      shortTitle: "Common Cause",
      title: "The Common Cause",
      date: "1763–1783",
      mapPosition: { lat: 39.95, lon: -75.16 },
      location: "Philadelphia, Pennsylvania · 1763–1783",
      question:
        "What did a frontier war, a farmer's protest, a King's offer of freedom, and rival appeals to liberty reveal about who could claim the Revolution's promise — and who was left still claiming it?",
      mechanic: "Field Investigation",
      route: "field",
      summary:
        "Walk the Chronicle Institute's reconstruction of a Revolutionary-era Philadelphia gathering ground, gather seven records spanning a frontier war to a fragile peace, and weigh how unevenly the era's language of liberty was extended — and to whom.",
    },
    {
      id: "case-008",
      shortTitle: "Founding Debate",
      title: "The Founding Debate",
      date: "1783–1789",
      mapPosition: { lat: 39.95, lon: -75.16 },
      location: "Philadelphia, Pennsylvania · 1783–1789",
      question:
        "What did a bankrupt confederation, a secret convention, a fierce war of pamphlets, and a promised bill of rights reveal about how much power a free people should entrust to a new national government — and how they would decide?",
      mechanic: "Ratification Ledger",
      route: "founding",
      summary:
        "Build a ratification ledger weighing the Articles of Confederation's failures, the Constitutional Convention's compromises, and the Federalist–Anti-Federalist debate that produced the Bill of Rights.",
    },
  ],
};

export const CASE_007_LANES = [
  { id: "empire-and-frontier", label: "Empire & frontier" },
  { id: "protest-and-rhetoric", label: "Protest & rhetoric" },
  { id: "revolution-and-its-promises", label: "Revolution & its promises" },
];

export const CASE_007_SOURCES = [
  {
    id: "commoncause-pontiac-speech",
    type: "Primary source · council speech",
    title: "Speech at a Council near Detroit",
    creator: "Pontiac (Odawa)",
    date: "1763",
    record: "Recorded speech from an Indigenous council opposing British expansion, Ohio Country/Great Lakes",
    visual: "context",
    activityRoute: null,
    excerpt:
      "This land, where you live, I have made for you and not for others. Whence comes it that you permit the Whites upon our lands? My children, you have forgotten the customs and traditions of your former fathers when you had commerce with our French brothers. Since the English have come among us, look now, my children, whether you can find that plenty of skins which formerly you had. You see well that we can no longer supply our wants, as we have done from our brothers, the French. The Master of Life has ordered me to drive from your lands those dogs in red clothing who will do you nothing but harm. Now, therefore, you must lift the hatchet against them, and never bury it until they are driven out of this country, or any Frenchman who sides with them. There let them remain.",
    prompt:
      "What does Pontiac's speech reveal about why the end of the Seven Years' War made conflict with Britain, rather than peace, more likely on the frontier — and what should a Chronicler weigh in trusting its exact wording?",
    feedback:
      "Institute Context: after France ceded its claims in 1763, British forts, traders, and settlers pushed onto lands recently guaranteed to Indigenous nations, provoking a broad, multi-nation uprising historians call Pontiac's Rebellion — resistance that ended in continued negotiation over the land rather than full control by any one side. No transcript survives in Pontiac's own language (Ottawa); this English rendering descends from a contemporary French-recorded council account, later widely translated and reprinted — a reminder that even a source built from an eyewitness record has passed through layers of translation and editing before it reaches a Chronicler's hands.",
    citation:
      "Speech attributed to Pontiac at a council near Detroit, April 1763, as recorded in a contemporary French-language journal of the siege (the so-called \"Pontiac Manuscript\"); English rendering as widely reprinted in Francis Parkman, The Conspiracy of Pontiac and the Indian War after the Conquest of Canada, vol. I (Boston: Little, Brown, 1851), and in Colin G. Calloway, ed., The World Turned Upside Down: Indian Voices from Early America (Boston: Bedford/St. Martin's, 1994); no verbatim transcript in Pontiac's own words survives.",
    externalUrl: "https://www.britannica.com/event/Pontiacs-War",
    reconstruction: "empire-and-frontier",
  },
  {
    id: "commoncause-dickinson-letter",
    type: "Primary source · newspaper essay",
    title: "Letters from a Farmer in Pennsylvania, Letter II",
    creator: "John Dickinson",
    date: "December 10, 1767",
    record: "Serialized newspaper essay opposing the Townshend Revenue Act",
    visual: "context",
    activityRoute: null,
    // Investigation Challenge (Phase A of the Investigation/Archive Challenge
    // plan's catalog-expansion pass) — gates this source's sourceReader()
    // worksheet behind a pre-reveal prediction quest
    // (UNIT_03_INVESTIGATION_MCQ_QUESTS).
    investigationMode: "mcq",
    investigationQuestId: "case-007-investigation-mcq-dickinson-persona",
    excerpt:
      "My dear Countrymen, There is another late act of Parliament, which appears to me to be unconstitutional, and as destructive to the liberty of these colonies, as that mentioned in my last letter; that is, the act for granting the duties on paper, glass, and other articles imported into these colonies… The parliament unquestionably possesses a legal authority to regulate the trade of Great Britain and all her colonies. Such a power is essential to the relation between a mother country and her colonies… But here I apprehend the parliament has exceeded the bounds of that authority… If you once admit, that Great Britain may lay duties upon her exportations to us, for the purpose of levying money on us only, she will then have nothing to do, but to lay those duties on the articles which she prohibits us to manufacture — and the tragedy of American liberty is finished.",
    prompt:
      "Dickinson concedes that Parliament may regulate colonial trade, yet argues it may not tax colonists 'for the purpose of levying money.' Why does drawing this exact line matter to his argument, and to whom is he most trying to prove it?",
    feedback:
      "Institute Context: Dickinson wrote as \"A Farmer,\" publishing twelve letters in colonial newspapers from December 1767 into 1768 opposing the Townshend Acts' duties on imported paper, glass, tea, and other goods. Rather than deny Parliament's authority outright, Letter II drew a careful distinction between trade regulation (which Dickinson accepted) and revenue-raising taxation (which he denied Parliament's right to impose without colonial consent) — an argument aimed at persuading moderate colonists and sympathetic Britons alike, not just committed radicals.",
    citation:
      "John Dickinson, \"Letters from a Farmer in Pennsylvania to the Inhabitants of the British Colonies, Letter II,\" Pennsylvania Chronicle, December 10, 1767; reprinted in The Writings of John Dickinson, ed. Paul Leicester Ford, vol. I (Philadelphia: Historical Society of Pennsylvania, 1895).",
    externalUrl: "https://avalon.law.yale.edu/subject_menus/18th.asp",
    reconstruction: "protest-and-rhetoric",
  },
  {
    id: "commoncause-henry-speech",
    type: "Primary source · speech",
    title: "Give Me Liberty, or Give Me Death",
    creator: "Patrick Henry",
    date: "March 23, 1775",
    record: "Speech to the Second Virginia Convention, Richmond, urging Virginia arm its militia",
    visual: "context",
    activityRoute: null,
    excerpt:
      "It is in vain, sir, to extenuate the matter. Gentlemen may cry, Peace, Peace — but there is no peace. The war is actually begun! The next gale that sweeps from the north will bring to our ears the clash of resounding arms! Our brethren are already in the field! Why stand we here idle? What is it that gentlemen wish? What would they have? Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!",
    prompt:
      "This exact wording comes not from a transcript made in 1775, but from a biography of Henry published more than forty years later, reconstructed from the memories of men who claimed to have been present. How should that fact shape how a Chronicler uses this source as evidence of what Henry actually said?",
    feedback:
      "Institute Context: no contemporary transcript of Henry's March 1775 speech to the Second Virginia Convention survives. This now-famous wording was reconstructed by biographer William Wirt in Sketches of the Life and Character of Patrick Henry (1817), decades after the fact, from the recollections of elderly witnesses including St. George Tucker. That doesn't mean the speech is fabricated — contemporaries agreed Henry moved the Convention to authorize arming Virginia's militia — but it does mean a Chronicler should treat the precise wording as a memory-based reconstruction, not a verbatim record, when weighing how much interpretive weight any single phrase can bear.",
    citation:
      "William Wirt, Sketches of the Life and Character of Patrick Henry (Philadelphia: James Webster, 1817), reconstructing Patrick Henry's speech to the Second Virginia Convention, St. John's Church, Richmond, Virginia, March 23, 1775, from witness recollections.",
    externalUrl: "https://www.americanrhetoric.com/speeches/patrickhenrygivemeliberty.html",
    reconstruction: "protest-and-rhetoric",
  },
  {
    id: "commoncause-wheatley-poem",
    type: "Primary source · poem",
    title: "On the Death of Reverend Mr. George Whitefield, 1770",
    creator: "Phillis Wheatley",
    date: "1773 (composed 1770)",
    record: "Elegy for evangelist George Whitefield, published in Wheatley's Poems on Various Subjects, Religious and Moral (London, 1773)",
    visual: "context",
    activityRoute: null,
    excerpt:
      "Great Countess, we Americans revere / Thy name, and mingle in thy grief sincere; … Take him, ye Africans, he longs for you; / Impartial Saviour is his title due; / Wash'd in the fountain of redeeming blood, / You shall be sons, and kings, and priests to God.",
    prompt:
      "Wheatley singles out an American audience for a direct appeal — 'Take him, ye Africans, he longs for you.' Why might this specific line matter more, coming from Wheatley, than from any other elegist mourning Whitefield in 1770?",
    feedback:
      "Institute Context: Phillis Wheatley, enslaved in Boston since childhood, wrote this elegy for the celebrated evangelist George Whitefield in 1770 and published it in her 1773 London collection — printed in London rather than Boston specifically because Boston publishers doubted an enslaved Black woman could have authored it; a panel of Boston notables, including John Hancock, had to attest to her authorship before the book appeared. Her direct address inserting African readers into Whitefield's promise of salvation used the religious language of the era's revivals to make a claim about spiritual equality that her own enslaved status directly contradicted.",
    citation:
      "Phillis Wheatley, \"On the Death of Reverend Mr. George Whitefield, — 1770,\" in Poems on Various Subjects, Religious and Moral (London: A. Bell, 1773), pp. 22–24.",
    externalUrl: "https://docsouth.unc.edu/neh/wheatley/wheatley.html",
    reconstruction: "revolution-and-its-promises",
  },
  {
    id: "commoncause-dunmore-proclamation",
    type: "Primary source · royal proclamation",
    title: "Lord Dunmore's Proclamation",
    creator: "John Murray, Earl of Dunmore, Royal Governor of Virginia",
    date: "November 7, 1775 (printed December 6, 1775)",
    record: "Martial-law proclamation offering freedom to enslaved people who left Patriot enslavers to join British forces",
    visual: "context",
    activityRoute: null,
    // Investigation Challenge pilot (Phase 3 of the Investigation/Archive
    // Challenge plan) — gates this source's sourceReader() worksheet behind a
    // pre-reveal Source Prediction quest (UNIT_03_INVESTIGATION_QUESTS).
    investigationMode: "hipp",
    investigationQuestId: "case-007-investigation-dunmore-proclamation",
    excerpt:
      "I do require every person capable of bearing arms, to resort to his Majesty's STANDARD, or be looked upon as traitors… and I do hereby further declare all indentured servants, Negroes, or others, (appertaining to Rebels,) free that are able and willing to bear arms, they joining His Majesty's Troops as soon as may be, for the more speedily reducing this Colony to a proper sense of their duty, to His Majesty's crown and dignity.",
    prompt:
      "Dunmore offered freedom only to enslaved people held by Patriot enslavers who were 'able and willing to bear arms' for the King — not to enslaved people generally, and not to any held by Loyalists. What does that specific wording suggest about Dunmore's purpose in issuing it?",
    feedback:
      "Institute Context: Dunmore issued this proclamation from a British warship off Norfolk after Patriot militia had already driven him from Virginia's government. Its offer of freedom was a wartime strategy to cripple the rebellion's labor force and raise a Loyalist force, not an antislavery measure — it exempted enslaved people held by Loyalists entirely. When word spread a month later after full reprinting, it disturbed and radicalized many wavering Patriot slaveholders, and an estimated several thousand enslaved people risked the crossing to British lines over the course of the war.",
    citation:
      "John Murray, Earl of Dunmore, proclamation, November 7, 1775, printed in the Pennsylvania Journal and Weekly Advertiser, December 6, 1775.",
    externalUrl: "https://www.battlefields.org/learn/primary-sources/lord-dunmores-proclamation-1775",
    reconstruction: "revolution-and-its-promises",
  },
  {
    id: "commoncause-hall-petition",
    type: "Primary source · petition",
    title: "Petition for Freedom to the Massachusetts Council and the House of Representatives",
    creator: "Prince Hall and seven other enslaved petitioners",
    date: "January 13, 1777",
    record: "Petition to the Massachusetts legislature arguing enslaved Black Bostonians' natural right to freedom",
    visual: "context",
    activityRoute: null,
    excerpt:
      "The petition of a great number of blacks detained in a state of slavery in the bowels of a free and Christian country humbly showing that your petitioners apprehend that they have in common with all other men a natural and unalienable right to that freedom which the great Parent of the universe hath bestowed equally on all mankind, and which they have never forfeited by any compact or agreement whatever … your petitioners have long and patiently waited the event of petition after petition … but cannot but with grief reflect that their success has been but too similar to the success of former petitions.",
    prompt:
      "Hall and his fellow petitioners invoke the same natural-rights language Patriots were using against Britain to argue for their own freedom instead. Why might 1777 Massachusetts have been a moment when that argument seemed newly persuasive — and why might it still have been ignored?",
    feedback:
      "Institute Context: Prince Hall and seven other enslaved Boston men petitioned the Massachusetts legislature in January 1777, directly echoing Revolutionary natural-rights and Christian-equality arguments to claim their own freedom — reasoning nearly identical to the Declaration of Independence's language adopted only months earlier. The legislature did not act on the petition, though Massachusetts courts effectively ended slavery there within a decade through separate rulings; the petition stands as evidence that Black Bostonians recognized and used revolutionary rhetoric as a tool long before white Patriots' own institutions caught up to its implications.",
    citation:
      "Prince Hall et al., \"Petition for freedom to the Massachusetts Council and the House of Representatives,\" January 13, 1777, Massachusetts Archives.",
    externalUrl: "https://www.masshist.org/",
    reconstruction: "revolution-and-its-promises",
  },
  {
    id: "commoncause-adams-letter",
    type: "Primary source · letter",
    title: "Letter to John Adams, \"Remember the Ladies\"",
    creator: "Abigail Adams",
    date: "March 31 – April 5, 1776",
    record: "Personal letter urging expanded legal rights for women be written into new American law",
    visual: "letter",
    activityRoute: null,
    excerpt:
      "I long to hear that you have declared an independancy—and by the way in the new Code of Laws which I suppose it will be necessary for you to make I desire you would Remember the Ladies, and be more generous and favourable to them than your ancestors. Do not put such unlimited power into the hands of the Husbands. Remember all Men would be tyrants if they could. If particular care and attention is not paid to the Laidies we are determined to foment a Rebellion, and will not hold ourselves bound by any Laws in which we have no voice, or Representation.",
    prompt:
      "Abigail Adams wrote this privately to her husband, a delegate then helping draft the case for independence — not as a public petition. How does writing to someone with actual influence over the 'new Code of Laws' shape the argument she makes?",
    feedback:
      "Institute Context: Abigail Adams wrote this letter while John Adams sat in the Continental Congress weighing independence, urging him to \"remember the ladies\" in whatever new laws followed and warning that women would \"foment a Rebellion\" of their own against laws made without their voice. John's reply treated the request as a joke rather than a serious proposal — a private appeal to a husband with real influence went unanswered in law, even as its natural-rights logic (no binding laws without consent or representation) was identical to the argument colonists were making against Britain.",
    citation:
      "Abigail Adams to John Adams, 31 March – 5 April 1776, Adams Family Papers, Massachusetts Historical Society.",
    externalUrl: "https://founders.archives.gov/documents/Adams/04-01-02-0241",
    reconstruction: "revolution-and-its-promises",
  },
];

// Case-008 ("The Founding Debate," 1783–1789) ledger records — structural
// mirror of unit-01-campaign.js's EXCHANGE_RECORDS / Case 1.02. Each record
// pairs one real, cited primary source excerpt with a single MCQ; there is no
// drag-and-drop or field exploration for this case. Covers the Founding
// Era's central debate: the Articles of Confederation's weaknesses, the
// Constitutional Convention's compromises, the Federalist/Anti-Federalist
// ratification fight, and the Bill of Rights it produced. Records 1 and 2
// are a deliberate contrasting pair — Federalist No. 10 and Brutus No. I
// arguing opposite conclusions about the same question: how much power a
// large, diverse republic can safely hold.
export const FOUNDING_RECORDS = [
  {
    id: "founding-federalist-10",
    label: "Federalist Argument",
    icon: "📜",
    sourceTitle: "Federalist No. 10",
    sourceMeta: "James Madison, writing as \"Publius\" · The Daily Advertiser (New York) · November 22, 1787",
    excerpt:
      "By a faction, I understand a number of citizens, whether amounting to a majority or a minority of the whole, who are united and actuated by some common impulse of passion, or of interest, adverse to the rights of other citizens, or to the permanent and aggregate interests of the community… Extend the sphere, and you take in a greater variety of parties and interests; you make it less probable that a majority of the whole will have a common motive to invade the rights of other citizens.",
    sourceNote:
      "Madison wrote as \"Publius,\" one of three authors (with Hamilton and Jay) of a newspaper essay series aimed at persuading New York's ratifying convention. Federalist No. 10 argued that a large, diverse republic — not a small one, as many republican theorists of the time assumed — was the strongest defense against the dangers of factional majorities.",
    question:
      "According to Madison's argument in this excerpt, why would an extensive republic like the one proposed by the Constitution better control the dangers of faction than a small one?",
    choices: [
      "A large republic would contain so many competing interests that no single faction could easily form a tyrannical majority.",
      "A large republic could ban political parties entirely once ratified.",
      "A large republic would need a monarch to prevent factions from forming.",
      "A large republic would eliminate the causes of faction by guaranteeing economic equality.",
    ],
    answer: 0,
    citation:
      "James Madison, \"The Union as a Safeguard Against Domestic Faction and Insurrection\" [Federalist No. 10], The Daily Advertiser (New York), November 22, 1787; reprinted in The Federalist, ed. Jacob E. Cooke (Middletown, CT: Wesleyan University Press, 1961).",
  },
  {
    id: "founding-brutus-1",
    label: "Anti-Federalist Argument",
    icon: "🛡",
    sourceTitle: "Brutus, No. I",
    sourceMeta: "Written under the pseudonym \"Brutus,\" traditionally attributed to Robert Yates · New York Journal · October 18, 1787",
    excerpt:
      "In a republic, the manners, sentiments, and interests of the people should be similar. If this be not the case, there will be a constant clashing of opinions; and the representatives of one part will be continually striving against those of the other. This will retard the operations of government, and prevent such conclusions as will promote the public good.",
    sourceNote:
      "\"Brutus\" was among the most widely reprinted Anti-Federalist essayists, publishing in New York newspapers to oppose ratification. This essay argued directly against the position Madison would make in Federalist No. 10, warning that a republic spread over as vast a territory as the United States could not stay unified enough to govern well or protect liberty.",
    question:
      "Brutus's argument in this excerpt most directly opposes which claim later made by James Madison in Federalist No. 10?",
    choices: [
      "That a large, diverse republic would better guard against the dangers of factional majorities than a small one.",
      "That the Constitution should be ratified only after adding a bill of rights.",
      "That the Senate should represent states equally regardless of population.",
      "That Congress should have the exclusive power to declare war.",
    ],
    answer: 0,
    citation:
      "\"Brutus,\" No. I, New York Journal, October 18, 1787; traditionally attributed to Robert Yates, though authorship is debated among historians; reprinted in The Complete Anti-Federalist, ed. Herbert J. Storing (Chicago: University of Chicago Press, 1981), vol. 2.",
  },
  {
    id: "founding-connecticut-compromise",
    label: "Convention Debate",
    icon: "⚖",
    sourceTitle: "Notes of Debates in the Federal Convention",
    sourceMeta: "Recorded by James Madison during the Convention's closed-door proceedings · June 11, 1787",
    excerpt:
      "Mr. Sherman proposed that the proportion of suffrage in the 1st. branch should be according to the respective numbers of free inhabitants; and that in the 2d. branch or Senate, each State should have one vote and no more.",
    sourceNote:
      "The Constitutional Convention met in secrecy and kept no official transcript; Madison's private notes, recording speeches in his own summarized third-person wording rather than verbatim quotation, are historians' fullest surviving record of the debates. Roger Sherman's proposal here — proportional representation in one house, equal state representation in the other — became the basis of the Connecticut (Great) Compromise that broke the Convention's deadlock between large and small states in July 1787.",
    question:
      "The proposal recorded here, later adopted as the Great Compromise, resolved which central dispute at the Constitutional Convention?",
    choices: [
      "Whether the new Congress should have one legislative house or two.",
      "Whether representation in Congress should favor large states, small states, or both.",
      "Whether the president should be elected directly by voters.",
      "Whether slavery should be abolished immediately under the new Constitution.",
    ],
    answer: 1,
    citation:
      "James Madison, Notes of Debates in the Federal Convention of 1787, entry for June 11, 1787; published as The Records of the Federal Convention of 1787, ed. Max Farrand (New Haven: Yale University Press, 1911), vol. 1.",
  },
  {
    id: "founding-mason-bill-of-rights",
    label: "Bill of Rights Origin",
    icon: "📋",
    sourceTitle: "Objections to This Constitution of Government",
    sourceMeta: "George Mason, Constitutional Convention delegate who refused to sign · 1787",
    excerpt:
      "There is no Declaration of Rights, and the laws of the general government being paramount to the laws and constitution of the several States, the Declaration of Rights in the separate States are no security.",
    sourceNote:
      "Mason helped draft Virginia's 1776 Declaration of Rights but refused to sign the finished Constitution in 1787, chiefly over its lack of a federal bill of rights. His widely circulated Objections became a rallying document for Anti-Federalists during ratification and helped force the compromise that produced the Bill of Rights: several states ratified only after Federalists promised to support amendments in the First Congress.",
    question: "Mason's objection, and its wide circulation during ratification, most directly contributed to which outcome?",
    choices: [
      "Several states ratifying the Constitution only after Federalists promised to support a bill of rights in the First Congress.",
      "The immediate rejection of the Constitution by the Philadelphia Convention.",
      "The permanent removal of the amendment process from the Constitution.",
      "Congress abolishing the Senate in response to Anti-Federalist pressure.",
    ],
    answer: 0,
    citation:
      "George Mason, \"Objections to This Constitution of Government,\" 1787; reprinted in The Papers of George Mason, 1725–1792, ed. Robert A. Rutland (Chapel Hill: University of North Carolina Press, 1970), vol. 3.",
  },
];
