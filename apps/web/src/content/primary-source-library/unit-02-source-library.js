/**
 * Primary source reference library — Unit 2 / Period 2, 1607-1754.
 * Colonial development, labor systems, religion, and Atlantic society.
 * See docs/content-guide/primary-source-library.md for how this reference
 * layer differs from the live gameplay Source records in
 * apps/web/src/content/unit-02-campaign.js.
 */

export const UNIT_02_SOURCE_LIBRARY_META = {
  unit: 2,
  period: "Period 2",
  years: "1607-1754",
  label: "Colonial development, labor systems, religion, and Atlantic society",
  testableComparisons: [
    "Chesapeake vs. New England",
    "Winthrop vs. Williams or Hutchinson",
    "Indentured servitude vs. racial slavery",
    "Edwards or Whitefield vs. established clergy",
  ],
};

export const UNIT_02_SOURCES = [
  {
    id: "u02-winthrop-model-of-christian-charity",
    unit: 2,
    priority: "essential",
    topPriorityRank: 3,
    title: "A Model of Christian Charity",
    creator: "John Winthrop",
    date: "1630",
    apushUse: "Puritan society, covenant theology, the 'city upon a hill'",
    excerpt:
      "Delivered aboard ship (traditionally, en route to Massachusetts Bay), Winthrop describes the Puritan colony as bound by a covenant with God, obligated to charity and mutual obligation, and destined to be watched by the world as 'a city upon a hill.'",
    citation: 'John Winthrop, "A Model of Christian Charity," 1630.',
    externalUrl: null,
  },
  {
    id: "u02-mayflower-compact",
    unit: 2,
    priority: "essential",
    topPriorityRank: 4,
    title: "Mayflower Compact",
    creator: "Plymouth colonists (Pilgrims)",
    date: "1620",
    apushUse: "Self-government and consent of the governed",
    excerpt:
      'Signed by 41 male passengers before landing, the compact establishes a "civil body politic" and commits signers to enact "just and equal laws" for the colony\'s general good, an early example of colonists agreeing to govern themselves by consent.',
    citation: "Mayflower Compact, signed aboard the Mayflower at Cape Cod, November 11, 1620.",
    externalUrl: "https://avalon.law.yale.edu/17th_century/mayflower.asp",
  },
  {
    id: "u02-virginia-house-of-burgesses",
    unit: 2,
    priority: "essential",
    topPriorityRank: null,
    title: "Virginia House of Burgesses records or laws",
    creator: "Virginia House of Burgesses",
    date: "after 1619",
    apushUse: "Representative government and planter power",
    excerpt:
      "The first elected legislative assembly in English North America, convened at Jamestown in 1619, whose surviving records and statutes show property-holding male colonists exercising a limited form of self-government under the Virginia Company and later the crown.",
    citation: "Journals and statutes of the Virginia House of Burgesses, beginning 1619.",
    externalUrl: null,
  },
  {
    id: "u02-fundamental-orders-of-connecticut",
    unit: 2,
    priority: "essential",
    topPriorityRank: null,
    title: "Fundamental Orders of Connecticut",
    creator: "Connecticut River towns (Hartford, Windsor, Wethersfield)",
    date: "1639",
    apushUse: "Colonial self-government",
    excerpt:
      "Often cited as an early written constitution, the Orders establish a general assembly and elected governor for the Connecticut colony, extending voting rights to men beyond the Puritan church membership required in Massachusetts Bay.",
    citation: "Fundamental Orders of Connecticut, adopted January 1639.",
    externalUrl: "https://avalon.law.yale.edu/17th_century/order.asp",
  },
  {
    id: "u02-maryland-toleration-act",
    unit: 2,
    priority: "essential",
    topPriorityRank: null,
    title: "Maryland Toleration Act",
    creator: "Maryland General Assembly",
    date: "1649",
    apushUse: "Religious toleration and its limits",
    excerpt:
      "Passed to protect Maryland's Catholic minority from its Protestant majority, the act guarantees free exercise of religion to all who believe in Jesus Christ, while imposing the death penalty for denying the Trinity — toleration among Christians, not full religious liberty.",
    citation: "Maryland Toleration Act (An Act Concerning Religion), 1649.",
    externalUrl: "https://avalon.law.yale.edu/17th_century/maryland_toleration.asp",
  },
  {
    id: "u02-navigation-acts",
    unit: 2,
    priority: "essential",
    topPriorityRank: 8,
    title: "Navigation Acts",
    creator: "English Parliament",
    date: "1651-1696",
    apushUse: "Mercantilism and imperial regulation",
    excerpt:
      'A series of laws requiring colonial trade to move on English (or colonial) ships and route key "enumerated" goods like tobacco and sugar through England, embodying a mercantilist system that colonists periodically evaded through smuggling.',
    citation: "Navigation Acts, English Parliament, 1651-1696.",
    externalUrl: null,
  },
  {
    id: "u02-virginia-slave-codes",
    unit: 2,
    priority: "essential",
    topPriorityRank: 5,
    title: "Virginia Slave Codes",
    creator: "Virginia General Assembly",
    date: "1660s-1705",
    apushUse: "Development of racialized, hereditary slavery",
    excerpt:
      "A series of statutes progressively defining enslaved status as lifelong, hereditary through the mother, and tied specifically to people of African descent, while restricting enslaved people's movement, assembly, and legal standing.",
    citation:
      "Virginia General Assembly statutes on slavery, especially the 1662 hereditary-status act and the 1705 Virginia Slave Code.",
    externalUrl: null,
  },
  {
    id: "u02-bacon-declaration-of-the-people",
    unit: 2,
    priority: "essential",
    topPriorityRank: 6,
    title: "Declaration of the People",
    creator: "Nathaniel Bacon",
    date: "1676",
    apushUse: "Class conflict, frontier tensions, and Native policy",
    excerpt:
      "Bacon accuses Governor William Berkeley of favoritism toward wealthy allies, failure to defend frontier settlers against Native raids, and corrupt monopolization of the fur trade, justifying his own armed rebellion (Bacon's Rebellion) against colonial authority.",
    citation:
      'Nathaniel Bacon, "Declaration of the People," 1676, issued during Bacon\'s Rebellion in Virginia.',
    externalUrl: null,
  },
  {
    id: "u02-edwards-sinners-in-the-hands-of-an-angry-god",
    unit: 2,
    priority: "essential",
    topPriorityRank: 7,
    title: "Sinners in the Hands of an Angry God",
    creator: "Jonathan Edwards",
    date: "1741",
    apushUse: "The First Great Awakening",
    excerpt:
      'A landmark revival sermon warning that unconverted sinners are held over hell "as one holds a spider... over the fire" by nothing but God\'s mercy, urging immediate conversion — emblematic of the emotional, individual-conscience style of the First Great Awakening.',
    citation:
      'Jonathan Edwards, "Sinners in the Hands of an Angry God," sermon delivered at Enfield, Connecticut, July 8, 1741.',
    externalUrl: null,
  },
  {
    id: "u02-penn-frame-of-government",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Frame of Government / promotional writings",
    creator: "William Penn",
    date: "1682",
    apushUse: "Quakerism and the founding of Pennsylvania",
    excerpt:
      'Penn\'s founding charter for Pennsylvania guarantees an elected assembly, broad religious liberty, and fair treatment of Native peoples, reflecting Quaker beliefs in pacifism, equality of conscience, and "holy experiment" self-government.',
    citation: "William Penn, Frame of Government of Pennsylvania, 1682.",
    externalUrl: "https://avalon.law.yale.edu/17th_century/pa04.asp",
  },
  {
    id: "u02-hutchinson-trial-transcript",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Trial transcript",
    creator: "Anne Hutchinson (defendant); Massachusetts Bay magistrates",
    date: "1637",
    apushUse: "Gender, religious dissent, and Puritan authority",
    excerpt:
      "Tried before the Massachusetts Bay General Court for holding unauthorized religious meetings and challenging clergy authority (the Antinomian Controversy), Hutchinson defends her direct revelation from God before being convicted and banished.",
    citation: "Trial of Anne Hutchinson before the Massachusetts Bay General Court, November 1637.",
    externalUrl: null,
  },
  {
    id: "u02-roger-williams-religious-liberty",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Writings on religious liberty",
    creator: "Roger Williams",
    date: "1640s-1650s",
    apushUse: "Separation of church and civil government",
    excerpt:
      'Banished from Massachusetts Bay and founder of Rhode Island, Williams argued for a "wall of separation" between civil government and religious conscience, opposing any state-enforced religion as corrupting to both faith and government.',
    citation: "Roger Williams, writings including The Bloudy Tenent of Persecution, 1644.",
    externalUrl: null,
  },
  {
    id: "u02-john-smith-jamestown-accounts",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Accounts of Jamestown",
    creator: "John Smith",
    date: "1608-1624",
    apushUse: "Chesapeake settlement and labor",
    excerpt:
      "Smith's writings describe Jamestown's early struggles with starvation and disease, his imposed work discipline (\"he that will not work shall not eat\"), and encounters with Powhatan's confederacy, promoting continued English investment in Virginia.",
    citation: "John Smith, A True Relation (1608) and The Generall Historie of Virginia (1624).",
    externalUrl: null,
  },
  {
    id: "u02-indentured-servant-contracts",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Indentured servant contracts",
    creator: "Colonial merchants, ship captains, and servants",
    date: "1600s",
    apushUse: "Colonial labor systems",
    excerpt:
      'Standard contracts bound a servant, often a poor English migrant, to a fixed term of unpaid labor (commonly four to seven years) in exchange for passage to the colonies, in return for "freedom dues" of land, tools, or clothing at the term\'s end.',
    citation:
      "Colonial indentured-servant contracts, 17th century, surviving in Virginia and Maryland court and shipping records.",
    externalUrl: null,
  },
  {
    id: "u02-salem-witch-trial-testimony",
    unit: 2,
    priority: "very_common",
    topPriorityRank: null,
    title: "Salem witch-trial testimony",
    creator: "Accusers, accused, and magistrates of Salem, Massachusetts",
    date: "1692",
    apushUse: "Gender, community conflict, and religious authority",
    excerpt:
      'Court records from the Salem witchcraft crisis record accusations (heavily reliant on "spectral evidence") against roughly 200 people, disproportionately women, resulting in 19 executions before the trials were halted and later widely repudiated.',
    citation: "Records of the Court of Oyer and Terminer, Salem witch trials, 1692.",
    externalUrl: null,
  },
  {
    id: "u02-whitefield-sermons",
    unit: 2,
    priority: "useful",
    topPriorityRank: null,
    title: "Sermons or accounts",
    creator: "George Whitefield",
    date: "1730s-1740s",
    apushUse: "The Great Awakening and intercolonial culture",
    excerpt:
      "An itinerant English preacher whose emotionally charged open-air sermons drew enormous, socially mixed crowds across the colonies, helping create a shared intercolonial religious culture independent of established local clergy.",
    citation:
      "George Whitefield, published sermons and journals of his American preaching tours, 1730s-1740s.",
    externalUrl: null,
  },
  {
    id: "u02-zenger-trial-materials",
    unit: 2,
    priority: "useful",
    topPriorityRank: null,
    title: "Trial materials",
    creator: "John Peter Zenger (defendant); Andrew Hamilton (defense counsel)",
    date: "1735",
    apushUse: "Freedom of the press and colonial resistance",
    excerpt:
      "Charged with seditious libel for printing criticism of New York's royal governor, Zenger was acquitted after his lawyer argued truth should be a defense against libel — an early and widely cited precedent for freedom of the press in the colonies.",
    citation:
      "A Brief Narrative of the Case and Tryal of John Peter Zenger, 1736 (trial held 1735).",
    externalUrl: null,
  },
  {
    id: "u02-treaty-of-lancaster",
    unit: 2,
    priority: "useful",
    topPriorityRank: null,
    title: "Treaty of Lancaster (Covenant Chain documents)",
    creator:
      "Colonial representatives of Virginia, Maryland, Pennsylvania and Haudenosaunee (Iroquois) leaders",
    date: "1744",
    apushUse: "British-Native diplomacy",
    excerpt:
      'Negotiated at Lancaster, Pennsylvania, the treaty settled colonial-Iroquois land disputes and renewed the "Covenant Chain" alliance, with the Haudenosaunee ceding claims to lands in the Shenandoah Valley in exchange for goods and continued diplomatic recognition.',
    citation:
      "Treaty of Lancaster, June 1744, negotiated among Virginia, Maryland, Pennsylvania, and the Six Nations (Haudenosaunee).",
    externalUrl: null,
  },
];

export const UNIT_02_VISUAL_SOURCES = [
  {
    id: "u02-visual-colonial-settlement-maps",
    unit: 2,
    title: "Colonial settlement maps",
    description:
      "Maps showing the pattern of English colonial settlement along the Atlantic seaboard by region (Chesapeake, New England, Middle Colonies, Lower South), used to illustrate differing geography, labor systems, and religious founding purposes.",
    citation: "Standard AP U.S. History textbook regional settlement maps.",
    externalUrl: null,
  },
  {
    id: "u02-visual-atlantic-trade-maps",
    unit: 2,
    title: "Atlantic trade maps",
    description:
      "Maps depicting transatlantic shipping routes connecting Britain, West Africa, the Caribbean, and mainland colonies, used to illustrate mercantilism and the broader Atlantic economy that the Navigation Acts sought to regulate.",
    citation: "Standard AP U.S. History textbook Atlantic-trade route maps.",
    externalUrl: null,
  },
  {
    id: "u02-visual-great-awakening-images",
    unit: 2,
    title: "Great Awakening images",
    description:
      "Contemporary engravings and later illustrations of open-air revival preaching (e.g. George Whitefield addressing large outdoor crowds), used to illustrate the emotional, mass-participation character of the First Great Awakening.",
    citation: "Contemporary 18th-century engravings depicting Great Awakening revival preaching.",
    externalUrl: null,
  },
  {
    id: "u02-visual-salem-trial-records",
    unit: 2,
    title: "Salem trial records",
    description:
      "Facsimiles of surviving 1692 Salem court documents (depositions, warrants, indictments), used to illustrate how spectral and circumstantial evidence was recorded and used in the witchcraft prosecutions.",
    citation:
      'Massachusetts State Archives / University of Virginia\'s "Salem Witch Trials Documentary Archive" collection.',
    externalUrl: null,
  },
];
