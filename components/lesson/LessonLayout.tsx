import type { ReactNode } from "react";
import "./LessonLayout.css";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  /** The lesson's panels. */
  children: ReactNode;
  /** Beside the panels on wide screens, under them at 900px and below: the lesson path. */
  aside?: ReactNode;
  footer: ReactNode;
};

/**
 * A lesson page: header, a column of panels with the lesson path beside it, and
 * a footer. It knows nothing about music or any one lesson (architecture.md §2).
 */
export function LessonLayout({ eyebrow, title, intro, children, aside, footer }: Props) {
  return (
    <div className="lesson-layout">
      <header className="lesson-layout__header">
        <span className="lesson-layout__eyebrow">{eyebrow}</span>
        <h1 className="lesson-layout__title">{title}</h1>
        <p className="lesson-layout__intro">{intro}</p>
      </header>
      <div className="lesson-layout__grid">
        <main className="lesson-layout__main">{children}</main>
        {aside ? <div className="lesson-layout__aside">{aside}</div> : null}
      </div>
      <footer className="lesson-layout__footer">{footer}</footer>
    </div>
  );
}
