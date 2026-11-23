"use client";

import type { Ref } from "react";
import { LessonPanel } from "./LessonPanel";
import "./LessonPath.css";

export type PathStep = {
  title: string;
  description: string;
  /** The button's label: what pressing it does ("Play the scale"). */
  actionLabel: string;
};

type Props = {
  steps: readonly PathStep[];
  /** The step last pressed. Earlier steps show as done; null before any is pressed. */
  current: number | null;
  /** A step's button was pressed. The lesson marks it current and runs its action. */
  onAction: (index: number) => void;
  highlighted?: boolean;
  panelRef?: Ref<HTMLElement>;
};

/** Numbered steps through a lesson, each with a button that shows it happening. */
export function LessonPath({ steps, current, onAction, highlighted, panelRef }: Props) {
  return (
    <LessonPanel as="aside" label="Lesson path" highlighted={highlighted} ref={panelRef}>
      <h2 className="lesson-panel__heading">Lesson path</h2>
      <ol className="lesson-path">
        {steps.map((step, i) => {
          const state =
            current === null
              ? undefined
              : i === current
                ? "current"
                : i < current
                  ? "done"
                  : undefined;
          return (
            <li
              key={step.title}
              className="lesson-path__step"
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              <h3 className="lesson-path__title">{step.title}</h3>
              <p className="lesson-path__description">{step.description}</p>
              <button type="button" className="lesson-path__action" onClick={() => onAction(i)}>
                {step.actionLabel} <span aria-hidden="true">→</span>
              </button>
            </li>
          );
        })}
      </ol>
    </LessonPanel>
  );
}
