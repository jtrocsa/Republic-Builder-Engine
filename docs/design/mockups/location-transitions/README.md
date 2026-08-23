# Location transitions — mockup

The warm "you have arrived somewhere" screen: a stylized image of the destination, light geometric
framing, and a circular **Syncing** loader that fills. A style-and-rules mockup, not game code — the
design spec and the plan for folding it into `main.js` live in [`DESIGN.md`](./DESIGN.md).

## Files

| File         | Role                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `index.html` | The mockup. Editable — art is referenced as `./art/<file>`, not inlined.                |
| `art/`       | Scene paintings, optimized (~1600px wide, JPEG q≈82). One per destination.              |
| `inline.mjs` | Build a self-contained copy for publishing (inlines `art/` as data URIs).               |
| `DESIGN.md`  | When it fires, the layer anatomy, the contextual-motion rule, and the integration path. |

## Edit & preview

```bash
cd docs/design/mockups/location-transitions
python3 -m http.server 8080     # then open http://localhost:8080/index.html
```

Open `index.html` directly and it works too — the `./art/` paths are relative.

## Publish for review (as a Claude Artifact)

Artifacts must be self-contained, so inline the art first, then publish the output:

```bash
node inline.mjs /tmp/location-transitions.html
```

Publish `/tmp/location-transitions.html`. Keep it out of the repo — it's generated, ~775KB, and
regenerates from `index.html` + `art/` any time.

## Add a destination (per map)

1. **Art** — drop an optimized painting in `art/<map>.jpg` (~1600px wide, JPEG q≈82).
2. **Scene image** — add `<img class="scene-img" id="img-<map>" />` inside a new
   `<div class="scene" id="scene-<map>">`.
3. **Config** — add a `DEST.<map>` block (eyebrow, kicker, title, meta, goal, q, sync, enter, scene)
   and wire its image: `const <MAP>_IMG = './art/<map>.jpg';` → `$("img-<map>").src = <MAP>_IMG;`.
4. **Tab** — add a `<button class="tab" data-dest="<map>">` so it's switchable in the mockup.
5. **Contextual motion** — the important one. Give the scene _its own_ motion native to that
   painting (see `DESIGN.md` §"Contextual motion"). Do **not** reuse the archive's dust or the
   Caribbean's water blindly — pick the one or two things that would actually move in _that_ place.

`inline.mjs` picks up any new `./art/<file>` automatically; no build config to touch.
