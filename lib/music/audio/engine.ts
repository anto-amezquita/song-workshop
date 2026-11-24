// The only code that touches Web Audio (architecture.md §2). Every value is the
// original file's: the chain, the voices, the envelope, the strum. Nothing is re-tuned.
//
// The audio context is created on the first play call, which only ever runs
// from a click or key press, never when the module loads (architecture.md §3).

import { frequency, type ChordVoicing } from "./voicing";

export type AudioStatus = "idle" | "running" | "unavailable";

/** The parts of AudioContext the engine uses, so tests can pass a fake. */
export type AudioContextLike = Pick<
  AudioContext,
  | "currentTime"
  | "state"
  | "destination"
  | "resume"
  | "close"
  | "createGain"
  | "createOscillator"
  | "createBiquadFilter"
  | "createDynamicsCompressor"
>;

export type AudioEngine = {
  /** A chord, starting now: a sine bass and a strummed triad, struck again at half time if it's long. */
  playChord(voicing: ChordVoicing, seconds: number, velocity?: number): void;
  /** One note, as "Play scale" plays them. */
  playNote(midi: number, seconds?: number, velocity?: number): void;
  /** Fades every sounding voice out. */
  silence(): void;
  /**
   * Closes the audio context, for when the lesson goes away, so it doesn't stay
   * open after the page has moved on. The next sound would make a new one.
   */
  close(): void;
  status(): AudioStatus;
  /** Called whenever the status changes. Returns a function that stops listening. */
  onStatusChange(listener: (status: AudioStatus) => void): () => void;
};

type ContextFactory = () => AudioContextLike;

function browserContext(): AudioContextLike {
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio isn't available");
  return new Ctor();
}

export function createAudioEngine(createContext: ContextFactory = browserContext): AudioEngine {
  let ctx: AudioContextLike | null = null;
  let master: GainNode | null = null;
  let current: AudioStatus = "idle";
  /** No Web Audio at all. The only "unavailable" that's final; a failed resume isn't. */
  let noWebAudio = false;
  const voices = new Set<GainNode>();
  const listeners = new Set<(status: AudioStatus) => void>();

  function setStatus(next: AudioStatus) {
    if (next === current) return;
    current = next;
    listeners.forEach((l) => l(next));
  }

  /**
   * The context, created on first use, or null when this sound can't play.
   * With no Web Audio, that's every sound. After a failed resume, it's only
   * until a resume works: each call tries again, as the file's ac() did.
   */
  function context(): AudioContextLike | null {
    if (noWebAudio) return null;
    if (!ctx) {
      try {
        ctx = createContext();
        master = ctx.createGain();
        master.gain.value = 0.6;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 2800;
        lowpass.Q.value = 0.4;
        const compressor = ctx.createDynamicsCompressor();
        master.connect(lowpass);
        lowpass.connect(compressor);
        compressor.connect(ctx.destination);
      } catch {
        ctx = null;
        master = null;
        noWebAudio = true;
        setStatus("unavailable");
        return null;
      }
    }
    if (ctx.state !== "suspended") {
      setStatus("running");
      return ctx;
    }
    // A context closed in the meantime doesn't get to set the status.
    const resuming = ctx;
    resuming.resume().then(
      () => {
        if (ctx === resuming) setStatus("running");
      },
      () => {
        if (ctx === resuming) setStatus("unavailable");
      },
    );
    // While the last resume failed, this sound is skipped rather than queued:
    // a suspended context's clock stands still, so queued bars would all
    // sound at once when it comes back.
    return current === "unavailable" ? null : ctx;
  }

  /** One voice: the file's tone(). Two oscillators, the second a sine 7 cents sharp at half level. */
  function tone(
    c: AudioContextLike,
    midi: number,
    start: number,
    seconds: number,
    velocity = 0.1,
    type: OscillatorType = "triangle",
  ) {
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(velocity, start + 0.012);
    gain.gain.setTargetAtTime(velocity * 0.4, start + 0.03, 0.3);
    gain.gain.setTargetAtTime(0.0001, start + seconds, 0.22);
    gain.connect(master!);
    const end = start + seconds + 1.4;
    const layers: [OscillatorType, number, number][] = [
      [type, 0, 1],
      ["sine", 7, 0.5],
    ];
    layers.forEach(([oscType, detune, level], k) => {
      const osc = c.createOscillator();
      osc.type = oscType;
      osc.frequency.value = frequency(midi);
      osc.detune.value = detune;
      const layerGain = c.createGain();
      layerGain.gain.value = level;
      osc.connect(layerGain);
      layerGain.connect(gain);
      osc.start(start);
      osc.stop(end);
      if (k === 0) {
        osc.onended = () => {
          voices.delete(gain);
          gain.disconnect();
        };
      }
    });
    voices.add(gain);
  }

  return {
    playChord(voicing, seconds, velocity = 1) {
      const c = context();
      if (!c) return;
      const start = c.currentTime + 0.02;
      tone(c, voicing.bass, start, seconds, 0.2 * velocity, "sine");
      voicing.triad.forEach((m, i) =>
        tone(c, m, start + i * 0.022, seconds * 0.5, 0.09 * velocity),
      );
      if (seconds > 1.2) {
        voicing.triad.forEach((m, i) =>
          tone(c, m, start + seconds / 2 + i * 0.018, seconds * 0.45, 0.065 * velocity),
        );
      }
    },

    playNote(midi, seconds = 0.3, velocity = 0.14) {
      const c = context();
      if (!c) return;
      tone(c, midi, c.currentTime + 0.01, seconds, velocity);
    },

    silence() {
      if (!ctx) return;
      const now = ctx.currentTime;
      voices.forEach((gain) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setTargetAtTime(0.0001, now, 0.04);
        } catch {
          // A voice that has already ended can't be scheduled; it's silent anyway.
        }
      });
    },

    close() {
      const closing = ctx;
      if (!closing) return;
      ctx = null;
      master = null;
      voices.clear();
      // Back to no context yet: the next sound makes a new one and tries again.
      setStatus("idle");
      closing.close().catch(() => {
        // Already closed or closing; either way it's gone.
      });
    },

    status: () => current,

    onStatusChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
