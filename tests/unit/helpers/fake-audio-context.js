// A hand-written stand-in for the Web Audio API, enough for `audio-engine.js` and no more.
//
// Not collected by vitest — `vitest.config.js` includes `tests/unit/**/*.test.js` only, so a
// `helpers/` folder beside the specs is a module, not a suite.
//
// It exists because the thing worth asserting about the bus graph is **arithmetic**: the product of
// every gain on the path from a synthesised note to the destination has to come out at exactly
// 0.045, which is what the single `audioMaster` gain was before this graph replaced it. jsdom has no
// AudioContext at all, and a mock that only records calls could not answer that question.
//
// Ramps record their automation *and* settle `.value` to the target, which models the state after
// the ramp completes. That is the state every assertion here is about.

function makeParam(initial) {
  const automation = [];
  const param = {
    value: initial,
    automation,
    setValueAtTime(value, time) {
      automation.push({ kind: "set", value, time });
      param.value = value;
      return param;
    },
    cancelScheduledValues(time) {
      automation.push({ kind: "cancel", time });
      return param;
    },
    exponentialRampToValueAtTime(value, time) {
      automation.push({ kind: "exp", value, time });
      param.value = value;
      return param;
    },
    linearRampToValueAtTime(value, time) {
      automation.push({ kind: "linear", value, time });
      param.value = value;
      return param;
    },
  };
  return param;
}

function attachConnect(node) {
  node.outputs = [];
  node.connect = (target) => {
    node.outputs.push(target);
    return target;
  };
  node.disconnect = () => {
    node.outputs.length = 0;
    node.disconnected = true;
  };
  return node;
}

export function createFakeAudioContext(options = {}) {
  const ctx = {
    state: options.state || "running",
    sampleRate: 48000,
    currentTime: 0,
    destination: { kind: "destination", outputs: [] },
    resume() {
      ctx.state = "running";
      return Promise.resolve();
    },
    createGain() {
      const node = attachConnect({ kind: "gain", gain: makeParam(1) });
      ctx.gains.push(node);
      return node;
    },
    createOscillator() {
      const node = attachConnect({
        kind: "oscillator",
        type: "sine",
        frequency: makeParam(440),
        started: false,
        stopped: false,
        start() {
          node.started = true;
        },
        stop() {
          node.stopped = true;
        },
      });
      ctx.oscillators.push(node);
      return node;
    },
    createBufferSource() {
      const node = attachConnect({
        kind: "bufferSource",
        buffer: null,
        loop: false,
        startedAt: null,
        startOffset: null,
        stopped: false,
        start(when = 0, offset = 0) {
          node.startedAt = when;
          node.startOffset = offset;
        },
        stop() {
          node.stopped = true;
        },
      });
      ctx.bufferSources.push(node);
      return node;
    },
    createBiquadFilter() {
      return attachConnect({ kind: "filter", type: "lowpass", frequency: makeParam(350), Q: {} });
    },
    createBuffer(channels, length, sampleRate) {
      return {
        kind: "buffer",
        numberOfChannels: channels,
        length,
        sampleRate,
        duration: length / sampleRate,
        getChannelData: () => new Float32Array(length),
      };
    },
    decodeAudioData: options.decodeAudioData || (() => Promise.resolve(makeFakeBuffer(60))),
    gains: [],
    oscillators: [],
    bufferSources: [],
  };
  return ctx;
}

export function makeFakeBuffer(durationSeconds = 60) {
  return { kind: "buffer", duration: durationSeconds, numberOfChannels: 2, sampleRate: 48000 };
}

/**
 * Multiply every gain on the path from `node` to the destination.
 *
 * This engine's graph is a chain — each node fans out to exactly one target — so a walk is enough,
 * and a fan-out would be a design change worth failing on rather than averaging over.
 */
export function gainToDestination(node, ctx) {
  let total = node.kind === "gain" ? node.gain.value : 1;
  let current = node;
  const seen = new Set();
  while (current && current !== ctx.destination) {
    if (seen.has(current)) throw new Error("cycle in the audio graph");
    seen.add(current);
    const next = current.outputs[0];
    if (!next) return null;
    if (next === ctx.destination) return total;
    if (next.kind === "gain") total *= next.gain.value;
    current = next;
  }
  return total;
}

/** Install the fake as `window.AudioContext`, and hand back the instance the engine will build. */
export function installFakeAudioContext(options = {}) {
  const instances = [];
  window.AudioContext = function FakeAudioContext() {
    const ctx = createFakeAudioContext(options);
    instances.push(ctx);
    return ctx;
  };
  return instances;
}
