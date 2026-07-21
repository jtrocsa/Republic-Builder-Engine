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
    externalUrl: null,
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
      "Bernardino de Sahagún with Nahua informants, Historia general de las cosas de Nueva España (the Florentine Codex), Book XII, compiled c. 1575-1577.",
    externalUrl: null,
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
