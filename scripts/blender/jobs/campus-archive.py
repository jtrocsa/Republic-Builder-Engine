# Unit 9's two missing props, closing `prop.archive.recordCarton` and `prop.archive.microfilmReader`
# (canonical-palette.js; decision log 0100 §3 names both, 0152 records this job).
#
# Run with `npm run assets:blender -- campus-archive`. Everything is modelled at real-world size
# in metres from 0100's geometry — describe the geometry, never the object — and the camera in
# lib/pixel_render.py decides the pixels.
#
# The two rooms these go in are dressed from office/1-4, so every colour here is either sampled
# off those sheets or chosen to sit beside them: the colour given is the one a face gets lit from
# above, and fronts come out at 0.70 of it, which is what the packs do.

import os
import sys

sys.dont_write_bytecode = True  # no __pycache__ left in scripts/ by an import from lib/
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))

from pixel_render import Part, finish, render_object, reset_scene  # noqa: E402

# Archival board. The packs' filing cabinets are #bfc6d3 on top; this is a little warmer and less
# blue, so a case standing beside a cabinet still reads as a different material.
BOARD = "#bec3ca"
LABEL = "#e9e4d6"
PULL = "#3b3b42"
MANILA = "#e3c887"
MANILA_DEEP = "#d4b56f"  # every other folder, so five of them read as five
STEEL = "#8e9399"
SHELF_BACK = "#5b5f66"
# The reader: 1990s office beige, the same family as office/1's wall panelling (#bcb6a8) and CRTs.
BEIGE = "#cfc6b0"
DARK = "#4b4b50"
SCREEN = "#e2e8e4"
SCREEN_TEXT = "#9aa39f"
REEL = "#3a3a40"
HUB = "#a3a8b0"
GLASS = "#a9c0c2"
# office/1's desk top, measured.
WOOD = "#967f73"

# A flip-top document case: 15.5 x 10.25 x 5 inches, standing on its long edge. Folders stand in
# it parallel to the long side, so a shelf of them shows only the 5-inch ends.
CASE_L, CASE_H, CASE_W = 0.39, 0.26, 0.13
FLAP = 0.05  # the lid's front flap folds down this far over the body


def closed_case(obj, x0=0.0, y0=0.0, z0=0.0, label=True):
    """A case standing upright, long side to the camera, lid shut."""
    x1, y1 = x0 + CASE_L, y0 + CASE_W
    parts = [
        Part(obj, "body", BOARD).box((x0, y0, z0), (x1, y1, z0 + CASE_H - FLAP)),
        # The lid: its top panel and the flap folded down in front, standing a hair proud of the body.
        Part(obj, "lid", BOARD)
        .box((x0 - 0.004, y0 - 0.006, z0 + CASE_H - 0.012), (x1 + 0.004, y1 + 0.004, z0 + CASE_H))
        .box((x0 - 0.004, y0 - 0.010, z0 + CASE_H - FLAP), (x1 + 0.004, y0 - 0.002, z0 + CASE_H)),
    ]
    if label:
        # BOX 3, FOLDER 11 — the record the player is sent to read cites a box, so a box is labelled.
        parts.append(
            Part(obj, "label", LABEL).box(
                (x1 - 0.15, y0 - 0.002, z0 + 0.07), (x1 - 0.04, y0, z0 + 0.15)
            )
        )
    return parts


def record_carton():
    return closed_case("recordCarton")


def record_carton_open():
    obj = "recordCartonOpen"
    t = 0.008  # board thickness: one pixel at this scale
    x1, y1 = CASE_L, CASE_W
    hinge = (y1, CASE_H)
    parts = [
        Part(obj, "shell", BOARD)
        .box((0, 0, 0), (x1, t, CASE_H))  # front wall
        .box((0, y1 - t, 0), (x1, y1, CASE_H))  # back wall
        .box((0, 0, 0), (t, y1, CASE_H))  # ends
        .box((x1 - t, 0, 0), (x1, y1, CASE_H))
        .box((0, 0, 0), (x1, y1, t)),  # floor
        # Lid thrown back past upright on its rear hinge, flap and all.
        Part(obj, "lid", BOARD)
        .box((-0.004, 0.0, CASE_H - 0.012), (x1 + 0.004, y1 + 0.004, CASE_H), rot=105, pivot=hinge)
        .box((-0.004, -0.004, CASE_H - FLAP), (x1 + 0.004, 0.004, CASE_H), rot=105, pivot=hinge),
    ]
    # Five folders standing in it, their tabs cut left, centre and right in turn — the detail that
    # says "folders" rather than "paper". A little proud of the rim, or at map scale they vanish.
    tab_x = [0.03, 0.15, 0.27, 0.07, 0.21]
    for i, tx in enumerate(tab_x):
        y = 0.014 + i * 0.021
        parts.append(
            Part(obj, f"folder{i}", MANILA if i % 2 == 0 else MANILA_DEEP)
            .box((0.02, y, t), (x1 - 0.02, y + 0.012, CASE_H + 0.025))
            .box((tx, y, CASE_H + 0.025), (tx + 0.09, y + 0.012, CASE_H + 0.05))
        )
    return parts


def record_carton_stack():
    """Three cases lying flat, not quite squared up — a stack somebody made, not a render.

    The first version centred a label on each and read as a three-drawer cabinet, handles and all.
    What says "three boxes" is each one's own lid edge and a visible stagger, so the label moves to
    an end and the offsets are bigger than a tidy archivist would leave them."""
    obj = "recordCartonStack"
    parts = []
    for i, dx in enumerate((-0.022, 0.018, -0.006)):
        z0 = i * CASE_W
        x0 = 0.03 + dx
        x1 = x0 + CASE_L
        parts.append(Part(obj, f"case{i}", BOARD).box((x0, 0, z0), (x1, CASE_H, z0 + CASE_W - 0.03)))
        parts.append(
            Part(obj, f"lid{i}", BOARD).box(
                (x0 - 0.004, -0.006, z0 + CASE_W - 0.03), (x1 + 0.004, CASE_H + 0.004, z0 + CASE_W)
            )
        )
        parts.append(
            Part(obj, f"label{i}", LABEL).box(
                (x0 + 0.03, -0.002, z0 + 0.025), (x0 + 0.13, 0.0, z0 + CASE_W - 0.045)
            )
        )
    return parts


def record_carton_shelf():
    """One bay of steel archival shelving, the cases standing on it ends-out."""
    obj = "recordCartonShelf"
    w, d, h = 0.92, 0.40, 2.13
    post = 0.03
    parts = [
        Part(obj, "back", SHELF_BACK).box((post, d - 0.02, 0), (w - post, d, h)),
        Part(obj, "frame", STEEL)
        .box((0, 0, 0), (post, d, h))  # end frames, full depth: this bay has closed ends
        .box((w - post, 0, 0), (w, d, h))
        .box((0, 0, h - 0.03), (w, d, h)),  # top
    ]
    levels = [0.06, 0.46, 0.86, 1.26, 1.66]
    counts = [6, 6, 5, 6, 4]  # not every shelf full: a processing room is mid-job
    for li, (z, count) in enumerate(zip(levels, counts)):
        parts.append(
            Part(obj, f"shelf{li}", STEEL)
            .box((post, 0, z - 0.025), (w - post, d, z))
            .box((post, 0, z - 0.06), (w - post, 0.015, z))  # the shelf's front lip
        )
        for ci in range(count):
            x0 = post + 0.02 + ci * (CASE_W + 0.005)
            group = f"case{li}.{ci}"
            parts.append(
                Part(obj, group, BOARD, group=group).box(
                    (x0, 0.01, z), (x0 + CASE_W, 0.01 + CASE_L, z + CASE_H)
                )
            )
            # The end a researcher reads: a label, and the thumb hole for pulling it. Same seam
            # region as the case, so neither gets outlined into nothing.
            parts.append(
                Part(obj, f"{group}.label", LABEL, group=group).box(
                    (x0 + 0.025, 0.006, z + 0.13), (x0 + CASE_W - 0.025, 0.01, z + 0.21)
                )
            )
            parts.append(
                Part(obj, f"{group}.pull", PULL, group=group).box(
                    (x0 + 0.05, 0.006, z + 0.04), (x0 + CASE_W - 0.05, 0.01, z + 0.08)
                )
            )
    return parts


def microfilm_reader():
    """0100 §3: a beige console, a large screen raked back about thirty degrees, a film carriage
    beneath it, two spool arms. The spool arms are the whole difference between this and the AV
    lectern that stands in for it, so they are drawn bigger than a photograph would have them."""
    obj = "microfilmReader"
    top = 0.74
    w, d, leg = 0.96, 0.66, 0.07
    parts = [
        Part(obj, "tableTop", WOOD).box((0, 0, top - 0.04), (w, d, top)),
        # Square legs and an apron all round: a library table, built heavier than an office desk.
        Part(obj, "tableFrame", WOOD)
        .box((0.02, 0.02, 0), (0.02 + leg, 0.02 + leg, top - 0.04))
        .box((w - 0.02 - leg, 0.02, 0), (w - 0.02, 0.02 + leg, top - 0.04))
        .box((0.02, d - 0.02 - leg, 0), (0.02 + leg, d - 0.02, top - 0.04))
        .box((w - 0.02 - leg, d - 0.02 - leg, 0), (w - 0.02, d - 0.02, top - 0.04))
        .box((0.02, 0.02, top - 0.13), (w - 0.02, 0.04, top - 0.04)),
        # The console's base, which holds the carriage.
        Part(obj, "base", BEIGE).box((0.22, 0.06, top), (0.74, 0.56, top + 0.12)),
        Part(obj, "carriage", GLASS).box((0.30, 0.07, top + 0.12), (0.66, 0.26, top + 0.135)),
        Part(obj, "lens", DARK).box((0.43, 0.15, top + 0.135), (0.53, 0.23, top + 0.20)),
    ]
    # The screen housing, raked back thirty degrees about its bottom front edge.
    pivot = (0.30, top + 0.12)
    parts.append(
        Part(obj, "housing", BEIGE).box(
            (0.19, 0.30, top + 0.12), (0.77, 0.50, top + 0.68), rot=30, pivot=pivot
        )
    )
    screen = Part(obj, "screen", SCREEN).box(
        (0.24, 0.294, top + 0.17), (0.72, 0.30, top + 0.63), rot=30, pivot=pivot
    )
    parts.append(screen)
    # A page on the screen: a few lines of text, so it reads as a film frame and not a blank panel.
    text = Part(obj, "screenText", SCREEN_TEXT, group=screen.name)
    for i in range(4):
        z = top + 0.52 - i * 0.08
        x1 = 0.67 - (0.12 if i == 3 else 0.0)
        text.box((0.29, 0.290, z), (x1, 0.294, z + 0.028), rot=30, pivot=pivot)
    parts.append(text)
    # Two spool arms, one either side of the carriage, each holding a reel face-on. A reel is a dark
    # disc with a pale hub; without the hub, at this size, it is a loudspeaker.
    for side, (arm_x0, arm_x1), reel_x in (("L", (0.12, 0.22), 0.10), ("R", (0.74, 0.84), 0.86)):
        parts.append(
            Part(obj, f"arm{side}", BEIGE).box((arm_x0, 0.16, top + 0.06), (arm_x1, 0.24, top + 0.09))
        )
        reel = f"reel{side}"
        parts.append(Part(obj, reel, REEL, group=reel).disc((reel_x, top + 0.08), 0.07, 0.12, 0.16, segments=20))
        parts.append(
            Part(obj, f"{reel}.hub", HUB, group=reel).disc((reel_x, top + 0.08), 0.025, 0.115, 0.12, segments=12)
        )
    return parts


if __name__ == "__main__":
    reset_scene()
    rendered = [
        # 1x1 props fill their tile (INVARIANTS: a prop's size is the pack's opinion). Low objects
        # show a deep top, like the packs' counter cabinet and desk.
        render_object("recordCarton", record_carton(), fit_width_px=44, top_ratio=1.0),
        render_object("recordCartonOpen", record_carton_open(), fit_width_px=44, top_ratio=1.0),
        render_object("recordCartonStack", record_carton_stack(), fit_width_px=44, top_ratio=0.9),
        # Furniture scale. The bay is sized to one tile wide, as office/1's bookcase is (48x96), and
        # is tall, so it shows a shallow top like the packs' tall cabinets.
        render_object("recordCartonShelf", record_carton_shelf(), px_per_m=52, top_ratio=0.5),
        # office/1's desk runs 64 px per metre of width; the reader stands on a desk-sized table.
        render_object("microfilmReader", microfilm_reader(), px_per_m=64, top_ratio=0.9),
    ]
    finish("campus-archive", rendered)
