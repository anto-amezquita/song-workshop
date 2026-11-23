import { LessonLayout } from "@/components/lesson/LessonLayout";
import { getLesson } from "@/lessons/registry";
import "./NashvilleLab.css";

const lesson = getLesson("nashville-numbers");

/**
 * The lesson's root: it carries the tonality and paints its tint. The panels
 * and the lesson path come in port phase 5.
 */
export function NashvilleLab() {
  return (
    <div className="nashville-lab" data-tonality="major">
      <LessonLayout
        eyebrow={lesson.eyebrow}
        title={lesson.title}
        intro={lesson.summary}
        footer="A music-teaching experiment by Antonio Amézquita. Sound is synthesized in your browser."
      >
        {null}
      </LessonLayout>
    </div>
  );
}
