import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { barSeconds, createBarLoop, createSequencer } from "./index";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0); // so Date.now() reads as ms since start
});
afterEach(() => {
  vi.useRealTimers();
});

function loopWith({ bars = 4, loop = true, bpm = 100 } = {}) {
  const state = { bars, loop, bpm };
  const played: [number, number, number][] = []; // [bar, seconds, at ms]
  const onEnd = vi.fn();
  const transport = createBarLoop({
    length: () => state.bars,
    loop: () => state.loop,
    barSeconds: () => barSeconds(state.bpm),
    onBar: (index, seconds) => played.push([index, seconds, Date.now()]),
    onEnd,
  });
  return { state, played, onEnd, transport };
}

describe("barSeconds", () => {
  it("is four beats at the tempo", () => {
    expect(barSeconds(100)).toBe(2.4);
    expect(barSeconds(60)).toBe(4);
    expect(barSeconds(150)).toBe(1.6);
  });
});

describe("the bar loop", () => {
  it("plays one bar at a time and loops back to bar 1", () => {
    const { played, transport } = loopWith();
    expect(transport.start()).toBe(true);
    vi.advanceTimersByTime(4 * 2400);
    expect(played.map(([bar, , at]) => [bar, at])).toEqual([
      [0, 0],
      [1, 2400],
      [2, 4800],
      [3, 7200],
      [0, 9600],
    ]);
    expect(transport.playing()).toBe(true);
  });

  it("stops by itself after the last bar with Loop off", () => {
    const { played, onEnd, transport } = loopWith({ loop: false });
    transport.start();
    vi.advanceTimersByTime(4 * 2400);
    expect(played.map(([bar]) => bar)).toEqual([0, 1, 2, 3]);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(transport.playing()).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(played).toHaveLength(4);
  });

  it("reads Loop at the end of the pass, so turning it off mid-pass still finishes the pass", () => {
    const { state, played, onEnd, transport } = loopWith();
    transport.start();
    vi.advanceTimersByTime(2400);
    state.loop = false;
    vi.advanceTimersByTime(3 * 2400);
    expect(played.map(([bar]) => bar)).toEqual([0, 1, 2, 3]);
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it("applies a tempo change from the next bar", () => {
    const { state, played, transport } = loopWith();
    transport.start();
    state.bpm = 60; // bar 1 is already playing at 2.4s
    vi.advanceTimersByTime(2400);
    vi.advanceTimersByTime(4000);
    expect(played.map(([bar, seconds, at]) => [bar, seconds, at])).toEqual([
      [0, 2.4, 0],
      [1, 4, 2400],
      [2, 4, 6400],
    ]);
  });

  it("goes back to bar 1 on the next bar after restart", () => {
    const { played, transport } = loopWith();
    transport.start();
    vi.advanceTimersByTime(2400); // bar 2 is playing
    transport.restart();
    vi.advanceTimersByTime(2400);
    expect(played.map(([bar]) => bar)).toEqual([0, 1, 0]);
  });

  it("follows a progression that shrinks or grows while it plays", () => {
    const { state, played, transport } = loopWith({ bars: 4 });
    transport.start();
    vi.advanceTimersByTime(2400); // bar 2 is playing
    state.bars = 2; // two bars removed
    vi.advanceTimersByTime(2400);
    state.bars = 3; // one added
    vi.advanceTimersByTime(3 * 2400);
    expect(played.map(([bar]) => bar)).toEqual([0, 1, 0, 1, 2, 0]);
  });

  it("stops at once on stop(), without calling onEnd", () => {
    const { played, onEnd, transport } = loopWith();
    transport.start();
    vi.advanceTimersByTime(1000);
    transport.stop();
    vi.advanceTimersByTime(10_000);
    expect(played).toHaveLength(1);
    expect(onEnd).not.toHaveBeenCalled();
    expect(transport.playing()).toBe(false);
  });

  it("doesn't start with no bars", () => {
    const { played, transport } = loopWith({ bars: 0 });
    expect(transport.start()).toBe(false);
    expect(transport.playing()).toBe(false);
    expect(played).toHaveLength(0);
  });

  it("ends when every bar is removed while it plays, even with Loop on", () => {
    const { state, onEnd, transport } = loopWith();
    transport.start();
    state.bars = 0;
    vi.advanceTimersByTime(2400);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(transport.playing()).toBe(false);
  });
});

describe("the sequencer", () => {
  it("runs evenly spaced steps, then finishes one interval after the last", () => {
    const sequencer = createSequencer();
    const steps: [number, number][] = [];
    const onDone = vi.fn();
    sequencer.run({
      steps: 8,
      intervalMs: 340,
      onStep: (i) => steps.push([i, Date.now()]),
      onDone,
    });
    vi.advanceTimersByTime(7 * 340);
    expect(steps).toEqual([0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i, i * 340]));
    expect(onDone).not.toHaveBeenCalled();
    expect(sequencer.running()).toBe(true);
    vi.advanceTimersByTime(340);
    expect(onDone).toHaveBeenCalledOnce();
    expect(sequencer.running()).toBe(false);
  });

  it("stops the running sequence when another starts", () => {
    const sequencer = createSequencer();
    const scale = vi.fn();
    const scaleDone = vi.fn();
    sequencer.run({ steps: 8, intervalMs: 340, onStep: scale, onDone: scaleDone });
    vi.advanceTimersByTime(340);
    const chords = vi.fn();
    sequencer.run({ steps: 7, intervalMs: 760, onStep: chords, onDone: vi.fn() });
    vi.advanceTimersByTime(10_000);
    expect(scale).toHaveBeenCalledTimes(2);
    expect(scaleDone).not.toHaveBeenCalled();
    expect(chords).toHaveBeenCalledTimes(7);
  });

  it("cancels without calling onDone", () => {
    const sequencer = createSequencer();
    const onStep = vi.fn();
    const onDone = vi.fn();
    sequencer.run({ steps: 7, intervalMs: 760, onStep, onDone });
    sequencer.cancel();
    vi.advanceTimersByTime(10_000);
    expect(onStep).toHaveBeenCalledOnce();
    expect(onDone).not.toHaveBeenCalled();
    expect(sequencer.running()).toBe(false);
  });
});
