import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AudioEngine } from "@/lib/music/audio/engine";
import { chordVoicing, scaleNoteMidi } from "@/lib/music/audio/voicing";
import { scaleFor, type Degree, type Tonality } from "@/lib/music/theory";
import { TAP_LIGHT_MS, createController } from "./controller";
import { createLabStore } from "./model";

// The sound engine is faked: tests check what the lesson asked it to play (architecture.md §10).
function setup() {
  const store = createLabStore();
  const engine = {
    playChord: vi.fn(),
    playNote: vi.fn(),
    silence: vi.fn(),
    status: () => "running" as const,
    onStatusChange: () => () => {},
  } satisfies AudioEngine;
  const highlight = vi.fn();
  const say = vi.fn();
  const c = createController({
    getState: store.getState,
    dispatch: store.dispatch,
    engine,
    highlight,
    say,
  });
  return { store, engine, highlight, say, c, s: store.getState };
}

const voicing = (
  key: Parameters<typeof scaleFor>[0],
  degree: Degree,
  tonality: Tonality = "major",
) => chordVoicing(scaleFor(key, tonality), degree);

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("playing a progression", () => {
  it("plays one chord a bar, lighting the chord, its notes and its slot", () => {
    const { c, engine, s } = setup();
    c.togglePlay();
    expect(s().playing).toBe(true);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 0), 2.4);
    expect(s().lights).toEqual({ chord: 0, notes: [0, 2, 4], slot: 0 });

    vi.advanceTimersByTime(2400);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 4), 2.4);
    expect(s().lights).toEqual({ chord: 4, notes: [4, 6, 1], slot: 1 });
  });

  it("stops, silences and unlights everything", () => {
    const { c, engine, s } = setup();
    c.togglePlay();
    c.togglePlay();
    expect(s().playing).toBe(false);
    expect(engine.silence).toHaveBeenCalled();
    expect(s().lights).toEqual({ chord: null, notes: [], slot: null });
    vi.advanceTimersByTime(10_000);
    expect(engine.playChord).toHaveBeenCalledOnce();
  });

  it("stops by itself after the last bar with Loop off", () => {
    const { c, s } = setup();
    c.setLoop(false);
    c.togglePlay();
    vi.advanceTimersByTime(4 * 2400);
    expect(s().playing).toBe(false);
    expect(s().lights.slot).toBeNull();
  });

  it("highlights the chords instead of playing an empty progression", () => {
    const { c, engine, highlight, s } = setup();
    c.startBuilding();
    c.togglePlay();
    expect(s().playing).toBe(false);
    expect(engine.playChord).not.toHaveBeenCalled();
    expect(highlight).toHaveBeenLastCalledWith("chords");
  });

  it("plays the new key from the next bar when the key changes", () => {
    const { c, engine } = setup();
    c.togglePlay();
    c.setKey("G");
    vi.advanceTimersByTime(2400);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("G", 4), 2.4);
  });
});

describe("presets", () => {
  it("start playing when chosen", () => {
    const { c, engine, s } = setup();
    c.loadPreset("rock");
    expect(s().playing).toBe(true);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 0), 2.4);
  });

  it("start from bar 1 at the next bar when chosen during playback", () => {
    const { c, engine, s } = setup();
    c.togglePlay();
    vi.advanceTimersByTime(2400); // bar 2 of Pop anthem
    c.loadPreset("moody");
    expect(engine.playChord).toHaveBeenCalledTimes(2); // nothing new until the bar ends
    vi.advanceTimersByTime(2400);
    expect(s().lights.slot).toBe(0);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 5), 2.4);
  });
});

describe("tapping a chord", () => {
  it("plays it for 1.4s and lights it for 900ms", () => {
    const { c, engine, s } = setup();
    c.tapChord(3);
    expect(engine.playChord).toHaveBeenCalledWith(voicing("C", 3), 1.4);
    expect(s().lights).toMatchObject({ chord: 3, notes: [3, 5, 0] });
    vi.advanceTimersByTime(TAP_LIGHT_MS - 1);
    expect(s().lights.chord).toBe(3);
    vi.advanceTimersByTime(1);
    expect(s().lights).toMatchObject({ chord: null, notes: [] });
  });

  it("stays lit if a progression is playing when its light would go out", () => {
    const { c, s } = setup();
    c.togglePlay();
    c.tapChord(2);
    vi.advanceTimersByTime(TAP_LIGHT_MS);
    expect(s().lights.chord).toBe(2);
  });

  it("adds it to your own progression, up to eight, and says so", () => {
    const { c, say, s } = setup();
    c.startBuilding();
    c.tapChord(4);
    expect(s().progression).toEqual([4]);
    expect(say).toHaveBeenLastCalledWith("Added 5 as bar 1.");
    c.setLabels("names");
    c.tapChord(5);
    expect(say).toHaveBeenLastCalledWith("Added Am as bar 2.");
    for (let i = 0; i < 6; i++) c.tapChord(0);
    expect(s().progression).toHaveLength(8);
    c.tapChord(1);
    expect(s().progression).toHaveLength(8);
    expect(say).toHaveBeenLastCalledWith("The progression is full: eight bars.");
  });

  it("doesn't add anything outside building", () => {
    const { c, say, s } = setup();
    c.tapChord(1);
    expect(s().progression).toEqual([0, 4, 5, 3]);
    expect(say).not.toHaveBeenCalled();
  });

  it("removes a bar and says so", () => {
    const { c, say, s } = setup();
    c.startBuilding();
    c.tapChord(0);
    c.tapChord(3);
    c.removeBar(0);
    expect(s().progression).toEqual([3]);
    expect(say).toHaveBeenLastCalledWith("Removed bar 1.");
  });
});

describe("Play scale and Play all seven", () => {
  it("plays the eight notes 340ms apart, lighting each, then unlights", () => {
    const { c, engine, s } = setup();
    c.playScale();
    const scale = scaleFor("C", "major");
    for (let i = 0; i < 8; i++) {
      expect(engine.playNote).toHaveBeenLastCalledWith(scaleNoteMidi(scale, i));
      expect(s().lights.notes).toEqual([i]);
      vi.advanceTimersByTime(340);
    }
    expect(s().lights.notes).toEqual([]);
    expect(engine.playNote).toHaveBeenCalledTimes(8);
  });

  it("stops a playing progression first", () => {
    const { c, s } = setup();
    c.togglePlay();
    c.playScale();
    expect(s().playing).toBe(false);
  });

  it("plays all seven chords 760ms apart, 1.1s each, then unlights", () => {
    const { c, engine, s } = setup();
    c.playAllChords();
    vi.advanceTimersByTime(6 * 760);
    expect(engine.playChord).toHaveBeenCalledTimes(7);
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 6), 1.1);
    expect(s().lights.chord).toBe(6);
    vi.advanceTimersByTime(760);
    expect(s().lights).toMatchObject({ chord: null, notes: [] });
  });

  it("are cut short by tapping a chord", () => {
    const { c, engine } = setup();
    c.playScale();
    c.tapChord(0);
    vi.advanceTimersByTime(5000);
    expect(engine.playNote).toHaveBeenCalledOnce();
  });
});

describe("the lesson path", () => {
  it("1: switches to major, highlights the scale and plays it", () => {
    const { c, highlight, engine, s } = setup();
    c.setTonality("minor");
    c.runPathStep(0);
    expect(s()).toMatchObject({ pathStep: 0, tonality: "major" });
    expect(highlight).toHaveBeenLastCalledWith("scale");
    expect(engine.playNote).toHaveBeenCalledOnce();
  });

  it("2: highlights the chords and plays all seven", () => {
    const { c, highlight, engine } = setup();
    c.runPathStep(1);
    expect(highlight).toHaveBeenLastCalledWith("chords");
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 0), 1.1);
  });

  it("3: plays Pop anthem from the start and highlights the progressions", () => {
    const { c, highlight, s } = setup();
    c.loadPreset("jazz");
    vi.advanceTimersByTime(2400);
    c.runPathStep(2);
    expect(s()).toMatchObject({ preset: "pop", playing: true });
    expect(s().lights.slot).toBe(0);
    expect(highlight).toHaveBeenLastCalledWith("progressions");
  });

  it("4: starts Pop anthem if nothing is playing, then moves one key round the circle", () => {
    const { c, highlight, s } = setup();
    c.runPathStep(3);
    expect(s()).toMatchObject({ key: "G", preset: "pop", playing: true });
    expect(highlight).toHaveBeenLastCalledWith("key");
    c.runPathStep(3);
    expect(s().key).toBe("D");
  });

  it("4: keeps whatever is already playing", () => {
    const { c, s } = setup();
    c.loadPreset("doowop");
    c.runPathStep(3);
    expect(s()).toMatchObject({ key: "G", preset: "doowop" });
  });

  it("4: wraps from F back to C", () => {
    const { c, s } = setup();
    c.setKey("F");
    c.runPathStep(3);
    expect(s().key).toBe("C");
  });

  it("5: switches to minor and plays Minor pop", () => {
    const { c, highlight, engine, s } = setup();
    c.runPathStep(4);
    expect(s()).toMatchObject({ tonality: "minor", preset: "minorpop", playing: true });
    expect(engine.playChord).toHaveBeenLastCalledWith(voicing("C", 0, "minor"), 2.4);
    expect(highlight).toHaveBeenLastCalledWith("key");
  });
});

describe("dispose", () => {
  it("stops every timer and sound", () => {
    const { c, engine } = setup();
    c.togglePlay();
    c.dispose();
    vi.advanceTimersByTime(10_000);
    expect(engine.playChord).toHaveBeenCalledOnce();
    expect(engine.silence).toHaveBeenCalled();
  });
});
