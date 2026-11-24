import type { Scale } from "./scales";

export type ChordQuality = "major" | "minor" | "dim";

/** A degree of the scale, 0–6. Chord 1 is degree 0. */
export type Degree = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Chord = {
  degree: Degree;
  quality: ChordQuality;
  /** Nashville number: "1", "2m", "7°". */
  number: string;
  /** Chord name in the key: "C", "Dm", "B°". */
  name: string;
  /** The chord's three notes, as scale degrees (root, third, fifth). */
  tones: readonly [Degree, Degree, Degree];
};

export const DEGREES: readonly Degree[] = [0, 1, 2, 3, 4, 5, 6];

const SUFFIX: Record<ChordQuality, string> = { major: "", minor: "m", dim: "°" };

/**
 * One chord on each note of the scale, built by stacking every other note:
 * root, third and fifth. Its quality comes from the gaps. A third of 4
 * semitones is major. A third of 3 is minor, unless the fifth is only 6
 * semitones, which makes it diminished. In any major key that gives
 * major, minor, minor, major, major, minor, diminished.
 */
export function chordsFor(scale: Scale): Chord[] {
  return DEGREES.map((degree) => {
    // Semitones above the tonic, counting up through the octave when the stack wraps.
    const above = (k: number) =>
      scale[(degree + k) % 7]!.semitones + 12 * Math.floor((degree + k) / 7);
    const third = above(2) - above(0);
    const fifth = above(4) - above(0);
    const quality: ChordQuality = third === 4 ? "major" : fifth === 6 ? "dim" : "minor";
    const suffix = SUFFIX[quality];
    return {
      degree,
      quality,
      number: `${degree + 1}${suffix}`,
      name: `${scale[degree]!.name}${suffix}`,
      tones: [degree, ((degree + 2) % 7) as Degree, ((degree + 4) % 7) as Degree],
    };
  });
}

/** A progression's numbers, joined with en dashes: "1–5–6m–4". */
export function progressionPattern(chords: readonly Chord[], degrees: readonly Degree[]): string {
  return degrees.map((d) => chords[d]!.number).join("–");
}
