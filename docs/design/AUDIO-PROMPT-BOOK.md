# The Chronicle Audio Prompt Book

Every music track and sound effect the game wants, written as a prompt you can paste into a
generator. One entry per track: where it plays, what it should sound like, what to avoid, and what it
replaces.

Written for **Lyria 3 in Gemini** for the music, and for a text-to-SFX tool (ElevenLabs SFX,
Freesound) for the effects Lyria cannot make. This is a production document, not a design decision —
it does not change any code, and nothing here is wired up yet.

**Status of audio in the game today**, so you know what you are replacing:

- Every sound is synthesised live from oscillators in
  [`engine/audio-engine.js`](../../apps/web/src/engine/audio-engine.js). There are **no audio files
  anywhere in the repository**.
- **Six loops exist** — `archive`, `island`, `settlement`, `dialogue`, `upload`, `quiet` — each a bare
  arpeggio of four to seven notes on a timer, identical every repeat.
- **Six of the seven field maps share one loop.** Only Unit 1 has its own; Riverbend, Philadelphia,
  Canal Crossroads, Richmond, the Kansas railhead and Ellis Island are all `settlement`.
- **Around twenty-two of the thirty-two screens play `quiet`** — one note every six seconds. That
  includes the whole intro, the warp screen, the reader, and every quest screen.
- **Meridian has no audio identity at all.**

That holding position was deliberate — decision log
[`0027-side-sprite-audio-sfx.md`](../decision-log/0027-side-sprite-audio-sfx.md) chose procedural
audio _"until the final sound direction is settled."_ This document is that direction.

---

## §0 · How to use this

### Prompt anatomy

Every music prompt below is written in the same order, because that is the order Lyria responds to
best and because it makes the prompts editable as a set:

> **instrumentation → mood → tempo → key/mode → density → production character → negative list**

If you want to change one thing about a track, change that clause and leave the rest.

### Rules that apply to every music prompt

- **`instrumental only, no vocals`** appears in every prompt. Lyria will add wordless voices
  otherwise, and a voice under gameplay dialogue is unusable.
- **Lyria will not hand you a gapless loop.** Generate 45–60 seconds, then find a bar line in
  Audacity or Reaper, cut there, and crossfade 20–50 ms. Every prompt asks for _"steady tempo
  throughout, no fade in, no fade out"_ so that edit is possible. A track that ritards at the end
  cannot be looped.
- **Generate three takes of anything important** and keep the one with the least melodic movement.
  Exploration music is heard for twenty minutes at a stretch; a memorable tune becomes an irritating
  tune. The Institute and field tracks especially should be closer to texture than to song.
- **Audition at low volume.** The game's master gain is `0.045`, which is very quiet. A mix that
  sounds balanced in Gemini will lose its quiet details in-game.

### Three engine constraints worth knowing

| Constraint                | What it means for the audio                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| One audio bus, no ducking | Music and effects sum at equal weight. A music bed must leave midrange space for a stinger to land on top of it — avoid dense, loud mids. |
| No fades between screens  | A screen change is a hard cut. Tracks should start and end on low-energy material so the cut is not jarring.                              |
| Audio is off by default   | The player opts in with the header toggle. First impressions happen on the title screen, so that track earns the extra take.              |

### File naming

| Kind             | Pattern            | Example                      |
| ---------------- | ------------------ | ---------------------------- |
| Music loop       | `<scene-key>.ogg`  | `island.ogg`, `richmond.ogg` |
| Musical one-shot | `sting-<name>.ogg` | `sting-chrono-out.ogg`       |
| Sound effect     | `sfx-<name>.ogg`   | `sfx-lock-water.ogg`         |

Scene keys reuse the `musicScene` strings already in the code where one exists, so the later wiring
phase is a lookup swap rather than a rename. Keys marked **new** below do not exist yet.

Export as OGG Vorbis, mono for effects, stereo for music, and normalise loops to roughly the same
perceived loudness so a screen change does not jump.

---

## §1 · The global identity

Seven period-authentic scores could easily sound like seven unrelated soundtracks. Two things stop
that: one motif that appears everywhere, and one set of tonal rules that never bends.

### The Chronicle motif

**A rising fourth, up a step, and back down to the start.** In C: `G → C → D → C`. It never states a
third, so it is neither major nor minor — it is _unresolved_, which is the whole thesis of the game.

The existing `archive` loop is already close to this shape by accident. This document makes it
deliberate.

Where it appears:

- **Full statement** — the title theme, and the Institute tracks.
- **One instrument, once per phrase** — every field map quotes it in whichever period instrument fits
  that era. On the Caribbean shore it is a wooden flute; in Philadelphia a harpsichord; at Ellis
  Island a clarinet. Same four notes, seven different mouths.
- **The same intervals in a different housing** — Meridian's theme. See §6.

When writing a field prompt, the clause to include is roughly: _"one instrument states a simple
four-note figure — a rising fourth, up a step, and back — once per phrase, never developed."_

### The period rule

**The instruments change with the era. The motif and its harmonic language do not.**

Every field track stays in a modal, third-ambiguous harmonic world — Dorian, Mixolydian, or plain
pentatonic. No functional cadences, no dominant-to-tonic resolutions. The game's closing thesis is
_"history must remain open — to evidence, questioning, disagreement, and revision,"_ and music that
resolves argues the opposite.

### Tone guardrails

From [`CHRONICLE-CANON.md`](./CHRONICLE-CANON.md). These are not suggestions; the game's narrative
rules depend on them.

- **Observation is free.** Entering the past is not transgressive and nothing is chasing the player.
  **No alarm tension on arrival**, ever. Arrival is curiosity, not danger.
- **The Codex is the one fixed point.** Archive and Codex audio is **stable, warm, and resolved** —
  never unstable, glitching, corrupted, or under threat.
- **An anomaly is archival, not fantastical.** The canonical example is fourteen hogsheads written
  over a scraped fifteen in the wrong hand. _Nothing glows._ An anomaly cue is **one note that does
  not belong** — not a horror sting. It is observed, not solved.
- **Ordinary historical uncertainty is never drift.** Bias, gaps and disagreement are normal. Do not
  score a contradictory source as if something were wrong with reality.
- **Nobody is a villain.** Chronicle believes the record must survive to be argued with; Meridian
  believes knowing better obliges you to act. Neither gets villain music.

### The standing avoid list

Append to any prompt that needs it; the per-track avoid lists below add to this rather than repeat
it.

> glitch or corruption textures, tape-stop effects, ticking clocks, "quantum" shimmer, riser-and-
> impact trailer sound design, cyberpunk neon synths, sterile sci-fi ambience, villain red-and-black
> orchestration, heroic brass fanfare, choir or any vocals, modern drum kit, sidechained pumping,
> dubstep or EDM elements, lo-fi hip-hop beats.

### A vocabulary note

The game bans six phrases outright, and they are test-enforced elsewhere in the repository: _temporal
integrity · quantum record · anchor instability · causal resonance · timeline corruption · one true
timeline._ Do not let them creep into a prompt, a filename, or a track title — prompts get copied
into commit messages and become copy.

---

## §2 · Institute and frame tracks

Ten tracks. The Chronicle Institute is a converted old building — warm wood, torch sconces, stone,
mended many times and short of money. Its art is drawn from the Medieval Tavern tile family for
exactly that reason. So the Institute's palette is **wood, brass and parchment**: hammered dulcimer,
celeste, bowed vibraphone, nylon-string guitar, and a low sustained cello pedal underneath.

Patient and institutional. Withholding, not sinister.

### `title` — the title sequence

**Plays on** the animated seal and "CHRONICLE / An AP U.S. History Adventure". **Length** 75 s,
loopable. **Status** new. This is the theme, the full statement of the motif, and the first thing
anyone hears — give it the extra takes.

> Instrumental only, no vocals. The main theme for a historical adventure game, played by a small
> chamber ensemble in a wood-panelled room. It opens with a solo hammered dulcimer stating a simple
> four-note figure — a rising fourth, up a step, and back down — which is then answered by a celeste
> and taken up by a warm string quartet. A low sustained cello pedal holds underneath throughout. The
> harmony is modal and never resolves to a clear major or minor; it keeps arriving somewhere adjacent
> to home. 72 BPM in D Dorian. Patient, curious and quietly grand rather than triumphant — the sound
> of a serious institution rather than an adventure. Close, dry, wooden recording with a little room
> tone, no cinematic reverb. Steady tempo throughout, no fade in, no fade out.

**Avoid** — heroic brass fanfare, timpani, trailer percussion, orchestral swell, a resolving final
cadence, choir, anything that sounds like a film studio logo.

### `menu` — the main menu

**Plays on** the student/teacher landing. **Length** 45 s. **Status** new. A reduced arrangement of
`title` — same motif, fewer players, so the two screens feel like one room.

> Instrumental only, no vocals. A quiet, waiting-room arrangement of a chamber theme: solo hammered
> dulcimer playing a simple four-note figure — a rising fourth, up a step, and back down — with a
> single sustained cello note underneath and an occasional celeste answer. Almost nothing else. 66
> BPM in D Dorian. Unhurried, warm, slightly formal, entirely unpressured. Dry wooden recording,
> close mic, minimal reverb. Steady tempo throughout, no fade in, no fade out.

**Avoid** — melodic development, percussion, anything that builds. This track's job is to be ignored.

### `intro` — the opening sequence

**Plays on** `intro-welcome`, `intro-briefing`, `intro-protocol`, `identity`, `intro-registration`.
**Length** 60 s. **Status** new — these screens are silent today. The player is being recruited in
the present day, so this is the one Institute track allowed a faintly contemporary edge.

> Instrumental only, no vocals. A quiet, attentive underscore for a present-day briefing. A muted
> felt upright piano plays a slow four-note figure — a rising fourth, up a step, and back down — over
> sustained low strings and a soft bowed vibraphone shimmer. A single soft mallet marks the beginning
> of each phrase, like a page being set down. 68 BPM in D Dorian, unresolved. Serious and welcoming
> at once: someone explaining important work to a person they have decided to trust. Intimate close
> recording, minimal reverb. Steady tempo throughout, no fade in, no fade out.

**Avoid** — mystery-box tension, pulsing synth ostinato, string tremolo, anything implying a
countdown or a warning.

### `hallway` — the Entrance Hall

**Plays on** hub room `"hallway"` — the first moment of player control, and the Director's escort
walk north into the Main Hall. **Length** 60 s. **Status** new (currently `archive`).

> Instrumental only, no vocals. A warm arrival cue for the entrance hall of an old institution.
> Nylon-string guitar and celeste trade a simple four-note figure — a rising fourth, up a step, and
> back down — over a soft sustained cello. A gentle walking pulse underneath, marked only by a light
> plucked bass on the downbeat, so the music moves at the pace of two people walking together. 76 BPM
> in D Dorian. Curious, welcoming, a little awed — arriving somewhere older and larger than expected.
> Warm wooden room acoustic. Steady tempo throughout, no fade in, no fade out.

**Avoid** — grandeur, pipe organ, cathedral reverb, any sense of threshold-crossing drama.

### `hub-main` — the Main Hall

**Plays on** hub room `"main"` — where Emery Voss, Director Hale, Dr. Soto and Professor Park stand,
and where the Preservation Case and the Navigation Table live. **Length** 75 s. **Status** new
(currently `archive`). This is the most-heard track in the game; make it the least eventful.

> Instrumental only, no vocals. A comfortable, lived-in loop for a wood-panelled hall where scholars
> are working. Hammered dulcimer and nylon-string guitar interlock in a slow, gently rolling pattern,
> with a bowed vibraphone holding long notes above and a low cello pedal beneath. The four-note motif
> — a rising fourth, up a step, and back down — surfaces in the dulcimer roughly once every two
> phrases and is never developed. 70 BPM in D Dorian. Warm, patient, busy but unhurried; the sound of
> a place where people have been doing careful work for a long time. Dry, close, wooden. Steady tempo
> throughout, no fade in, no fade out.

**Avoid** — melodic hooks, key changes, dynamic builds, anything memorable enough to notice twice.

### `archive-room` — the Archive Room

**Plays on** hub room `"archive"` — the Archive Terminal, the lit hearth, no NPCs. **Length** 60 s.
**Status** new (currently `archive`). Same building, fewer people: the reading-room version of
`hub-main`.

> Instrumental only, no vocals. A hushed reading-room loop. A single nylon-string guitar plays sparse,
> widely spaced notes over a very low sustained cello, with an occasional celeste note like a small
> sound in a large quiet room. Long silences between phrases. 60 BPM in D Dorian. Still, warm,
> hearthside, entirely safe — the one place in the game where nothing is at stake. Close intimate
> recording with a faint sense of a stone room. Steady tempo throughout, no fade in, no fade out.

**Avoid** — mystery, tension, or any implication that the archive is threatened or unstable. This is
the fixed point; it has to sound like one.

### `archive` — the Navigation Table

**Plays on** the `archive` screen: the world map with a marker on every surviving record, and the
only place a case can be launched. **Length** 60 s. **Status** rewrite of the existing `archive` loop.

> Instrumental only, no vocals. An anticipatory loop for standing over a great map table choosing
> where to go. Bowed vibraphone and celeste hold slow shifting chords while a hammered dulcimer picks
> out a four-note figure — a rising fourth, up a step, and back down — over a low sustained cello. A
> slow, even pulse underneath, like a compass needle settling. 66 BPM in D Dorian, deliberately
> unresolved. Expectant and considered rather than exciting: the moment before a decision, not the
> decision itself. Warm, wide, gently resonant. Steady tempo throughout, no fade in, no fade out.

**Avoid** — swashbuckling adventure-map music, ticking clocks, sonar pings, anything that sounds like
a science-fiction instrument panel.

### `travel` — the warp screen, held

**Plays on** the `travel` screen's `ready` phase — after the tunnel and the plate have resolved, while
the ring reads "Synced" and the game waits for the player to press the arrival prompt. **Length** 40 s,
seamless. **Status** new (currently `quiet`).

The timing is fixed in code: a 2000 ms tunnel, then a 2500 ms dwell on the painting, then an
indefinite hold. So `sting-chrono-out` (§7) covers the first 4.5 seconds, and **this pad sits
underneath it and holds for as long as the player looks at the painting.**

> Instrumental only, no vocals. A suspended, weightless drone for a held moment. Two bowed string
> notes a fourth apart, sustained and very slowly swelling against each other, with a distant
> shimmering vibraphone above and a deep soft sub-bass beneath. No melody, no pulse, no rhythm at all.
> Static and patient — a held breath, not a countdown. Warm rather than cold; there is no danger here.
> Wide, slow, long natural decay. Absolutely steady, no fade in, no fade out, no development.

**Avoid** — any pulse or rhythm, rising tension, science-fiction whoosh textures, alarm tones, urgency
of any kind. The player is looking at a painting, not defusing something.

### `upload` — record transmission

**Plays on** the `upload` screen: "Field record transmitting," with the beam animation. **Length** 30 s.
**Status** rewrite of the existing `upload` loop.

> Instrumental only, no vocals. A short, purposeful, gently ascending loop. Celeste and hammered
> dulcimer climb through a rising modal figure in even eighth notes, layered over a warm sustained
> string chord that grows slightly brighter with each pass. A soft mallet marks each phrase. 88 BPM in
> D Mixolydian. Satisfying and industrious without being triumphant — work being completed properly,
> not a victory. Warm, bright, close. Steady tempo throughout, no fade in, no fade out.

**Avoid** — fanfare, cymbal crash, science-fiction data-transfer bleeps, a big final chord.

### `completion` — the unit archived

**Plays on** the `completion` screen at the end of a unit. **Length** 45 s. **Status** new (currently
`quiet`).

> Instrumental only, no vocals. A warm, settled closing piece for a small chamber ensemble. The
> four-note motif — a rising fourth, up a step, and back down — is stated once by the full group,
> unhurried, then handed to a solo cello which lets it fade into a long sustained chord. Hammered
> dulcimer and celeste decorate lightly underneath. 64 BPM in D Dorian. The feeling is satisfaction
> and a slight opening outward rather than triumph: something has been preserved, and there is more to
> do. The last chord should be warm but inconclusive — it must not sound like an ending. Rich, close,
> wooden. No fade in.

**Avoid** — a full authentic cadence, brass, cymbals, a key change into major, any "you won" gesture.
The player preserved a record; they did not defeat anything.

---

## §3 · The seven field maps

The core of this document, and the biggest single improvement available: six of these seven maps
currently share one loop.

Each map gets its own track, instrumented from what would actually have been heard in that place in
that year, and each quotes the Chronicle motif in one period instrument so the set still reads as one
score.

| Unit | Proposed key   | Place and year                                 | Currently    |
| ---- | -------------- | ---------------------------------------------- | ------------ |
| 1    | `island`       | A Caribbean island, 1492–93                    | `island`     |
| 2    | `riverbend`    | Chesapeake tidewater, Virginia, 1619–1630      | `settlement` |
| 3    | `philadelphia` | Philadelphia, 1770s                            | `settlement` |
| 4    | `canal`        | An Erie Canal boomtown, upstate New York, 1845 | `settlement` |
| 5    | `richmond`     | Richmond, Virginia, 1864                       | `settlement` |
| 6    | `railhead`     | Cottonwood Junction, Kansas, June 1873         | `settlement` |
| 7    | `port`         | Ellis Island, New York Harbor, 17 April 1907   | `settlement` |

Three things every field track must respect:

- **A field track belongs to its era and place first.** A map carries at most two Chronicle-frame
  details, and a student who finishes a map should have learned a period, not a plot. None of these
  seven should sound like time travel.
- **Length matters more here than anywhere else.** These play for twenty or thirty minutes at a
  stretch. Generate 60 s, keep the least melodic take, and resist anything hummable.
- **Arrival is not danger.** Observation is free in this game's rules. No map opens on tension.

### `island` — Unit 1 · a Caribbean island, 1492–93

> _"Anchor holds. Two peoples are counting the same shoreline, and only one of them is writing it
> down."_

**The map** — a Taíno village and conuco garden, a Spanish landing camp along the shore, three ships
anchored offshore, dirt footpaths through the palms. **Length** 60 s. **Status** rewrite of `island`.

The two-cultures idea lives in the _arrangement_: the Taíno material is present, close and playing;
the Iberian material is distant, intermittent, and offshore.

> Instrumental only, no vocals. A warm, unhurried exploration loop for a top-down pixel-art history
> game. Taíno-rooted percussion carries it — a güiro scrape, gourd rattles, and a soft low slit-log
> drum in a gentle rolling 6/8 lilt — under a breathy cane flute playing a rising-and-falling
> pentatonic figure in D. Once per phrase the flute states a simple four-note motif: a rising fourth,
> up a step, and back down. Far underneath and much quieter, a single Iberian gut-string vihuela chord
> enters every second or third phrase only, as if carried across water from a ship anchored offshore.
> 84 BPM. Sparse, with plenty of air between phrases. Sunlit, open and curious rather than tense.
> Close-mic'd dry acoustic recording, minimal reverb. Steady tempo throughout, no fade in, no fade out.

**Avoid** — orchestral strings, brass, synthesizers, steel drums or any tropical-resort cliché,
cinematic percussion, a discovery fanfare, ominous low drones. Nothing here is about to go wrong yet.

### `riverbend` — Unit 2 · Chesapeake tidewater, Virginia, 1619–1630

> _"Anchor holds. A wall, a wharf, and everyone inside them arguing about who owes whom what."_

**The map** — a palisaded settlement on a wooded river bend: meetinghouse, clapboard dwellings, barn,
fenced tobacco plots, a wharf below the bluff, cleared fields running back into the trees. **Length**
60 s. **Status** new (currently `settlement`).

Three peoples are on this map and all three belong in the music: the English inside the palisade, the
Powhatan of Tsenacommacah beyond the treeline, and the Angolan labourers who arrive in 1619. The
English material is the loudest because it is the one writing things down — which is the point, not an
endorsement.

> Instrumental only, no vocals. A plain, working loop for an early colonial river settlement. An
> English consort leads: a treble recorder and two viols playing a square, hymn-like tune with no
> ornament, joined by a small tabor drum keeping a flat walking pulse. The recorder states a simple
> four-note motif once per phrase — a rising fourth, up a step, and back down. From further off, a
> gourd rattle and a cane flute answer in a different rhythm that never quite lines up with the
> consort. Underneath everything, very quiet, a plucked lamellophone repeating a short cyclic figure.
> 74 BPM in D Dorian. Austere, damp, industrious; unglamorous and a little cold. Dry period recording
> with a sense of open air and trees. Steady tempo throughout, no fade in, no fade out.

**Avoid** — Renaissance-faire jollity, sea shanties, Celtic fiddle, harpsichord (too urban and too
late for this), orchestral warmth, any sense of adventure or frontier romance.

> **A dating discrepancy, flagged not fixed.** The two art-pipeline headers for this map —
> `content/maps/riverbend-field.palette.js` and `scripts/generate-riverbend-tmj.js` — both describe it
> as "a New England river settlement, ~1620s". The campaign content in `content/unit-02-campaign.js`
> places it in the **Chesapeake tidewater, Virginia, 1619–1630**: tobacco, headright, Tsenacommacah,
> Angolan labourers, Jamestown letters. The campaign is authoritative and the two art comments are
> stale. This prompt is written to the Chesapeake. Correcting those comments is a separate, unrelated
> change.

### `philadelphia` — Unit 3 · Philadelphia, 1770s

> _"Anchor holds. A city printing the argument faster than anyone in it can finish having it."_

**The map** — a Revolutionary-era town square: the brick statehouse and clock tower, a print shop, a
chapel and churchyard, market stalls, a liberty pole, the Delaware waterfront with piers and masts.
Cobbled, paved, busy. **Length** 60 s. **Status** new (currently `settlement`).

The one map whose _rhythm section is a machine_. A hand press pulls roughly one sheet every few
seconds, and that is the pulse of the town.

> Instrumental only, no vocals. A busy, articulate loop for a colonial American city street. A
> harpsichord plays a brisk, clean, contrapuntal figure in a galant eighteenth-century style, doubled
> lightly by a baroque flute. Underneath, the percussion is mechanical rather than musical: the heavy
> regular thump and creak of a wooden printing press, plus a rope-tension side drum tapping a quiet
> military cadence some distance away. A fife plays a short bright phrase across the top every few
> bars, out in the street, never resolving into a recognisable tune. The harpsichord states a
> four-note motif — a rising fourth, up a step, and back down — once per phrase. 96 BPM in D
> Mixolydian. Energetic, argumentative, crowded and civic; not martial, not yet at war. Dry, close,
> period-instrument recording. Steady tempo throughout, no fade in, no fade out.

**Avoid** — quoting any actual patriotic tune, orchestral pomp, a full fife-and-drum march, triumphal
brass, anything that takes a side. The argument is still being had.

### `canal` — Unit 4 · an Erie Canal boomtown, upstate New York, 1845

> _"Anchor holds. The lock lifts a loaded boat by hand. Everything else here is an argument about who
> paid for it."_

**The map** — a stone-lined canal with a working lock and brass winding gear, moored cargo barges, a
water-powered flour mill, brick shopfronts and a free bank, a reform square with a church and meeting
hall, terraced immigrant housing. **Length** 60 s. **Status** new (currently `settlement`).

This is the most cheerful map in the game, and the cheer is the point: a boomtown believes in itself.
The reform square gives it its counter-melody.

> Instrumental only, no vocals. A bright, rolling, working-town loop for an American canal boomtown.
> A fiddle and a hammered dulcimer carry a lively reel-adjacent figure together, with an Irish tin
> whistle weaving above and a plucked banjo keeping a steady rolling pattern underneath. Percussion is
> the place itself: mule bells at a walking pace and the soft continuous rush of water over lock
> gates. Every second phrase a small pump organ enters underneath with a plain shape-note hymn line,
> squarer and slower than everything above it, as if heard through the door of a meeting hall. The
> fiddle states a four-note motif — a rising fourth, up a step, and back down — once per phrase. 104
> BPM in G Mixolydian. Optimistic, industrious, slightly overcrowded; a town certain it is going
> somewhere. Warm, dry, close acoustic recording. Steady tempo throughout, no fade in, no fade out.

**Avoid** — bluegrass or any twentieth-century country idiom, minstrel-show pastiche, orchestral
Americana, hoedown clichés, saloon honky-tonk piano (wrong decade and wrong state).

### `richmond` — Unit 5 · Richmond, Virginia, 1864

> _"Anchor holds. A capital running a war on paper it is also running out of."_

**The map** — a columned capitol on a green hill above brick government offices, a price board, a
hospital ward with tents, the Tredegar ironworks stack, cranes and cargo on a paved quay, the James
River and the falls below. **Length** 60 s. **Status** new (currently `settlement`).

**Richmond does not burn until April 1865.** In 1864 the city is intact, overcrowded and overbuilt —
this is not rubble-and-ashes scoring. The war is present as _shortage and strain_, not destruction.

> Instrumental only, no vocals. A strained, genteel loop for a wartime southern capital that has not
> been damaged but is running out of everything. A parlor piano, slightly out of tune and played
> softly, works through a sentimental period drawing-room melody. A solo cornet answers it from
> further away, unaccompanied and a little flat. Underneath, a muffled military side drum keeps a slow
> dead-march pulse, and a low sustained industrial hum — a distant furnace and river falls — never
> stops. What would be a full brass band is reduced to that one cornet. The piano states a four-note
> motif — a rising fourth, up a step, and back down — once per phrase. 60 BPM in D minor, though it
> never cadences. Dignified, tired, and quietly desperate; keeping up appearances. Close, dry, with
> real room noise. Steady tempo throughout, no fade in, no fade out.

**Avoid** — quoting "Dixie" or any Confederate tune, battle music, cannon, orchestral tragedy,
horror-movie strings, rubble ambience, anything mournful enough to read as sympathy for the regime.
The record here is being kept _by_ the government the player is investigating.

### `railhead` — Unit 6 · Cottonwood Junction, Kansas, June 1873

> _"Anchor holds. A town the survey drew before anyone arrived to live in it."_

**The map** — the line runs east–west across the whole map. North of it is the town, where paper is
made and kept: depot, land office, telegraph office, town-site office, store. South of it is what the
paper is for: the Kanza village on the creek, the hide yard, the graders' camp, the stock pens.
Tallgrass prairie, bluestem, cottonwood. **Length** 60 s. **Status** new (currently `settlement`).

The composition of the map should be the composition of the track: **the town's music and the Kanza
music are on either side of the line, in different tempos, and the town cannot hear the other one.**
The Kanza leave in June; the Panic breaks in September. The town is booming on a printed page and
nervous in conversation.

> Instrumental only, no vocals. A wide, open, slightly lonely loop for a new prairie railhead town.
> A single fiddle plays a spare, unhurried tune with a lot of open string, joined by a jaw harp and a
> softly strummed guitar. There is far more space than sound. The pulse comes from a telegraph key
> tapping an irregular pattern and, further off, the slow idle breathing of a locomotive taking water.
> Continuous quiet wind through tall grass underneath everything. Separately, very distant and in a
> different unrelated tempo, a cedar flute and a soft water drum play their own phrase, never
> synchronising with the fiddle and never getting louder. The fiddle states a four-note motif — a
> rising fourth, up a step, and back down — once per phrase. 80 BPM in G Mixolydian. Optimistic on the
> surface with something unsettled underneath; big sky, thin population. Dry, wide, very little
> reverb. Steady tempo throughout, no fade in, no fade out.

**Avoid** — spaghetti-western guitar and whistling, Hollywood "Indian" tom-tom-and-fifths cliché,
harmonica wailing, cowboy campfire music, orchestral frontier grandeur, cacti-and-desert scoring. This
is Kansas tallgrass, not Monument Valley.

### `port` — Unit 7 · Ellis Island, New York Harbor, 17 April 1907

> _"Anchor holds. Everyone on this quay was written down in Europe before anyone here looked at them."_

**The map** — the brick reception building across the whole north edge, a paved and lamped forecourt,
one wrought-iron rail with a single gate, then the wharf with baggage and waiting families, then the
Upper Bay and two timber piers. 11,747 people came off the barges that day. **Length** 60 s.
**Status** new (currently `settlement`).

The deliberate inversion of Unit 6: Cottonwood Junction's line could be walked across; **this one
cannot.** So where `railhead` is open and thin, `port` is dense and procedural — warm and human on
top, orderly and impersonal underneath.

> Instrumental only, no vocals. A crowded harbour loop for a great immigration station. Four folk
> traditions play near each other without quite playing together: a Central European button accordion,
> a klezmer-inflected clarinet, a southern Italian mandolin tremolo, and a plucked upright bass walking
> beneath them. They share a tempo but not a phrase, so the texture overlaps and crowds. Under all of
> it, a low sustained steam-whistle drone and a slow, absolutely even pulse, like a queue advancing.
> The clarinet states a four-note motif — a rising fourth, up a step, and back down — once per phrase.
> 96 BPM in D minor, unresolved. Warm, human and hopeful on the surface; orderly, procedural and
> indifferent underneath. Period acoustic recording character, no modern polish. Steady tempo
> throughout, no fade in, no fade out.

**Avoid** — sentimental immigrant-saga film scoring, a solo violin lament, orchestral strings, the
Statue of Liberty gesture, patriotic swell, anything triumphal or anything tragic. The day is
administrative, and that is what makes it what it is.

---

## §4 · Interiors — optional, and currently unplayable

> **Read this before generating any of the eight.** Interiors deliberately do not get their own music
> today. `sceneForMusic()` reads the _outdoor_ map's scene even when the player is inside a room,
> because "an interior is a room in that town, not a change of place, and stepping through a door
> should not restart the score" — see [`0048-field-interiors.md`](../decision-log/0048-field-interiors.md).
> Every interior does declare a `musicScene` field, but only for shape parity with outdoor maps, and
> nothing ever reads it.
>
> **These eight tracks would not play.** Generate them only if that decision is revisited. They are
> written here so the list is complete, and because a couple of these rooms are strong enough that
> they might justify revisiting it.

All eight are **reduced arrangements of the parent map's theme** — same motif, same key, fewer
instruments, and an interior acoustic (close walls, no wind, no crowd). The shared prompt stem:

> Instrumental only, no vocals. A reduced interior arrangement of [parent theme]: the same modal
> material and the same four-note motif — a rising fourth, up a step, and back down — played by one or
> two instruments only, in a small room with close walls. Quieter, slower and more spacious than the
> outdoor version. No wind, no crowd, no exterior ambience. Steady tempo, no fade in, no fade out.

| Room                         | Unit | What it is                                                                                                                                                                            | The one thing the arrangement should say                                                                                                                                                                     |
| ---------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Printing office**          | 4    | Partisan newspaper and jobbing shop: iron hand press, two compositor's cases, a stove, the editor's desk and safe                                                                     | Keep the press thump from `canal` and drop almost everything else — in here the machine is the only instrument. Add the fine irregular click of type being set.                                              |
| **Boardinghouse**            | 4    | Curtained sleeping alcove with three rope beds, a flagged kitchen end, a common room with boarding tables. Boat crews, Irish diggers, a temperance visitor                            | Solo tin whistle and a quiet fiddle, close and tired, at the end of a working day. The reform hymn from `canal` never enters here.                                                                           |
| **Counting room**            | 5    | A slave-trading commission house in Shockoe Bottom: panelled office, clerks' writing table, iron safe, bound ledgers, longcase clock                                                  | **Nothing theatrical.** No menace, no low drone, no horror. A longcase clock, a pen, and a single sustained cello note. It should sound like a well-run office, because that is the whole point of the room. |
| **Chimborazo ward**          | 5    | Long whitewashed hospital room, sash windows, two ranks of empty made-up camp cots, linen press, the matron's register                                                                | The `richmond` parlor piano alone, very quiet and far away, in a room with a hard echo. Non-graphic throughout, as the room itself is.                                                                       |
| **Land office**              | 6    | United States district land office: counter with an iron rail and one gate, register's desk, plat table, tract books, floor safe                                                      | The `railhead` fiddle reduced to long held open strings, over the scratch of a pen and the settle of a heavy book. The prairie wind is gone the moment the door shuts.                                       |
| **Telegraph office**         | 6    | Western Union office: railed instrument table, message file, message window, public benches. **No clock, on purpose** — standard time is not until 1883                               | The telegraph key from `railhead` promoted to lead instrument, with a jaw harp answering it. Deliberately no clock tick and no steady pulse — nothing in this room agrees on what time it is.                |
| **Reception hall**           | 7    | The registry floor: pale-tiled hall crossed by two iron railings whose gates are at opposite ends, so it is walked as a switchback. Two registry desks, a money exchange, public pens | The `port` queue-pulse alone, in a huge tiled room with a long hard reverb, with the four folk instruments reduced to distant fragments. The procedure has won; the music has not.                           |
| **Board of special inquiry** | 7    | Committee room: herringbone parquet, panelled wainscot, carpet, a long table with empty chairs, a clerk's table, a longcase clock, bound minute books                                 | Almost silence. A longcase clock, a carpeted room tone, and one sustained low note. The nicest room in the building is the one where the decision is made, and it should be the quietest thing in the game.  |

---

## §5 · Systemic screens

Nine tracks for the screens that are not places. These are all **beds** — they play under reading,
writing, and clicking, and every one of them should be less interesting than the field tracks.

### `dialogue` — a conversation is open

**Plays on** `field` while an NPC conversation is open. **Length** 40 s. **Status** rewrite of
`dialogue`. Dialogue is written one idea per box with real pauses, so this must be gap-tolerant.

> Instrumental only, no vocals. A very thin conversational underscore. Two sustained notes a fourth
> apart on bowed vibraphone, with a single soft plucked note marking long irregular intervals. Almost
> nothing happens. 60 BPM, modal and unresolved. Attentive and neutral — it should not colour what is
> being said, sympathetically or otherwise. Close and quiet, no reverb tail. Steady, no fade in, no
> fade out.

**Avoid** — melody, emotional shading, string swells, anything that tells the player how to feel about
a speaker. Several of these people are lying.

### `desk` — the activity engines

**Plays on** `interview`, `assembly`, `discrepancy`, `trace`. **Length** 60 s. **Status** new
(currently `archive`). This is desk work on a record — the four engines are the same posture.

> Instrumental only, no vocals. A focused, quietly industrious work loop. A muted felt piano repeats a
> short cyclic figure with small variations, over a low sustained cello and the faint regular sound of
> paper being handled. A bowed vibraphone holds one long note that changes about once every eight bars.
> 72 BPM, modal, no resolution. Absorbed and steady — concentration, not tension. Close, dry, small
> room. Steady tempo throughout, no fade in, no fade out.

**Avoid** — puzzle-game tension, ticking, a timer feel, anything that implies a wrong answer is
costly. These are not timed.

### `desk-interview` — optional variant

**Plays on** `interview` only, if you want the one conversational engine to feel different from the
three document engines. **Length** 60 s. **Status** new and optional.

> As `desk`, but replace the paper handling with longer silences and give the felt piano a slower,
> more questioning phrase that ends unfinished each time. Slightly warmer. Same tempo and key so the
> two tracks are interchangeable mid-session.

### `source` — the record reader

**Plays on** `source`. **Length** 45 s. **Status** new (currently `quiet`). A student is reading a
primary source; nothing should compete with that.

> Instrumental only, no vocals. Near-ambient reading music. One very low sustained string note and a
> single celeste note that recurs every fifteen or twenty seconds. No pulse, no melody, no development
> whatsoever. Warm, still, and almost unnoticeable. Long decays. Absolutely steady, no fade in, no
> fade out.

**Avoid** — everything. If it is noticeable it is wrong.

### `writing` — extended written work

**Plays on** `archive-challenges` and `review` — the unit's SAQ and DBQ. **Length** 60 s. **Status**
new (currently `quiet`). Deliberately boring: a student may sit here for twenty minutes composing an
argument.

> Instrumental only, no vocals. A completely static, warm ambient bed for sustained concentration. Two
> or three low sustained string notes in a stable open chord, very slowly breathing against each other,
> with a barely audible warm room tone underneath. No rhythm, no melody, no change of any kind. Calm,
> spacious and neutral. Long, slow, absolutely steady. No fade in, no fade out.

**Avoid** — any event at all. No swells, no entries, no chord changes.

### `practice` — practice and prediction

**Plays on** `practice-check` and `investigation`. **Length** 45 s. **Status** new (currently `quiet`).

> Instrumental only, no vocals. A light, low-stakes loop. Celeste and plucked nylon-string guitar
> trade a small, gentle, slightly playful figure over a soft sustained pad. 84 BPM, modal, warm.
> Encouraging and unpressured — practice, not assessment. Close and bright. Steady tempo, no fade in,
> no fade out.

**Avoid** — quiz-show urgency, timers, tension, anything that raises the stakes.

### `browse` — collection and progress

**Plays on** `codex`, `mastery`, `archive-rotation`. **Length** 60 s. **Status** new (currently
`quiet`). The player is looking at what they have collected — this is the badge-case feeling.

> Instrumental only, no vocals. A warm, satisfied browsing loop. Hammered dulcimer plays a gently
> rolling pattern over a sustained cello, with celeste accents, and states the four-note motif — a
> rising fourth, up a step, and back down — about once per phrase. 76 BPM in D Dorian. Pleased,
> unhurried, a little proud, without ever becoming a fanfare. Warm and close. Steady tempo, no fade in,
> no fade out.

**Avoid** — triumph, achievement-unlocked shimmer, anything that celebrates rather than reflects.

### `reconstruction` — the Record Reconstruction

**Plays on** `reconstruction` — the signature end-of-field activity, where every secured record is
filed into the lane it belongs in. **Length** 60 s. **Status** new (currently `archive`). The one
systemic track allowed to build.

> Instrumental only, no vocals. A gathering, assembling loop. It begins with a solo hammered dulcimer
> and adds one instrument each time the phrase repeats — cello, then celeste, then a warm string pad —
> until the full small ensemble is playing the four-note motif together. The motif is a rising fourth,
> up a step, and back down. 78 BPM in D Dorian, and it still does not resolve. Purposeful and
> accumulating: pieces coming together into something that holds. Warm, close, wooden. Steady tempo
> throughout, no fade in, no fade out.

**Avoid** — a final cadence, a climax, cymbals. It accumulates; it does not arrive.

### `arcade` — the mini-games

**Plays on** `mini-games` — Storm Navigation and Cargo Sorting. **Length** 60 s. **Status** new
(currently `archive`). Explicitly a pacing break, not scored, not required. The one genuinely playful
track in the game, and the one place the retro-game register can come forward.

> Instrumental only, no vocals. A bright, bouncy, retro-flavoured game loop. A chiptune-style square
> lead plays a cheerful hopping melody over a plucked bass and a light shaker pulse, with a hammered
> dulcimer doubling the lead so it still belongs to this game's palette. 132 BPM, major and
> unambiguously happy — the only track here allowed to resolve. Bright, punchy, close. Steady tempo,
> no fade in, no fade out.

**Avoid** — nothing much; this is the release valve. Keep it short-looping and keep the dulcimer in so
it does not sound imported from another game.

### Screens with no music, on purpose

`join`, `login`, `teacher-dashboard`, `grading`, and `manage-content-case` are teacher and account
surfaces. They get **silence** — they are administration, not the game, and a teacher grading twenty
submissions does not want a loop. Listed here so the set reads as deliberate rather than unfinished.

---

## §6 · Meridian and character themes

Three tracks. **Meridian currently has no audio identity at all** — no scene, no sting, nothing — and
of everything in this document it is the largest hole.

### `meridian` — the Meridian Institute

**Plays on** Meridian-associated scenes; currently only the Unit 6 reveal, with more to come in Units
7–9. **Length** 60 s. **Status** new.

The whole idea, from [`MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md): **Meridian
is not a villain.** Chronicle believes the record must survive to be argued with; Meridian believes
that knowing better obliges you to act. The visual difference between them is _resources and upkeep_,
not geometry — Chronicle is an old converted building that has been mended; Meridian is purpose-built,
polished, matched, and recently funded. The art is meant to make a player uneasy about which of them
they are standing in _before_ any dialogue says so.

So the strongest available move is **the same motif in a different housing**: Meridian plays
Chronicle's four notes, but newer, larger, better lit, and faintly too precise.

> Instrumental only, no vocals. An elegant, controlled, well-funded loop for a purpose-built
> institution. The same four-note figure Chronicle uses — a rising fourth, up a step, and back down —
> but played by a matched group of bowed strings in unison, perfectly in tune and perfectly together,
> over a polished brass-toned bell and a deep even pulse that never varies by a fraction. Everything is
> exactly on the beat. A dark, warm, gaslit low register underneath. 72 BPM, the same key as the
> Chronicle theme, still unresolved. Elegant, confident, orderly, and just slightly too precise to be
> comfortable — impressive rather than threatening. Rich, wide, expensive-sounding recording, in
> contrast to Chronicle's dry close wooden one. Steady tempo, no fade in, no fade out.

**Avoid** — villain scoring of every kind: minor-key menace, low brass stabs, distorted synths, choir,
ticking, red-alert tension, science-fiction textures. Nothing here is evil. The unease should come
entirely from how _well maintained_ it sounds next to Chronicle.

**How it should age.** Meridian's arc across the game runs _improvised → confident → wealthy →
divided → exposed_, and its own members notice the decline. If you generate variants later, degrade in
that direction: the unison strings gradually stop being quite in unison, and the perfect pulse
develops a small drag. **It must never become a horror cue.**

### `voss` — Emery Voss, the Field Liaison

**Plays on** her scripted beats. **Length** 45 s. **Status** new.

Voss is direct, observant, comfortable saying she does not know, and she responds to historical
suffering as suffering — which the Director does not. Her reveal is scored in the shipped game with the
warm `codex-reveal` evidence cue, **not** a betrayal sting, and that is the tonal instruction: the
emotional weight comes from the relationship having been real. The player should finish the game unable
to say cleanly that she was wrong.

> Instrumental only, no vocals. A warm, direct, slightly wistful theme for a solo instrument. A cello
> plays a simple singing line, unaccompanied at first, then joined by a nylon-string guitar. The line
> is plain and unornamented — nothing clever, nothing withheld. Underneath, entering only in the second
> half and very quietly, one sustained note from a different, cooler-toned instrument that does not
> quite belong to the same ensemble, and does not resolve with it. 68 BPM in D Dorian. Sympathetic,
> honest, and unresolved — a person you trust who is carrying something. Close, warm, intimate. Steady
> tempo, no fade in, no fade out.

**Avoid** — a betrayal sting, a minor-key twist, sinister reharmonisation of her own theme, tragic
strings. Her theme stays sympathetic. The shadow is one note underneath it, not a swap.

### `director` — Rowan Hale

**Plays on** his scripted beats, including the orientation walk. **Length** 40 s. **Status** new and
lowest priority of the three.

Precise, controlled, protective, sincere. Never smug, never cruel, never a villain reading his own
indictment.

> Instrumental only, no vocals. A measured, formal theme for a small string group. Even, deliberate
> phrasing with clean articulation and no rubato at all, stating the four-note motif — a rising fourth,
> up a step, and back down — with unusual care. A low cello anchors it. 64 BPM in D Dorian. Controlled,
> sincere, protective; the sound of someone who has thought carefully about the thing he is about to
> say. Warm but formal. Close, dry. Steady tempo, no fade in, no fade out.

**Avoid** — pomposity, authority-figure brass, anything smug or cold. He is not the antagonist either.

---

## §7 · Lyria stingers

Ten short musical one-shots. These are the cues Lyria _can_ do — they are music, just brief.

Durations are taken from the code, not guessed. Where a sting replaces an existing procedural cue,
that is named so the later swap is mechanical.

**A rule for all ten:** a stinger has to land on top of a music bed with no ducking, so keep them
**bright and thin rather than loud and wide.** Leave the low midrange alone; that is where the beds
live.

### `sting-chrono-out` — Chronotravel departure

**Fires on** `goToCase()` — the moment a case is launched from the Navigation Table. **Length** 4.5 s
in two parts. **Replaces** the `chrono` cue.

The warp screen's timing is fixed: a 2000 ms tunnel, then a 2500 ms dwell on the destination painting.
Write to those two beats exactly. Underneath, the `travel` pad (§2) takes over and holds.

> Instrumental only, no vocals. A two-part transition cue, 4.5 seconds total. For the first two
> seconds: a rising, accelerating shimmer of struck metal and bowed strings sweeping upward together,
> gathering speed and then easing off — motion, not impact, and no percussion hit. Then at two seconds
> it opens out into a warm sustained chord on strings and celeste, which settles and holds for the
> remaining two and a half seconds, resolving into stillness rather than into a cadence. Awe and
> arrival. No fade in. Let the final chord ring naturally.

**Avoid** — a riser-and-impact, a whoosh-boom, a sub-bass drop, alarm tones, anything that sounds like
danger or like a portal. Travel in this game is routine and permitted.

### `sting-return-warp` — recall to the Archive

**Fires on** the recall chrome action and on filing a field record home. **Length** 2.5 s. **Replaces**
the `return-warp` cue, which already has a resolving chord at 1.52 s — keep that shape.

> Instrumental only, no vocals. A short descending arrival cue, 2.5 seconds. A gentle downward sweep of
> celeste and bowed strings over about a second, settling into a warm, fully resolved chord on
> hammered dulcimer and cello that rings for the rest. Coming home; relief and completion. Warm and
> close. No fade in.

**Avoid** — anything ominous. This is the one cue in the game allowed a clean resolution, because the
Archive is the fixed point.

### `sting-record-filed` — a record is secured

**Fires on** `secure-source` — filing a record into the case evidence, and the most-heard cue in the
game. **Length** 0.6 s. **Replaces** `secure`.

> Instrumental only, no vocals. A very short, bright, satisfying confirmation: three quick ascending
> notes on celeste and a soft struck woodblock, over in six tenths of a second. Clean, small, and
> pleasant to hear a hundred times. No reverb tail.

**Avoid** — length, reverb, melody, anything that would become tiresome. Test it by playing it thirty
times in a row.

### `sting-archive-receive` — the Preservation Case

**Fires on** interacting with the Preservation Case plinth in the Main Hall. **Length** 0.9 s.
**Replaces** `archive-receive`.

> Instrumental only, no vocals. A soft, warm acknowledgement under a second: a low struck dulcimer
> chord with a single bright celeste note above it, decaying naturally. Gentle and unhurried; a display
> case opening, not an award.

### `sting-codex-reveal` — evidence is shown

**Fires on** an image reveal in the Director's intro, **and on the Meridian reveal in Unit 6** — the
same warm cue for both, which is deliberate and is the tonal instruction for Voss's whole arc.
**Length** 1.4 s. **Replaces** `codex-reveal`.

> Instrumental only, no vocals. A slow, ceremonial reveal, 1.4 seconds. A sustained warm string bed
> underneath four unhurried ascending notes on celeste and bowed vibraphone, opening into a broad, open
> chord that rings out. Significant and warm — something is being shown to you in confidence. Wide and
> resonant. No fade in.

**Avoid** — a discovery sparkle, a mystery sting, anything sinister. This cue plays at the moment the
player learns the most unsettling thing in the game so far, and it must stay warm. That contrast is the
scene.

### `sting-upload` — transmission complete

**Fires on** a correct reconstruction, and on an Archive Challenge flipping to complete. **Length**
1.5 s. **Replaces** `upload`.

> Instrumental only, no vocals. A brief ascending completion cue, 1.5 seconds: celeste and hammered
> dulcimer climbing five notes into a warm sustained chord on strings. Satisfying and industrious, not
> triumphant. Bright and close. No fade in.

**Avoid** — fanfare, brass, cymbal, a big finish.

### `sting-badge` — an area badge is earned

**Fires on** earning a badge into the Preservation Case. **Length** 3 s. **Status** new — nothing plays
here today. This is the game's Pokémon-badge moment and one of only two places allowed real celebration.

> Instrumental only, no vocals. A warm three-second flourish for a small chamber ensemble: hammered
> dulcimer and celeste run up together into a full, glowing sustained chord on strings, with a single
> soft struck bell at the peak. Proud and generous, but wooden and warm rather than orchestral —
> earned recognition from an institution, not a video-game jingle. Rich and close. No fade in.

**Avoid** — synthetic achievement chimes, brass fanfare, choir, cymbal crash.

### `sting-era-secured` — Era Record Secured

**Fires on** a unit reaching the Era Record Secured state. **Length** 4 s. **Status** new. The largest
cue in the game.

> Instrumental only, no vocals. A four-second closing flourish. The full small chamber ensemble states
> the four-note motif — a rising fourth, up a step, and back down — once, together and unhurried, then
> opens into a wide sustained chord that rings and slowly fades. Warm, complete, and slightly open-
> ended; an achievement that is also a door. Rich, wooden, close, with real room. No fade in.

**Avoid** — a full authentic cadence, timpani, cymbals, anything conclusive. Even the biggest cue in
this game does not fully resolve.

### `sting-mission-complete` — a mission's record is recovered

**Fires on** completing a mission's culminating record. **Length** 2 s. **Status** new.

> Instrumental only, no vocals. A two-second confirmation with a little more weight than a routine
> filing: hammered dulcimer and cello state three ascending notes together, landing on a warm open
> chord that rings briefly. Solid and satisfying, modest in scale. Close and dry. No fade in.

### `sting-anomaly` — something in the record is wrong

**Fires on** encountering a unit's anomaly. **Length** 1.2 s. **Status** new.

Read [`CHRONICLE-CANON.md`](./CHRONICLE-CANON.md) before generating this one. An anomaly is
**archival, not fantastical** — the canonical example is fourteen hogsheads written over a scraped
fifteen, in the wrong hand. _Nothing glows._ It is **observed, not solved**, and the moment it becomes
a puzzle with an answer it stops working.

> Instrumental only, no vocals. A very small, quiet, wrong-sounding moment lasting just over a second.
> The ensemble's warm chord is playing, and one single note enters that does not belong to it — a
> slightly out-of-tune struck string, quiet, close, and unexplained — then everything continues as
> before. No swell, no build, no resolution, no reaction. It should be easy to miss and impossible to
> un-hear.

**Avoid** — horror stings, dissonant string stabs, low drones, reversed audio, a glitch or tape-stop
texture, anything that signals "something supernatural is happening." Also avoid making it _sad_.
Ordinary historical uncertainty is never drift, and this cue must not fire emotionally as if the world
were breaking.

---

## §8 · Non-musical sound effects

Roughly thirty-seven effects that Lyria is the wrong tool for. Generate these with a text-to-SFX tool
(**ElevenLabs SFX** is the best fit) or source them from **Freesound** under CC0 — noting that
licensing was one of the reasons the game went procedural in the first place, so CC0 or generated
assets only, nothing that needs attribution baked into the build.

Some existing procedural cues are genuinely fine and are marked **keep procedural**; replacing them
buys nothing.

**Honesty about what is wired:** of the categories below, only the UI and feedback cues have existing
call sites. **Footsteps, doors, and ambience do not exist in the game at all** — there is no ambient
audio layer and no per-surface movement sound. Those would need engine work in the wiring phase. They
are here because they are the highest-value additions available, not because they are one file away.

### UI (8)

| Id                | Trigger                         | Length | Prompt / verdict                                                                 |
| ----------------- | ------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `sfx-click`       | any button press                | 0.08 s | A single soft, dry click of a wooden button being pressed. Warm, close, no ring. |
| `sfx-hover`       | interactive element focus       | 0.05 s | A very quiet, short paper-brush sound. Barely there.                             |
| `sfx-toggle-on`   | the audio toggle, off → on      | 0.3 s  | **keep procedural** — the existing two-note rise works.                          |
| `sfx-toggle-off`  | the audio toggle, on → off      | 0.3 s  | Currently silent by design; leave it silent.                                     |
| `sfx-panel-open`  | a panel or overlay opens        | 0.25 s | A soft leather-and-paper sound of a folder being opened. Close, dry.             |
| `sfx-panel-close` | a panel or overlay closes       | 0.2 s  | The same folder closing — slightly shorter, slightly lower.                      |
| `sfx-page-turn`   | moving between reader pages     | 0.4 s  | A single sheet of heavy old paper being turned over. Close, dry, no room.        |
| `sfx-refused`     | an action that will not proceed | 0.2 s  | A soft, low, non-punitive wooden knock. Not a buzzer, not an error tone.         |

### Movement — footsteps by surface (8)

Each is **one footstep**, mono, very dry, with **four to six variations** so the walk cycle does not
machine-gun. Keep them quiet: the player walks constantly.

| Id                    | Surface                              | Prompt                                                                                    |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `sfx-step-sand`       | Unit 1 shoreline                     | A single barefoot step on dry loose sand. Soft, granular, no impact.                      |
| `sfx-step-dirt`       | Units 1–2 and 4 paths, Unit 6 street | A single boot step on packed dry earth. Dull, close, a little grit.                       |
| `sfx-step-cobble`     | Unit 3 and Unit 7 streets            | A single hard shoe step on rounded cobblestones. Sharp, small, dry.                       |
| `sfx-step-plank`      | Unit 4 towpath bridge, Unit 7 wharf  | A single boot step on a hollow wooden boardwalk plank. Slight resonance underneath.       |
| `sfx-step-gravel`     | Unit 6 track ballast, Unit 7 wharf   | A single boot step on coarse gravel. Crunchy, sharp, no reverb.                           |
| `sfx-step-stone-wet`  | Unit 7 quay                          | A single hard shoe step on wet stone paving. Slightly slapping, a small room reflection.  |
| `sfx-step-floorboard` | all wooden interiors                 | A single shoe step on an old wooden floorboard indoors. A faint creak on some variations. |
| `sfx-step-tile`       | the Unit 7 reception hall            | A single hard shoe step on a large tiled hall floor, with a long hard reflection.         |

### Doors (4)

Two archetypes across the eight interiors, plus the Institute's own.

| Id                     | Where                                                                 | Length | Prompt                                                                                                 |
| ---------------------- | --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `sfx-door-wood-open`   | print shop, boardinghouse, land office, telegraph office              | 0.7 s  | A simple plank door with an iron latch being lifted and pushed open. Dry, close, a small creak.        |
| `sfx-door-wood-close`  | the same                                                              | 0.6 s  | The same door pulled shut and the latch dropping.                                                      |
| `sfx-door-heavy-open`  | counting room, hospital ward, reception hall, inquiry room, Institute | 0.9 s  | A heavy panelled door with a brass handle opening into a larger room. A little reverb on the far side. |
| `sfx-door-heavy-close` | the same                                                              | 0.8 s  | The same door closing solidly, with the handle returning.                                              |

### World ambience beds (8)

**The highest-value items in this document after the field music.** These loop _under_ the music and
are what will actually make the maps feel inhabited. 30 s each, seamless, stereo, mixed well below the
music.

| Id                 | Map                 | Prompt                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `amb-shore`        | Unit 1              | Gentle small waves on a sheltered tropical shore, with unhurried seabirds and a soft breeze through palm fronds. No music, no voices, no gulls screaming.                                                                                                                                                 |
| `amb-riverbend`    | Unit 2              | A slow wide river at a wooded bend: water moving past a bank, wind in leaves, songbirds and crows at the treeline, a distant axe on wood every so often. No voices.                                                                                                                                       |
| `amb-street-1770s` | Unit 3              | A busy pre-industrial city street: many footsteps on cobbles, iron-rimmed cart wheels passing, indistinct crowd murmur too far off to make out words, a church bell in the distance, gulls from the river. No engines.                                                                                    |
| `amb-canal`        | Unit 4              | Water spilling steadily over closed timber lock gates into a canal basin, heard from the towpath a few metres away — a continuous mid-weight rush with an irregular wooden knocking underneath as a moored boat shifts against the wall. Mule bells and a millwheel further off. No birdsong, no voices.  |
| `amb-richmond`     | Unit 5              | A crowded wartime city under strain: a distant heavy industrial furnace and hammering, river falls below, cart traffic on paving, a low unintelligible crowd, and a very distant dull artillery report every twenty or thirty seconds — far enough away that nobody reacts to it. No shouting, no combat. |
| `amb-prairie`      | Unit 6              | Wide open tallgrass prairie wind, constant and unhurried, with meadowlarks and grasshoppers, and a stationary steam locomotive idling and venting at a distance. Occasional cattle. Very few human sounds.                                                                                                |
| `amb-harbour`      | Unit 7              | A crowded harbour wharf: a large multilingual crowd murmuring indistinctly, trunks and bundles being set down on stone, water slapping against timber piles, gulls, and long low steam whistles from ships some distance out. No individual voices audible.                                               |
| `amb-institute`    | the three hub rooms | A quiet interior room tone: a low fire crackling in a hearth some distance away, an occasional settling of wood, and the faintest paper handling. Almost silent.                                                                                                                                          |

### Activity engines (6)

Short, dry, and quiet — these fire on nearly every click inside the four engines.

| Id                | Trigger                         | Length | Prompt                                                                     |
| ----------------- | ------------------------------- | ------ | -------------------------------------------------------------------------- |
| `sfx-pick-up`     | picking up a draggable fragment | 0.12 s | A single sheet of paper being lifted off a desk. Soft, close.              |
| `sfx-place`       | dropping into a valid slot      | 0.15 s | A sheet of paper being set down flat on wood. Soft, definite.              |
| `sfx-snap`        | a fragment locking into place   | 0.1 s  | A small dry wooden click, slightly brighter than a UI click.               |
| `sfx-reject`      | dropping onto an invalid slot   | 0.15 s | A soft paper rustle that stops short. Non-punitive.                        |
| `sfx-log-answer`  | logging an interview answer     | 0.3 s  | A fountain pen writing two or three quick strokes on paper. Close and dry. |
| `sfx-file-record` | filing a completed record       | 0.5 s  | A sheet of paper being slid into a card index and the drawer nudged shut.  |

### Feedback (3)

| Id              | Trigger                      | Length | Prompt / verdict                                                                                                |
| --------------- | ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `sfx-correct`   | a correct practice answer    | 0.35 s | **keep procedural**, or a soft two-note celeste rise. Quiet and encouraging, never a game-show ding.            |
| `sfx-incorrect` | an incorrect practice answer | 0.35 s | A soft, low, neutral wooden tap. **It must not sound like punishment** — being wrong is how the practice works. |
| `sfx-unlock`    | a case or route unlocking    | 0.6 s  | A brass latch turning and releasing on a wooden case. Warm, mechanical, satisfying.                             |

---

## §9 · Production order

Generate in this order. Each batch is a coherent listening session, and each one is worth shipping on
its own.

| Batch | What                                                       | Why first                                                                                                                                 |
| ----- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | The seven field maps (§3)                                  | Six of the seven currently share one loop. This is the single biggest change available, and it is where players spend most of their time. |
| **2** | `title`, `hub-main`, `archive` (§2)                        | The three most-heard non-field tracks, and the first impression.                                                                          |
| **3** | `sting-chrono-out`, `sting-return-warp`, `travel` (§7, §2) | The warp is the game's signature transition and currently plays a synthesised sweep over a single held note.                              |
| **4** | The eight ambience beds (§8)                               | Cheap to generate, enormous effect. Layered under batch 1, these are what make a map feel like a place.                                   |
| **5** | The remaining §2 Institute tracks                          | `intro`, `hallway`, `archive-room`, `menu`, `upload`, `completion`.                                                                       |
| **6** | The remaining stingers (§7)                                | `sting-record-filed` first — it is the most-heard cue in the game.                                                                        |
| **7** | The systemic beds (§5)                                     | Deliberately unremarkable, so they can wait.                                                                                              |
| **8** | `meridian`, `voss`, `director` (§6)                        | Needed before Units 8–9 ship, not before then.                                                                                            |
| **9** | Footsteps, doors, activity and UI effects (§8)             | These need engine work to have anywhere to play, so they are last.                                                                        |
| **—** | The eight interiors (§4)                                   | **Do not generate** unless the interior-music decision is revisited. They would not play.                                                 |

### What the wiring phase will need

Out of scope for this document, but worth recording while it is fresh, because the current engine
cannot play any of the above:

- An `apps/web/src/assets/audio/` directory and a loader — `decodeAudioData`, a preload step, and a
  loading state, none of which exist today.
- **Two gain buses** instead of one, so effects can duck the music. Everything currently sums into a
  single master at `0.045`.
- **Fades** on `stopMusic()`, which today just clears the scheduler and lets notes decay.
- A **volume control**, since the only current setting is a binary on/off.
- New `musicScene` keys per §3, plus branches in `sceneForMusic()` for the screens that currently
  fall through to `quiet`.
- A decision on **interior music** if §4 is ever wanted.

None of that should be built speculatively. It is listed so that whoever picks up the wiring phase
knows the shape of it before they start.
