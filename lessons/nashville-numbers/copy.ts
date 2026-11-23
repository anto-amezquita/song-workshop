// The lesson's words, as in the file. Strings that depend on the key or the
// tonality are built from lib/music/theory, so they can't drift from the music.

import {
  keyName,
  tonicName,
  type Chord,
  type Key,
  type ScaleNote,
  type Tonality,
} from "@/lib/music/theory";

export const FOOTER =
  "A music-teaching experiment by Antonio Amézquita. Sound is synthesized in your browser.";

/** "C major", or "A minor" for its relative minor. */
export function keyTitle(key: Key, tonality: Tonality): string {
  return `${tonicName(key, tonality)} ${tonality}`;
}

/** The line under the key name. */
export function keySubline(key: Key, tonality: Tonality): string {
  return tonality === "major"
    ? `Relative minor: ${keyTitle(key, "minor")}`
    : `Same notes as ${keyTitle(key, "major")}`;
}

/** What a key pill shows: "F♯", or "D♯m" in minor. */
export function pillLabel(key: Key, tonality: Tonality): string {
  return tonality === "minor" ? `${tonicName(key, "minor")}m` : keyName(key);
}

/**
 * A key pill's name for screen readers (port spec C-11). It starts with what
 * the pill shows, so voice control can use the visible label: "D♭ major",
 * "B♭m, B♭ minor".
 */
export function pillName(key: Key, tonality: Tonality): string {
  const full = keyTitle(key, tonality);
  return tonality === "minor" ? `${pillLabel(key, tonality)}, ${full}` : full;
}

export const KEY_HINT =
  "Keys follow the circle of fifths. Neighbours share six of their seven notes.";

export function scaleHint(tonality: Tonality): string {
  return tonality === "major"
    ? "W is a whole step, H is a half step. W W H W W W H builds every major scale."
    : "Counted from the 6 of the major scale, the steps become W H W W H W W: the natural minor.";
}

export function chordHint(tonality: Tonality): string {
  return tonality === "major"
    ? "Major, minor, minor, major, major, minor, diminished. That order is the same in every major key."
    : "The same seven chords as the major key, counted from a new home: 1m, 2°, 3, 4m, 5m, 6, 7.";
}

export const PROGRESSION_HINT =
  "Change the key while it plays. The numbers stay put and only the chord names move.";

export const EMPTY_PROGRESSION = "Tap chords above to add them, up to eight.";

export const NO_SOUND = "Sound isn't available in this browser. Everything else still works.";

/**
 * A chord card's name. It follows the order the labels show, so it contains
 * the visible text (WCAG 2.5.3, C-15). With numbers first it's the file's
 * name, "Chord 6m, Am minor"; with names first, "Chord Am, 6m minor".
 */
export function chordCardName(primary: string, secondary: string, chord: Chord): string {
  // Chord 1's "home" tag is CSS, so the name says it too (C-16).
  const home = chord.degree === 0 ? ", home" : "";
  return `Chord ${primary}, ${secondary} ${chord.quality}${home}`;
}

/** A chord said out loud: "A minor", "B diminished", "F♯ major". */
export function spokenChord(chord: Chord, scale: readonly ScaleNote[]): string {
  const root = scale[chord.degree]!.name;
  return `${root} ${chord.quality === "dim" ? "diminished" : chord.quality}`;
}

/**
 * A filled slot's button in building mode (port spec R3, C-15). It contains
 * what the slot shows, in order, then the chord said out loud:
 * "Remove bar 2: 6m, Am (A minor)".
 */
export function removeBarName(
  bar: number,
  primary: string,
  secondary: string,
  chord: Chord,
  scale: readonly ScaleNote[],
): string {
  return `Remove bar ${bar + 1}: ${primary}, ${secondary} (${spokenChord(chord, scale)})`;
}

// Live-region announcements (port spec C-09).
export const announce = {
  added: (label: string, bar: number) => `Added ${label} as bar ${bar + 1}.`,
  removed: (bar: number) => `Removed bar ${bar + 1}.`,
  full: "The progression is full: eight bars.",
};
