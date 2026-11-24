// Keeps time for a progression: one bar at a time, calling the lesson back on
// each bar. The lesson decides what to play and light (architecture.md §2).
//
// One setTimeout per bar, as the original file does. That drifts slightly,
// which is fine for chords; the rhythm lesson will need the audio clock instead.

/** Four beats at the tempo, in seconds. */
export function barSeconds(bpm: number): number {
  return (4 * 60) / bpm;
}

export type BarLoopOptions = {
  /** Bars in the progression now. Read before every bar, so adding or removing applies at once. */
  length: () => number;
  /** Whether to go back to bar 1 after the last. Read at the end of each pass. */
  loop: () => boolean;
  /** One bar's length in seconds. Read before every bar, so a tempo change applies from the next. */
  barSeconds: () => number;
  /** A bar starts: play it and light it. */
  onBar: (index: number, seconds: number) => void;
  /** Playback stopped by itself, after the last bar with Loop off. Not called by stop(). */
  onEnd: () => void;
};

export type BarLoop = {
  /** Starts from bar 1. Returns false, and does nothing, if there are no bars. */
  start(): boolean;
  stop(): void;
  /** While playing: the next bar is bar 1 again, as when a new preset is chosen. */
  restart(): void;
  playing(): boolean;
};

export function createBarLoop(options: BarLoopOptions): BarLoop {
  let playing = false;
  let step = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function tick() {
    if (!playing) return;
    if (step >= options.length()) {
      if (options.loop() && options.length() > 0) {
        step = 0;
      } else {
        playing = false;
        options.onEnd();
        return;
      }
    }
    const seconds = options.barSeconds();
    options.onBar(step, seconds);
    step++;
    timer = setTimeout(tick, seconds * 1000);
  }

  return {
    start() {
      if (options.length() === 0) return false;
      clearTimeout(timer);
      playing = true;
      step = 0;
      tick();
      return true;
    },
    stop() {
      playing = false;
      clearTimeout(timer);
    },
    restart() {
      if (playing) step = 0;
    },
    playing: () => playing,
  };
}
