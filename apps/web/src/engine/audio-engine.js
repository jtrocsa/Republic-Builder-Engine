// Procedural Web Audio engine (music loops + one-shot SFX) for the whole game — oscillator/
// noise-buffer synthesis only, no sample assets. Self-contained: owns its own AudioContext,
// gain nodes, and the `audioEnabled` on/off persistence (localStorage key
// "republic-builder.audio.enabled"). The one place content leaks in is data, not logic:
// `playSfx`'s per-name note tables (names like "chrono"/"secure") and the `quest` case's
// `questMotifs` map (keyed by source IDs like "taino-context"), plus `scheduleLoop`'s
// `sequences` map (keyed by scene names like "island"/"settlement"). These are literal data
// tables, not logic reaching back into main.js — same shape as tiled-map-loader.js's tolerance
// for tileset-path assumptions. `sceneForMusic()` — the function that decides *which* scene
// string to pass into `updateMusicForScreen`/`toggleAudio` — deliberately stays in main.js;
// it reads `progress.currentScreen`/`activeFieldMap()`, which is screen-routing policy, not
// audio logic.

let audioEnabled = window.localStorage.getItem("republic-builder.audio.enabled") === "true";
let audioContext = null;
let audioMaster = null;
let audioScene = null;
let audioTimers = [];
let lastSfxAt = {};

export function isAudioEnabled() {
  return audioEnabled;
}

export function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioMaster = audioContext.createGain();
    audioMaster.gain.value = 0.045;
    audioMaster.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}
export function audioNote(freq, duration = 0.22, delay = 0, type = "sine", gainValue = 0.55) {
  if (!audioEnabled) return;
  const ctx = ensureAudio();
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audioMaster);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}
export function audioNoise(duration = 0.24, delay = 0, gainValue = 0.25, filterFreq = 900) {
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
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  noise.connect(filter).connect(gain).connect(audioMaster);
  noise.start(start);
  noise.stop(start + duration + 0.03);
}
export function audioChord(notes, duration = 0.32, delay = 0, type = "triangle", gainValue = 0.32) {
  notes.forEach((freq, index) =>
    audioNote(freq, duration, delay + index * 0.015, type, gainValue / Math.max(1.2, notes.length))
  );
}
export function playSfx(name, sourceId = null) {
  if (!audioEnabled) return;
  const now = performance.now();
  const key = `${name}:${sourceId || ""}`;
  if (lastSfxAt[key] && now - lastSfxAt[key] < 260) return;
  lastSfxAt[key] = now;
  ensureAudio();
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
export function stopMusic() {
  audioTimers.forEach(clearInterval);
  audioTimers = [];
  audioScene = null;
}
export function scheduleLoop(scene) {
  if (!audioEnabled) return;
  const sequences = {
    archive: { every: 3600, notes: [392, 523, 587, 523, 440, 392], type: "triangle" },
    // Unit 1 field motif: softer hand-drum pulse plus flute-like pentatonic movement.
    island: { every: 3200, notes: [294, 349, 392, 440, 392, 349, 330], type: "sine" },
    // Unit 2 field motif: steadier hymn-like settlement theme, lower and squarer.
    settlement: { every: 3600, notes: [262, 330, 392, 330, 294, 262, 220], type: "triangle" },
    dialogue: { every: 4300, notes: [440, 523, 659, 523], type: "sine" },
    upload: { every: 2300, notes: [392, 494, 587, 740, 784], type: "triangle" },
    quiet: { every: 6000, notes: [261.63], type: "sine" },
  };
  const config = sequences[scene] || sequences.quiet;
  const play = () => {
    config.notes.forEach((freq, index) =>
      audioNote(freq, 0.32, index * 0.28, config.type, scene === "quiet" ? 0.22 : 0.48)
    );
    if (scene === "archive") audioNote(196, 1.15, 0, "sine", 0.25);
    if (scene === "island") {
      audioNote(147, 0.18, 0, "triangle", 0.22);
      audioNote(147, 0.14, 0.62, "triangle", 0.18);
      audioNote(196, 0.18, 1.25, "triangle", 0.17);
    }
  };
  play();
  audioTimers.push(setInterval(play, config.every));
}
export function updateMusicForScreen(scene) {
  if (!audioEnabled) {
    stopMusic();
    return;
  }
  if (audioScene === scene) return;
  stopMusic();
  audioScene = scene;
  scheduleLoop(scene);
}
export function toggleAudio(scene) {
  audioEnabled = !audioEnabled;
  window.localStorage.setItem("republic-builder.audio.enabled", String(audioEnabled));
  if (audioEnabled) {
    ensureAudio();
    playSfx("toggle");
  }
  updateMusicForScreen(scene);
}
