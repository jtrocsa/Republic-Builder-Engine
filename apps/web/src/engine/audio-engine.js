// Web Audio engine (music loops + one-shot SFX) for the whole game. **It plays a file when there is
// one and synthesises when there is not**, and the second half is not a fallback in the error sense
// — it is the state the game ships in. `apps/web/src/assets/audio/` is empty on purpose: every
// track in `docs/design/AUDIO-PROMPT-BOOK.md` is still to be commissioned, and each one is a
// drop-in that needs no code change. See decision log `0151`.
//
// Self-contained: owns its own AudioContext, its gain graph, and two localStorage keys —
// "republic-builder.audio.enabled" (on/off) and "republic-builder.audio.volume" (the two levels).
// Volume lives here and **not** in `progress`, deliberately: `progress` syncs to Supabase and
// follows a student to another device (`0147`), and a shared classroom Chromebook's speaker level
// is a property of the machine, not of the student sitting at it.
//
// The one place content leaks in is data, not logic: `playSfx`'s per-name note tables (names like
// "chrono"/"secure"), the `quest` case's `questMotifs` map (keyed by source IDs like
// "taino-context"), `MUSIC_SEQUENCES` (keyed by scene names), and `TRACKS` (keyed by the same
// scene names, mapping each to a file basename and to the synthesised loop to use until that file
// exists). These are literal data tables, not logic reaching back into main.js — same shape as
// tiled-map-loader.js's tolerance for tileset-path assumptions. `sceneForMusic()` — the function
// that decides *which* scene string to pass into `updateMusicForScreen`/`toggleAudio` —
// deliberately stays in main.js; it reads `progress.currentScreen`/`activeFieldMap()`, which is
// screen-routing policy, not audio logic.

const ENABLED_KEY = "republic-builder.audio.enabled";
const VOLUME_KEY = "republic-builder.audio.volume";

// **Where the old single `audioMaster.gain = 0.045` went.** MUSIC_LEVEL * OSC_CAL is exactly
// 0.045, on both sides, so at default volumes a synthesised note's total gain to the destination is
// bit-for-bit what it was before this file grew a bus graph. That is an arithmetic identity a test
// asserts (`tests/unit/audio-buses.test.js`) rather than a claim. A decoded file arrives at the
// bus level itself — about 7 dB above the synthesis calibration point, which is right for a
// normalised OGG against per-note gains running 0.2–0.55.
const MUSIC_LEVEL = 0.1;
const SFX_LEVEL = 0.1;
const OSC_CAL = 0.45;

const FADE_OUT_S = 0.35;
const FADE_IN_S = 0.45;
const DUCK_ATTACK_S = 0.08;
const DUCK_RELEASE_S = 0.35;
// The floor an exponential ramp can reach — `exponentialRampToValueAtTime` throws on 0.
const SILENT = 0.0001;

// **A 60-second stereo track decodes to 60 * 48000 * 2 * 4 = 23 MB of Float32.** Eight map tracks
// plus the ten Institute ones is over 400 MB resident, which is a dead tab on the classroom
// Chromebooks this game targets, weeks after the track that caused it was added. So music buffers
// are an LRU of two — the playing track and the one before it, which is exactly what makes
// field -> dialogue -> field and map -> interior -> map free. One-shot cues are under a second
// each and are kept unconditionally.
const MUSIC_BUFFER_CACHE = 2;

/**
 * Scene -> { file, loop }. **Both columns are load-bearing and the second one is why this is a
 * table rather than a rename.**
 *
 * Before this phase the eight field maps collapsed to two scene keys: `island` once and
 * `settlement` seven times, so a 1622 Virginia hymn played on a 1767 Philadelphia street, an 1873
 * Kansas railhead and a 1957 suburb. Giving each map its own key is the point of the change — but
 * `scheduleLoop` resolves an unknown key to `quiet`, which is a single 261.63 Hz note every six
 * seconds. Renaming alone would therefore have made seven of the eight maps **quieter and worse**,
 * on a change whose whole premise is that nothing regresses for a player with no files, and
 * nothing in the repository would have caught it: no visual baseline photographs sound.
 *
 * So `loop` names the synthesised sequence to play until `file` exists on disk. With an empty
 * `assets/audio/`, every entry below resolves to exactly the loop that scene played before.
 *
 * `quiet` carries `file: null` on purpose — it means *never look for a file*, which is the prompt
 * book's "screens that get silence on purpose" written as data rather than as an absence.
 */
export const TRACKS = {
  island: { file: "island", loop: "island" },
  riverbend: { file: "riverbend", loop: "settlement" },
  philadelphia: { file: "philadelphia", loop: "settlement" },
  canal: { file: "canal", loop: "settlement" },
  richmond: { file: "richmond", loop: "settlement" },
  railhead: { file: "railhead", loop: "settlement" },
  port: { file: "port", loop: "settlement" },
  fairmeadow: { file: "fairmeadow", loop: "settlement" },
  archive: { file: "archive", loop: "archive" },
  dialogue: { file: "dialogue", loop: "dialogue" },
  upload: { file: "upload", loop: "upload" },
  quiet: { file: null, loop: "quiet" },
};

/**
 * The synthesised loops, unchanged from before this phase. `settlement` no longer has a
 * `musicScene` pointing at it — it is reached only through `TRACKS`' `loop` column, which is what
 * keeps Units 2–8 sounding as they did until their files land.
 */
export const MUSIC_SEQUENCES = {
  archive: { every: 3600, notes: [392, 523, 587, 523, 440, 392], type: "triangle" },
  // Unit 1 field motif: softer hand-drum pulse plus flute-like pentatonic movement.
  island: { every: 3200, notes: [294, 349, 392, 440, 392, 349, 330], type: "sine" },
  // Unit 2 field motif: steadier hymn-like settlement theme, lower and squarer.
  settlement: { every: 3600, notes: [262, 330, 392, 330, 294, 262, 220], type: "triangle" },
  dialogue: { every: 4300, notes: [440, 523, 659, 523], type: "sine" },
  upload: { every: 2300, notes: [392, 494, 587, 740, 784], type: "triangle" },
  quiet: { every: 6000, notes: [261.63], type: "sine" },
};

/**
 * One-shot cue -> the file basename to prefer, and whether it ducks the music under it.
 *
 * Only the five long cues duck. `secure` and `flat` fire on nearly every press inside an activity,
 * and a music bus that pumps on every click is worse than no ducking at all.
 *
 * **`flat` is deliberately not mapped to the book's `sfx-incorrect`.** That row's description is
 * right — "must not sound like punishment" — but its *name* is wrong for this game: there is no
 * `✗` here and a deflection is not a wrong answer, and `flat` fires on 104 of the 156 authored
 * interview answers that carry nothing *by design*. The book should rename the row; until it does,
 * this cue keeps its synthesised voice rather than being quietly bound to a file called "incorrect".
 */
const CUES = {
  chrono: { file: "sting-chrono-out", duck: 0.45, holdS: 1.6 },
  "return-warp": { file: "sting-return-warp", duck: 0.45, holdS: 2.2 },
  upload: { file: "sting-upload", duck: 0.5, holdS: 1.4 },
  "codex-reveal": { file: "sting-codex-reveal", duck: 0.5, holdS: 1.4 },
  "archive-receive": { file: "sting-archive-receive", duck: 0.6, holdS: 0.9 },
  secure: { file: "sting-record-filed", duck: null, holdS: 0 },
  flat: { file: null, duck: null, holdS: 0 },
  dialogue: { file: null, duck: null, holdS: 0 },
  quest: { file: null, duck: null, holdS: 0 },
  toggle: { file: null, duck: null, holdS: 0 },
};

// **`eager: true` with `?url` puts only the hashed path strings in the entry chunk** — about 40
// bytes each — while the audio bytes are emitted as separate assets and fetched only when
// `loadBuffer` calls `fetch()`. `vite.config.js` already sets `assetsInlineLimit: 0` and `.ogg` is
// already in Vite's default `assetsInclude`, so that file needs no change and decision log
// `0135`'s entry-chunk budget is untouched. A *lazy* glob would instead emit one tiny JS chunk per
// file whose whole content is a URL string, which is strictly worse. With no files on disk this
// returns `{}` and does not error, which is the state the phase ships in.
const GLOBBED_TRACK_URLS = import.meta.glob("../assets/audio/*.ogg", {
  eager: true,
  query: "?url",
  import: "default",
});

function basenameOf(path) {
  const tail = path.slice(path.lastIndexOf("/") + 1);
  return tail.endsWith(".ogg") ? tail.slice(0, -4) : tail;
}

function normalizeTrackUrls(globbed) {
  const out = {};
  for (const path of Object.keys(globbed)) out[basenameOf(path)] = globbed[path];
  return out;
}

let trackUrls = normalizeTrackUrls(GLOBBED_TRACK_URLS);

let audioEnabled = window.localStorage.getItem(ENABLED_KEY) === "true";
const volumes = readVolumes();
let audioContext = null;
let masterGain = null;
let musicVolumeGain = null;
let musicDuckGain = null;
let musicOscGain = null;
let musicFileGain = null;
let sfxVolumeGain = null;
let sfxOscGain = null;
let sfxFileGain = null;
// **The *target* scene, not the sounding one.** That redefinition is what lets the early-out in
// `updateMusicForScreen` survive crossfades: mid-fade the target is already the new scene, so a
// render that re-asks for it returns without touching an AudioParam, and a render that asks for a
// third scene still starts a fade to it.
let audioScene = null;
const lastSfxAt = {};
let musicGeneration = 0;
let currentVoice = null;
let duckUntil = 0;

const bufferCache = new Map();
const musicLru = [];
const trackOffsets = new Map();

function clamp01(value, fallback = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

function readVolumes() {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (!raw) return { music: 1, sfx: 1 };
    const parsed = JSON.parse(raw);
    return { music: clamp01(parsed && parsed.music), sfx: clamp01(parsed && parsed.sfx) };
  } catch {
    // A malformed or unreadable value is the same as none — full volume, never a throw on boot.
    return { music: 1, sfx: 1 };
  }
}

function persistVolumes() {
  try {
    window.localStorage.setItem(VOLUME_KEY, JSON.stringify(volumes));
  } catch {
    // Private mode / blocked storage. The level still applies for this session.
  }
}

export function isAudioEnabled() {
  return audioEnabled;
}

export function getVolumes() {
  return { ...volumes };
}

function applyVolumes() {
  if (musicVolumeGain) musicVolumeGain.gain.value = MUSIC_LEVEL * volumes.music;
  if (sfxVolumeGain) sfxVolumeGain.gain.value = SFX_LEVEL * volumes.sfx;
}

/**
 * The music level. **Writes `musicVolumeGain` and never `musicDuckGain`** — the two are separate
 * nodes precisely so that dragging the slider during a duck cannot fight the duck's ramp. One
 * param with two writers is CLAUDE.md's "one variable answering two questions": one write wins
 * silently and the music either never comes back up or comes back to the wrong level.
 */
export function setMusicVolume(value) {
  volumes.music = clamp01(value);
  applyVolumes();
  persistVolumes();
  return volumes.music;
}

export function setSfxVolume(value) {
  volumes.sfx = clamp01(value);
  applyVolumes();
  persistVolumes();
  return volumes.sfx;
}

export function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContext;
    masterGain = ctx.createGain();
    musicVolumeGain = ctx.createGain();
    musicDuckGain = ctx.createGain();
    musicOscGain = ctx.createGain();
    musicFileGain = ctx.createGain();
    sfxVolumeGain = ctx.createGain();
    sfxOscGain = ctx.createGain();
    sfxFileGain = ctx.createGain();

    masterGain.gain.value = 1;
    musicDuckGain.gain.value = 1;
    musicOscGain.gain.value = OSC_CAL;
    musicFileGain.gain.value = 1;
    sfxOscGain.gain.value = OSC_CAL;
    sfxFileGain.gain.value = 1;
    applyVolumes();

    musicOscGain.connect(musicDuckGain);
    musicFileGain.connect(musicDuckGain);
    musicDuckGain.connect(musicVolumeGain);
    musicVolumeGain.connect(masterGain);
    sfxOscGain.connect(sfxVolumeGain);
    sfxFileGain.connect(sfxVolumeGain);
    sfxVolumeGain.connect(masterGain);
    masterGain.connect(ctx.destination);
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

export function audioNote(
  freq,
  duration = 0.22,
  delay = 0,
  type = "sine",
  gainValue = 0.55,
  destination = null
) {
  if (!audioEnabled) return;
  const ctx = ensureAudio();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(SILENT, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(SILENT, start + duration);
  osc.connect(gain).connect(destination || sfxOscGain);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

export function audioNoise(
  duration = 0.24,
  delay = 0,
  gainValue = 0.25,
  filterFreq = 900,
  destination = null
) {
  if (!audioEnabled) return;
  const ctx = ensureAudio();
  const start = ctx.currentTime + delay;
  const buffer = ctx.createBuffer(
    1,
    Math.max(1, Math.floor(ctx.sampleRate * duration)),
    ctx.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFreq, start);
  filter.Q.value = 2.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SILENT, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(SILENT, start + duration);
  noise
    .connect(filter)
    .connect(gain)
    .connect(destination || sfxOscGain);
  noise.start(start);
  noise.stop(start + duration + 0.03);
}

export function audioChord(
  notes,
  duration = 0.32,
  delay = 0,
  type = "triangle",
  gainValue = 0.32,
  destination = null
) {
  notes.forEach((freq, index) =>
    audioNote(
      freq,
      duration,
      delay + index * 0.015,
      type,
      gainValue / Math.max(1.2, notes.length),
      destination
    )
  );
}

/**
 * Decode a file into an `AudioBuffer`, or answer `null`.
 *
 * **Four outcomes and three of them are `null`**, because a missing file, a 404 and a file that
 * will not decode are the same thing to a caller whose job is to fall back. None of them throws,
 * and **none of them is ever retried**: a scene the player re-enters thirty times would otherwise
 * issue thirty failing requests and log thirty warnings. `absent` is a permanent verdict for the
 * life of the page.
 *
 * It decodes bytes rather than trusting an extension, which is what lets the e2e spec prove the
 * file branch with an in-page WAV and no committed asset.
 */
export function loadBuffer(basename, kind = "sfx") {
  if (!basename) return Promise.resolve(null);
  const hit = bufferCache.get(basename);
  if (hit) {
    if (hit.state === "absent") return Promise.resolve(null);
    if (hit.state === "ready") {
      touchMusicLru(basename, kind);
      return Promise.resolve(hit.buffer);
    }
    return hit.promise;
  }
  const url = trackUrls[basename];
  if (!url) {
    bufferCache.set(basename, { state: "absent", buffer: null, promise: null });
    return Promise.resolve(null);
  }
  const ctx = ensureAudio();
  const entry = { state: "pending", buffer: null, promise: null };
  entry.promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((bytes) => ctx.decodeAudioData(bytes))
    .then((buffer) => {
      entry.state = "ready";
      entry.buffer = buffer;
      touchMusicLru(basename, kind);
      return buffer;
    })
    .catch((err) => {
      entry.state = "absent";
      entry.buffer = null;
      console.warn(
        `[audio] "${basename}" unavailable (${err && err.message}) — using the synthesised loop.`
      );
      return null;
    });
  bufferCache.set(basename, entry);
  return entry.promise;
}

function touchMusicLru(basename, kind) {
  if (kind !== "music") return;
  const at = musicLru.indexOf(basename);
  if (at !== -1) musicLru.splice(at, 1);
  musicLru.push(basename);
  while (musicLru.length > MUSIC_BUFFER_CACHE) {
    const evicted = musicLru.shift();
    const entry = bufferCache.get(evicted);
    // Drop the decoded buffer, not the knowledge that the file exists. A return re-fetches from
    // the HTTP cache and re-decodes; an `absent` verdict is never re-litigated.
    if (entry && entry.state === "ready") bufferCache.delete(evicted);
  }
}

function newVoice(kind) {
  const ctx = ensureAudio();
  const gain = ctx.createGain();
  gain.gain.value = SILENT;
  gain.connect(kind === "file" ? musicFileGain : musicOscGain);
  // `startedAt` is set for **both** kinds. The file path needs it to work out a resume offset, and
  // the synthesised path needs it so "did this track restart?" is answerable at all — which is the
  // whole question a doorway has to answer no to.
  return {
    kind,
    gain,
    timers: [],
    source: null,
    basename: null,
    startedAt: ctx.currentTime,
    offset: 0,
  };
}

function fadeIn(voice) {
  const ctx = audioContext;
  const now = ctx.currentTime;
  const param = voice.gain.gain;
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(param.value, SILENT), now);
  param.exponentialRampToValueAtTime(1, now + FADE_IN_S);
}

/**
 * Fade a voice out and tear it down. **Every voice owns its own gain node, its own intervals and
 * its own buffer source**, so a teardown can only ever touch what it started — which is why a late
 * teardown cannot stop the track that replaced it. The generation counter below guards the other
 * half of that problem, which is a *load* resolving after the scene has moved on.
 */
function retireVoice(voice) {
  if (!voice) return;
  voice.timers.forEach(clearInterval);
  voice.timers = [];
  if (voice.kind === "file" && voice.basename && voice.source) {
    const buffer = voice.source.buffer;
    if (buffer && buffer.duration) {
      const played = audioContext.currentTime - voice.startedAt + voice.offset;
      trackOffsets.set(voice.basename, played % buffer.duration);
    }
  }
  const ctx = audioContext;
  const now = ctx.currentTime;
  const param = voice.gain.gain;
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(param.value, SILENT), now);
  param.exponentialRampToValueAtTime(SILENT, now + FADE_OUT_S);
  window.setTimeout(
    () => {
      try {
        if (voice.source) voice.source.stop();
      } catch {
        // Already stopped, or never started. Nothing to do.
      }
      try {
        voice.gain.disconnect();
      } catch {
        // Already disconnected.
      }
    },
    FADE_OUT_S * 1000 + 80
  );
}

function stopVoiceNow(voice) {
  if (!voice) return;
  voice.timers.forEach(clearInterval);
  voice.timers = [];
  try {
    if (voice.source) voice.source.stop();
  } catch {
    // Already stopped.
  }
  try {
    voice.gain.disconnect();
  } catch {
    // Already disconnected.
  }
}

function startOscillatorVoice(loopKey) {
  const config = MUSIC_SEQUENCES[loopKey] || MUSIC_SEQUENCES.quiet;
  const voice = newVoice("oscillator");
  const play = () => {
    config.notes.forEach((freq, index) =>
      audioNote(
        freq,
        0.32,
        index * 0.28,
        config.type,
        loopKey === "quiet" ? 0.22 : 0.48,
        voice.gain
      )
    );
    if (loopKey === "archive") audioNote(196, 1.15, 0, "sine", 0.25, voice.gain);
    if (loopKey === "island") {
      audioNote(147, 0.18, 0, "triangle", 0.22, voice.gain);
      audioNote(147, 0.14, 0.62, "triangle", 0.18, voice.gain);
      audioNote(196, 0.18, 1.25, "triangle", 0.17, voice.gain);
    }
  };
  play();
  voice.timers.push(setInterval(play, config.every));
  fadeIn(voice);
  return voice;
}

function startFileVoice(basename, buffer) {
  const ctx = ensureAudio();
  const voice = newVoice("file");
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  // A track's seam is a property of the recording, not of this engine. If a commissioned loop ever
  // needs trimming, the two numbers belong in TRACKS as data rather than in a re-export.
  const track = TRACKS[audioScene];
  if (track && Number.isFinite(track.loopStart)) source.loopStart = track.loopStart;
  if (track && Number.isFinite(track.loopEnd)) source.loopEnd = track.loopEnd;
  source.connect(voice.gain);
  // **Resume where this track left off.** Without it, a map with eight NPCs plays the first six
  // seconds of its theme sixteen times and nothing else, because every conversation swaps to
  // `dialogue` and back. The synthesised path restarts at note one, as it always has.
  const offset = (trackOffsets.get(basename) || 0) % (buffer.duration || 1);
  source.start(0, offset);
  voice.source = source;
  voice.basename = basename;
  voice.offset = offset;
  voice.startedAt = ctx.currentTime;
  fadeIn(voice);
  return voice;
}

function startMusic(scene) {
  const track = TRACKS[scene];
  const loopKey = (track && track.loop) || scene;
  const file = track ? track.file : null;
  const cached = file ? bufferCache.get(file) : null;

  if (file && cached && cached.state === "ready") {
    currentVoice = startFileVoice(file, cached.buffer);
    return;
  }
  if (!file || !trackUrls[file] || (cached && cached.state === "absent")) {
    currentVoice = startOscillatorVoice(loopKey);
    return;
  }
  // The file exists but is not decoded yet. **Start synthesising immediately** rather than waiting
  // on the network — there is never a silent gap, and never a case where a slow connection makes
  // the game mute. The cost is a second or two of synthesis on a cold first visit, and nothing
  // afterwards, because the HTTP cache serves the second one.
  const generation = musicGeneration;
  currentVoice = startOscillatorVoice(loopKey);
  loadBuffer(file, "music").then((buffer) => {
    if (generation !== musicGeneration) return;
    if (!buffer) return;
    retireVoice(currentVoice);
    currentVoice = startFileVoice(file, buffer);
  });
}

/**
 * Kept exported and behaviour-compatible: `scheduleLoop("settlement")` still starts that sequence.
 * The only change is that an entry in `TRACKS` may redirect a *scene* key to a different
 * *sequence* key, and `?? scene` keeps a direct sequence name working.
 */
export function scheduleLoop(scene) {
  if (!audioEnabled) return;
  const track = TRACKS[scene];
  currentVoice = startOscillatorVoice((track && track.loop) || scene);
}

export function stopMusic() {
  musicGeneration += 1;
  stopVoiceNow(currentVoice);
  currentVoice = null;
  audioScene = null;
}

export function updateMusicForScreen(scene) {
  if (!audioEnabled) {
    stopMusic();
    return;
  }
  // `render()` rebuilds `#app` wholesale and calls this at its tail, so it runs dozens of times a
  // minute. This line is the only thing between the player and a track that restarts on every
  // button press, and it costs one string comparison.
  if (audioScene === scene) return;
  musicGeneration += 1;
  const previous = currentVoice;
  audioScene = scene;
  if (!audioContext) {
    // Nothing has ever played; no fade to perform.
    startMusic(scene);
    return;
  }
  retireVoice(previous);
  startMusic(scene);
}

function duckFor(cue) {
  if (!cue || cue.duck === null || !musicDuckGain) return;
  const ctx = audioContext;
  const now = ctx.currentTime;
  const release = now + DUCK_ATTACK_S + cue.holdS;
  // Overlapping cues extend one release rather than each scheduling their own, which is what stops
  // a second cue's release from lifting the music while a first cue is still sounding.
  duckUntil = Math.max(duckUntil, release);
  const param = musicDuckGain.gain;
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(param.value, SILENT), now);
  param.linearRampToValueAtTime(cue.duck, now + DUCK_ATTACK_S);
  param.setValueAtTime(cue.duck, duckUntil);
  param.linearRampToValueAtTime(1, duckUntil + DUCK_RELEASE_S);
}

export function playSfx(name, sourceId = null) {
  if (!audioEnabled) return;
  const now = performance.now();
  const key = `${name}:${sourceId || ""}`;
  if (lastSfxAt[key] && now - lastSfxAt[key] < 260) return;
  lastSfxAt[key] = now;
  ensureAudio();
  const cue = CUES[name];
  duckFor(cue);
  if (cue && cue.file) {
    const cached = bufferCache.get(cue.file);
    if (cached && cached.state === "ready") {
      const ctx = audioContext;
      const source = ctx.createBufferSource();
      source.buffer = cached.buffer;
      source.connect(sfxFileGain);
      source.start();
      return;
    }
    // Not decoded yet: synthesise now, and warm the cache for next time. A one-shot is too short
    // to be worth swapping mid-flight.
    if (!cached) loadBuffer(cue.file, "sfx");
  }
  if (name === "chrono") {
    [196, 247, 311, 392, 523, 659].forEach((freq, i) =>
      audioNote(freq, 0.24, i * 0.07, i % 2 ? "triangle" : "sine", 0.42)
    );
    audioNoise(0.65, 0.06, 0.16, 1400);
    audioNote(98, 0.78, 0.02, "sine", 0.28);
    return;
  }
  if (name === "return-warp") {
    [740, 659, 523, 392, 311, 247].forEach((freq, i) =>
      audioNote(freq, 0.28, i * 0.08, i % 2 ? "sine" : "triangle", 0.4)
    );
    audioNoise(0.8, 0.04, 0.2, 1800);
    audioNote(123, 1.35, 0.04, "sine", 0.3);
    audioChord([262, 392, 523], 0.62, 1.52, "triangle", 0.3);
    return;
  }
  if (name === "upload") {
    [330, 392, 494, 587, 740, 880].forEach((freq, i) =>
      audioNote(freq, 0.18, i * 0.09, "triangle", 0.46)
    );
    audioNoise(0.34, 0.04, 0.12, 2100);
    audioChord([392, 587, 784], 0.72, 0.62, "sine", 0.36);
    return;
  }
  if (name === "codex-reveal") {
    audioNote(220, 0.9, 0, "sine", 0.22);
    [330, 415, 494, 587].forEach((freq, i) =>
      audioNote(freq, 0.4, 0.1 + i * 0.14, "triangle", 0.3)
    );
    audioChord([392, 494, 659], 0.75, 0.62, "sine", 0.3);
    return;
  }
  if (name === "archive-receive") {
    audioChord([262, 330, 392], 0.42, 0, "triangle", 0.32);
    audioNote(523, 0.18, 0.32, "sine", 0.34);
    audioNote(392, 0.45, 0.48, "sine", 0.22);
    return;
  }
  if (name === "secure") {
    audioNote(392, 0.12, 0, "triangle", 0.34);
    audioNote(587, 0.14, 0.09, "triangle", 0.34);
    audioNote(784, 0.25, 0.18, "sine", 0.32);
    return;
  }
  // The counterpart to "secure", and the whole point is that it is the same gesture pointed
  // downward: two soft notes falling where secure's triad rises. A press that gathered nothing —
  // a flat interview answer logged, a fragment in the wrong frame, a claim called wrongly — and a
  // press the reducer refused outright both land here. Quiet and short on purpose: it reports, it
  // does not scold, and a student meets it far more often than its opposite (104 of the game's 156
  // authored interview answers carry nothing, by design).
  if (name === "flat") {
    audioNote(220, 0.1, 0, "sine", 0.16);
    audioNote(196, 0.17, 0.07, "sine", 0.13);
    return;
  }
  if (name === "dialogue") {
    audioNote(523, 0.08, 0, "sine", 0.18);
    audioNote(659, 0.1, 0.075, "sine", 0.16);
    return;
  }
  if (name === "quest") {
    const questMotifs = {
      "taino-context": [294, 370, 440],
      "columbus-letter": [330, 415, 494],
      "waldseemuller-map": [392, 494, 622],
    };
    const notes = questMotifs[sourceId] || [330, 392, 494];
    notes.forEach((freq, i) => audioNote(freq, 0.16, i * 0.08, "triangle", 0.28));
    audioNoise(0.1, 0.02, 0.055, sourceId === "waldseemuller-map" ? 2600 : 1200);
    return;
  }
  if (name === "toggle") {
    audioNote(440, 0.12, 0, "sine", 0.2);
    audioNote(660, 0.14, 0.1, "sine", 0.18);
  }
}

export function playQuestSfx(sourceId) {
  playSfx("quest", sourceId);
}

export function toggleAudio(scene) {
  audioEnabled = !audioEnabled;
  window.localStorage.setItem(ENABLED_KEY, String(audioEnabled));
  if (audioEnabled) {
    ensureAudio();
    playSfx("toggle");
  }
  updateMusicForScreen(scene);
}

/**
 * What the engine believes right now. Read by `window.__chronicleAudio` in main.js, which is
 * DEV-gated exactly as the other three probes are. It **reports the engine's own answer and does
 * not restate its rules** — `source` is which branch `startMusic` actually took, `loop` is what
 * `scheduleLoop` actually resolved — which is the line decision log `0093` drew for a test probe.
 */
export function audioDebugState() {
  const track = TRACKS[audioScene];
  const cache = { ready: [], absent: [], pending: [] };
  for (const [name, entry] of bufferCache) {
    if (cache[entry.state]) cache[entry.state].push(name);
  }
  return {
    enabled: audioEnabled,
    contextState: audioContext ? audioContext.state : "none",
    scene: audioScene,
    source: currentVoice ? currentVoice.kind : "none",
    file: currentVoice && currentVoice.basename ? currentVoice.basename : null,
    loop: (track && track.loop) || audioScene,
    startedAt: currentVoice ? currentVoice.startedAt : 0,
    generation: musicGeneration,
    volumes: { ...volumes },
    ducked: musicDuckGain ? musicDuckGain.gain.value < 0.999 : false,
    knownFiles: Object.keys(trackUrls),
    cache,
  };
}

/**
 * Point the engine at a different set of files. **Test and DEV only** — it exists so a spec can
 * prove the file branch without committing an audio asset, by handing over a `data:` URL it built
 * in the page. Resets the decode cache, since the URLs behind the names have changed.
 */
export function setTrackUrls(map) {
  trackUrls = { ...map };
  bufferCache.clear();
  musicLru.length = 0;
  trackOffsets.clear();
}
