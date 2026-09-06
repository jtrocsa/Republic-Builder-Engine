// The Chronotravel plates — the painted establishing shot each warp screen loads on.
//
// One per destination: the era a unit travels to, plus the Institute Archive the recall beacon
// pulls back to. The warp screens were an abstract teal vortex for a long time and said nothing
// about where you were going; a plate says it in the one second before the map exists.
//
// **A plate belongs to a unit, and exactly one of that unit's cases opens on it.** The plate is
// the unit's map painted from outside, so it is only ever true of the case that walks that map.
// This file used to say a unit was "one place and one era" and let all three cases open on it,
// which is why the warp spent three phases showing a Kansas railhead behind "Chicago, Illinois ·
// 1893" and a 1957 boulevard behind "The United States Senate · 1 June 1950". Keying by case would
// mean twenty-seven paintings to say nine things; the fix was the other direction — a case with no
// map does not open a warp at all. See decision log `0114`, and the guard in
// `tests/unit/chronotravel-plates.test.js` that pins one field case per unit.
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
// **Unit 7 collected its line in Phase 89, Unit 8 in Phase 95 and Unit 9 in Phase 100**, each
// costing exactly the four lines below, which is what the early commission was for. **The queue
// is now empty and there are no unwired plates left**, which retires the guard in
// `tests/unit/chronotravel-plates.test.js` that kept the last of them from being deleted as
// "unused". The rest of that file still holds: every unit must have a plate, no plate may name a
// unit that is not shipped, and every plate must point at a file that is actually there.

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
  "unit-08": {
    image: new URL("../assets/plates/unit-08-postwar-suburb.webp", import.meta.url).href,
    alt: "A wide new boulevard running downhill into a valley on a summer afternoon: low ranch houses behind white picket fences and clipped front lawns along the left-hand side, a service station and a strip of shopfronts on the right, chrome-heavy cars in both directions, telephone poles and a long line of hills beyond.",
    note: "Anchor holds. New houses, a new road, and every term of who may live on it already written and recorded.",
  },
  "unit-09": {
    image: new URL("../assets/plates/unit-09-college-campus.webp", import.meta.url).href,
    alt: "A university quadrangle on a bright autumn afternoon: a red-brick library with a white columned portico across the far side of the lawn, an older gabled hall among yellowing trees, students crossing the paved paths with backpacks, cars parked along a service road, and a kiosk on the near corner papered over with layers of printed notices.",
    note: "Anchor holds. Everything this valley still remembers about itself is in one building, and it opens by appointment.",
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
