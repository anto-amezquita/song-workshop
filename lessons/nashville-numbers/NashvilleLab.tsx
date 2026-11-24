"use client";

import { useCallback, useMemo, useRef } from "react";
import { VisuallyHidden } from "@amezquita/design-system/components/primitives/VisuallyHidden";
import { LessonLayout } from "@/components/lesson/LessonLayout";
import { LessonPath } from "@/components/lesson/LessonPath";
import { chordsFor, scaleFor } from "@/lib/music/theory";
import { getLesson } from "@/lessons/registry";
import { FOOTER } from "./copy";
import { LabStoreContext } from "./lights";
import { ChordsPanel, KeyPanel, ProgressionsPanel, ScalePanel } from "./panels";
import { PATH } from "./path";
import { useNashvilleLab } from "./useNashvilleLab";
import "./NashvilleLab.css";

const lesson = getLesson("nashville-numbers");

/**
 * Nashville Number Lab: the seven chords of a key, as numbers. The root
 * carries the tonality, which recolours everything inside it (architecture.md §4).
 *
 * It reads the state without the lights, so a playback step doesn't re-render
 * it; the cards, notes and slots read their own lights (lights.ts).
 */
export function NashvilleLab() {
  const { store, view, controller, audioStatus, message, highlighted, register } =
    useNashvilleLab();
  const scale = useMemo(() => scaleFor(view.key, view.tonality), [view.key, view.tonality]);
  const chords = useMemo(() => chordsFor(scale), [scale]);

  const firstChord = useRef<HTMLButtonElement>(null);
  const focusFirstChord = useCallback(() => firstChord.current?.focus(), []);

  return (
    <LabStoreContext value={store}>
      <div className="nashville-lab" data-tonality={view.tonality}>
        <LessonLayout
          eyebrow={lesson.eyebrow}
          title={lesson.title}
          intro={lesson.summary}
          footer={FOOTER}
          aside={
            <LessonPath steps={PATH} current={view.pathStep} onAction={controller.runPathStep} />
          }
        >
          <KeyPanel
            controller={controller}
            highlighted={highlighted === "key"}
            panelRef={register("key")}
            keyName={view.key}
            tonality={view.tonality}
          />
          <ScalePanel
            controller={controller}
            highlighted={highlighted === "scale"}
            panelRef={register("scale")}
            scale={scale}
            tonality={view.tonality}
          />
          <ChordsPanel
            controller={controller}
            highlighted={highlighted === "chords"}
            panelRef={register("chords")}
            chords={chords}
            labels={view.labels}
            tonality={view.tonality}
            firstChordRef={firstChord}
          />
          <ProgressionsPanel
            controller={controller}
            highlighted={highlighted === "progressions"}
            panelRef={register("progressions")}
            tonality={view.tonality}
            scale={scale}
            chords={chords}
            labels={view.labels}
            progression={view.progression}
            preset={view.preset}
            building={view.building}
            slotsGeneration={view.slotsGeneration}
            playing={view.playing}
            bpm={view.bpm}
            loop={view.loop}
            audioStatus={audioStatus}
            focusFirstChord={focusFirstChord}
          />
        </LessonLayout>

        {/* Building changes and the no-sound message, for screen readers (C-09). */}
        <VisuallyHidden as="div" role="status" aria-live="polite">
          <span key={message.id}>{message.text}</span>
        </VisuallyHidden>
      </div>
    </LabStoreContext>
  );
}
