import type { ReactNode, Ref } from "react";
import "./LessonPanel.css";

type Props = {
  /** The panel's name for screen readers ("Key", "Scale", "Lesson path"). */
  label: string;
  /** `aside` for the lesson path; `section` for everything else. */
  as?: "section" | "aside";
  /** Accent border and a soft ring. The lesson sets it through usePanelHighlight. */
  highlighted?: boolean;
  ref?: Ref<HTMLElement>;
  className?: string;
  children: ReactNode;
};

/** A white panel on the tinted page, the lesson's unit of content. */
export function LessonPanel({
  label,
  as: Tag = "section",
  highlighted = false,
  ref,
  className,
  children,
}: Props) {
  return (
    <Tag
      ref={ref}
      aria-label={label}
      className={className ? `lesson-panel ${className}` : "lesson-panel"}
      data-highlighted={highlighted || undefined}
    >
      {children}
    </Tag>
  );
}
