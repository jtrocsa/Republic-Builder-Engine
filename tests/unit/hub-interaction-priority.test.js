// Spine Review Part 5, finding P5-6.
//
// `nearestHubTarget()` was built on `Array#find`, so for as long as it has existed it answered
// with the first in-reach entry in HUB_TARGETS **declaration order**, not the nearest one. That is
// invisible until two things are in reach at once, which in the Main Hall meant Professor Park —
// declared two entries above `table` — standing at his route's east stop, 1.4 tiles from the
// Navigation Table's anchor and inside its 1.65 reach. Walking to the table and pressing E opened
// the professor instead, intermittently, on the object every case selection in the game goes
// through. The "Open Navigation Table →" button in his own dialogue is the workaround somebody
// added rather than the bug being found.
//
// The geometry half is fixed by moving his stop and asserted in field-map-coordinates.test.js.
// This is the logic half: the rule, tested without a room, because an end-to-end version would
// depend on where a walking NPC happened to be.
import { describe, it, expect } from "vitest";
import { nearestInReach } from "../../apps/web/src/main.js";

const at = (id, distance, reach = 1.1) => ({ id, distance, reach });

describe("nearestInReach", () => {
  it("returns null when nothing is inside its own reach", () => {
    expect(nearestInReach([at("julian", 2.0), at("table", 1.7, 1.65)])).toBeNull();
  });

  it("returns the only candidate in reach", () => {
    expect(nearestInReach([at("julian", 2.0), at("table", 1.4, 1.65)])?.id).toBe("table");
  });

  // The bug, as a case. Declaration order puts julian first and it is genuinely in reach; the
  // table is further inside a wider radius but nearer in absolute terms, and nearer is what wins.
  it("prefers the nearest of two in-reach candidates, not the first-declared", () => {
    expect(nearestInReach([at("julian", 1.05), at("table", 0.9, 1.65)])?.id).toBe("table");
  });

  it("prefers the nearest whichever order they arrive in", () => {
    expect(nearestInReach([at("table", 0.9, 1.65), at("julian", 1.05)])?.id).toBe("table");
    expect(nearestInReach([at("julian", 0.4), at("table", 0.9, 1.65)])?.id).toBe("julian");
  });

  // A wider radius buys a larger approach, not a win against something closer — which is why this
  // sorts on raw distance and not on distance-over-reach. Under a normalised comparison the table
  // at 1.20/1.65 (0.73) would beat a person standing 1.00/1.1 (0.91) away, i.e. the object would
  // win from further off than the body the player is nose to nose with.
  it("does not let the table's wider reach outrank someone standing closer", () => {
    expect(nearestInReach([at("table", 1.2, 1.65), at("director", 1.0)])?.id).toBe("director");
  });

  it("keeps the earlier candidate on an exact tie", () => {
    expect(nearestInReach([at("a", 1.0), at("b", 1.0)])?.id).toBe("a");
  });

  it("ignores a nearer candidate that is outside its own reach", () => {
    // A 0.5-reach target at 0.6 is out; the table at 1.5 is in. Reach is per-target, not global.
    expect(nearestInReach([at("tight", 0.6, 0.5), at("table", 1.5, 1.65)])?.id).toBe("table");
  });

  it("handles an empty room", () => {
    expect(nearestInReach([])).toBeNull();
  });
});
