// Note names and how they're spelled. Pure: no DOM, no audio, no React.

/** The seven letter names, in order from C. */
export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];

/** The pitch class (0–11, C = 0) of each natural letter. */
const LETTER_PITCH_CLASS = [0, 2, 4, 5, 7, 9, 11] as const;

/**
 * The twelve major keys, in circle-of-fifths order. Each step adds a sharp,
 * until the flat keys take over at D♭, so every key is spelled with the fewest
 * accidentals: F♯ rather than G♭, D♭ rather than C♯. Neighbours share six of
 * their seven notes.
 */
export const KEYS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"] as const;
export type Key = (typeof KEYS)[number];

export type Tonality = "major" | "minor";

/** A pitch class: 0–11, with C = 0. */
export type PitchClass = number;

export type ParsedKey = { letter: number; pitchClass: PitchClass };

/** "F#" → F (letter index 3) and pitch class 6. */
export function parseKey(key: Key): ParsedKey {
  const letter = LETTERS.indexOf(key[0] as Letter);
  const accidental = key.slice(1) === "#" ? 1 : key.slice(1) === "b" ? -1 : 0;
  return { letter, pitchClass: mod12(LETTER_PITCH_CLASS[letter]! + accidental) };
}

/**
 * Spells a pitch class on a given letter: pitch class 6 on F is F♯, on G is G♭.
 * A scale uses each letter once, so the letter is fixed first and the
 * accidentals follow from it. That's why E♯ appears in F♯ major, not F.
 */
export function spell(letter: number, pitchClass: PitchClass): string {
  let distance = mod12(pitchClass - LETTER_PITCH_CLASS[letter]!);
  if (distance > 6) distance -= 12;
  const accidentals = distance > 0 ? "♯".repeat(distance) : "♭".repeat(-distance);
  return LETTERS[letter] + accidentals;
}

/** The key's own name, spelled: "F#" → "F♯". */
export function keyName(key: Key): string {
  const { letter, pitchClass } = parseKey(key);
  return spell(letter, pitchClass);
}

export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}
