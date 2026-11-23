import type { PathStep } from "@/components/lesson/LessonPath";

export type PathAction =
  | "number-the-scale"
  | "chord-on-every-note"
  | "hear-a-pattern"
  | "move-to-another-key"
  | "same-notes-new-home";

/** The five lesson-path steps, as data. The controller runs each step's action. */
export const PATH: readonly (PathStep & { action: PathAction })[] = [
  {
    title: "Number the scale",
    description: "Each note of the scale gets a number from 1 to 7. Watch for the two half steps.",
    actionLabel: "Play the scale",
    action: "number-the-scale",
  },
  {
    title: "A chord on every note",
    description: "Stack every other note and you get seven chords: 1, 2m, 3m, 4, 5, 6m, 7°.",
    actionLabel: "Play all seven",
    action: "chord-on-every-note",
  },
  {
    title: "Hear a pattern",
    description: "1–5–6m–4 sits under a huge number of pop songs. Sing a melody you know over it.",
    actionLabel: "Play 1–5–6m–4",
    action: "hear-a-pattern",
  },
  {
    title: "Move it to another key",
    description: "Same numbers, new chord names. The song keeps its shape, just higher or lower.",
    actionLabel: "Change the key",
    action: "move-to-another-key",
  },
  {
    title: "Same notes, new home",
    description:
      "Start from the 6 and the major key turns into its relative minor. Same notes, a darker mood.",
    actionLabel: "Switch to minor",
    action: "same-notes-new-home",
  },
];
