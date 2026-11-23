"use client";

import { useCallback, useMemo, useRef } from "react";
import { VisuallyHidden } from "@amezquita/design-system/components/primitives/VisuallyHidden";
import { LessonLayout } from "@/components/lesson/LessonLayout";
import { LessonPanel } from "@/components/lesson/LessonPanel";
import { LessonPath } from "@/components/lesson/LessonPath";
import { RollText } from "@/components/lesson/RollText";
import { SegmentSwitch } from "@/components/lesson/SegmentSwitch";
import { chordsFor, scaleFor, type Tonality } from "@/lib/music/theory";
import { getLesson } from "@/lessons/registry";
import { ChordGrid } from "./ChordGrid";
import {
  FOOTER,
  KEY_HINT,
  PROGRESSION_HINT,
  chordHint,
  keySubline,
  keyTitle,
  scaleHint,
} from "./copy";
import { KeyPicker } from "./KeyPicker";
import type { Labels } from "./model";
import { PATH } from "./path";
import { ProgressionBuilder } from "./ProgressionBuilder";
import { ScaleRow } from "./ScaleRow";
import { Transport } from "./Transport";
import { useNashvilleLab } from "./useNashvilleLab";
import "./NashvilleLab.css";

const lesson = getLesson("nashville-numbers");

const TONALITIES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Relative minor" },
] as const satisfies readonly { value: Tonality; label: string }[];

const LABELS = [
  { value: "numbers", label: "Numbers" },
  { value: "names", label: "Chord names" },
] as const satisfies readonly { value: Labels; label: string }[];

/**
 * Nashville Number Lab: the seven chords of a key, as numbers. The root
 * carries the tonality, which recolours everything inside it (architecture.md §4).
 */
export function NashvilleLab() {
  const { state, controller: c, audioStatus, message, highlighted, register } = useNashvilleLab();
  const scale = useMemo(() => scaleFor(state.key, state.tonality), [state.key, state.tonality]);
  const chords = useMemo(() => chordsFor(scale), [scale]);

  const firstChord = useRef<HTMLButtonElement>(null);
  const focusFirstChord = useCallback(() => firstChord.current?.focus(), []);

  return (
    <div className="nashville-lab" data-tonality={state.tonality}>
      <LessonLayout
        eyebrow={lesson.eyebrow}
        title={lesson.title}
        intro={lesson.summary}
        footer={FOOTER}
        aside={<LessonPath steps={PATH} current={state.pathStep} onAction={c.runPathStep} />}
      >
        <LessonPanel label="Key" ref={register("key")} highlighted={highlighted === "key"}>
          <div className="nashville-lab__key-head">
            <div>
              <div className="lesson-panel__label">Key</div>
              <div className="nashville-lab__key-name">
                <RollText text={keyTitle(state.key, state.tonality)} />
              </div>
              <div className="nashville-lab__key-sub">
                <RollText text={keySubline(state.key, state.tonality)} delay={60} />
              </div>
            </div>
            <SegmentSwitch
              label="Mode"
              options={TONALITIES}
              value={state.tonality}
              onChange={c.setTonality}
            />
          </div>
          <KeyPicker value={state.key} tonality={state.tonality} onChange={c.setKey} />
          <p className="lesson-panel__hint">{KEY_HINT}</p>
        </LessonPanel>

        <LessonPanel label="Scale" ref={register("scale")} highlighted={highlighted === "scale"}>
          <div className="lesson-panel__head">
            <h2 className="lesson-panel__heading">The scale, numbered</h2>
            <button type="button" className="nashville-lab__ghost" onClick={c.playScale}>
              Play scale
            </button>
          </div>
          <ScaleRow scale={scale} lit={state.lights.notes} />
          <p className="lesson-panel__hint">{scaleHint(state.tonality)}</p>
        </LessonPanel>

        <LessonPanel label="Chords" ref={register("chords")} highlighted={highlighted === "chords"}>
          <div className="lesson-panel__head">
            <h2 className="lesson-panel__heading">The seven chords</h2>
            <SegmentSwitch
              label="Show"
              size="small"
              options={LABELS}
              value={state.labels}
              onChange={c.setLabels}
            />
          </div>
          <ChordGrid
            chords={chords}
            labels={state.labels}
            lit={state.lights.chord}
            onTap={c.tapChord}
            firstChordRef={firstChord}
          />
          <p className="lesson-panel__hint">{chordHint(state.tonality)}</p>
        </LessonPanel>

        <LessonPanel
          label="Progressions"
          ref={register("progressions")}
          highlighted={highlighted === "progressions"}
        >
          <div className="lesson-panel__head">
            <h2 className="lesson-panel__heading">Progressions</h2>
          </div>
          <ProgressionBuilder
            tonality={state.tonality}
            scale={scale}
            chords={chords}
            labels={state.labels}
            progression={state.progression}
            preset={state.preset}
            building={state.building}
            litSlot={state.lights.slot}
            generation={state.slotsGeneration}
            onPreset={c.loadPreset}
            onBuild={c.startBuilding}
            onRemove={c.removeBar}
            focusFirstChord={focusFirstChord}
          />
          <Transport
            playing={state.playing}
            bpm={state.bpm}
            loop={state.loop}
            audioStatus={audioStatus}
            onTogglePlay={c.togglePlay}
            onBpm={c.setBpm}
            onLoop={c.setLoop}
          />
          <p className="lesson-panel__hint">{PROGRESSION_HINT}</p>
        </LessonPanel>
      </LessonLayout>

      {/* Building changes and the no-sound message, for screen readers (C-09). */}
      <VisuallyHidden as="div" role="status" aria-live="polite">
        <span key={message.id}>{message.text}</span>
      </VisuallyHidden>
    </div>
  );
}
