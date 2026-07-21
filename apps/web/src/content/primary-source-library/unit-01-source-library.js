/**
 * Primary source reference library — Unit 1 / Period 1, 1491-1607.
 * Indigenous societies before European contact and the beginnings of
 * European colonization. See docs/content-guide/primary-source-library.md
 * for how this reference layer differs from the live gameplay Source
 * records in apps/web/src/content/unit-01-campaign.js.
 */

export const UNIT_01_SOURCE_LIBRARY_META = {
  unit: 1,
  period: "Period 1",
  years: "1491-1607",
  label: "Indigenous societies before European contact and the beginnings of European colonization",
  testableComparisons: [
    "Las Casas vs. Sepúlveda: natural rights and the legitimacy of conquest",
    "Columbus vs. Indigenous accounts: competing perspectives on first contact",
    "Spanish vs. English colonization motives",
  ],
};

export const UNIT_01_SOURCES = [
  {
    id: "u01-columbus-first-voyage-letter",
    unit: 1,
    priority: "essential",
    topPriorityRank: 1,
    title: "Letter announcing the first voyage",
    creator: "Christopher Columbus",
    date: "1492-1493",
    apushUse: "European motives, first contact, misunderstanding of Native societies",
    excerpt:
      "Writing to his Spanish patrons after landfall in the Caribbean, Columbus describes the islands as fertile and their inhabitants as unarmed, generous, and easily converted or put to use — framing the voyage as both a religious triumph and a commercial opportunity for the Crown.",
    citation:
      "Christopher Columbus, letter to Luis de Santángel (and a related letter to Rafael Sánchez), 1493, announcing the results of the first voyage; widely reprinted in English translation.",
    externalUrl:
      "https://www.loc.gov/collections/discovery-and-exploration/articles-and-essays/christopher-columbus/",
    fullText: `Since I know that you will be pleased by the great victory which Our Lord has given me on my voyage, I am writing you this letter, from which you will learn how in twenty days I crossed to the Indies with the fleet which the King and Queen, our most illustrious sovereigns, gave me. I found there very many islands inhabited by people without number, and I have taken possession of them all on behalf of Their Highnesses by proclamation and by unfurling the royal standard, and I was not contradicted.

To the first island I found I gave the name San Salvador in memory of His High Majesty who miraculously has given all this; the Indians call it Guanahaní. To the second I gave the name the island of Santa María de Concepción; to the third, Fernandina; to the fourth, Isabela; to the fifth, the island of Juana, and so on, to each a new name.

All the people on this island and all the others I have found or have learned of go naked, men and women alike, just as their mothers bear them, although some women cover themselves in one place with a leaf from a plant or a cotton garment which they make for the purpose.

They have no iron or steel or weapons, nor are they that way inclined, not because they are not well built and of fine bearing, but because they are amazingly timid.`,
  },
  {
    id: "u01-las-casas-short-account",
    unit: 1,
    priority: "essential",
    topPriorityRank: 2,
    title: "A Short Account of the Destruction of the Indies",
    creator: "Bartolomé de las Casas",
    date: "1542 (published 1552)",
    apushUse: "Spanish brutality, the encomienda system, treatment of Indigenous peoples",
    excerpt:
      "A Dominican friar and former colonist argues that Spanish colonizers subjected the Taíno and other Indigenous peoples to forced labor, violence, and mass death driven chiefly by the pursuit of gold, and calls on the Spanish crown to end the abuses.",
    citation:
      "Bartolomé de las Casas, Brevísima relación de la destrucción de las Indias (A Short Account of the Destruction of the Indies), 1542, presented to Prince Philip of Spain; published 1552.",
    externalUrl: null,
    fullText: `It was upon these gentle lambs, imbued by the Creator with all the qualities we have mentioned, that from the very first day they clapped eyes on them the Spanish fell like ravening wolves upon the fold, or like tigers and savage lions who have not eaten meat for days. The pattern established at the outset has remained unchanged to this day, and the Spaniards still do nothing save tear the natives to shreds, murder them and inflict upon them untold misery, suffering and distress, tormenting, harrying and persecuting them mercilessly. We shall in due course describe some of the many ingenious methods of torture they have invented and refined for this purpose, but one can get some idea of the effectiveness of their methods from the figures alone. When the Spanish first journeyed there, the indigenous population of the island of Hispaniola stood at some three million; today only two hundred survive. The island of Cuba, which extends for a distance almost as great as that separating Valladolid from Rome, is now to all intents and purposes uninhabited; and two other large, beautiful and fertile islands, Puerto Rico and Jamaica, have been similarly devastated.`,
  },
  {
    id: "u01-sepulveda-arguments",
    unit: 1,
    priority: "essential",
    topPriorityRank: null,
    title: "Arguments concerning Indigenous peoples",
    creator: "Juan Ginés de Sepúlveda",
    date: "c. 1550",
    apushUse: "European racial and religious justifications for conquest",
    excerpt:
      "Sepúlveda argued at the Valladolid debate that Indigenous peoples were natural slaves under Aristotelian theory, that their societies practiced idolatry and human sacrifice, and that Spanish conquest and Christianization were therefore just.",
    citation:
      "Juan Ginés de Sepúlveda, arguments presented at the Valladolid debate against Bartolomé de las Casas, c. 1550-1551, on the legitimacy of war against and enslavement of Indigenous peoples.",
    externalUrl: null,
    fullText: `The Spaniards have a perfect right to rule these barbarians of the New World and the adjacent islands, who in prudence, skill, virtues, and humanity are as inferior to the Spanish as children to adults, or women to men, for there exists between the two as great a difference as between savage and cruel races and the most merciful, between the most intemperate and the moderate and temperate and, I might even say, between apes and men.

You surely do not expect me to recall at length the prudence and talents of the Spanish…. And what can I say of the gentleness and humanity of our people, who, even in battle, after having gained the victory, put forth their greatest effort and care to save the greatest possible number of the conquered and to protect them from the cruelty of their allies?`,
  },
  {
    id: "u01-requerimiento",
    unit: 1,
    priority: "very_common",
    topPriorityRank: null,
    title: "The Requerimiento",
    creator: "Crown of Castile (drafted by jurist Juan López de Palacios Rubios)",
    date: "1513",
    apushUse: "Spanish religious and legal justification for conquest",
    excerpt:
      "A formal proclamation, read aloud (often in Spanish, to people who could not understand it) before military action, demanding that Indigenous peoples accept the authority of the Catholic Church and the Spanish crown or face just war, enslavement, and dispossession.",
    citation:
      "The Requerimiento, 1513, issued by the Spanish crown for use by conquistadors before engaging Indigenous peoples in the Americas.",
    externalUrl: "https://faculty.chass.ncsu.edu/slatta/hi216/require.htm",
    fullText: `On behalf of the king and the queen, subjugators of barbarous peoples, we, their servants, notify and make known to you as best we are able, that God, Our Lord, living and eternal, created the heavens and the earth, and a man and a woman, of whom you and we and all other people of the world were, and are, the descendants. Because of the great numbers of people who have come from the union of these two in the five thousand year, which have run their course since the world was created, it became necessary that some should go in one direction and that others should go in another. Thus they became divided into many kingdoms and many provinces, since they could not all remain or sustain themselves in one place.

Of all these people God, Our Lord, chose one, who was called Saint Peter, to be the lord and the one who was to be superior to all the other people of the world, whom all should obey. He was to be the head of the entire human race, wherever men might exist. God gave him the world for his kingdom and jurisdiction. God also permitted him to be and establish himself in any other part of the world to judge and govern all peoples, whether Christian, Moors, Jew, Gentiles, or those of any other sects and beliefs that there might be. He was called the Pope. One of the past Popes who succeeded Saint Peter, as Lord of the Earth gave these islands and Mainland's of the Ocean Sea [the Atlantic Ocean] to the said King and Queen and to their successors, with everything that there is in them, as is set forth in certain documents which were drawn up regarding this donation in the manner described, which you may see if you so desire.

In consequence, Their Highnesses are Kings and Lords of these islands and mainland by virtue of said donation. Certain other isles and almost all [the native peoples] to whom this summons has been read have accepted Their Highnesses as such Kings and Lords, and have served, and serve, them as their subjects as they should, and must, do, with good will and without offering any resistance. You are constrained and obliged to do the same as they.

Consequently, as we best may, we beseech and demand that you understand fully this that we have said to you and ponder it, so that you may understand and deliberate upon it for a just and fair period, and that you accept the Church and Superior Organization of the whole world and recognize the Supreme Pontiff, called the Pope, and that in his name, you acknowledge the King and Queen, as the lords and superior authorities of these islands and Mainlands by virtue of the said donation.

If you do not do this, however, or resort maliciously to delay, we warn you that, with the aid of God, we will enter your land against you with force and will make war in every place and by every means we can and are able, and we will then subject you to the yoke and authority of the Church and Their Highnesses. We will take you and your wives and children and make them slaves, and as such we will sell them, and will dispose of you and them as Their Highnesses order. And we will take your property and will do to you all the harm and evil we can, as is done to vassals who will not obey their lord or who do not wish to accept him, or who resist and defy him. We avow that the deaths and harm which you will receive thereby will be your own blame, and not that of Their Highnesses, nor ours, nor of the gentlemen who come with us.`,
  },
  {
    id: "u01-cortes-letters",
    unit: 1,
    priority: "very_common",
    topPriorityRank: null,
    title: "Letters to Charles V",
    creator: "Hernán Cortés",
    date: "1519-1526",
    apushUse: "Spanish conquest of the Aztec Empire",
    excerpt:
      "Cortés's five letters to the Spanish king describe Tenochtitlan as a magnificent, orderly city, justify his unauthorized expedition and alliance-building against the Aztec Empire, and report the eventual conquest as both a religious and territorial victory for Spain.",
    citation:
      "Hernán Cortés, Cartas de relación (Letters from Mexico) to Emperor Charles V, 1519-1526.",
    externalUrl: null,
    fullText: `This great city of Temixtitlan [Mexico] is situated in this salt lake, and from the main land to the denser parts of it, by whichever route one chooses to enter, the distance is two leagues. There are four avenues or entrances to the city, all of which are formed by artificial causeways, two spears' length in width. The city is as large as Seville or Cordova; its streets, I speak of the principal ones, are very wide and straight; some of these, and all the inferior ones, are half land and half water, and are navigated by canoes. All the streets at intervals have openings, through which the water flows, crossing from one street to another; and at these openings, some of which are very wide, there are also very wide bridges, composed of large pieces of timber, of great strength and well put together; on many of these bridges ten horses can go abreast.`,
  },
  {
    id: "u01-diaz-del-castillo-tenochtitlan",
    unit: 1,
    priority: "very_common",
    topPriorityRank: null,
    title: "Account of Tenochtitlan",
    creator: "Bernal Díaz del Castillo",
    date: "c. 1568",
    apushUse: "Aztec urban development and Spanish perspectives",
    excerpt:
      "A soldier who served under Cortés, writing decades later, recalls his first sight of Tenochtitlan's causeways, canals, and markets as so extraordinary that some of his companions wondered if they were dreaming.",
    citation:
      "Bernal Díaz del Castillo, Historia verdadera de la conquista de la Nueva España (The True History of the Conquest of New Spain), written c. 1568, first published 1632.",
    externalUrl: null,
    fullText: `The next morning we reached the broad high road of Iztapalapan, whence we for the first time beheld the numbers of towns and villages built in the lake, and the still greater number of large townships on the mainland, with the level causeway which ran in a straight line into Mexico. Our astonishment was indeed raised to the highest pitch, and we could not help remarking to each other, that all these buildings resembled the fairy castles we read of in Amadis de Gaul; so high, majestic, and splendid did the temples, towers, and houses of the town, all built of massive stone and lime, rise up out of the midst of the lake. Indeed, many of our men believed what they saw was a mere dream. And the reader must not feel surprised at the manner in which I have expressed myself, for it is impossible to speak coolly of things which we had never seen nor heard of, nor even could have dreamt of, beforehand.`,
  },
  {
    id: "u01-florentine-codex",
    unit: 1,
    priority: "very_common",
    topPriorityRank: null,
    title: "Indigenous account of the conquest of Mexico",
    creator: "Nahua informants, compiled under Bernardino de Sahagún",
    date: "c. 1570s",
    apushUse: "Native perspectives on conquest and disease",
    excerpt:
      "Compiled from Nahua eyewitnesses working with a Spanish friar, this bilingual (Nahuatl/Spanish) manuscript describes the Spanish invasion, the fall of Tenochtitlan, and the devastating smallpox epidemic from an Indigenous point of view largely absent from Spanish chronicles.",
    citation:
      "Bernardino de Sahagún with Nahua informants, Historia general de las cosas de Nueva España (the Florentine Codex), Book XII, compiled c. 1575-1577; translation from Miguel León-Portilla, The Broken Spears (1992).",
    externalUrl: null,
    fullText: `A great plague broke out here in Tenochtitlan . . . striking everywhere in the city and killing a vast number of people. Sores erupted on our faces, our breasts, our bellies; we were covered with agonizing sores from head to foot. The illness was so dreadful that no one could walk or move. The sick were so utterly helpless that they could only lie on their beds like corpses, unable to move their limbs or even their heads. They could not lie face down or roll from one side to the other. If they did move their bodies, they screamed with pain. A great many died from this plague, and many others died of hunger. They could not get up to search for food, and everyone else was too sick to care for them, so they starved to death in their beds. . . . By the time the danger was recognized, the plague was so well established that nothing could halt it.`,
  },
  {
    id: "u01-hakluyt-western-planting",
    unit: 1,
    priority: "useful",
    topPriorityRank: null,
    title: "Discourse of Western Planting",
    creator: "Richard Hakluyt",
    date: "1584",
    apushUse: "English motives for colonization",
    excerpt:
      "Hakluyt petitioned Queen Elizabeth I to fund English colonization of North America, arguing it would spread Protestant Christianity, provide new markets and resources, check Spanish power, and relieve England's poor and unemployed.",
    citation:
      "Richard Hakluyt, A Discourse Concerning Western Planting, 1584, presented to Queen Elizabeth I.",
    externalUrl: null,
    fullText: `That this westerne discoverie will be greately for the inlargement of the gospell of Christe whereunto the Princes of the refourmed relligion are chefely bounde amongest whome her Majestie is principall.

That this westerne voyadge will yelde unto us all the commodities of Europe, Affrica, and Asia, as far as wee were wonte to travell, and supply the wantes of all our decayed trades.

That this enterprise will be for the manifolde imploymente of nombers of idle men, and for bredinge of many sufficient, and for utterance of the greate quantitie of the commodities of our Realme.

That this voyage will be a great bridle to the Indies of the kinge of Spaine and a means that wee may arreste at our pleasure for the space of teime weekes or three monethes every yere, one or twoo hundred saile of his subjectes shippes at the fysshinge in Newfounde Iande.`,
  },
  {
    id: "u01-harriot-brief-and-true-report",
    unit: 1,
    priority: "useful",
    topPriorityRank: null,
    title: "A Brief and True Report of the New Found Land of Virginia",
    creator: "Thomas Harriot",
    date: "1588",
    apushUse: "English observations of Indigenous societies",
    excerpt:
      "A scientist on the Roanoke expedition catalogs the region's resources and describes Algonquian farming, government, and religion for an English audience, framing the land as promising for future colonization.",
    citation: "Thomas Harriot, A Brief and True Report of the New Found Land of Virginia, 1588.",
    externalUrl: null,
    fullText: `It resteth I speake a word or two of the naturall inhabitants, their natures and maners, leauing large discourse thereof vntill time more conuenient hereafter: nowe onely so farre foorth, as that you may know, how that they in respect of troubling our inhabiting and planting, are not to be feared; but that they shall haue cause both to feare and loue vs, that shall inhabite with them.

They are a people clothed with loose mantles made of Deere skins, & aprons of the same rounde about their middles; all els naked; of such a difference of statures only as wee in England; hauing no edge tooles or weapons of yron or steele to offend vs withall, neither know they how to make any: those weapons that they haue, are onlie bowes made of Witch hazle, & arrowes of reeds; flat edged truncheons also of wood about a yard long, neither haue they any thing to defend themselues but targets made of barcks; and some armours made of stickes wickered together with thread.`,
  },
  {
    id: "u01-de-bry-engravings",
    unit: 1,
    priority: "useful",
    topPriorityRank: null,
    title: "Engravings of the Americas",
    creator: "Theodor de Bry",
    date: "late 1500s",
    apushUse: "European representations and stereotypes of Native peoples",
    excerpt:
      "A Flemish engraver never himself in the Americas produced widely circulated illustrated editions (based on artists like John White and Jacques Le Moyne) that shaped European visual imagination of Native societies, mixing ethnographic detail with European stereotype.",
    citation:
      "Theodor de Bry, engraved illustrations in the Grands Voyages series, published from 1590 onward, including illustrations for Thomas Harriot's A Brief and True Report.",
    externalUrl: null,
  },
];

export const UNIT_01_VISUAL_SOURCES = [
  {
    id: "u01-visual-tenochtitlan-maps",
    unit: 1,
    title: "Aztec or Tenochtitlan maps",
    description:
      "Contemporary or reconstructed maps of Tenochtitlan's island causeway-and-canal layout, used to illustrate the scale and sophistication of Aztec urban planning before and during the Spanish conquest.",
    citation:
      "Various — e.g. the 1524 Nuremberg map of Tenochtitlan attributed to Hernán Cortés's expedition.",
    externalUrl: "https://www.loc.gov/item/2003623125",
  },
  {
    id: "u01-visual-pueblo-settlements",
    unit: 1,
    title: "Pueblo settlements",
    description:
      "Images of Ancestral Puebloan multi-story adobe or masonry settlements (e.g. Chaco Canyon, Taos), used to illustrate sedentary, agriculturally based Indigenous societies of the Southwest before European contact.",
    citation:
      "National Park Service photographic and archaeological documentation of Southwestern Pueblo sites.",
    externalUrl: null,
  },
  {
    id: "u01-visual-mississippian-mounds",
    unit: 1,
    title: "Mississippian mound-building societies",
    description:
      "Images or site plans of large earthwork mounds (e.g. Cahokia, near modern St. Louis), used to illustrate complex, hierarchical Indigenous societies and long-distance trade networks in precontact North America.",
    citation: "Cahokia Mounds State Historic Site documentation.",
    externalUrl: null,
  },
  {
    id: "u01-visual-columbian-exchange-diagrams",
    unit: 1,
    title: "Columbian Exchange diagrams",
    description:
      "Diagrams mapping the transatlantic movement of crops, animals, people, and diseases between the Eastern and Western Hemispheres after 1492, used to summarize the broad biological and demographic consequences of contact.",
    citation:
      "Standard AP U.S. History textbook diagram convention, following Alfred Crosby's Columbian Exchange framework.",
    externalUrl: null,
  },
];
