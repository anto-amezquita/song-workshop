import { mod12, parseKey, spell, type Key, type PitchClass, type Tonality } from "./notes";

/** Semitones from the tonic to each note of a major scale: W W H W W W H. */
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11] as const;

export type ScaleNote = {
  /** Spelled name, with ♯ and ♭: "F♯". */
  name: string;
  pitchClass: PitchClass;
  /** Semitones above this scale's tonic, 0–11. */
  semitones: number;
};

/** Seven notes, from the tonic. */
export type Scale = readonly ScaleNote[];

export type Step = "W" | "H";

/** The major scale of a key, each note on its own letter. */
export function majorScale(key: Key): Scale {
  const { letter, pitchClass } = parseKey(key);
  return MAJOR_STEPS.map((interval, i) => {
    const pc = mod12(pitchClass + interval);
    return { name: spell((letter + i) % 7, pc), pitchClass: pc, semitones: interval };
  });
}

/**
 * The scale the lesson shows for a key and tonality. Minor is the relative
 * minor: the same seven notes as the major key, counted from its sixth note.
 * Rotating the major scale to start on the 6 turns W W H W W W H into
 * W H W W H W W, the natural minor. So C's minor is A minor, and the spellings
 * come from the major key: D♭'s minor is B♭ minor.
 */
export function scaleFor(key: Key, tonality: Tonality): Scale {
  const major = majorScale(key);
  const start = tonality === "minor" ? 5 : 0;
  const notes = [...major.slice(start), ...major.slice(0, start)];
  const tonic = notes[0]!.pitchClass;
  return notes.map((n) => ({ ...n, semitones: mod12(n.pitchClass - tonic) }));
}

/**
 * The step from each note to the next, the seventh going up to the octave:
 * seven steps for the seven gaps between eight notes.
 */
export function stepPattern(scale: Scale): Step[] {
  return scale.map((note, i) => {
    const next = i < scale.length - 1 ? scale[i + 1]!.semitones : 12;
    return next - note.semitones === 1 ? "H" : "W";
  });
}

/** The tonic's spelled name in a tonality: "C" for C major, "A" for its relative minor. */
export function tonicName(key: Key, tonality: Tonality): string {
  return scaleFor(key, tonality)[0]!.name;
}
