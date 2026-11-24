// Which MIDI notes a chord or scale note uses. Pure: it lives beside the audio
// engine because it's about how things sound, but it never touches Web Audio.

import type { Degree, Scale } from "../theory";

export type ChordVoicing = {
  /** One bass note: the root, in the tonic's octave. */
  bass: number;
  /** Root, third and fifth, an octave above the bass. */
  triad: readonly [number, number, number];
};

/**
 * The MIDI note of the tonic. It sits in octave 3 (C3 = 48), except for tonics
 * from F♯ up, which drop to octave 2. That keeps every key's chords in the
 * same comfortable range instead of climbing with the key.
 */
export function tonicMidi(scale: Scale): number {
  const pc = scale[0]!.pitchClass;
  return 48 + pc - (pc >= 6 ? 12 : 0);
}

/** The chord on a degree, voiced as the file voices it. */
export function chordVoicing(scale: Scale, degree: Degree): ChordVoicing {
  const tonic = tonicMidi(scale);
  // The k-th note up from the root, climbing into the next octave when the stack wraps.
  const at = (k: number) =>
    tonic + scale[(degree + k) % 7]!.semitones + 12 * Math.floor((degree + k) / 7);
  return { bass: at(0), triad: [at(0) + 12, at(2) + 12, at(4) + 12] };
}

/** The scale's notes for "Play scale": 0–6 are the scale, 7 is the octave. One octave above the tonic. */
export function scaleNoteMidi(scale: Scale, index: number): number {
  const base = tonicMidi(scale) + 12;
  return base + (index === 7 ? 12 : scale[index]!.semitones);
}

/** Frequency of a MIDI note, A4 (69) = 440Hz. */
export function frequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
