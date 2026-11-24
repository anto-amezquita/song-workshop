// One-off runs of evenly spaced steps: "Play scale" and "Play all seven".
// Only one runs at a time: starting one, or cancel(), stops the one before,
// as the file's single side timer did.

export type SequenceOptions = {
  steps: number;
  intervalMs: number;
  /** Step i starts now. The first runs straight away. */
  onStep: (index: number) => void;
  /** One interval after the last step, when its sound and light should end. Not called on cancel. */
  onDone: () => void;
};

export type Sequencer = {
  run(options: SequenceOptions): void;
  cancel(): void;
  running(): boolean;
};

export function createSequencer(): Sequencer {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = false;

  function cancel() {
    clearTimeout(timer);
    timer = undefined;
    active = false;
  }

  return {
    run({ steps, intervalMs, onStep, onDone }) {
      cancel();
      active = true;
      let index = 0;
      const next = () => {
        if (index >= steps) {
          active = false;
          timer = undefined;
          onDone();
          return;
        }
        onStep(index);
        index++;
        timer = setTimeout(next, intervalMs);
      };
      next();
    },
    cancel,
    running: () => active,
  };
}
