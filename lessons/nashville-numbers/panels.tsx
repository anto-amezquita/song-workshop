"use client";

// The lesson's four panels. Each is memoised and gets only what it shows, so a
// change re-renders the panels it touches: Loop or tempo re-renders only the
// progressions panel, a highlight only the panel it lights (architecture.md §12).
// The controller's methods never change, so passing it doesn't break the memo.

import { memo, type Ref } from "react";
import { LessonPanel } from "@/components/lesson/LessonPanel";
import { RollText } from "@/components/lesson/RollText";
import { SegmentSwitch } from "@/components/lesson/SegmentSwitch";
import type { AudioStatus } from "@/lib/music/audio/engine";
import type { Chord, Key, Scale, Tonality } from "@/lib/music/theory";
import { ChordGrid } from "./ChordGrid";
import type { Controller } from "./controller";
import { KEY_HINT, PROGRESSION_HINT, chordHint, keySubline, keyTitle, scaleHint } from "./copy";
import { KeyPicker } from "./KeyPicker";
import type { View, Labels } from "./model";
import { ProgressionBuilder } from "./ProgressionBuilder";
import { ScaleRow } from "./ScaleRow";
import { Transport } from "./Transport";

const TONALITIES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Relative minor" },
] as const satisfies readonly { value: Tonality; label: string }[];

const LABELS = [
  { value: "numbers", label: "Numbers" },
  { value: "names", label: "Chord names" },
] as const satisfies readonly { value: Labels; label: string }[];

type PanelProps = {
  c: Controller;
  highlighted: boolean;
  panelRef: Ref<HTMLElement>;
};

export const KeyPanel = memo(function KeyPanel({
  c,
  highlighted,
  panelRef,
  keyName,
  tonality,
}: PanelProps & { keyName: Key; tonality: Tonality }) {
  return (
    <LessonPanel label="Key" ref={panelRef} highlighted={highlighted}>
      <div className="nashville-lab__key-head">
        <div>
          {/* A heading, so jumping by headings reaches this panel too (C-16). */}
          <h2 className="lesson-panel__label">Key</h2>
          <div className="nashville-lab__key-name">
            <RollText text={keyTitle(keyName, tonality)} />
          </div>
          <div className="nashville-lab__key-sub">
            <RollText text={keySubline(keyName, tonality)} delay={60} />
          </div>
        </div>
        <SegmentSwitch
          label="Mode"
          options={TONALITIES}
          value={tonality}
          onChange={c.setTonality}
        />
      </div>
      <KeyPicker value={keyName} tonality={tonality} onChange={c.setKey} />
      <p className="lesson-panel__hint">{KEY_HINT}</p>
    </LessonPanel>
  );
});

export const ScalePanel = memo(function ScalePanel({
  c,
  highlighted,
  panelRef,
  scale,
  tonality,
}: PanelProps & { scale: Scale; tonality: Tonality }) {
  return (
    <LessonPanel label="Scale" ref={panelRef} highlighted={highlighted}>
      <div className="lesson-panel__head">
        <h2 className="lesson-panel__heading">The scale, numbered</h2>
        <button type="button" className="nashville-lab__ghost" onClick={c.playScale}>
          Play scale
        </button>
      </div>
      <ScaleRow scale={scale} />
      <p className="lesson-panel__hint">{scaleHint(tonality)}</p>
    </LessonPanel>
  );
});

export const ChordsPanel = memo(function ChordsPanel({
  c,
  highlighted,
  panelRef,
  chords,
  labels,
  tonality,
  firstChordRef,
}: PanelProps & {
  chords: readonly Chord[];
  labels: Labels;
  tonality: Tonality;
  firstChordRef: Ref<HTMLButtonElement>;
}) {
  return (
    <LessonPanel label="Chords" ref={panelRef} highlighted={highlighted}>
      <div className="lesson-panel__head">
        <h2 className="lesson-panel__heading">The seven chords</h2>
        <SegmentSwitch
          label="Show"
          size="small"
          options={LABELS}
          value={labels}
          onChange={c.setLabels}
        />
      </div>
      <ChordGrid chords={chords} labels={labels} onTap={c.tapChord} firstChordRef={firstChordRef} />
      <p className="lesson-panel__hint">{chordHint(tonality)}</p>
    </LessonPanel>
  );
});

export const ProgressionsPanel = memo(function ProgressionsPanel({
  c,
  highlighted,
  panelRef,
  tonality,
  scale,
  chords,
  labels,
  progression,
  preset,
  building,
  slotsGeneration,
  playing,
  bpm,
  loop,
  audioStatus,
  focusFirstChord,
}: PanelProps &
  Pick<
    View,
    | "tonality"
    | "labels"
    | "progression"
    | "preset"
    | "building"
    | "slotsGeneration"
    | "playing"
    | "bpm"
    | "loop"
  > & {
    scale: Scale;
    chords: readonly Chord[];
    audioStatus: AudioStatus;
    focusFirstChord: () => void;
  }) {
  return (
    <LessonPanel label="Progressions" ref={panelRef} highlighted={highlighted}>
      <div className="lesson-panel__head">
        <h2 className="lesson-panel__heading">Progressions</h2>
      </div>
      <ProgressionBuilder
        tonality={tonality}
        scale={scale}
        chords={chords}
        labels={labels}
        progression={progression}
        preset={preset}
        building={building}
        generation={slotsGeneration}
        onPreset={c.loadPreset}
        onBuild={c.startBuilding}
        onRemove={c.removeBar}
        focusFirstChord={focusFirstChord}
      />
      <Transport
        playing={playing}
        bpm={bpm}
        loop={loop}
        audioStatus={audioStatus}
        onTogglePlay={c.togglePlay}
        onBpm={c.setBpm}
        onLoop={c.setLoop}
      />
      <p className="lesson-panel__hint">{PROGRESSION_HINT}</p>
    </LessonPanel>
  );
});
