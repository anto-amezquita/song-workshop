import { describe, expect, it, vi } from "vitest";
import { createAudioEngine, type AudioContextLike } from "./engine";
import { frequency } from "./voicing";

// A fake AudioContext that records what the engine builds and schedules.
// Tests don't listen; they check the engine asked for the right sounds (architecture.md §10).

type Call = [string, ...number[]];

class FakeParam {
  value = 0;
  calls: Call[] = [];
  setValueAtTime(v: number, t: number) {
    this.calls.push(["set", v, t]);
  }
  linearRampToValueAtTime(v: number, t: number) {
    this.calls.push(["ramp", v, t]);
  }
  setTargetAtTime(v: number, t: number, c: number) {
    this.calls.push(["target", v, t, c]);
  }
  cancelScheduledValues(t: number) {
    this.calls.push(["cancel", t]);
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  disconnected = false;
  constructor(readonly kind: string) {}
  connect(to: FakeNode) {
    this.outputs.push(to);
    return to;
  }
  disconnect() {
    this.disconnected = true;
  }
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
  constructor() {
    super("gain");
  }
}

class FakeOscillator extends FakeNode {
  type = "sine";
  frequency = new FakeParam();
  detune = new FakeParam();
  startAt = -1;
  stopAt = -1;
  onended: (() => void) | null = null;
  constructor() {
    super("oscillator");
  }
  start(t: number) {
    this.startAt = t;
  }
  stop(t: number) {
    this.stopAt = t;
  }
}

class FakeFilter extends FakeNode {
  type = "";
  frequency = new FakeParam();
  Q = new FakeParam();
  constructor() {
    super("filter");
  }
}

class FakeContext {
  currentTime = 10;
  state: AudioContextState = "running";
  destination = new FakeNode("destination");
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];
  filters: FakeFilter[] = [];
  resume = vi.fn(() => Promise.resolve());
  createGain() {
    const g = new FakeGain();
    this.gains.push(g);
    return g;
  }
  createOscillator() {
    const o = new FakeOscillator();
    this.oscillators.push(o);
    return o;
  }
  createBiquadFilter() {
    const f = new FakeFilter();
    this.filters.push(f);
    return f;
  }
  createDynamicsCompressor() {
    return new FakeNode("compressor");
  }
}

function setup() {
  const ctx = new FakeContext();
  const factory = vi.fn(() => ctx as unknown as AudioContextLike);
  const engine = createAudioEngine(factory);
  return { ctx, factory, engine };
}

/** Each voice the engine scheduled: its main oscillator and the envelope gain it feeds. */
function voices(ctx: FakeContext) {
  return ctx.oscillators
    .filter((_, i) => i % 2 === 0)
    .map((main, i) => {
      const detuned = ctx.oscillators[i * 2 + 1]!;
      const envelope = main.outputs[0]!.outputs[0] as FakeGain;
      return {
        type: main.type,
        midiHz: main.frequency.value,
        start: main.startAt,
        stop: main.stopAt,
        envelope: envelope.gain.calls,
        detuned: { type: detuned.type, cents: detuned.detune.value },
      };
    });
}

const C_MAJOR = { bass: 48, triad: [60, 64, 67] as const };

describe("the audio engine", () => {
  it("doesn't create an audio context until something plays", () => {
    const { factory, engine } = setup();
    expect(factory).not.toHaveBeenCalled();
    expect(engine.status()).toBe("idle");
    engine.silence();
    expect(factory).not.toHaveBeenCalled();
  });

  it("builds the file's chain: gain 0.6 → low-pass 2800Hz, Q 0.4 → compressor → speakers", () => {
    const { ctx, engine } = setup();
    engine.playNote(60);
    const master = ctx.gains[0]!;
    const lowpass = ctx.filters[0]!;
    expect(master.gain.value).toBe(0.6);
    expect(lowpass.type).toBe("lowpass");
    expect(lowpass.frequency.value).toBe(2800);
    expect(lowpass.Q.value).toBe(0.4);
    expect(master.outputs).toEqual([lowpass]);
    expect(lowpass.outputs[0]!.kind).toBe("compressor");
    expect(lowpass.outputs[0]!.outputs).toEqual([ctx.destination]);
    expect(engine.status()).toBe("running");
  });

  it("plays a long chord as a sine bass, a strummed triad, and the triad again at half time", () => {
    const { ctx, engine } = setup();
    engine.playChord(C_MAJOR, 2.4); // one bar at 100 BPM
    const v = voices(ctx);
    expect(v).toHaveLength(7);

    const start = 10.02;
    expect(v[0]).toMatchObject({ type: "sine", midiHz: frequency(48), start });
    expect(v[0]!.envelope[1]).toEqual(["ramp", 0.2, start + 0.012]);

    v.slice(1, 4).forEach((voice, i) => {
      expect(voice.type).toBe("triangle");
      expect(voice.midiHz).toBe(frequency(C_MAJOR.triad[i]!));
      expect(voice.start).toBeCloseTo(start + i * 0.022, 6);
      expect(voice.envelope[1]![1]).toBeCloseTo(0.09, 6);
      expect(voice.stop).toBeCloseTo(start + i * 0.022 + 1.2 + 1.4, 6);
    });

    v.slice(4).forEach((voice, i) => {
      expect(voice.start).toBeCloseTo(start + 1.2 + i * 0.018, 6);
      expect(voice.envelope[1]![1]).toBeCloseTo(0.065, 6);
      expect(voice.stop).toBeCloseTo(start + 1.2 + i * 0.018 + 2.4 * 0.45 + 1.4, 6);
    });
  });

  it("doesn't strike again for a chord of 1.2s or less", () => {
    const { ctx, engine } = setup();
    engine.playChord(C_MAJOR, 1.1);
    expect(voices(ctx)).toHaveLength(4);
  });

  it("scales a chord's levels by its velocity", () => {
    const { ctx, engine } = setup();
    engine.playChord(C_MAJOR, 1, 0.5);
    const v = voices(ctx);
    expect(v[0]!.envelope[1]![1]).toBeCloseTo(0.1, 6);
    expect(v[1]!.envelope[1]![1]).toBeCloseTo(0.045, 6);
  });

  it("shapes every voice with the file's envelope and a detuned sine underneath", () => {
    const { ctx, engine } = setup();
    engine.playNote(72);
    const [voice] = voices(ctx);
    const start = 10.01;
    expect(voice!.envelope).toEqual([
      ["set", 0, start],
      ["ramp", 0.14, start + 0.012],
      ["target", 0.14 * 0.4, start + 0.03, 0.3],
      ["target", 0.0001, start + 0.3, 0.22],
    ]);
    expect(voice!.type).toBe("triangle");
    expect(voice!.detuned).toEqual({ type: "sine", cents: 7 });
    expect(voice!.stop).toBeCloseTo(start + 0.3 + 1.4, 6);
  });

  it("fades out every sounding voice on silence, and forgets voices that have ended", () => {
    const { ctx, engine } = setup();
    engine.playChord(C_MAJOR, 1);
    const firstEnvelope = ctx.oscillators[0]!.outputs[0]!.outputs[0] as FakeGain;
    ctx.oscillators[0]!.onended!(); // the bass has finished
    expect(firstEnvelope.disconnected).toBe(true);

    ctx.currentTime = 11;
    engine.silence();
    const faded = ctx.gains.filter((g) => g.gain.calls.some((c) => c[0] === "cancel"));
    expect(faded).toHaveLength(3); // the triad, not the ended bass
    for (const g of faded) {
      expect(g.gain.calls.slice(-2)).toEqual([
        ["cancel", 11],
        ["target", 0.0001, 11, 0.04],
      ]);
    }
  });

  it("resumes a suspended context, and is running once it has", async () => {
    const { ctx, engine } = setup();
    ctx.state = "suspended";
    const seen: string[] = [];
    engine.onStatusChange((s) => seen.push(s));
    engine.playNote(60);
    expect(ctx.resume).toHaveBeenCalled();
    await Promise.resolve();
    expect(seen).toEqual(["running"]);
  });

  it("reports sound as unavailable when the context won't resume, and stays quiet after", async () => {
    const { ctx, engine } = setup();
    ctx.state = "suspended";
    ctx.resume.mockImplementation(() => Promise.reject(new Error("blocked")));
    engine.playNote(60);
    await new Promise((r) => setTimeout(r, 0));
    expect(engine.status()).toBe("unavailable");
    const before = ctx.oscillators.length;
    engine.playChord(C_MAJOR, 1);
    expect(ctx.oscillators.length).toBe(before);
  });

  it("reports sound as unavailable when there's no Web Audio, without throwing", () => {
    const listener = vi.fn();
    const engine = createAudioEngine(() => {
      throw new Error("Web Audio isn't available");
    });
    engine.onStatusChange(listener);
    expect(() => engine.playChord(C_MAJOR, 1)).not.toThrow();
    expect(engine.status()).toBe("unavailable");
    expect(listener).toHaveBeenCalledWith("unavailable");
    expect(() => engine.silence()).not.toThrow();
  });
});
