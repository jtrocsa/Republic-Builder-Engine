// The Chronotravel plates — the painted establishing shot each warp screen loads on.
//
// One per destination: the era a unit travels to, plus the Institute Archive the recall beacon
// pulls back to. The warp screens were an abstract teal vortex for a long time and said nothing
// about where you were going; a plate says it in the one second before the map exists.
//
// **A plate belongs to a unit, not a case.** A unit is one place and one era — Unit 1's three
// cases are all the 1493 Caribbean whether they route to a field map or not, so all three open on
// the same painting. Keying by case would mean eighteen paintings to say six things.
//
// **`note` is flavour and must stay flavour.** It orients the player in the setting they are about
// to stand in; it is not a fact to be tested, a hint, or a claim a mission depends on. A plate is
// the one screen in the game with a player's undivided attention and no task on it, which is
// exactly why the temptation to teach through it should be refused — the curriculum rule in
// CLAUDE.md is about advantage, and this file is about atmosphere.
//
// **Units 7-9 were painted and committed ahead of their units, on purpose.** The artwork for the
// immigrant port, the postwar suburb and the 1990s campus arrived as one commission with the six
// that shipped, and sat in apps/web/src/assets/plates/ unreferenced until the unit that opens on
// them was real — because wiring one early would mean naming a unit id that does not exist.
// **Unit 7 collected its line in Phase 89** and cost exactly the four lines below, which is what
// the early commission was for. Units 8 and 9 are still queued.
// `tests/unit/chronotravel-plates.test.js` holds every end of that: every unit must have a plate,
// no plate may name a unit that is not shipped, every plate file must exist, and the two files
// still waiting must not be deleted as "unused".

// Written out one by one rather than through a `plate(file)` helper, which is what this was first:
// a template literal inside `new URL()` makes Vite treat the folder as a glob and emit all ten
// plates into every build, including the three whose units do not exist yet. Static literals are
// the convention everywhere else in the repo for exactly this reason.
export const CHRONOTRAVEL_PLATES = {
  "unit-01": {
    image: new URL("../assets/plates/unit-01-caribbean.webp", import.meta.url).href,
    alt: "A Caribbean shore at midday: a Spanish caravel anchored in turquoise water off a rocky headland, a timber landing stage running out from the sand, and palm-thatched houses under the palms along the beach.",
    note: "Anchor holds. Two peoples are counting the same shoreline, and only one of them is writing it down.",
  },
  "unit-02": {
    image: new URL("../assets/plates/unit-02-riverbend.webp", import.meta.url).href,
    alt: "A palisaded settlement on a wooded river bend at first light: thatched and clapboard houses inside a log wall, a wharf with small boats below the bluff, and cleared fields running back into the trees.",
    note: "Anchor holds. A wall, a wharf, and everyone inside them arguing about who owes whom what.",
  },
  "unit-03": {
    image: new URL("../assets/plates/unit-03-philadelphia.webp", import.meta.url).href,
    alt: "A busy Philadelphia street in summer: the brick State House and its clock tower above a cobbled square, market awnings and a fruit stall in the foreground, wagons and ships' masts at the end of the street.",
    note: "Anchor holds. A city printing the argument faster than anyone in it can finish having it.",
  },
  "unit-04": {
    image: new URL("../assets/plates/unit-04-canal-crossroads.webp", import.meta.url).href,
    alt: "A canal town at a lock: a mule team hauling a laden packet boat along the towpath, water spilling over the lock gates, and a street of shopfronts and warehouses climbing the far bank toward a church spire.",
    note: "Anchor holds. The lock lifts a loaded boat by hand. Everything else here is an argument about who paid for it.",
  },
  "unit-05": {
    image: new URL("../assets/plates/unit-05-richmond.webp", import.meta.url).href,
    alt: "Wartime Richmond from the bluffs at dusk: a columned capitol on the hill above brick warehouses and church spires, a Confederate flag on a pole in the foreground beside a field gun, and smoking ironworks along the river below.",
    note: "Anchor holds. A capital running a war on paper it is also running out of.",
  },
  "unit-06": {
    image: new URL("../assets/plates/unit-06-cottonwood-junction.webp", import.meta.url).href,
    alt: "A Kansas railhead on the open prairie: a locomotive taking water at a timber tank, cattle pens beside the track, and a dirt street of false-front buildings and telegraph poles running out toward the horizon.",
    note: "Anchor holds. A town the survey drew before anyone arrived to live in it.",
  },
  "unit-07": {
    image: new URL("../assets/plates/unit-07-immigrant-port.webp", import.meta.url).href,
    alt: "A harbour wharf at first light: a black-hulled liner made fast at the quay with people crowding her rails, families waiting on the wet stone among trunks and bundles, a long brick reception hall with domes and an iron canopy down the right-hand side, and a city of towers across the water.",
    note: "Anchor holds. Everyone on this quay was written down in Europe before anyone here looked at them.",
  },
  institute: {
    image: new URL("../assets/plates/institute-archive.webp", import.meta.url).href,
    alt: "The Chronicle Institute Archive: a domed reading room with a compass rose inlaid in the floor, a great map table under a lit lantern, navy and gold banners between shelves of bound records, and an open atlas on a stand.",
    note: "Recall beacon locked. The Archive is expecting your record.",
  },
};

/**
 * The plate a Chronotravel to this unit opens on.
 *
 * Falls back to Unit 1's rather than to nothing: a unit that has not been given a plate yet is a
 * missing line in the table above, and a warp screen with no painting on it is a worse way to
 * report that than a wrong-era one. The test is what reports it.
 */
export function plateForUnit(unitId) {
  return CHRONOTRAVEL_PLATES[unitId] || CHRONOTRAVEL_PLATES["unit-01"];
}

export const INSTITUTE_PLATE = CHRONOTRAVEL_PLATES.institute;
