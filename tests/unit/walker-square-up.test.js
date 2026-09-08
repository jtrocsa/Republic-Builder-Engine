// The e2e walker's one non-obvious decision, asked in isolation.
//
// `walkTo()` walks a breadth-first route corner to corner, and the route's corners sit on the nav
// probe's half-tile lattice while the player does not. A leg finishes when the leg's *own* axis is
// within ARRIVE_TILES (0.3) of its waypoint, so the walker can turn a corner up to a third of a
// tile off the row the next leg was planned along — and that row can be solid there. When a leg
// stops making progress, the walker squares up on the other axis to get back onto it.
//
// **Why this is a unit test and not a spec.** The two times that decision has been wrong, neither
// could be reproduced on demand in a browser. Phase 128's window is 0.01 of a tile wide: the walk
// wedges only when the leg into the row lands short of it by more than the row's own clearance
// (0.02 of a tile) and less than the gate (0.03). One rendered frame moves the body about 0.06 of a
// tile at 60fps and further under load, so nothing a test can do steers into a band a sixth that
// size. It reproduced three times in twenty-four runs at four workers, resting at the identical
// coordinate every time — and then not once in forty-two further runs of the same *unfixed*
// walker, which is exactly why the fix is not allowed to rest on a green suite. The numbers below
// are the two incidents' own measured ones, and they are deterministic.
import { describe, it, expect } from "vitest";
import { burstAxis } from "../e2e/helpers/progress-seed.js";

describe("which axis a stalled burst is spent on", () => {
  it("walks the leg's own axis while the leg is making progress", () => {
    // Six tiles west and a hair north: the leg is horizontal and stalls is 0, so nothing else is
    // in question.
    expect(burstAxis(0, -6.0, -0.025)).toBe("horizontal");
    expect(burstAxis(0, -0.025, -6.0)).toBe("vertical");
  });

  it("squares up on Phase 119's quarter tile, which ARRIVE_TILES calls arrived", () => {
    // The body came to rest at (12.66, 7.25) walking to a waypoint at (13.00, 7.00) with no NPC
    // within four tiles. The leg is horizontal; the offset that wedged it is the 0.25 in y.
    expect(burstAxis(1, 0.34, -0.25)).toBe("vertical");
  });

  it("squares up on Phase 128's twenty-five thousandths, which the noise floor calls noise", () => {
    // Richmond's counting room. The route west to the book-keeper runs along lattice row y = 10.0,
    // where the player's foot box clears Nathan Purcell's blocking box by 0.02 of a tile — one
    // pixel. The leg into that row falls short under load and ends at y = 10.025; five thousandths
    // of a tile of overlap then stops the body dead at x = 5.260, every time.
    //
    // This is the regression. The gate used to read `> PROGRESS_TILES`, the 0.03 that answers "did
    // that burst move the body", and 0.025 is under it — so the escape hatch was refused and the
    // walker pressed the same blocked key until it ran out of stalls. Two questions, one constant.
    expect(burstAxis(1, -1.26, -0.025)).toBe("vertical");
  });

  it("does not square up on an offset smaller than a pixel, because the body is on the row", () => {
    // Positions are written in pixels and a pixel is 1/48 of a tile, so below this there is no
    // difference for the game to act on: the body is standing on the row the route was drawn
    // along and whatever is blocking it is not the offset.
    expect(burstAxis(1, -1.26, -0.02)).toBe("horizontal");
    expect(burstAxis(1, -1.26, 0)).toBe("horizontal");
  });

  it("alternates rather than squaring up twice in a row", () => {
    // maxStalls is 4 so that both axes get two attempts; the even stalls belong to the leg. Asked
    // with an offset far above either threshold, so this measures the parity and nothing else.
    expect(burstAxis(0, -1.26, -0.25)).toBe("horizontal");
    expect(burstAxis(1, -1.26, -0.25)).toBe("vertical");
    expect(burstAxis(2, -1.26, -0.25)).toBe("horizontal");
    expect(burstAxis(3, -1.26, -0.25)).toBe("vertical");
  });
});
