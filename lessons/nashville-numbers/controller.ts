// What happens when someone uses the lesson: the original file's actions, with
// the same order of events. It drives the reducer (model.ts), the audio engine
// and the transport. No React here, so it can be tested on its own.
//
// It reads the latest state through getState(), not a render's snapshot,
// because the transport's bar callbacks run between renders.

import type { AudioEngine } from "@/lib/music/audio/engine";
import { chordVoicing, scaleNoteMidi } from "@/lib/music/audio/voicing";
import {
  KEYS,
  chordsFor,
  scaleFor,
  type Degree,
  type Key,
  type Tonality,
} from "@/lib/music/theory";
import { barSeconds, createBarLoop, createSequencer } from "@/lib/music/transport";
import { announce } from "./copy";
import { MAX_BARS, NO_LIGHTS, type Action, type Labels, type State } from "./model";
import { PATH } from "./path";
import type { PresetId } from "./presets";

export type PanelId = "key" | "scale" | "chords" | "progressions";

/** How long a tapped chord stays lit when nothing is playing (ms). */
export const TAP_LIGHT_MS = 900;
/** A tapped chord rings this long (s). */
export const TAP_SECONDS = 1.4;
/** "Play scale": one note every 340ms. */
export const SCALE_STEP_MS = 340;
/** "Play all seven": one chord every 760ms, each 1.1s long. */
export const ALL_CHORDS_STEP_MS = 760;
export const ALL_CHORDS_SECONDS = 1.1;

type Deps = {
  getState: () => State;
  dispatch: (action: Action) => void;
  engine: AudioEngine;
  highlight: (panel: PanelId) => void;
  say: (message: string) => void;
};

export type Controller = ReturnType<typeof createController>;

export function createController({ getState, dispatch, engine, highlight, say }: Deps) {
  const sequencer = createSequencer();
  let tapTimer: ReturnType<typeof setTimeout> | undefined;

  const scale = () => scaleFor(getState().key, getState().tonality);

  /** Lights a chord card and its three notes in the scale; null unlights both. */
  function light(degree: Degree | null, extra: { slot?: number | null } = {}) {
    const notes = degree === null ? [] : chordsFor(scale())[degree]!.tones;
    dispatch({ type: "lights", lights: { chord: degree, notes, ...extra } });
  }

  function playChord(degree: Degree, seconds: number) {
    engine.playChord(chordVoicing(scale(), degree), seconds);
  }

  function endPlayback() {
    dispatch({ type: "playing", playing: false });
    engine.silence();
    dispatch({ type: "lights", lights: NO_LIGHTS });
  }

  const transport = createBarLoop({
    length: () => getState().progression.length,
    loop: () => getState().loop,
    barSeconds: () => barSeconds(getState().bpm),
    onBar: (bar, seconds) => {
      const degree = getState().progression[bar]!;
      playChord(degree, seconds);
      light(degree, { slot: bar });
    },
    onEnd: endPlayback,
  });

  function stop() {
    transport.stop();
    endPlayback();
  }

  function start() {
    if (getState().progression.length === 0) {
      highlight("chords");
      return;
    }
    sequencer.cancel();
    dispatch({ type: "playing", playing: true });
    transport.start();
  }

  function loadPreset(id: PresetId) {
    dispatch({ type: "preset", id });
    if (getState().playing) transport.restart();
    else start();
  }

  function setTonality(tonality: Tonality) {
    dispatch({ type: "tonality", tonality });
  }

  function playScale() {
    stop();
    sequencer.run({
      steps: 8,
      intervalMs: SCALE_STEP_MS,
      onStep: (i) => {
        engine.playNote(scaleNoteMidi(scale(), i));
        dispatch({ type: "lights", lights: { notes: [i] } });
      },
      onDone: () => dispatch({ type: "lights", lights: { notes: [] } }),
    });
  }

  function playAllChords() {
    stop();
    sequencer.run({
      steps: 7,
      intervalMs: ALL_CHORDS_STEP_MS,
      onStep: (i) => {
        playChord(i as Degree, ALL_CHORDS_SECONDS);
        light(i as Degree);
      },
      onDone: () => light(null),
    });
  }

  function majorFirst() {
    if (getState().tonality !== "major") setTonality("major");
  }

  return {
    setKey: (key: Key) => dispatch({ type: "key", key }),
    setTonality,
    setLabels: (labels: Labels) => dispatch({ type: "labels", labels }),
    setLoop: (loop: boolean) => dispatch({ type: "loop", loop }),
    setBpm: (bpm: number) => dispatch({ type: "bpm", bpm }),
    loadPreset,
    playScale,
    playAllChords,

    togglePlay() {
      if (getState().playing) stop();
      else start();
    },

    startBuilding() {
      stop();
      dispatch({ type: "build" });
      highlight("chords");
    },

    tapChord(degree: Degree) {
      sequencer.cancel();
      playChord(degree, TAP_SECONDS);
      light(degree);
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        if (!getState().playing) light(null);
      }, TAP_LIGHT_MS);

      const { building, progression, labels } = getState();
      if (!building) return;
      if (progression.length >= MAX_BARS) {
        say(announce.full);
        return;
      }
      dispatch({ type: "add", degree });
      const chord = chordsFor(scale())[degree]!;
      say(announce.added(labels === "numbers" ? chord.number : chord.name, progression.length));
    },

    removeBar(index: number) {
      dispatch({ type: "remove", index });
      say(announce.removed(index));
    },

    runPathStep(step: number) {
      dispatch({ type: "path", step });
      switch (PATH[step]?.action) {
        case "number-the-scale":
          majorFirst();
          highlight("scale");
          playScale();
          break;
        case "chord-on-every-note":
          majorFirst();
          highlight("chords");
          playAllChords();
          break;
        case "hear-a-pattern":
          majorFirst();
          stop();
          loadPreset("pop");
          highlight("progressions");
          break;
        case "move-to-another-key": {
          if (!getState().playing) {
            majorFirst();
            loadPreset("pop");
          }
          const next = (KEYS.indexOf(getState().key) + 1) % KEYS.length;
          dispatch({ type: "key", key: KEYS[next]! });
          highlight("key");
          break;
        }
        case "same-notes-new-home":
          stop();
          setTonality("minor");
          loadPreset("minorpop");
          highlight("key");
          break;
      }
    },

    /** Stops everything and closes the audio context, for when the lesson unmounts. */
    dispose() {
      transport.stop();
      sequencer.cancel();
      clearTimeout(tapTimer);
      engine.close();
    },
  };
}
