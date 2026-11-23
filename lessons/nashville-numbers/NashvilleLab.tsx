import { getLesson } from "@/lessons/registry";
import "./NashvilleLab.css";

const lesson = getLesson("nashville-numbers");

/**
 * The lesson's root. For now (port phase 2) it holds only the header and footer,
 * so the page builds and can be checked; the panels come in phase 5, and the
 * header and footer move into the shared LessonLayout in phase 4.
 */
export function NashvilleLab() {
  return (
    <div className="nashville-lab" data-tonality="major">
      <div className="nashville-lab__wrap">
        <header className="nashville-lab__header">
          <span className="nashville-lab__eyebrow">{lesson.eyebrow}</span>
          <h1 className="nashville-lab__title">{lesson.title}</h1>
          <p className="nashville-lab__intro">{lesson.summary}</p>
        </header>
        <main />
        <footer className="nashville-lab__footer">
          A music-teaching experiment by Antonio Amézquita. Sound is synthesized in your browser.
        </footer>
      </div>
    </div>
  );
}
