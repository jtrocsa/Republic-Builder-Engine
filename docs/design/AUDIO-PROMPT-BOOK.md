# The Chronicle Audio Prompt Book

Every music track and sound effect the game needs, written as text you can paste straight into a
generator.

Music goes in **Lyria 3 (Gemini)**. Sound effects go in a text-to-sound tool like **ElevenLabs SFX**,
or come from **Freesound** — Lyria makes music, not footsteps.

## How to read this

Each track looks like this:

> ### `key` — Plain name
>
> **Plays:** where you hear it. **Length:** how long to generate. **Status:** new, or what it replaces.
>
> **► PASTE THIS:**
>
> > _This is the only part you copy. Everything else on the page is notes for whoever wires it up._
>
> **Don't want:** things to add if the first result is wrong.

That's it. **Anything after ► PASTE THIS is the prompt.** Everything else is context.

## Before you start

Four things that will save you time:

1. **Lyria won't give you a track that loops cleanly.** Generate 45–60 seconds, then open it in
   Audacity (free), find a spot where the beat lands, cut there, and fade the two ends into each other
   by a few hundredths of a second. Every prompt below already asks for "same speed all the way
   through, no fading in or out" so this is possible. A track that slows down at the end can't loop.
2. **Make three versions of anything important and keep the most boring one.** Exploration music plays
   for twenty or thirty minutes straight. A catchy tune becomes an annoying tune.
3. **Turn your volume down when you judge these.** The game plays audio very quietly. A mix that sounds
   right in Gemini will lose its quiet details in the game.
4. **Keep sound effects out of the low-middle range.** The game has no way to duck the music under an
   effect, so effects need to be bright and thin to be heard over a track.

## What to name the files

| Kind              | Pattern            | Example                      |
| ----------------- | ------------------ | ---------------------------- |
| Music that loops  | `<key>.ogg`        | `island.ogg`, `richmond.ogg` |
| Short musical cue | `sting-<name>.ogg` | `sting-chrono-out.ogg`       |
| Sound effect      | `sfx-<name>.ogg`   | `sfx-lock-water.ogg`         |

Export as OGG. Mono for effects, stereo for music. Make all the loops roughly the same loudness so
changing screens doesn't jump.

## Where the game's audio stands today

So you know what you're replacing:

- Every sound is generated live by a bit of code — beeps from an oscillator. **There are no audio files
  in the project at all.**
- **There are six loops.** Each is four to seven notes played in a row, over and over, identical every
  time.
- **Six of the seven maps share one of them.** Only the Caribbean map has its own. Riverbend,
  Philadelphia, the canal town, Richmond, the Kansas railhead and Ellis Island all play the same thing.
- **About twenty-two of the thirty-two screens play one note every six seconds.** That includes the
  entire opening, the time-travel screen, the document reader, and every question screen.
- **The Meridian Institute has no music at all.**

---

## §1 · The one thing that ties it together

Seven historically accurate scores could easily sound like seven different games. One thing stops that.

### The Chronicle four notes

**A short four-note phrase that shows up everywhere: G, C, D, C.**

It deliberately skips the note that would tell your ear whether it's happy or sad, so it always sounds
slightly unresolved. That's the point — the game is about history staying open to argument.

- The **title theme and the Institute tracks** play it out in full.
- **Every map plays it once per phrase on one period instrument** — a wooden flute in the Caribbean, a
  harpsichord in Philadelphia, a clarinet at Ellis Island. Same four notes, seven different mouths.
- **Meridian plays the same four notes on better equipment.** That's their whole character. See §6.

Every field prompt below already contains the line _"one instrument plays a simple four-note phrase —
G, C, D, C — once per phrase, and never develops it into a tune."_ Leave that line in.

### Nothing resolves

Every music prompt avoids a satisfying, final-sounding ending. The game's closing idea is that history
must stay open to evidence and disagreement, and music that wraps up neatly argues the opposite.

### Five rules the story imposes on the music

These come from the game's story canon and they're not stylistic preferences — breaking them breaks the
fiction.

| Rule                                                      | What it means for a track                                                                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Time travel is allowed and safe                           | **No tension when you arrive somewhere.** Nothing is chasing the player. Arrival is curiosity.                                                     |
| The Archive is the one safe place                         | Archive music is **warm and stable**. Never glitchy, never unstable, never threatened.                                                             |
| A historical "anomaly" is a paperwork error, not magic    | The example in the story is a number scraped off a ledger and rewritten. **Nothing glows.** The anomaly cue is one wrong note, not a horror sting. |
| Normal historical uncertainty is not a supernatural event | Sources disagreeing is normal. Don't score a contradiction as if reality were breaking.                                                            |
| Nobody is the villain                                     | Chronicle and Meridian disagree about ethics. **Neither gets villain music.**                                                                      |

### The universal "don't want" list

Add any of these to a prompt if a result goes wrong:

> glitchy or corrupted sounds, tape-stop effects, ticking clocks, sci-fi shimmer, big riser-then-boom
> trailer sounds, neon synthesizers, sterile spaceship ambience, evil-sounding orchestration, heroic
> brass fanfare, any singing or choir, modern drum kit, pumping/throbbing compression, EDM or dubstep,
> lo-fi hip-hop beats.

### Six phrases to never type

The game bans these outright and there's an automated test enforcing it elsewhere in the project:
_temporal integrity · quantum record · anchor instability · causal resonance · timeline corruption ·
one true timeline._ Don't put them in a prompt or a file name — prompts get copied around and turn into
game text.

---

## §2 · The Institute — 10 tracks

The Chronicle Institute is an old building someone converted: wood panelling, torches on the walls,
stone floors, mended a lot of times, short of money. So its instruments are **wood, brass and paper**.

Four instruments do most of the work, and it's worth knowing what they sound like:

- **Hammered dulcimer** — a box of strings hit with little wooden mallets. Bright, woody, a bit like a
  harp being tapped.
- **Celeste** — a small keyboard that sounds like tiny bells. The Sugar Plum Fairy instrument.
- **Bowed vibraphone** — metal bars played with a violin bow instead of a mallet, so they hum instead
  of ringing. Glassy and sustained.
- **Cello** — usually just holding one long low note underneath everything.

The feeling is patient and institutional. Warm, but holding something back.

### `title` — the title screen

**Plays:** on the animated seal, "CHRONICLE / An AP U.S. History Adventure". **Length:** 75 seconds.
**Status:** new. This is the main theme and the first thing anyone hears — make several versions.

**► PASTE THIS:**

> Instrumental only, no singing. The main theme for a historical adventure game, played by a small
> group of acoustic instruments in a wood-panelled room. It starts with a solo hammered dulcimer
> playing a simple four-note phrase — G, C, D, C — which is then answered by a celeste and picked up by
> a warm string quartet. One long low cello note holds underneath the whole time. The harmony never
> settles into a clearly happy or clearly sad key; it keeps landing just next to home. 72 beats per
> minute, in D minor but unresolved. Patient, curious and quietly grand rather than triumphant — a
> serious institution, not a treasure hunt. Recorded close and dry with a little room sound, no big
> movie reverb. Same speed all the way through, no fading in or out.

**Don't want:** heroic brass fanfare, timpani, movie-trailer drums, a big orchestral swell, a
final-sounding ending, choir, anything like a film studio logo.

### `menu` — the main menu

**Plays:** the screen where you pick student or teacher. **Length:** 45 seconds. **Status:** new.
Same theme as the title, fewer instruments, so the two screens feel like the same room.

**► PASTE THIS:**

> Instrumental only, no singing. A quiet waiting-room version of a chamber theme: a solo hammered
> dulcimer plays a simple four-note phrase — G, C, D, C — with one long low cello note underneath and
> an occasional answer from a celeste. Almost nothing else happens. 66 beats per minute, in D minor but
> never settling. Unhurried, warm, slightly formal, no pressure at all. Dry wooden recording, close
> microphone, hardly any reverb. Same speed all the way through, no fading in or out.

**Don't want:** the melody going anywhere, drums, anything that builds. This track's job is to be
ignored.

### `intro` — the opening sequence

**Plays:** all five opening screens, where the Director recruits you and you make your character.
**Length:** 60 seconds. **Status:** new — these screens are silent right now.

This part of the game is set in the present day, so it's the one Institute track allowed to sound
slightly modern.

**► PASTE THIS:**

> Instrumental only, no singing. Quiet, attentive background music for a present-day briefing. A soft
> felt-muted upright piano plays a slow four-note phrase — G, C, D, C — over long held low strings and
> a faint glassy hum from a vibraphone played with a bow. A single soft mallet marks the start of each
> phrase, like someone setting a page down. 68 beats per minute, in D minor, never resolving. Serious
> and welcoming at the same time: someone explaining important work to a person they've decided to
> trust. Recorded close and intimate, hardly any reverb. Same speed all the way through, no fading in
> or out.

**Don't want:** mystery-thriller tension, a pulsing synthesizer, shivering strings, anything that
sounds like a countdown or a warning.

### `hallway` — the Entrance Hall

**Plays:** the very first room, where you get control and the Director walks you north into the Main
Hall. **Length:** 60 seconds. **Status:** new.

**► PASTE THIS:**

> Instrumental only, no singing. A warm arrival piece for the entrance hall of an old institution. A
> nylon-string guitar and a celeste pass a simple four-note phrase — G, C, D, C — back and forth over a
> soft held cello note. Underneath there's a gentle walking pulse, just a light plucked bass note on
> each beat, so the music moves at the speed of two people walking together. 76 beats per minute, in D
> minor and unresolved. Curious, welcoming, slightly awed — arriving somewhere older and bigger than
> you expected. Warm wooden room sound. Same speed all the way through, no fading in or out.

**Don't want:** grandeur, pipe organ, cathedral echo, any big "crossing the threshold" drama.

### `hub-main` — the Main Hall

**Plays:** the room with Emery Voss, Director Hale, Dr. Soto and Professor Park, the badge case, and
the Navigation Table. **Length:** 75 seconds. **Status:** new.

**This is the most-heard track in the game. Make it the least interesting one.**

**► PASTE THIS:**

> Instrumental only, no singing. A comfortable, lived-in loop for a wood-panelled hall where scholars
> are working. A hammered dulcimer and a nylon-string guitar weave a slow, gently rolling pattern
> together, with a bow-played vibraphone holding long notes above and a low cello underneath. About
> once every two phrases the dulcimer plays a four-note figure — G, C, D, C — and then drops it without
> developing it. 70 beats per minute, in D minor and never resolving. Warm, patient, busy but unhurried
> — a place where people have been doing careful work for a very long time. Dry, close, wooden. Same
> speed all the way through, no fading in or out.

**Don't want:** a catchy hook, key changes, getting louder, anything memorable enough to notice twice.

### `archive-room` — the Archive Room

**Plays:** the side room with the writing desk and the fireplace. No characters in here. **Length:** 60
seconds. **Status:** new. Same building as the Main Hall, fewer people.

**► PASTE THIS:**

> Instrumental only, no singing. A hushed reading-room loop. A single nylon-string guitar plays sparse,
> widely spaced notes over a very low held cello, with an occasional celeste note like a small sound in
> a big quiet room. Long silences between phrases. 60 beats per minute, in D minor. Still, warm, by the
> fireside, completely safe — the one place in the game where nothing is at stake. Recorded close and
> intimate with a faint sense of a stone room. Same speed all the way through, no fading in or out.

**Don't want:** mystery, tension, or anything hinting the archive is in danger. This is the safe place
in the story and it has to sound like it.

### `archive` — the Navigation Table

**Plays:** the world map screen where you choose which case to travel to. **Length:** 60 seconds.
**Status:** replaces the current `archive` loop.

**► PASTE THIS:**

> Instrumental only, no singing. Anticipatory music for standing over a big map table deciding where to
> go. A bow-played vibraphone and a celeste hold slow shifting chords while a hammered dulcimer picks
> out a four-note figure — G, C, D, C — over a low held cello. Underneath, a slow even pulse, like a
> compass needle settling. 66 beats per minute, in D minor and deliberately unresolved. Expectant and
> considered rather than exciting — the moment before a decision, not the decision. Warm, wide, gently
> resonant. Same speed all the way through, no fading in or out.

**Don't want:** swashbuckling treasure-map music, ticking clocks, sonar pings, anything that sounds
like a spaceship control panel.

### `travel` — the time-travel screen, held

**Plays:** the travel screen after the tunnel finishes and the painting has settled, while the ring
says "Synced" and the game waits for you to click. **Length:** 40 seconds. **Status:** new.

**How this fits together:** the screen runs a 2-second tunnel, then 2.5 seconds settling onto a
painting, then it waits for the player indefinitely. The short cue `sting-chrono-out` (§7) covers the
first 4.5 seconds. **This track sits underneath it and holds for as long as the player looks at the
painting.**

**► PASTE THIS:**

> Instrumental only, no singing. A weightless, suspended drone for a held moment. Two bowed string
> notes a few steps apart, held and very slowly swelling against each other, with a distant shimmering
> vibraphone above and a deep soft bass note beneath. No melody, no beat, no rhythm at all. Still and
> patient — a held breath, not a countdown. Warm rather than cold; there's no danger here. Wide and
> slow with long natural decay. Completely steady, no fading in or out, nothing develops.

**Don't want:** any beat or rhythm, rising tension, sci-fi whooshing, alarm sounds, urgency of any
kind. The player is looking at a painting, not defusing a bomb.

### `upload` — sending the record home

**Plays:** the "Field record transmitting" screen with the beam animation. **Length:** 30 seconds.
**Status:** replaces the current `upload` loop.

**► PASTE THIS:**

> Instrumental only, no singing. A short, purposeful, gently rising loop. A celeste and a hammered
> dulcimer climb an ascending figure in even eighth notes over a warm held string chord that gets
> slightly brighter each time round. A soft mallet marks each phrase. 88 beats per minute, major-ish
> but with one flattened note keeping it from sounding too sweet. Satisfying and industrious without
> being triumphant — a job being finished properly, not a victory. Warm, bright, close. Same speed all
> the way through, no fading in or out.

**Don't want:** fanfare, cymbal crash, sci-fi data-transfer beeps, a big final chord.

### `completion` — a unit finished

**Plays:** the end-of-unit summary screen. **Length:** 45 seconds. **Status:** new.

**► PASTE THIS:**

> Instrumental only, no singing. A warm, settled closing piece for a small acoustic group. The whole
> group plays a four-note phrase — G, C, D, C — once, unhurried, then hands it to a solo cello which
> lets it fade into one long held chord. A hammered dulcimer and celeste decorate lightly underneath.
> 64 beats per minute, in D minor. The feeling is satisfaction and a slight sense of opening outward,
> not triumph — something has been saved, and there's more to do. The last chord should be warm but
> unfinished-sounding; it must not feel like an ending. Rich, close, wooden. No fading in.

**Don't want:** a proper final-sounding cadence, brass, cymbals, switching to a happy major key, any
"you won" moment. The player preserved a record; they didn't defeat anything.

---

## §3 · The seven maps — 7 tracks

**Start here.** Six of these seven currently play the same loop, so this section changes the game more
than anything else in this document.

Each map gets instruments that were actually around in that place in that year, and each one plays the
four Chronicle notes on one of them so the whole soundtrack still hangs together.

| Unit | File name          | Place and year                                 | Plays today     |
| ---- | ------------------ | ---------------------------------------------- | --------------- |
| 1    | `island.ogg`       | A Caribbean island, 1492–93                    | its own loop    |
| 2    | `riverbend.ogg`    | Chesapeake tidewater, Virginia, 1619–1630      | the shared loop |
| 3    | `philadelphia.ogg` | Philadelphia, 1770s                            | the shared loop |
| 4    | `canal.ogg`        | An Erie Canal boomtown, upstate New York, 1845 | the shared loop |
| 5    | `richmond.ogg`     | Richmond, Virginia, 1864                       | the shared loop |
| 6    | `railhead.ogg`     | Cottonwood Junction, Kansas, June 1873         | the shared loop |
| 7    | `port.ogg`         | Ellis Island, New York Harbor, 17 April 1907   | the shared loop |

Three things that apply to all seven:

- **These belong to their time and place first.** A student who finishes a map should come away having
  learned a period, not a plot. None of these seven should sound like time travel.
- **Length matters most here.** These play for twenty or thirty minutes straight. Make three versions
  and keep the least tuneful one.
- **Arriving somewhere is not dangerous** in this game's story. No map opens on tension.

### `island` — Unit 1 · a Caribbean island, 1492–93

_"Two peoples are counting the same shoreline, and only one of them is writing it down."_

**The map:** a Taíno village and garden plots, a Spanish landing camp along the shore, three ships
anchored offshore, dirt paths through the palms. **Length:** 60 seconds. **Status:** replaces `island`.

The two-cultures idea is in the arrangement, not the notes: the Taíno instruments are close and
playing; the Spanish one is distant and only turns up now and then.

**► PASTE THIS:**

> Instrumental only, no singing. A warm, unhurried exploration loop for a top-down pixel-art history
> game. Taíno percussion carries it — a güiro (a notched gourd scraped with a stick), gourd rattles,
> and a soft low hollow-log drum in a gentle rolling 6/8 sway — under a breathy cane flute playing a
> rising-and-falling five-note-scale melody. Once per phrase the flute plays a simple four-note figure:
> G, C, D, C. Far underneath and much quieter, a single chord on an early Spanish gut-string guitar
> enters only every second or third phrase, as if carried across the water from a ship anchored
> offshore. 84 beats per minute. Sparse, with lots of air between phrases. Sunlit, open and curious
> rather than tense. Recorded close and dry, hardly any reverb. Same speed all the way through, no
> fading in or out.

**Don't want:** orchestral strings, brass, synthesizers, steel drums or any beach-resort sound, movie
percussion, a discovery fanfare, ominous low drones. Nothing has gone wrong here yet.

### `riverbend` — Unit 2 · Chesapeake tidewater, Virginia, 1619–1630

_"A wall, a wharf, and everyone inside them arguing about who owes whom what."_

**The map:** a fenced settlement on a wooded river bend — meetinghouse, clapboard houses, barn, tobacco
plots, a wharf below the bluff, cleared fields running back into the trees. **Length:** 60 seconds.
**Status:** new.

Three peoples are on this map and all three belong in the music: the English inside the fence, the
Powhatan beyond the treeline, and the Angolan labourers who arrive in 1619. The English part is loudest
because they're the ones writing things down — that's the point being made, not an endorsement.

**► PASTE THIS:**

> Instrumental only, no singing. A plain, working loop for an early colonial river settlement. A small
> English group leads: a wooden recorder and two viols (early bowed instruments held on the knee)
> playing a square, hymn-like tune with no decoration, plus a small hand drum keeping a flat walking
> beat. The recorder plays a simple four-note figure — G, C, D, C — once per phrase. From further away,
> a gourd rattle and a cane flute answer in a different rhythm that never quite lines up with the
> others. Underneath everything and very quiet, a plucked thumb piano repeating a short looping
> pattern. 74 beats per minute, in D minor. Austere, damp, hardworking; unglamorous and a bit cold.
> Dry period recording with a sense of open air and trees. Same speed all the way through, no fading in
> or out.

**Don't want:** Renaissance-fair jollity, sea shanties, Celtic fiddle, harpsichord (too fancy and too
late for this), orchestral warmth, any sense of adventure or frontier romance.

> **One inconsistency to know about.** Two of the art-pipeline files for this map call it "a New England
> river settlement, ~1620s". The actual game content puts it in the Chesapeake tidewater of Virginia,
> 1619–1630 — tobacco, Jamestown letters, the Powhatan, Angolan labourers. The game content is correct
> and the two art comments are out of date. This prompt is written to Virginia.

### `philadelphia` — Unit 3 · Philadelphia, 1770s

_"A city printing the argument faster than anyone in it can finish having it."_

**The map:** a Revolutionary-era town square — brick statehouse and clock tower, a print shop, a chapel
and churchyard, market stalls, a liberty pole, the waterfront with piers and masts. Cobbled and busy.
**Length:** 60 seconds. **Status:** new.

This is the one map whose drum part is a machine. A hand printing press pulls about one sheet every few
seconds, and that's the heartbeat of the town.

**► PASTE THIS:**

> Instrumental only, no singing. A busy, chattering loop for a colonial American city street. A
> harpsichord plays a brisk, clean, neatly interlocking figure in a light 1700s style, doubled softly
> by a wooden baroque flute. The percussion isn't musical — it's the heavy regular thump and creak of a
> wooden printing press, plus an old military snare drum tapping a quiet marching pattern some distance
> away. Every few bars a fife plays a short bright phrase out in the street that never turns into a
> recognisable tune. The harpsichord plays a four-note figure — G, C, D, C — once per phrase. 96 beats
> per minute, major-sounding but with one flattened note keeping it slightly rough. Energetic,
> argumentative, crowded and civic; not military, not at war yet. Dry, close, old-instrument recording.
> Same speed all the way through, no fading in or out.

**Don't want:** any actual patriotic tune quoted, orchestral pomp, a full fife-and-drum march,
triumphant brass, anything that picks a side. The argument is still going on.

### `canal` — Unit 4 · an Erie Canal boomtown, upstate New York, 1845

_"The lock lifts a loaded boat by hand. Everything else here is an argument about who paid for it."_

**The map:** a stone canal with a working lock and brass gear, moored cargo barges, a water-powered
flour mill, brick shopfronts and a bank, a reform square with a church and meeting hall, terraced
immigrant housing. **Length:** 60 seconds. **Status:** new.

This is the most cheerful map in the game, and the cheerfulness is the point — a boomtown believes in
itself. The reform meeting hall gives it a counter-melody.

**► PASTE THIS:**

> Instrumental only, no singing. A bright, rolling, hardworking loop for an American canal boomtown. A
> fiddle and a hammered dulcimer play a lively jig-like figure together, with an Irish tin whistle
> weaving above and a plucked banjo rolling underneath. The percussion is the place itself: mule bells
> at walking pace and the soft continuous rush of water spilling over lock gates. Every second phrase a
> small pump organ comes in underneath with a plain old-fashioned hymn line, squarer and slower than
> everything above it, as if heard through the door of a meeting hall. The fiddle plays a four-note
> figure — G, C, D, C — once per phrase. 104 beats per minute, major-sounding with one flattened note.
> Optimistic, industrious, a little overcrowded — a town certain it's going somewhere. Warm, dry, close
> recording. Same speed all the way through, no fading in or out.

**Don't want:** bluegrass or any 20th-century country sound, minstrel-show pastiche, orchestral
Americana, hoedown clichés, saloon honky-tonk piano (wrong decade, wrong state).

### `richmond` — Unit 5 · Richmond, Virginia, 1864

_"A capital running a war on paper it is also running out of."_

**The map:** a columned capitol on a green hill above brick government offices, a price board, a
hospital ward with tents, the ironworks chimney, cranes and cargo on a paved quay, the river and falls
below. **Length:** 60 seconds. **Status:** new.

**Richmond doesn't burn until April 1865.** In 1864 the city is undamaged, overcrowded and overbuilt.
This is not rubble-and-ashes music. The war shows up as **shortage and strain**, not destruction.

**► PASTE THIS:**

> Instrumental only, no singing. Strained, genteel music for a wartime southern capital that hasn't
> been damaged but is running out of everything. A parlour piano, slightly out of tune and played
> softly, works through a sentimental period drawing-room melody. A solo cornet (a small trumpet)
> answers it from further away, alone and a little flat. Underneath, a muffled military snare drum
> keeps a slow funeral-march pulse, and a low sustained industrial hum — a distant furnace and river
> falls — never stops. What should be a full brass band is just that one cornet. The piano plays a
> four-note figure — G, C, D, C — once per phrase. 60 beats per minute, in D minor, but it never
> arrives anywhere. Dignified, tired and quietly desperate; keeping up appearances. Close, dry, with
> real room noise. Same speed all the way through, no fading in or out.

**Don't want:** "Dixie" or any Confederate tune quoted, battle music, cannon fire, orchestral tragedy,
horror strings, rubble sounds, anything mournful enough to read as sympathy for the government. The
records here are being kept **by** the people the player is investigating.

### `railhead` — Unit 6 · Cottonwood Junction, Kansas, June 1873

_"A town the survey drew before anyone arrived to live in it."_

**The map:** the railway line runs east–west right across the map. North of it is the town, where paper
gets made and stored — depot, land office, telegraph office, store. South of it is what the paper is
for: the Kanza village on the creek, the hide yard, the workers' camp, the cattle pens. Tall prairie
grass and cottonwood trees. **Length:** 60 seconds. **Status:** new.

**The layout of the map should be the layout of the track.** The town's music and the Kanza music are on
opposite sides of the line, in different tempos, and the town can't hear the other one. The Kanza leave
in June; the financial crash comes in September. The town is booming on paper and nervous in
conversation.

**► PASTE THIS:**

> Instrumental only, no singing. A wide, open, slightly lonely loop for a brand-new prairie railway
> town. A single fiddle plays a spare, unhurried tune using a lot of open strings, joined by a jaw harp
> (a small twangy mouth instrument) and a softly strummed guitar. There's far more space than sound.
> The pulse comes from a telegraph key tapping an irregular pattern and, further off, the slow idling
> breath of a steam locomotive taking on water. Quiet wind through tall grass runs underneath
> everything. Separately, very distant and in a completely different unrelated tempo, a cedar flute and
> a soft water drum play their own phrase — never lining up with the fiddle and never getting louder.
> The fiddle plays a four-note figure — G, C, D, C — once per phrase. 80 beats per minute,
> major-sounding with one flattened note. Optimistic on the surface with something unsettled
> underneath; big sky, few people. Dry, wide, almost no reverb. Same speed all the way through, no
> fading in or out.

**Don't want:** spaghetti-western twangy guitar and whistling, the Hollywood "Indian" tom-tom cliché,
wailing harmonica, cowboy campfire music, orchestral frontier grandeur, desert or cactus sounds. This
is Kansas tall-grass prairie, not Monument Valley.

### `port` — Unit 7 · Ellis Island, New York Harbor, 17 April 1907

_"Everyone on this quay was written down in Europe before anyone here looked at them."_

**The map:** the brick reception building across the whole north edge, a paved and lamplit forecourt,
one iron railing with a single gate in it, then the wharf with baggage and waiting families, then the
bay and two wooden piers. 11,747 people came off the barges that day. **Length:** 60 seconds.
**Status:** new.

This is the deliberate opposite of Unit 6: Kansas's railway line could be walked across, **this railing
cannot.** So where the Kansas track is open and thin, this one is crowded and mechanical — warm and
human on top, orderly and indifferent underneath.

**► PASTE THIS:**

> Instrumental only, no singing. A crowded harbour loop for a great immigration station. Four folk
> traditions play near each other without quite playing together: a Central European button accordion,
> a clarinet played in the Eastern European Jewish klezmer style with sliding notes, a southern Italian
> mandolin playing fast repeated notes, and a plucked upright bass walking underneath them. They share
> a tempo but not a phrase, so the texture overlaps and crowds. Under all of it, a low sustained
> steam-whistle drone and a slow, absolutely even pulse, like a queue shuffling forward. The clarinet
> plays a four-note figure — G, C, D, C — once per phrase. 96 beats per minute, in D minor, unresolved.
> Warm, human and hopeful on the surface; orderly, procedural and indifferent underneath. Old acoustic
> recording character, no modern polish. Same speed all the way through, no fading in or out.

**Don't want:** sentimental immigrant-saga film music, a lone weeping violin, orchestral strings, a
Statue of Liberty moment, patriotic swelling, anything triumphant or anything tragic. The day is
paperwork, and that's exactly what makes it what it is.

---

## §4 · Indoor rooms — 8 tracks you should NOT generate yet

> **Skip this section.** The eight rooms you can walk into (the print shop, the boarding house, and so
> on) deliberately keep playing the outdoor map's music. Walking through a door isn't supposed to
> restart the score, so the code reads the outdoor map's track even when you're inside.
>
> **These eight would not play if you made them.** They're written down so the list is complete, and
> because one or two of these rooms are good enough that someone might want to change that decision
> later.

If that decision ever changes, each of these is the parent map's track with fewer instruments and an
indoor sound. The shared starting point:

> Instrumental only, no singing. A stripped-back indoor version of [the map's theme]: the same key and
> the same four-note figure — G, C, D, C — played by only one or two instruments, in a small room with
> close walls. Quieter, slower and more spacious than the outdoor version. No wind, no crowd, no
> outdoor sounds. Steady speed, no fading in or out.

| Room                         | Unit | What it is                                                                                                                                                                   | What the indoor version should say                                                                                                                                                                                  |
| ---------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Printing office**          | 4    | A partisan newspaper and job-printing shop: iron hand press, type cases, a stove, the editor's desk and safe                                                                 | Keep the press thump from the canal track and drop nearly everything else — in here the machine is the only instrument. Add the fine irregular click of type being set.                                             |
| **Boarding house**           | 4    | Curtained sleeping alcove with three rope beds, a flagged kitchen, a common room with boarding tables. Boat crews, Irish canal diggers, a temperance visitor                 | Solo tin whistle and a quiet fiddle, close and tired, at the end of a working day. The hymn from the canal track never comes in here.                                                                               |
| **Counting room**            | 5    | A slave-trading commission house in Shockoe Bottom: panelled office, clerks' writing table, iron safe, ledgers, a grandfather clock                                          | **Nothing theatrical.** No menace, no low drone, no horror. A clock, a pen, and one held cello note. It should sound like a well-run office — that is the entire point of the room.                                 |
| **Hospital ward**            | 5    | A long whitewashed room, sash windows, two rows of empty made-up camp beds, a linen press, the matron's register                                                             | The Richmond parlour piano alone, very quiet and far away, in a room with a hard echo. Non-graphic throughout, like the room itself.                                                                                |
| **Land office**              | 6    | A US district land office: counter with an iron rail and one gate, the register's desk, map table, tract books, floor safe                                                   | The Kansas fiddle reduced to long held open strings, over the scratch of a pen and the thump of a heavy book. The prairie wind vanishes the moment the door shuts.                                                  |
| **Telegraph office**         | 6    | A Western Union office: railed instrument table, message file, message window, benches. **No clock, on purpose** — standard time doesn't exist until 1883                    | Promote the telegraph key from the Kansas track to lead instrument, with a jaw harp answering it. Deliberately no clock tick and no steady beat — nothing in this room agrees what time it is.                      |
| **Reception hall**           | 7    | The registry floor: a big tiled hall crossed by two iron railings whose gates are at opposite ends, so you walk it as a zigzag. Registry desks, money exchange, holding pens | Just the queue pulse from the Ellis Island track, in a huge tiled room with a long hard echo, with the four folk instruments reduced to distant fragments. The procedure has won; the music hasn't.                 |
| **Board of special inquiry** | 7    | The hearing room: parquet floor, panelled walls, carpet, a long table with empty chairs, a clerk's table, a grandfather clock, minute books                                  | Almost silence. A grandfather clock, the sound of a carpeted room, and one held low note. The nicest room in the building is the one where the decision gets made, and it should be the quietest thing in the game. |

---

## §5 · Everything that isn't a place — 9 tracks

These play under reading, writing and clicking. **Every one of them should be less interesting than
the map tracks.**

### `dialogue` — while you're talking to someone

**Plays:** on a map while a conversation is open. **Length:** 40 seconds. **Status:** replaces
`dialogue`. Dialogue is written one idea per box with real pauses, so this has to tolerate gaps.

**► PASTE THIS:**

> Instrumental only, no singing. Very thin background music for a conversation. Two held notes a few
> steps apart on a bow-played vibraphone, with one soft plucked note marking long irregular gaps.
> Almost nothing happens. 60 beats per minute, unresolved. Attentive and neutral. Close and quiet, no
> echo. Steady, no fading in or out.

**Don't want:** melody, emotion, string swells, anything that tells the player how to feel about a
speaker. Several of these people are lying.

### `desk` — the four record activities

**Plays:** the interview, assembly, discrepancy and trace activities. **Length:** 60 seconds.
**Status:** new.

**► PASTE THIS:**

> Instrumental only, no singing. Focused, quietly industrious work music. A felt-muted piano repeats a
> short looping figure with small variations, over a low held cello and the faint regular sound of
> paper being handled. A bow-played vibraphone holds one long note that changes about once every eight
> bars. 72 beats per minute, unresolved. Absorbed and steady — concentration, not tension. Close, dry,
> small room. Same speed all the way through, no fading in or out.

**Don't want:** puzzle-game tension, ticking, a timer feeling, anything implying a wrong answer costs
something. None of these are timed.

### `desk-interview` — optional variant

**Plays:** the interview activity only, if you want the conversation one to feel different from the
three document ones. **Length:** 60 seconds. **Status:** new and optional.

**► PASTE THIS:**

> Same as the `desk` prompt above, but replace the paper-handling sound with longer silences, and give
> the felt piano a slower, more questioning phrase that stops unfinished each time. Slightly warmer.
> Keep the same tempo and key so the two can swap mid-session.

### `source` — reading a document

**Plays:** the document reader. **Length:** 45 seconds. **Status:** new. A student is reading a primary
source; nothing should compete with that.

**► PASTE THIS:**

> Instrumental only, no singing. Near-silent reading music. One very low held string note and a single
> celeste note that comes back every fifteen or twenty seconds. No beat, no melody, no development at
> all. Warm, still, almost unnoticeable. Long decays. Completely steady, no fading in or out.

**Don't want:** everything. If you notice it, it's wrong.

### `writing` — the long written assignments

**Plays:** the Archive Challenges and the unit review — the essay-style work. **Length:** 60 seconds.
**Status:** new. Deliberately boring: a student may sit here twenty minutes writing an argument.

**► PASTE THIS:**

> Instrumental only, no singing. A completely static, warm background for sustained concentration. Two
> or three low held string notes in a stable open chord, breathing very slowly against each other, with
> a barely audible warm room tone underneath. No rhythm, no melody, no change of any kind. Calm,
> spacious, neutral. Long and slow and completely steady. No fading in or out.

**Don't want:** anything happening at all. No swells, no new instruments, no chord changes.

### `practice` — practice questions

**Plays:** the practice check and the prediction screens. **Length:** 45 seconds. **Status:** new.

**► PASTE THIS:**

> Instrumental only, no singing. A light, low-stakes loop. A celeste and a plucked nylon-string guitar
> pass a small, gentle, slightly playful figure back and forth over a soft held pad. 84 beats per
> minute, warm. Encouraging and unpressured — practice, not a test. Close and bright. Steady speed, no
> fading in or out.

**Don't want:** quiz-show urgency, timers, tension, anything that raises the stakes.

### `browse` — looking at what you've collected

**Plays:** the Codex, the skills record, and the daily review. **Length:** 60 seconds. **Status:** new.
This is the badge-case feeling.

**► PASTE THIS:**

> Instrumental only, no singing. A warm, satisfied browsing loop. A hammered dulcimer plays a gently
> rolling pattern over a held cello, with celeste accents, and plays a four-note figure — G, C, D, C —
> about once per phrase. 76 beats per minute, in D minor. Pleased, unhurried, a little proud, without
> ever becoming a fanfare. Warm and close. Steady speed, no fading in or out.

**Don't want:** triumph, achievement-unlocked sparkle, anything that celebrates rather than reflects.

### `reconstruction` — the end-of-map activity

**Plays:** the Record Reconstruction, where you file every record you collected into the right category.
**Length:** 60 seconds. **Status:** new. The one background track allowed to build.

**► PASTE THIS:**

> Instrumental only, no singing. A gathering, assembling loop. It starts with a solo hammered dulcimer
> and adds one more instrument each time the phrase comes round — cello, then celeste, then a warm
> string pad — until the whole small group is playing a four-note figure together: G, C, D, C. 78 beats
> per minute, in D minor, and it still doesn't resolve. Purposeful and accumulating: pieces coming
> together into something that holds. Warm, close, wooden. Same speed all the way through, no fading in
> or out.

**Don't want:** a final-sounding ending, a climax, cymbals. It piles up; it doesn't arrive.

### `arcade` — the mini-games

**Plays:** Storm Navigation and Cargo Sorting. **Length:** 60 seconds. **Status:** new.

These are a break from the work and are not graded — the one genuinely playful track in the game, and
the one place the retro-game sound can come forward.

**► PASTE THIS:**

> Instrumental only, no singing. A bright, bouncy, retro video-game loop. A chiptune square-wave lead
> plays a cheerful hopping melody over a plucked bass and a light shaker beat, with a hammered dulcimer
> doubling the lead so it still belongs to this game. 132 beats per minute, in a major key and
> unambiguously happy — the only track here allowed to resolve properly. Bright, punchy, close. Steady
> speed, no fading in or out.

**Don't want:** not much — this is the release valve. Just keep the dulcimer in so it doesn't sound
imported from a different game.

### Screens that get silence on purpose

The join, login, teacher dashboard, grading and content-management screens get **no music**. They're
administration, not the game, and a teacher grading twenty submissions doesn't want a loop. Listed here
so it's clear that's a decision, not something unfinished.

---

## §6 · Meridian and the characters — 3 tracks

**The Meridian Institute currently has no music at all**, and of everything in this document that's the
biggest hole.

### `meridian` — the Meridian Institute

**Plays:** Meridian scenes — currently just the Unit 6 reveal, with more coming in Units 7–9.
**Length:** 60 seconds. **Status:** new.

**The whole idea: Meridian is not the villain.** Chronicle thinks the historical record has to survive
so people can argue with it. Meridian thinks that knowing better obliges you to act. The visible
difference between them is **money and upkeep**, not good versus evil — Chronicle is an old converted
building that's been patched up; Meridian is purpose-built, polished, matching, and recently funded. The
art is meant to make you uneasy about which one you're standing in _before_ anyone explains anything.

So the move is: **Meridian plays Chronicle's four notes on better equipment.**

**► PASTE THIS:**

> Instrumental only, no singing. An elegant, controlled, expensive-sounding loop for a purpose-built
> institution. The same four-note figure Chronicle uses — G, C, D, C — but played by a matched group of
> bowed strings in perfect unison, perfectly in tune and perfectly together, over a polished
> brass-toned bell and a deep even pulse that never varies at all. Everything lands exactly on the
> beat. A dark, warm, gaslit low register underneath. 72 beats per minute, same key as the main theme,
> still unresolved. Elegant, confident, orderly, and just slightly too precise to be comfortable —
> impressive rather than threatening. A rich, wide, expensive recording, in contrast to Chronicle's dry
> close wooden one. Steady speed, no fading in or out.

**Don't want:** villain music of every kind — minor-key menace, low brass stabs, distorted synths,
choir, ticking, red-alert tension, sci-fi textures. **Nothing here is evil.** The unease should come
entirely from how much better maintained it sounds than Chronicle.

**If you make variants later:** Meridian's story arc runs improvised → confident → wealthy → divided →
exposed, and its own members notice the decline. Degrade it in that direction — the strings gradually
stop being quite in unison and the perfect pulse develops a slight drag. **It must never become horror
music.**

### `voss` — Emery Voss, the field liaison

**Plays:** her scripted scenes. **Length:** 45 seconds. **Status:** new.

Voss is direct, observant, comfortable saying she doesn't know, and she reacts to historical suffering
as suffering — which the Director doesn't. When her secret comes out, the game plays its **warm
evidence cue**, not a betrayal sting. That's the instruction: the weight comes from the relationship
having been real. The player should finish the game unable to say cleanly that she was wrong.

**► PASTE THIS:**

> Instrumental only, no singing. A warm, direct, slightly wistful theme for a solo instrument. A cello
> plays a simple singing line, alone at first, then joined by a nylon-string guitar. The line is plain
> and undecorated — nothing clever, nothing held back. Underneath, entering only in the second half and
> very quietly, one held note from a different, cooler-sounding instrument that doesn't quite belong to
> the same group and doesn't resolve with it. 68 beats per minute, in D minor. Sympathetic, honest and
> unresolved — someone you trust who is carrying something. Close, warm, intimate. Steady speed, no
> fading in or out.

**Don't want:** a betrayal sting, a minor-key twist, a sinister rewrite of her own theme, tragic
strings. Her theme stays sympathetic. The shadow is one note underneath it, not a swap.

### `director` — Rowan Hale

**Plays:** his scripted scenes, including the orientation walk. **Length:** 40 seconds. **Status:** new,
and the lowest priority of the three.

Precise, controlled, protective, sincere. Never smug, never cruel, never a villain reading out his own
crimes.

**► PASTE THIS:**

> Instrumental only, no singing. A measured, formal theme for a small string group. Even, deliberate
> phrasing with clean articulation and absolutely no speeding up or slowing down, playing a four-note
> figure — G, C, D, C — with unusual care. A low cello anchors it. 64 beats per minute, in D minor.
> Controlled, sincere, protective — someone who has thought carefully about what he's about to say.
> Warm but formal. Close, dry. Steady speed, no fading in or out.

**Don't want:** pomposity, authority-figure brass, anything smug or cold. He isn't the antagonist
either.

---

## §7 · Short musical cues — 10, still Lyria

These are the sounds Lyria _can_ make, because they're music — just very short.

The lengths come from the game's actual code, not guesswork. Where a cue replaces an existing beep,
that's noted.

**One rule for all ten:** the game can't turn the music down when a cue plays, so keep them **bright and
thin, not loud and wide.** Stay out of the low-middle range — that's where the background tracks live.

### `sting-chrono-out` — travelling back in time

**Plays:** the moment you launch a case from the Navigation Table. **Length:** 4.5 seconds, in two
halves. **Status:** replaces the current time-travel beep.

The screen's timing is fixed: 2 seconds of tunnel, then 2.5 seconds settling onto a painting. Write to
those two beats exactly.

**► PASTE THIS:**

> Instrumental only, no singing. A two-part transition sound, 4.5 seconds total. For the first two
> seconds: a rising, speeding-up shimmer of struck metal and bowed strings sweeping upward together,
> gathering pace and then easing off — movement, not impact, and no drum hit. Then at the two-second
> mark it opens out into a warm held chord on strings and celeste, which settles and stays for the
> remaining two and a half seconds, resolving into stillness rather than into a proper ending. Awe and
> arrival. No fade in. Let the final chord ring out naturally.

**Don't want:** a whoosh-then-boom, a bass drop, alarm sounds, anything that sounds like danger or a
magic portal. Time travel in this game is routine and permitted.

### `sting-return-warp` — coming home

**Plays:** recalling to the Archive, and filing a field record home. **Length:** 2.5 seconds.
**Status:** replaces the current return beep.

**► PASTE THIS:**

> Instrumental only, no singing. A short descending arrival sound, 2.5 seconds. A gentle downward sweep
> of celeste and bowed strings over about a second, settling into a warm, fully resolved chord on
> hammered dulcimer and cello that rings for the rest. Coming home; relief and completion. Warm and
> close. No fade in.

**Don't want:** anything ominous. This is the one cue in the game allowed a clean, satisfying ending,
because the Archive is the safe place.

### `sting-record-filed` — you secured a record

**Plays:** every time you file a record into your evidence. **This is the most-heard sound in the
game.** **Length:** 0.6 seconds. **Status:** replaces the current confirm beep.

**► PASTE THIS:**

> Instrumental only, no singing. A very short, bright, satisfying confirmation: three quick rising
> notes on a celeste plus a soft struck woodblock, over in six tenths of a second. Clean, small, and
> pleasant to hear a hundred times. No reverb tail.

**Don't want:** length, reverb, melody, anything that gets tiring. Test it by playing it thirty times
in a row.

### `sting-archive-receive` — the badge case

**Plays:** interacting with the badge display in the Main Hall. **Length:** 0.9 seconds. **Status:**
replaces the current beep.

**► PASTE THIS:**

> Instrumental only, no singing. A soft, warm acknowledgement under a second: a low struck hammered
> dulcimer chord with a single bright celeste note above it, decaying naturally. Gentle and unhurried —
> a display case opening, not an award.

### `sting-codex-reveal` — you're being shown something

**Plays:** an image reveal in the Director's intro, **and at the Meridian reveal in Unit 6.** The same
warm sound for both, deliberately. **Length:** 1.4 seconds. **Status:** replaces the current reveal
beep.

**► PASTE THIS:**

> Instrumental only, no singing. A slow, ceremonial reveal, 1.4 seconds. A warm held string bed under
> four unhurried rising notes on celeste and bow-played vibraphone, opening into a broad open chord
> that rings out. Significant and warm — someone is showing you something in confidence. Wide and
> resonant. No fade in.

**Don't want:** a discovery sparkle, a mystery sting, anything sinister. This plays at the moment the
player learns the most unsettling thing in the game so far, and it has to stay warm. **That contrast is
the scene.**

### `sting-upload` — transmission finished

**Plays:** a correct reconstruction, and finishing an Archive Challenge. **Length:** 1.5 seconds.
**Status:** replaces the current beep.

**► PASTE THIS:**

> Instrumental only, no singing. A brief rising completion sound, 1.5 seconds: celeste and hammered
> dulcimer climbing five notes into a warm held string chord. Satisfying and industrious, not
> triumphant. Bright and close. No fade in.

**Don't want:** fanfare, brass, cymbal, a big finish.

### `sting-badge` — you earned a badge

**Plays:** earning an area badge into the display case. **Length:** 3 seconds. **Status:** new —
nothing plays here at the moment.

This is the game's Pokémon-badge moment and one of only two places allowed real celebration.

**► PASTE THIS:**

> Instrumental only, no singing. A warm three-second flourish for a small acoustic group: hammered
> dulcimer and celeste run upward together into a full, glowing held chord on strings, with a single
> soft struck bell at the top. Proud and generous, but wooden and warm rather than orchestral — earned
> recognition from an institution, not a video-game jingle. Rich and close. No fade in.

**Don't want:** synthetic achievement chimes, brass fanfare, choir, cymbal crash.

### `sting-era-secured` — a whole era preserved

**Plays:** when a unit reaches its finished state. **Length:** 4 seconds. **Status:** new. The biggest
cue in the game.

**► PASTE THIS:**

> Instrumental only, no singing. A four-second closing flourish. The full small acoustic group plays a
> four-note figure — G, C, D, C — once, together and unhurried, then opens into a wide held chord that
> rings and slowly fades. Warm, complete, and slightly open-ended — an achievement that's also a door.
> Rich, wooden, close, with real room sound. No fade in.

**Don't want:** a proper final cadence, timpani, cymbals, anything conclusive. Even the biggest moment
in this game doesn't fully resolve.

### `sting-mission-complete` — a mission's record recovered

**Plays:** finishing a mission's main record. **Length:** 2 seconds. **Status:** new.

**► PASTE THIS:**

> Instrumental only, no singing. A two-second confirmation with a bit more weight than a routine filing:
> hammered dulcimer and cello play three rising notes together, landing on a warm open chord that rings
> briefly. Solid and satisfying, modest in scale. Close and dry. No fade in.

### `sting-anomaly` — something in the record is wrong

**Plays:** finding a unit's anomaly. **Length:** 1.2 seconds. **Status:** new.

**Read this before generating it.** In this game an anomaly is **a paperwork problem, not magic.** The
story's own example is a number scraped off a ledger and rewritten in the wrong handwriting. _Nothing
glows._ You notice it; you don't solve it. The moment it becomes a puzzle with an answer, it stops
working.

**► PASTE THIS:**

> Instrumental only, no singing. A very small, quiet, wrong-sounding moment lasting just over a second.
> A warm chord is playing, and one single note comes in that doesn't belong to it — a slightly
> out-of-tune plucked string, quiet, close and unexplained — and then everything carries on as before.
> No swell, no build-up, no resolution, no reaction. It should be easy to miss and impossible to
> un-hear.

**Don't want:** horror stings, screeching strings, low drones, reversed audio, glitch or tape-stop
effects, anything signalling "something supernatural is happening". **Also don't make it sad.** Normal
historical uncertainty isn't a supernatural event, and this cue mustn't play as though reality is
breaking.

---

## §8 · Sound effects — 37, NOT Lyria

Lyria makes music. These aren't music. Use **ElevenLabs SFX** (you type a description, it makes the
sound) or grab them from **Freesound** — but only CC0 / public-domain ones, since avoiding licensing
hassle was one reason the game went with generated beeps in the first place.

A few of the existing beeps are genuinely fine and are marked **keep what's there**.

> **Worth knowing:** only the interface and feedback sounds below have anywhere to play right now.
> **Footsteps, doors and background ambience don't exist in the game at all** — there's no ambient audio
> layer and no per-surface footstep system. Those need code written before they'd do anything. They're
> listed because they're the biggest improvements available, not because they're one file away.

### Interface — 8

| File              | When it plays                   | Length | What to make                                                                    |
| ----------------- | ------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `sfx-click`       | any button press                | 0.08 s | A single soft dry click of a wooden button being pressed. Warm, close, no ring. |
| `sfx-hover`       | moving onto a button            | 0.05 s | A very quiet short brush of paper. Barely there.                                |
| `sfx-toggle-on`   | turning audio on                | 0.3 s  | **Keep what's there** — the existing two-note rise works fine.                  |
| `sfx-toggle-off`  | turning audio off               | —      | Currently silent by design. Leave it silent.                                    |
| `sfx-panel-open`  | a panel opens                   | 0.25 s | A soft leather-and-paper sound of a folder being opened. Close, dry.            |
| `sfx-panel-close` | a panel closes                  | 0.2 s  | The same folder closing — a bit shorter and lower.                              |
| `sfx-page-turn`   | changing pages in the reader    | 0.4 s  | One sheet of heavy old paper turning over. Close, dry, no room sound.           |
| `sfx-refused`     | an action that won't go through | 0.2 s  | A soft low wooden knock. **Not a buzzer, not an error tone.**                   |

### Footsteps — 8, by surface

Each one is **a single footstep**, mono, very dry. **Make four to six versions of each** or the walk
cycle will sound like a machine gun. Keep them quiet — the player walks constantly.

| File                  | Surface                                  | What to make                                                                           |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `sfx-step-sand`       | Caribbean shore                          | One bare foot stepping on dry loose sand. Soft, grainy, no impact.                     |
| `sfx-step-dirt`       | most outdoor paths                       | One boot stepping on packed dry earth. Dull, close, a bit of grit.                     |
| `sfx-step-cobble`     | Philadelphia and Ellis Island streets    | One hard shoe stepping on rounded cobblestones. Sharp, small, dry.                     |
| `sfx-step-plank`      | the canal bridge, the Ellis Island wharf | One boot stepping on a hollow wooden boardwalk plank. Slight resonance underneath.     |
| `sfx-step-gravel`     | Kansas track ballast, the wharf          | One boot stepping on coarse gravel. Crunchy, sharp, no echo.                           |
| `sfx-step-stone-wet`  | the Ellis Island quay                    | One hard shoe stepping on wet stone paving. Slightly slapping, a small reflection.     |
| `sfx-step-floorboard` | all wooden interiors                     | One shoe stepping on an old wooden floorboard indoors. A faint creak on some versions. |
| `sfx-step-tile`       | the Ellis Island reception hall          | One hard shoe stepping on a big tiled hall floor, with a long hard echo.               |

### Doors — 4

| File                   | Where                                                                     | Length | What to make                                                                                         |
| ---------------------- | ------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `sfx-door-wood-open`   | print shop, boarding house, land office, telegraph office                 | 0.7 s  | A simple plank door with an iron latch being lifted and pushed open. Dry, close, a small creak.      |
| `sfx-door-wood-close`  | the same                                                                  | 0.6 s  | The same door pulled shut, latch dropping.                                                           |
| `sfx-door-heavy-open`  | counting room, hospital ward, reception hall, hearing room, the Institute | 0.9 s  | A heavy panelled door with a brass handle opening into a bigger room. A little echo on the far side. |
| `sfx-door-heavy-close` | the same                                                                  | 0.8 s  | The same door closing solidly, handle returning.                                                     |

### Background ambience — 8

**These are the most valuable items in this whole document after the map music.** They loop underneath
the music and are what will actually make a map feel like a real place. **30 seconds each, seamless,
stereo, mixed well below the music.**

| File               | Map                       | What to make                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `amb-shore`        | Caribbean                 | Gentle small waves on a sheltered tropical shore, unhurried seabirds, a soft breeze through palm fronds. No music, no voices, no screeching gulls.                                                                                                                                           |
| `amb-riverbend`    | Virginia                  | A slow wide river at a wooded bend: water moving past a bank, wind in leaves, songbirds and crows at the treeline, and a distant axe on wood every so often. No voices.                                                                                                                      |
| `amb-street-1770s` | Philadelphia              | A busy pre-industrial city street: many footsteps on cobbles, iron-rimmed cart wheels passing, an indistinct crowd murmur too far off to make out words, a distant church bell, river gulls. No engines.                                                                                     |
| `amb-canal`        | canal town                | Water spilling steadily over closed timber lock gates into a canal basin, heard from a few metres away — a continuous rush with an irregular wooden knocking underneath as a moored boat shifts against the wall. Mule bells and a mill wheel further off. No birdsong, no voices.           |
| `amb-richmond`     | Richmond                  | A crowded wartime city under strain: a distant heavy furnace and hammering, river falls below, cart traffic on paving, a low unintelligible crowd, and a very distant dull artillery thud every twenty or thirty seconds — far enough away that nobody reacts to it. No shouting, no combat. |
| `amb-prairie`      | Kansas                    | Wide open tall-grass prairie wind, constant and unhurried, with meadowlarks and grasshoppers, and a stationary steam locomotive idling and venting in the distance. Occasional cattle. Very few human sounds.                                                                                |
| `amb-harbour`      | Ellis Island              | A crowded harbour wharf: a large multilingual crowd murmuring indistinctly, trunks and bundles being set down on stone, water slapping timber piles, gulls, and long low steam whistles from ships out in the bay. No individual voices audible.                                             |
| `amb-institute`    | the three Institute rooms | A quiet indoor room tone: a low fire crackling some distance away, an occasional creak of settling wood, the faintest paper handling. Almost silent.                                                                                                                                         |

### The record activities — 6

Short, dry and quiet — these fire on nearly every click inside the four activities.

| File              | When                          | Length | What to make                                                               |
| ----------------- | ----------------------------- | ------ | -------------------------------------------------------------------------- |
| `sfx-pick-up`     | picking up a piece            | 0.12 s | One sheet of paper lifted off a desk. Soft, close.                         |
| `sfx-place`       | dropping it somewhere valid   | 0.15 s | A sheet of paper set down flat on wood. Soft, definite.                    |
| `sfx-snap`        | a piece locking into place    | 0.1 s  | A small dry wooden click, slightly brighter than the button click.         |
| `sfx-reject`      | dropping it somewhere invalid | 0.15 s | A soft paper rustle that stops short. Not punishing.                       |
| `sfx-log-answer`  | logging an interview answer   | 0.3 s  | A fountain pen writing two or three quick strokes on paper. Close and dry. |
| `sfx-file-record` | filing a finished record      | 0.5 s  | A sheet of paper sliding into a card index, and the drawer nudged shut.    |

### Right and wrong — 3

| File            | When                      | Length | What to make                                                                                                |
| --------------- | ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `sfx-correct`   | a correct practice answer | 0.35 s | **Keep what's there**, or a soft two-note celeste rise. Quiet and encouraging, never a game-show ding.      |
| `sfx-incorrect` | a wrong practice answer   | 0.35 s | A soft, low, neutral wooden tap. **It must not sound like punishment** — being wrong is how practice works. |
| `sfx-unlock`    | a case unlocking          | 0.6 s  | A brass latch turning and releasing on a wooden case. Warm, mechanical, satisfying.                         |

---

## §9 · What order to make them in

Each batch is a sensible sitting, and each one is worth having on its own.

| Batch | What                                                       | Why now                                                                                                                            |
| ----- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **1** | The seven maps (§3)                                        | Six of them currently share one loop, and this is where players spend nearly all their time. Biggest single improvement available. |
| **2** | `title`, `hub-main`, `archive` (§2)                        | The three most-heard non-map tracks, and the first impression.                                                                     |
| **3** | `sting-chrono-out`, `sting-return-warp`, `travel` (§7, §2) | Time travel is the game's signature moment and currently plays a synthesised sweep over one held note.                             |
| **4** | The eight ambience beds (§8)                               | Cheap to make, huge effect. Layered under batch 1, these are what make a map feel like a place.                                    |
| **5** | The rest of the Institute tracks (§2)                      | `intro`, `hallway`, `archive-room`, `menu`, `upload`, `completion`.                                                                |
| **6** | The rest of the short cues (§7)                            | Do `sting-record-filed` first — it's the most-heard sound in the game.                                                             |
| **7** | The background tracks (§5)                                 | Deliberately unremarkable, so they can wait.                                                                                       |
| **8** | `meridian`, `voss`, `director` (§6)                        | Needed before Units 8–9 ship, not before that.                                                                                     |
| **9** | Footsteps, doors, interface and activity effects (§8)      | These need code written before they have anywhere to play, so they're last.                                                        |
| **—** | The eight indoor rooms (§4)                                | **Don't make these.** They wouldn't play.                                                                                          |

### What still needs building before any of this can be heard

None of this is in scope right now, but it's worth writing down while it's fresh — **the game currently
cannot play an audio file at all.**

- An `apps/web/src/assets/audio/` folder and code to load and decode files. Neither exists.
- **Two separate volume controls** instead of one, so effects can duck the music. Everything currently
  goes through a single master volume.
- **Fades** when the music stops. Right now it just stops.
- **A volume slider.** The only setting today is on/off.
- New track names wired to each map, plus music for the screens that currently fall silent.
- A decision about indoor music if §4 is ever wanted.

Don't build any of that speculatively. It's listed so whoever picks up the wiring knows the shape of the
job before starting.
