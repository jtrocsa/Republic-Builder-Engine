// @vitest-environment jsdom
//
// `loadBuffer()` in `audio-engine.js` — the half of Phase 152 that has to be boring.
//
// The engine ships with `apps/web/src/assets/audio/` empty, so "there is no file" is not an error
// path, it is the normal one, and every assertion here is really about the same property: a missing
// file, a 404 and a file that will not decode all answer `null`, none of them throws, and **none of
// them is ever retried**. A scene the player walks in and out of thirty times must not issue thirty
// failing requests.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { installFakeAudioContext, makeFakeBuffer } from "./helpers/fake-audio-context.js";

let fetchCalls;
let warnSpy;

function stubFetch(handler) {
  fetchCalls = [];
  globalThis.fetch = vi.fn((url) => {
    fetchCalls.push(url);
    return handler(url);
  });
}

const okResponse = () =>
  Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("republic-builder.audio.enabled", "true");
  vi.resetModules();
  installFakeAudioContext();
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

async function loadEngine() {
  return import("../../apps/web/src/engine/audio-engine.js");
}

describe("a basename with no file", () => {
  it("answers null without touching the network (normal case — this is the shipping state)", async () => {
    stubFetch(okResponse);
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({});
    await expect(loadBuffer("richmond", "music")).resolves.toBeNull();
    expect(fetchCalls).toHaveLength(0);
  });
});

describe("a file that 404s", () => {
  it("answers null, warns once, and never asks again (edge case)", async () => {
    stubFetch(() => Promise.resolve({ ok: false, status: 404 }));
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({ richmond: "/audio/richmond.ogg" });

    await expect(loadBuffer("richmond", "music")).resolves.toBeNull();
    await expect(loadBuffer("richmond", "music")).resolves.toBeNull();
    await expect(loadBuffer("richmond", "music")).resolves.toBeNull();

    // The assertion is the *count*, not the return value — a loader without the memo returns null
    // every time too, and would issue a request every time.
    expect(fetchCalls).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe("a file that will not decode", () => {
  it("answers null and is never retried either (edge case)", async () => {
    stubFetch(okResponse);
    vi.resetModules();
    installFakeAudioContext({
      decodeAudioData: () => Promise.reject(new Error("bad container")),
    });
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({ port: "/audio/port.ogg" });

    await expect(loadBuffer("port", "music")).resolves.toBeNull();
    await expect(loadBuffer("port", "music")).resolves.toBeNull();
    expect(fetchCalls).toHaveLength(1);
  });
});

describe("a file that decodes", () => {
  it("is cached, and a second request returns the identical buffer (normal case)", async () => {
    stubFetch(okResponse);
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({ island: "/audio/island.ogg" });

    const first = await loadBuffer("island", "music");
    const second = await loadBuffer("island", "music");
    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(fetchCalls).toHaveLength(1);
  });

  it("does not issue a second request while the first is still in flight (boundary case)", async () => {
    stubFetch(okResponse);
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({ canal: "/audio/canal.ogg" });

    const [a, b] = await Promise.all([loadBuffer("canal", "music"), loadBuffer("canal", "music")]);
    expect(a).toBe(b);
    expect(fetchCalls).toHaveLength(1);
  });
});

describe("the music buffer cache is bounded", () => {
  // A 60-second stereo track decodes to about 23 MB. Eighteen of them is a dead tab on a classroom
  // Chromebook, weeks after whichever track pushed it over. Two is the working set: the playing
  // track and the one before it, which is what makes map -> dialogue -> map free.
  it("evicts the least recently used track, and re-fetches it on return (boundary case)", async () => {
    stubFetch(okResponse);
    installFakeAudioContext({ decodeAudioData: () => Promise.resolve(makeFakeBuffer(60)) });
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({
      island: "/audio/island.ogg",
      canal: "/audio/canal.ogg",
      port: "/audio/port.ogg",
    });

    await loadBuffer("island", "music");
    await loadBuffer("canal", "music");
    await loadBuffer("port", "music");
    expect(fetchCalls).toHaveLength(3);

    // `island` was pushed out by `port`; asking for it again costs a request.
    await loadBuffer("island", "music");
    expect(fetchCalls).toHaveLength(4);

    // `port` is still resident and costs nothing.
    await loadBuffer("port", "music");
    expect(fetchCalls).toHaveLength(4);
  });

  it("keeps one-shot cues unconditionally — they are under a second each (boundary case)", async () => {
    stubFetch(okResponse);
    installFakeAudioContext({ decodeAudioData: () => Promise.resolve(makeFakeBuffer(0.6)) });
    const { loadBuffer, setTrackUrls } = await loadEngine();
    setTrackUrls({ a: "/audio/a.ogg", b: "/audio/b.ogg", c: "/audio/c.ogg" });

    await loadBuffer("a", "sfx");
    await loadBuffer("b", "sfx");
    await loadBuffer("c", "sfx");
    await loadBuffer("a", "sfx");
    expect(fetchCalls).toHaveLength(3);
  });
});
