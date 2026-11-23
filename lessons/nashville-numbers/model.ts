// The lesson's state and how it changes. Pure: the reducer never plays sound
// or starts timers; the controller does that (controller.ts).

import type { Degree, Key, Tonality } from "@/lib/music/theory";
import { PRESETS, findPreset, type PresetId } from "./presets";

export type Labels = "numbers" | "names";

export const MAX_BARS = 8;
export const MIN_BPM = 60;
export const MAX_BPM = 150;

/** What's lit up right now. */
export type Lights = {
  /** The chord card that's lit, filled with the accent. */
  chord: Degree | null;
  /** Lit scale notes, 0–7 (7 is the octave). */
  notes: readonly number[];
  /** The progression slot that's playing. */
  slot: number | null;
};

export type State = {
  key: Key;
  tonality: Tonality;
  labels: Labels;
  progression: readonly Degree[];
  preset: PresetId | null;
  building: boolean;
  playing: boolean;
  loop: boolean;
  bpm: number;
  /** The lesson-path step last pressed. */
  pathStep: number | null;
  lights: Lights;
  /**
   * Goes up whenever the file rebuilds the slot row (new preset, tonality,
   * building, a chord added or removed), so every slot pops in again (§3.5).
   */
  slotsGeneration: number;
};

export const NO_LIGHTS: Lights = { chord: null, notes: [], slot: null };

export const initialState: State = {
  key: "C",
  tonality: "major",
  labels: "numbers",
  progression: PRESETS.major[0].degrees,
  preset: PRESETS.major[0].id,
  building: false,
  playing: false,
  loop: true,
  bpm: 100,
  pathStep: null,
  lights: NO_LIGHTS,
  slotsGeneration: 0,
};

export type Action =
  | { type: "key"; key: Key }
  | { type: "tonality"; tonality: Tonality }
  | { type: "labels"; labels: Labels }
  | { type: "preset"; id: PresetId }
  | { type: "build" }
  | { type: "add"; degree: Degree }
  | { type: "remove"; index: number }
  | { type: "playing"; playing: boolean }
  | { type: "lights"; lights: Partial<Lights> }
  | { type: "loop"; loop: boolean }
  | { type: "bpm"; bpm: number }
  | { type: "path"; step: number };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "key":
      return action.key === state.key ? state : { ...state, key: action.key };

    case "tonality": {
      if (action.tonality === state.tonality) return state;
      // Switching tonality loads its first preset, unless you're building your own.
      const first = PRESETS[action.tonality][0];
      return {
        ...state,
        tonality: action.tonality,
        ...(state.building ? {} : { preset: first.id, progression: first.degrees }),
        slotsGeneration: state.slotsGeneration + 1,
      };
    }

    case "labels":
      return { ...state, labels: action.labels };

    case "preset": {
      const preset = findPreset(state.tonality, action.id);
      if (!preset) return state;
      return {
        ...state,
        preset: action.id,
        building: false,
        progression: preset.degrees,
        slotsGeneration: state.slotsGeneration + 1,
      };
    }

    case "build":
      return {
        ...state,
        building: true,
        preset: null,
        progression: [],
        slotsGeneration: state.slotsGeneration + 1,
      };

    case "add":
      if (!state.building || state.progression.length >= MAX_BARS) return state;
      return {
        ...state,
        progression: [...state.progression, action.degree],
        slotsGeneration: state.slotsGeneration + 1,
      };

    case "remove":
      if (action.index < 0 || action.index >= state.progression.length) return state;
      return {
        ...state,
        progression: state.progression.filter((_, i) => i !== action.index),
        slotsGeneration: state.slotsGeneration + 1,
      };

    case "playing":
      return { ...state, playing: action.playing };

    case "lights":
      return { ...state, lights: { ...state.lights, ...action.lights } };

    case "loop":
      return { ...state, loop: action.loop };

    case "bpm":
      return { ...state, bpm: Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(action.bpm))) };

    case "path":
      return { ...state, pathStep: action.step };
  }
}

export type LabStore = ReturnType<typeof createLabStore>;

/**
 * The lesson's state outside React: the reducer behind getState, dispatch and
 * subscribe. The controller reads the latest state from it between renders
 * (the transport calls back on its own timer); React reads it through
 * useSyncExternalStore.
 */
export function createLabStore(initial: State = initialState) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action: Action) {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
