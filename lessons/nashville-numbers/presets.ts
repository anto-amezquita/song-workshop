import type { Degree, Tonality } from "@/lib/music/theory";

export type Preset = {
  id: string;
  name: string;
  /** One chord per bar, as scale degrees (0 = chord 1). */
  degrees: readonly Degree[];
};

/** Named progressions for each tonality, as in the file. The first is loaded on switching. */
export const PRESETS = {
  major: [
    { id: "pop", name: "Pop anthem", degrees: [0, 4, 5, 3] },
    { id: "rock", name: "Rock & folk", degrees: [0, 3, 4, 0] },
    { id: "moody", name: "Moody pop", degrees: [5, 3, 0, 4] },
    { id: "doowop", name: "50s doo-wop", degrees: [0, 5, 3, 4] },
    { id: "jazz", name: "Jazz turnaround", degrees: [1, 4, 0, 0] },
  ],
  minor: [
    { id: "minorpop", name: "Minor pop", degrees: [0, 5, 2, 6] },
    { id: "descent", name: "Descending", degrees: [0, 6, 5, 6] },
    { id: "minor145", name: "Minor 1–4–5", degrees: [0, 3, 4, 0] },
    { id: "cinema", name: "Cinematic", degrees: [0, 5, 6, 0] },
  ],
} as const satisfies Record<Tonality, readonly Preset[]>;

export type PresetId = (typeof PRESETS)[Tonality][number]["id"];

export function findPreset(tonality: Tonality, id: PresetId): Preset | undefined {
  return (PRESETS[tonality] as readonly Preset[]).find((p) => p.id === id);
}
