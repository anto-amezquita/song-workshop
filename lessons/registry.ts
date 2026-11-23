/** One entry per lesson. Adding a lesson never means editing another (architecture.md §2). */
export type Lesson = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
};

export const lessons = [
  {
    slug: "nashville-numbers",
    title: "Nashville Number Lab",
    eyebrow: "Diatonic harmony, by number",
    summary:
      "Every major key holds the same seven chords. Learn them as numbers once, and you can play a song in any key.",
  },
] as const satisfies readonly Lesson[];

export type LessonSlug = (typeof lessons)[number]["slug"];

export function getLesson(slug: LessonSlug): Lesson {
  const lesson = lessons.find((l) => l.slug === slug);
  if (!lesson) throw new Error(`No lesson with the slug "${slug}"`);
  return lesson;
}

export const lessonPath = (slug: LessonSlug) => `/lessons/${slug}`;
